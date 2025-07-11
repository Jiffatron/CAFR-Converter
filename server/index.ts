import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import uploadRouter from "./routes/upload";
import stripeRouter from "./routes/stripe";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve uploaded CSVs if you keep local copies
app.use("/uploads", express.static("uploads"));

// ------------------------------------------------------------------
// Minimal request logger (only for /api or /stripe hits)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    if (!req.path.startsWith("/api") && !req.path.startsWith("/stripe")) return;
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} – ${ms}ms`);
  });
  next();
});
// ------------------------------------------------------------------

// Routes
app.use("/api", uploadRouter);   // POST /api/upload
app.use("/stripe", stripeRouter); // POST /stripe/create-checkout, GET /stripe/verify

// Render health check
app.get("/healthz", (_req: Request, res: Response) => res.sendStatus(200));

// Global error handler (keeps Render logs tidy)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const code = err.status || err.statusCode || 500;
  res.status(code).json({ message: err.message || "Internal Server Error" });
  console.error(err);
});

// Start server — Render will set PORT
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";
app.listen(PORT, HOST, () =>
  console.log(`CAFR API running on ${HOST}:${PORT}`)
);
