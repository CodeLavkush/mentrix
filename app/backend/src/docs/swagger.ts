import path from "node:path";
import fs from "node:fs";
import yaml from "yaml";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

export function setupSwagger(app: Express) {
    const file = fs.readFileSync(
        path.join(process.cwd(), "src/docs/swagger.yml"),
        "utf8"
    );

    const swaggerDocument = yaml.parse(file);

    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument)
    );
}