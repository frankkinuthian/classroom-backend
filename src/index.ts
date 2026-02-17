import express from "express";
import subjectsRouter from "./routes/subjects";
import cors from "cors";
import securityMiddleware from "./middleware/security";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();
const PORT = process.env.PORT || 8000;
const LOG_REQUESTS =
  process.env.LOG_REQUESTS === "true" || process.env.NODE_ENV !== "production";

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

// Security middleware
app.use(securityMiddleware);

if (LOG_REQUESTS) {
  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();

    res.on("finish", () => {
      const durationMs =
        Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      const safeUrl = req.originalUrl.split("?")[0];
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${safeUrl} -> ${res.statusCode} (${durationMs.toFixed(1)}ms)`,
      );
    });

    next();
  });
}

// Subjects router
app.use("/api/subjects", subjectsRouter);

app.get("/", (req, res) => {
  res.send("Hello, Welcome to the classroom API!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
