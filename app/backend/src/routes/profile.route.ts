import { Router } from "express";
import { createProfile, getProfile, updateProfile } from "../controllers/profile.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { profileValidator } from "../validators/index.js";
import { validate } from "../middlewares/validate.middlware.js";

const router: Router = Router()


router
    .route("/academics")
    .get(verifyJWT, getProfile)
    .post(verifyJWT, profileValidator(), validate, createProfile)
    .patch(verifyJWT, profileValidator(), validate, updateProfile)

export default router
