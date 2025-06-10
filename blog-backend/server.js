import express from "express";
import dotenv from "dotenv";
import connectDB from "./Database/db.js";
import postRouter from "./Routers/postRoutes.js";
import authRouter from "./Routers/authRoutes.js";
import userRouter from "./Routers/userRoutes.js";
import commentRouter from "./Routers/commentRoutes.js";
import cookieParser from "cookie-parser";
import AppError from "./Utils/appError.js";
import errorHandler from "./Middlewares/errorHandler.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import cors from "cors";

dotenv.config();
const app = express();
connectDB();

app.use(
  cors({
    origin: "http://localhost:5500",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.set("view engine", "pug");
app.set("views", join(__dirname, "views"));

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).render("base");
});
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.use((req, res, next) => {
  const error = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(error);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
