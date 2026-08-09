import { quizValidator } from "../validators/index.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middlware.js"
import { createQuiz, deleteQuizById, deleteQuizzes, getAllQuizzes, getQuizById } from "../controllers/quiz.controller.js"
import { Router } from "express"

const router: Router = Router()

router
    .route("/:documentId")
    .post(verifyJWT, quizValidator(), validate, createQuiz)
    .get(verifyJWT, getAllQuizzes)
    .delete(verifyJWT, deleteQuizzes)

router
    .route("/:documentId/:quizId")
    .get(verifyJWT, getQuizById)
    .delete(verifyJWT, deleteQuizById)


export default router

