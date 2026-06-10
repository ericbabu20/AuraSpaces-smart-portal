const BASE_URL = "https://api.octopus.energy/v1";
const DEFAULT_GAS_M3_TO_KWH = 11.1868;
const MAX_PAGES = 25;

export class OctopusError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "OctopusError";
    this.status = status;
  }
}

export type Fuel = "electricity" | "gas";

export interface ConsumptionPoint {
  date: string;
  consumption: number;
}

export interface ConsumptionSummary {
  fuel: Fuel;
  unit: string;
  total: number;
  points: ConsumptionPoint[];
}

interface OctopusReading {
  consumption: number;
  interval_start: string;
  interval_end: string;
}

interface OctopusPage {
  count: number;
  next: string | null;
  previous: string | null;
  results: OctopusReading[];
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new OctopusError(`Missing required configuration: ${name}`, 500);
  }
  return value;
}

function authHeader(): string {
  const apiKey = requireEnv("OCTOPUS_API_KEY");
  const token = Buffer.from(`${apiKey}:`).toString("base64");
  return `Basic ${token}`;
}

function periodFrom(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d.toISOString();
}

async function fetchAll(url: string): Promise<OctopusReading[]> {
  const readings: OctopusReading[] = [];
  let next: string | null = url;
  let pages = 0;

  while (next && pages < MAX_PAGES) {
    const response = await fetch(next, {
      headers: { Authorization: authHeader() },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new OctopusError(
        `Octopus API responded ${response.status}: ${body.slice(0, 200)}`,
        response.status === 401 || response.status === 403 ? 401 : 502,
      );
    }

    const page = (await response.json()) as OctopusPage;
    readings.push(...page.results);
    next = page.next;
    pages += 1;
  }

  return readings;
}

function toDailyPoints(
  readings: OctopusReading[],
  convertToKwh: number | null,
): ConsumptionPoint[] {
  const byDate = new Map<string, number>();

  for (const reading of readings) {
    const date = reading.interval_start.slice(0, 10);
    const value = convertToKwh
      ? reading.consumption * convertToKwh
      : reading.consumption;
    byDate.set(date, (byDate.get(date) ?? 0) + value);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, consumption]) => ({
      date,
      consumption: Math.round(consumption * 100) / 100,
    }));
}

// Smart-meter data lags, so the most recent day(s) returned by Octopus are
// often incomplete (a tiny fraction of a full day). Drop trailing days whose
// consumption is an obvious partial reading so headline figures and charts only
// reflect complete days.
function trimTrailingPartial(points: ConsumptionPoint[]): ConsumptionPoint[] {
  if (points.length < 3) return points;
  const positive = points
    .map((p) => p.consumption)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  if (positive.length === 0) return points;
  const median = positive[Math.floor(positive.length / 2)];
  const threshold = median * 0.15;
  let end = points.length;
  while (end > 1 && points[end - 1].consumption < threshold) {
    end -= 1;
  }
  return points.slice(0, end);
}

export async function getConsumption(
  fuel: Fuel,
  days: number,
): Promise<ConsumptionSummary> {
  const from = periodFrom(days);

  let path: string;
  let convertToKwh: number | null = null;

  if (fuel === "electricity") {
    const mpan = requireEnv("OCTOPUS_ELECTRICITY_MPAN");
    const serial = requireEnv("OCTOPUS_ELECTRICITY_SERIAL");
    path = `electricity-meter-points/${mpan}/meters/${serial}`;
  } else {
    const mprn = requireEnv("OCTOPUS_GAS_MPRN");
    const serial = requireEnv("OCTOPUS_GAS_SERIAL");
    path = `gas-meter-points/${mprn}/meters/${serial}`;

    const units = (process.env.OCTOPUS_GAS_UNITS ?? "m3").toLowerCase();
    if (units === "m3" || units === "m³" || units === "cubic") {
      const factor = Number(process.env.OCTOPUS_GAS_M3_TO_KWH);
      convertToKwh =
        Number.isFinite(factor) && factor > 0 ? factor : DEFAULT_GAS_M3_TO_KWH;
    }
  }

  const url =
    `${BASE_URL}/${path}/consumption/` +
    `?group_by=day&order_by=period&period_from=${encodeURIComponent(from)}`;

  const readings = await fetchAll(url);
  const points = trimTrailingPartial(toDailyPoints(readings, convertToKwh));
  const total =
    Math.round(points.reduce((sum, p) => sum + p.consumption, 0) * 100) / 100;

  return { fuel, unit: "kWh", total, points };
}
