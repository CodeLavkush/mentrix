import app from "./app.js"
import { logger } from "./utils/logger.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

const PORT: number = 4000


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    logger.info("Server started");
})