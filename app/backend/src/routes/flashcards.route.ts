import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getAllFlashCards } from "../controllers/flashcard.controller.js"
import { Router } from "express"

const router: Router = Router()


router
    .route("/:flashcardSetId")
    .get(verifyJWT, getAllFlashCards)


export default router