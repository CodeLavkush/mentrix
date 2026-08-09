import { quizAttemptsValidator } from "../validators/index.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middlware.js"
import { createQuizAttempts, getAllAttempts } from "../controllers/quizAttempts.controller.js"
import { Router } from "express"

const router: Router = Router()


router
    .route("/:quizId")
    .post(verifyJWT, quizAttemptsValidator(), validate, createQuizAttempts)
    .get(verifyJWT, getAllAttempts)

export default router