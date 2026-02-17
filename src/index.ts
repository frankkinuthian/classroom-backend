// Initialize APM as early as possible without hard-failing environments
// where the agent/config is intentionally unavailable.
import("apminsight")
  .then(({ default: AgentAPI }) => AgentAPI.config())
  .catch(() => console.log("APM not available in this environment"));

import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import securityMiddleware from "./middleware/security.js";
import classesRouter from "./routes/classes.js";
import departmentsRouter from "./routes/departments.js";
import enrollmentsRouter from "./routes/enrollments.js";
import statsRouter from "./routes/stats.js";
import subjectsRouter from "./routes/subjects.js";
import usersRouter from "./routes/users.js";

const app = express();
const PORT = process.env.PORT || 8000;
const LOG_REQUESTS =
  process.env.LOG_REQUESTS === "true" || process.env.NODE_ENV !== "production";

// Allow frontend origin to call this API with cookies/credentials.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  }),
);

// Better Auth handler for all auth endpoints.
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

// Global security guard (Arcjet rules + role-based throttling).
app.use(securityMiddleware);

// Optional request timing logs in non-production or when explicitly enabled.
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

// Domain route mounting.
app.use("/api/classes", classesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/subjects", subjectsRouter);
app.use("/api/users", usersRouter);

// Simple health/root endpoint.
app.get("/", (req, res) => {
  res.send("Hello, Welcome to the classroom API!");
});

// Bind to Railway-provided PORT in production; fallback to 8000 locally.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
