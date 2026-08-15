import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import type { Express } from "express";
import { httpLogger } from "./middlewares/logger.middleware.js";
import { errorMiddleware } from "./middlewares/error.middlware.js";
import { setupSwagger } from "./docs/swagger.js";

const app: Express = express();
const apiPrefix = "/api/v1";

app.set("trust proxy", 1);

// 1. CORS Configuration (MUST BE FIRST)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5174",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, internal calls)
    if (!origin) return callback(null, true);
    
    // Check if origin matches allowed list or any localhost/127.0.0.1 port
    if (
      allowedOrigins.includes(origin) ||
      /^http:\/\/localhost(:\d+)?$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow in dev/local environments
  },
  credentials: true,
  methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Headers",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// 2. Rate Limiting (Skip preflight OPTIONS requests)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 500, // higher limit for active SPA interactions
  skip: (req) => req.method === "OPTIONS",
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);
app.use(httpLogger);
app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ extended: true, limit: "16mb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Routers
import healthCheckRouter from "./routes/healthcheck.route.js";
import authRouter from "./routes/auth.route.js";
import profileRouter from "./routes/profile.route.js";
import documentRouter from "./routes/document.route.js";
import chatRouter from "./routes/chat.route.js";
import quizRouter from "./routes/quiz.route.js";
import quizQuestionsRouter from "./routes/quizQuestions.route.js";
import quizAttemptsRouter from "./routes/quizAttempts.route.js";
import flashcardSetsRouter from "./routes/flashcardSets.routes.js";
import flashcardsRouter from "./routes/flashcards.route.js";
import flashcardProgressRouter from "./routes/flashcardProgress.route.js";
import notesRouter from "./routes/notes.route.js";
import whiteboardRouter from "./routes/whiteboard.route.js";

setupSwagger(app); // swagger docs endpoint

app.use(apiPrefix + "/healthcheck", healthCheckRouter);
app.use(apiPrefix + "/auth", authRouter);
app.use(apiPrefix + "/profile", profileRouter);
app.use(apiPrefix + "/document", documentRouter);
app.use(apiPrefix + "/chat", chatRouter);
app.use(apiPrefix + "/quiz", quizRouter);
app.use(apiPrefix + "/quiz-questions", quizQuestionsRouter);
app.use(apiPrefix + "/quiz-attempts", quizAttemptsRouter);
app.use(apiPrefix + "/flashcardsets", flashcardSetsRouter);
app.use(apiPrefix + "/flashcards", flashcardsRouter);
app.use(apiPrefix + "/flashcard-progress", flashcardProgressRouter);
app.use(apiPrefix + "/notes", notesRouter);
app.use(apiPrefix + "/whiteboard", whiteboardRouter);

// Error Middleware
app.use(errorMiddleware);

export default app;