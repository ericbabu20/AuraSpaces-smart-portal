import { Router, type IRouter } from "express";
import healthRouter from "./health";
import consumptionRouter from "./consumption";

const router: IRouter = Router();

router.use(healthRouter);
router.use(consumptionRouter);

export default router;
