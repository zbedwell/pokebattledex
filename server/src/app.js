import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createApiRouter } from "./routes/index.js";
import { AppError } from "./utils/httpErrors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createApp = ({ services, nodeEnv = "development" }) => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", createApiRouter(services));

  if (nodeEnv === "production") {
    const clientDistPath = path.resolve(__dirname, "../../client/dist");
    app.use(express.static(clientDistPath));

    app.use((req, res, next) => {
      if (req.path.startsWith("/api")) {
        next();
        return;
      }
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        error: error.message,
        details: error.details,
      });
      return;
    }

    console.error(error);
    res.status(500).json({
      error: "Internal server error",
    });
  });

  return app;
};
