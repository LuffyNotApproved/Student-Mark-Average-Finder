import { Router, type IRouter } from "express";
import healthRouter from "./health";
import reviewRouter from "./review";
import sourceRouter from "./source";

const router: IRouter = Router();

router.use(healthRouter);
router.use(reviewRouter);
router.use(sourceRouter);

export default router;
