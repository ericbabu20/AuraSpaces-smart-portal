import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { HttpError, json, parseJson, preflight, safeError } from "../_shared/http.ts";
import { fetchWithTimeout, requireUser } from "../_shared/supabase.ts";

type Input = {
  apiKey: string;
  electricityMpan?: string;
  electricitySerial?: string;
  gasMprn?: string;
  gasSerial?: string;
};

Deno.serve(async (req) => {
  const options = preflight(req);
  if (options) return options;
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const { user, admin } = await requireUser(req);
    const input = await parseJson<Input>(req, 8_192);
    const apiKey = input.apiKey?.trim();
    if (!apiKey || apiKey.length > 256) {
      throw new HttpError(400, "Enter a valid Octopus API key.");
    }
    validateMeterField(input.electricityMpan, "MPAN", 13);
    validateMeterField(input.electricitySerial, "electricity serial");
    validateMeterField(input.gasMprn, "MPRN", 10);
    validateMeterField(input.gasSerial, "gas serial");

    // A valid key can read the authenticated account list.
    const response = await fetchWithTimeout(
      "https://api.octopus.energy/v1/accounts/",
      {
        headers: {
          Authorization: `Basic ${btoa(`${apiKey}:`)}`,
          Accept: "application/json",
        },
      },
      12_000,
    );
    if (response.status === 401 || response.status === 403) {
      throw new HttpError(400, "Octopus rejected this API key.");
    }
    if (!response.ok) throw new HttpError(502, "Octopus is temporarily unavailable.");

    const { error } = await admin.rpc("upsert_octopus_connection", {
      p_user_id: user.id,
      p_api_key: apiKey,
      p_electricity_mpan: clean(input.electricityMpan),
      p_electricity_serial: clean(input.electricitySerial),
      p_gas_mprn: clean(input.gasMprn),
      p_gas_serial: clean(input.gasSerial),
    });
    if (error) throw error;

    return json({
      connected: true,
      hasElectricity: Boolean(input.electricityMpan && input.electricitySerial),
      hasGas: Boolean(input.gasMprn && input.gasSerial),
    });
  } catch (error) {
    return safeError(error);
  }
});

function clean(value?: string) {
  return value?.trim() || null;
}

function validateMeterField(value: string | undefined, label: string, exact?: number) {
  if (!value) return;
  const cleaned = value.trim();
  if (!/^[A-Za-z0-9-]+$/.test(cleaned) || cleaned.length > 40) {
    throw new HttpError(400, `Enter a valid ${label}.`);
  }
  if (exact && cleaned.length !== exact) {
    throw new HttpError(400, `${label} must be ${exact} characters.`);
  }
}
