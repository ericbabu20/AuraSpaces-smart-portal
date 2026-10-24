import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetElectricityConsumptionResponse,
  GetGasConsumptionResponse,
} from "@workspace/api-zod";
import { getConsumption, getPrepayBalances, OctopusError } from "../lib/octopus";

const router: IRouter = Router();

function parseDays(raw: unknown): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return 7;
  return Math.min(Math.max(parsed, 1), 31);
}

function handleError(err: unknown, req: Request, res: Response): void {
  if (err instanceof OctopusError) {
    req.log.error(
      { status: err.status, message: err.message },
      "Octopus API error",
    );
    const status = err.status === 500 ? 500 : 502;
    res.status(status).json({ error: err.message });
    return;
  }
  req.log.error({ err }, "Unexpected consumption error");
  res.status(500).json({ error: "Failed to fetch consumption data" });
}

router.get("/consumption/electricity", async (req, res): Promise<void> => {
  const days = parseDays(req.query.days);
  try {
    const summary = await getConsumption("electricity", days);
    res.json(GetElectricityConsumptionResponse.parse(summary));
  } catch (err) {
    handleError(err, req, res);
  }
});

router.get("/prepay", async (req, res): Promise<void> => {
  try {
    res.json(await getPrepayBalances());
  } catch (err) {
    handleError(err, req, res);
  }
});

router.get("/consumption/gas", async (req, res): Promise<void> => {
  const days = parseDays(req.query.days);
  try {
    const summary = await getConsumption("gas", days);
    res.json(GetGasConsumptionResponse.parse(summary));
  } catch (err) {
    handleError(err, req, res);
  }
});

export default router;
