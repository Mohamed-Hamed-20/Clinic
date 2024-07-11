import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import connectDB from "./DB/connect.js";
import { GlobalErrorHandling } from "./services/errorHandling.js";
const app = express();

dotenv.config({ path: "./.env" });

const allowedOrigins = [
  "https://graduation-project-beryl-seven.vercel.app/",
  "https://graduation-project-beryl-seven.vercel.app",
  "http://localhost:3000/",
  "http://localhost:3000",
  "https://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

// parse Data
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true }));

// DB connection
connectDB();

// === API ====
app.use("/auth", authRouter);
app.use("/doctor", doctorRouter);

// ========================
app.get("/", (req, res) => res.send("Hello World!"));
app.all("*", (req, res) => {
  res.json({ message: "Invaild url or method check documantation" });
});

//Globale error handling
app.use(GlobalErrorHandling);

// ==================
const port = parseInt(process.env.PORT) || 3707;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
