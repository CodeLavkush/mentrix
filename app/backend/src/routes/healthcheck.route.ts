import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";

const router: Router = Router()

router.route('/').get(healthCheck)


export default router