import { whiteboardValidator } from "../validators/index.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middlware.js"
import { Router } from "express"
import {
    createWhiteboard,
    getAllWhiteboards,
    getWhiteboardById,
    getWhiteboardThumbnail,
    deleteWhiteboardById,
    deleteWhiteboards
} from "../controllers/whiteboard.controller.js"
import { upload } from "../middlewares/upload.middlware.js"


const router: Router = Router()


router
    .route("/")
    .post(verifyJWT, upload.single("thumbnail"), whiteboardValidator(), validate, createWhiteboard)
    .get(verifyJWT, getAllWhiteboards)
    .delete(verifyJWT, deleteWhiteboards)

router
    .route("/:whiteboardId/thumbnail")
    .get(getWhiteboardThumbnail)

router
    .route("/:whiteboardId")
    .get(verifyJWT, getWhiteboardById)
    .delete(verifyJWT, deleteWhiteboardById)


export default router