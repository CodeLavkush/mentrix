import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middlware.js"
import { flashcardProgressValidator } from "../validators/index.js"
import { Router } from "express"
import { createFlashcardProgress, deleteAllFlashcardProgress, getAllFlashcardProgress, deleteFlashcardProgressById, getFlashcardProgressBySet } from "../controllers/flashcardProgress.controller.js"


const router: Router = Router()

router
    .route("/set/:flashcardSetId")
    .get(verifyJWT, getFlashcardProgressBySet)

router
    .route("/:flashcardId")
    .post(verifyJWT, flashcardProgressValidator(), validate, createFlashcardProgress)
    .get(verifyJWT, getAllFlashcardProgress)
    .delete(verifyJWT, deleteAllFlashcardProgress)

router
    .route("/:flashcardId/:flashcardProgressId")
    .delete(verifyJWT, deleteFlashcardProgressById)


export default router
