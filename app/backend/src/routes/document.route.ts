import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/upload.middlware.js"
import { uploadDocument } from "../controllers/document.controller.js"
import { Router } from "express"


const router: Router = Router()

router
    .route("/")
    .post(verifyJWT, upload.single("document"), uploadDocument)


export default router

