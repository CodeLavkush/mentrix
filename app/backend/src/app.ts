import express from "express";
import { httpLogger } from "./middlewares/logger.middleware.js";
import type { Request, Response, Express } from 'express'

const app: Express = express();

app.use(httpLogger);

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send("Hello World!")
})

export default app;