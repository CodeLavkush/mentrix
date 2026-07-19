import { registerUserValidator, loginValidator } from "../validators/index.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middlware.js"
import { upload } from "../middlewares/upload.middlware.js"
import { loginUser, registerUser, logoutUser, getCurrentUser, refreshAccessToken, verifyEmail, resendEmailVerification } from "../controllers/auth.controller.js"
import { Router } from "express"



const router: Router = Router()

router
    .route("/register")
    .post(upload.single("avatar"), registerUserValidator(), validate, registerUser)

router
    .route("/login")
    .post(loginValidator(), validate, loginUser)

router
    .route("/verify-email")
    .post(verifyEmail)

router
    .route("/refresh-token")
    .post(refreshAccessToken)

// secure routes
router
    .route("/logout")
    .post(verifyJWT, logoutUser)

router
    .route("/current-user")
    .post(verifyJWT, getCurrentUser)

router
    .route("/resend-email-verification")
    .post(verifyJWT, resendEmailVerification)


export default router