import { Router } from "express";
import { createFlashcardSet, getAllFlashcardSets, getFlashcardSetsById, deleteAllFlashcardSets, deleteFlashcardSetsById } from "../controllers/flashcardSets.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { flashcardSetValidator } from "../validators/index.js";
import { validate } from "../middlewares/validate.middlware.js";



const router: Router = Router()


router
    .route("/:quizAttemptId")
    .post(verifyJWT, flashcardSetValidator(), validate, createFlashcardSet)
    .get(verifyJWT, getAllFlashcardSets)
    .delete(verifyJWT, deleteAllFlashcardSets)


router
    .route("/:quizAttemptId/:flashcardSetsId")
    .get(verifyJWT, getFlashcardSetsById)
    .delete(verifyJWT, deleteFlashcardSetsById)

export default router