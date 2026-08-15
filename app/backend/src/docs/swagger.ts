import path from "node:path";
import fs from "node:fs";
import yaml from "yaml";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function setupSwagger(app: Express) {
    const file = fs.readFileSync(
        path.join(__dirname, "swagger.yml"),
        "utf8"
    );

    const swaggerDocument = yaml.parse(file);

    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument)
    );
}