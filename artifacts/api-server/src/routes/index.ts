import { Router, type IRouter } from "express";
import healthRouter from "./health";
import consumptionRouter from "./consumption";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(consumptionRouter);
router.use(chatRouter);

export default router;
