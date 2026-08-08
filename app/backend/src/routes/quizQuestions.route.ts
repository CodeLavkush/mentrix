import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getAllQuizQuestions } from "../controllers/quizQuestions.controller.js"
import { Router } from "express"

const router: Router = Router()


router
    .route("/:quizId")
    .get(verifyJWT, getAllQuizQuestions)


export default router