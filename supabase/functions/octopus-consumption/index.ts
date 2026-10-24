import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { HttpError, json, parseJson, preflight, safeError } from "../_shared/http.ts";
import { fetchWithTimeout, requireUser } from "../_shared/supabase.ts";

type Input = { fuel: "electricity" | "gas"; days?: number };
type Connection = {
  api_key: string;
  electricity_mpan: string | null;
  electricity_serial: string | null;
  gas_mprn: string | null;
  gas_serial: string | null;
};

Deno.serve(async (req) => {
  const options = preflight(req);
  if (options) return options;
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  try {
    const { user, admin } = await requireUser(req);
    const input = await parseJson<Input>(req, 2_048);
    if (input.fuel !== "electricity" && input.fuel !== "gas") {
      throw new HttpError(400, "Fuel must be electricity or gas.");
    }
    const days = Math.min(Math.max(Math.round(input.days ?? 7), 1), 31);

    const { data, error } = await admin.rpc("get_octopus_connection_secret", {
      p_user_id: user.id,
    });
    if (error) throw error;
    const connection = (data?.[0] ?? null) as Connection | null;
    if (!connection) throw new HttpError(404, "Connect your Octopus account first.");

    const point =
      input.fuel === "electricity"
        ? connection.electricity_mpan
        : connection.gas_mprn;
    const serial =
      input.fuel === "electricity"
        ? connection.electricity_serial
        : connection.gas_serial;
    if (!point || !serial) {
      throw new HttpError(400, `Add your ${input.fuel} meter details first.`);
    }

    const now = new Date();
    const from = new Date(now);
    from.setUTCDate(from.getUTCDate() - days);
    const path =
      input.fuel === "electricity"
        ? `electricity-meter-points/${encodeURIComponent(point)}`
        : `gas-meter-points/${encodeURIComponent(point)}`;
    const url = new URL(
      `https://api.octopus.energy/v1/${path}/meters/${encodeURIComponent(serial)}/consumption/`,
    );
    url.searchParams.set("period_from", from.toISOString());
    url.searchParams.set("period_to", now.toISOString());
    url.searchParams.set("page_size", "1500");
    url.searchParams.set("order_by", "period");

    const response = await fetchWithTimeout(
      url.toString(),
      {
        headers: {
          Authorization: `Basic ${btoa(`${connection.api_key}:`)}`,
          Accept: "application/json",
        },
      },
      15_000,
    );
    if (response.status === 401 || response.status === 403) {
      throw new HttpError(401, "Your Octopus connection needs to be updated.");
    }
    if (!response.ok) throw new HttpError(502, "Octopus consumption is unavailable.");

    const payload = await response.json();
    const daily = new Map<string, number>();
    for (const row of payload.results ?? []) {
      const date = String(row.interval_start ?? "").slice(0, 10);
      const raw = Number(row.consumption);
      // Octopus gas smart-meter consumption is normally cubic metres.
      const consumption = input.fuel === "gas" ? raw * 11.1868 : raw;
      if (date && Number.isFinite(consumption)) {
        daily.set(date, (daily.get(date) ?? 0) + consumption);
      }
    }

    const points = [...daily.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, consumption]) => ({
        date,
        consumption: Math.round(consumption * 1000) / 1000,
      }));

    const total =
      Math.round(points.reduce((sum, point) => sum + point.consumption, 0) * 100) /
      100;
    return json({ fuel: input.fuel, unit: "kWh", total, points });
  } catch (error) {
    return safeError(error);
  }
});
