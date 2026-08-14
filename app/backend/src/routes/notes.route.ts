import { noteValidator } from "../validators/index.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middlware.js"
import { Router } from "express"
import { createNote, getAllNotes, getNoteById, deleteAllNotes, deleteNoteById } from "../controllers/notes.controller.js"


const router: Router = Router()


router
    .route("/:documentId")
    .post(verifyJWT, noteValidator(), validate, createNote)
    .get(verifyJWT, getAllNotes)
    .delete(verifyJWT, deleteAllNotes)

router
    .route("/:documentId/:noteId")
    .get(verifyJWT, getNoteById)
    .delete(verifyJWT, deleteNoteById)


export default router