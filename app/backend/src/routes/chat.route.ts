import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getMessages, sendMessage } from "../controllers/chat.controller.js"
import { Router } from "express"


const router: Router = Router()

router
    .route("/:documentId")
    .post(verifyJWT, sendMessage)
    .get(verifyJWT, getMessages)


export default router

