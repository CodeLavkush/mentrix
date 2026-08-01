import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/upload.middlware.js"
import { uploadDocument, getDocumentsById, deleteDocumentById, downloadDocumentById } from "../controllers/document.controller.js"
import { Router } from "express"


const router: Router = Router()

router
    .route("/")
    .post(verifyJWT, upload.single("document"), uploadDocument)
    .get(verifyJWT, getDocumentsById)

router
    .route("/:documentId")
    .delete(verifyJWT, deleteDocumentById)

router
    .route("/:documentId/download")
    .get(verifyJWT, downloadDocumentById)


export default router

