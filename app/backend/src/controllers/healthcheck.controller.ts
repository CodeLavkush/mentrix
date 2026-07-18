import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import type { RequestHandler } from "express"
import { uploadFile } from "../services/storage.service.js"

const healthCheck: RequestHandler = asyncHandler(async (req, res) => {

    await uploadFile("C:\\Users\\Lavkush\\Documents\\Study\\Sem 5\\project\\diagram\\mentrix_er.jpeg", Buffer.from("Health check file"), "image/jpeg");

    res
        .status(200)
        .json(new ApiResponse(
            200,
            {
                message: "Server is running"
            }
        ))
})

export { healthCheck }