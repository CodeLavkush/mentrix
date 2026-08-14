import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middlware.js"
import { flashcardProgressValidator } from "../validators/index.js"
import { Router } from "express"
import { createFlashcardProgress, deleteAllFlashcardProgress, getAllFlashcardProgress, deleteFlashcardProgressById } from "../controllers/flashcardProgress.controller.js"


const router: Router = Router()

router
    .route("/:flashcardId")
    .post(verifyJWT, flashcardProgressValidator(), validate, createFlashcardProgress)
    .delete(verifyJWT, deleteAllFlashcardProgress)

router
    .route("/:flashcardId/:flashcardProgressId")
    .get(verifyJWT, getAllFlashcardProgress)
    .delete(verifyJWT, deleteFlashcardProgressById)


export default router
