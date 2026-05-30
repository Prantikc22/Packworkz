import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import quotesRouter from "./quotes";
import authRouter from "./auth";
import dashboardRouter from "./dashboard";
import designSamplesRouter from "./design_samples";
import testimonialsRouter from "./testimonials";
import adminRouter from "./admin";
import paymentsRouter from "./payments";
import packAiRouter from "./pack_ai";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(quotesRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(designSamplesRouter);
router.use(testimonialsRouter);
router.use(adminRouter);
router.use(paymentsRouter);
router.use(packAiRouter);
router.use(uploadRouter);

export default router;
