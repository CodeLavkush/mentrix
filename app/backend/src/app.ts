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
import profileRouter from "./routes/profile.route.js"
import documentRouter from "./routes/document.route.js"
import chatRouter from "./routes/chat.route.js"
import quizRouter from "./routes/quiz.route.js"
import quizQuestionsRouter from "./routes/quizQuestions.route.js"
import quizAttemptsRouter from "./routes/quizAttempts.route.js"
import flashcardSetsRouter from "./routes/flashcardSets.routes.js"
import flashcardsRouter from "./routes/flashcards.route.js"
import flashcardProgressRouter from "./routes/flashcardProgress.route.js"
import notesRouter from "./routes/notes.route.js"
import whiteboardRouter from "./routes/whiteboard.route.js"

setupSwagger(app); // swagger docs endpoint
app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/profile", profileRouter)
app.use("/api/v1/document", documentRouter)
app.use("/api/v1/chat", chatRouter)
app.use("/api/v1/quiz", quizRouter)
app.use("/api/v1/quiz-questions", quizQuestionsRouter)
app.use("/api/v1/quiz-attempts", quizAttemptsRouter)
app.use("/api/v1/flashcardsets", flashcardSetsRouter)
app.use("/api/v1/flashcards", flashcardsRouter)
app.use("/api/v1/flashcard-progress", flashcardProgressRouter)
app.use("/api/v1/notes", notesRouter)
app.use("/api/v1/whiteboard", whiteboardRouter)

app.use(errorMiddleware)

export default app;