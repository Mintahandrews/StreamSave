import express, { Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { videoRouter } from "./routes/video";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.MAX_REQUESTS_PER_MINUTE || "100"),
  handler: (req, res) => {
    res
      .status(429)
      .json({ error: "Too many requests, please try again later" });
  },
  skipSuccessfulRequests: true, // Only count failed requests
  keyGenerator: (req) => req.ip || (req.headers["x-forwarded-for"] as string),
});

app.use(limiter);
app.use(express.json());

// Routes
app.use("/api", videoRouter);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
