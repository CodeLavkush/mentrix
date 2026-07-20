import express from "express";
import { httpLogger } from "./middlewares/logger.middleware.js";
import { errorMiddleware } from "./middlewares/error.middlware.js";
import type { Express } from 'express'
import { setupSwagger } from "./docs/swagger.js";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser"
import cors from 'cors'

const app: Express = express();

app.set("trust proxy", 1)

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    limit: 100, // max requests per IP

    message: {
        success: false,
        message: "Too many requests, please try again later"
    },

    standardHeaders: true,
    legacyHeaders: false,
})


app.use(limiter)
app.use(httpLogger);
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(","),
    credentials: true,
    methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization"],
}))

import healthCheckRouter from "./routes/healthcheck.route.js"
import authRouter from "./routes/auth.route.js"

setupSwagger(app); // swagger docs endpoint
app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/auth", authRouter)

app.use(errorMiddleware)

export default app;