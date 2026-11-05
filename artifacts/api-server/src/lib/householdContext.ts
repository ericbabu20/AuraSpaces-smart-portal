type DeviceRow = {
  name?: string;
  category?: string;
  is_on?: boolean;
  power_draw?: number;
  room?: string;
};

type EnergyRow = {
  has_solar?: boolean;
  has_battery?: boolean;
  has_ev?: boolean;
  has_gas?: boolean;
};

type ConsumptionRow = {
  fuel?: string;
  usage_date?: string;
  kwh?: number | string;
};

export class HouseholdContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HouseholdContextError";
  }
}

function bearerToken(header: string | undefined): string | null {
  if (!header?.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token || null;
}

async function supabaseGet<T>(path: string, token: string): Promise<T> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new HouseholdContextError("Supabase is not configured on the server.");
  }
  const response = await fetch(`${url}${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new HouseholdContextError("Could not read the household record.");
  }
  return (await response.json()) as T;
}

function flag(value: boolean | undefined, label: string): string {
  if (value === true) return `${label}: yes`;
  if (value === false) return `${label}: no`;
  return `${label}: not saved`;
}

function consumptionLines(rows: ConsumptionRow[], fuel: string): string {
  const points = rows
    .filter((row) => row.fuel === fuel && row.usage_date)
    .sort((a, b) => String(a.usage_date).localeCompare(String(b.usage_date)));
  if (!points.length) return `${fuel}: no saved readings`;
  const lines = points.map((row) => {
    const kwh = Number(row.kwh);
    const amount = Number.isFinite(kwh) ? kwh.toFixed(2) : "unknown";
    return `- ${row.usage_date}: ${amount} kWh`;
  });
  return `${fuel}:\n${lines.join("\n")}`;
}

/** Read the signed-in household from Supabase. Throws if the record cannot be read. */
export async function loadHouseholdContext(authHeader: string | undefined): Promise<string> {
  const token = bearerToken(authHeader);
  if (!token) {
    throw new HouseholdContextError("Sign in before asking Aura.");
  }

  const user = await supabaseGet<{ id?: string }>("/auth/v1/user", token);
  if (!user.id) {
    throw new HouseholdContextError("Sign in before asking Aura.");
  }

  const [devices, energyRows, consumption] = await Promise.all([
    supabaseGet<DeviceRow[]>(
      "/rest/v1/household_devices?select=name,category,is_on,power_draw,room&order=name.asc",
      token,
    ),
    supabaseGet<EnergyRow[]>(
      "/rest/v1/energy_inputs?select=has_solar,has_battery,has_ev,has_gas&limit=1",
      token,
    ),
    supabaseGet<ConsumptionRow[]>(
      "/rest/v1/consumption_daily?select=fuel,usage_date,kwh&order=usage_date.asc",
      token,
    ),
  ]);

  const energy = energyRows[0];
  const deviceLines = devices.length
    ? devices
        .map((device) => {
          const state = device.is_on ? "on" : "off";
          const watts = Number(device.power_draw);
          const power = Number.isFinite(watts) ? `${watts} W` : "power not saved";
          return `- ${device.name ?? "Unnamed"} (${device.category ?? "other"}, ${device.room ?? "Home"}, ${state}, ${power})`;
        })
        .join("\n")
    : "none";

  return [
    "Household record from Supabase. Use only this record for devices, rooms, and consumption.",
    "If a device is not listed, it does not exist. If a reading is missing, say it is not saved.",
    "Do not invent devices, kWh figures, balances, or pound savings.",
    "",
    "Devices:",
    deviceLines,
    "",
    "Home:",
    flag(energy?.has_solar, "solar"),
    flag(energy?.has_battery, "battery"),
    flag(energy?.has_ev, "ev"),
    flag(energy?.has_gas, "gas"),
    "",
    "Consumption kept for this month:",
    consumptionLines(consumption, "electricity"),
    consumptionLines(consumption, "gas"),
  ].join("\n");
}
