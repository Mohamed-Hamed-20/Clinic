import express from "express";
import dotenv from "dotenv";
import authRouter from "./routes/auth.routes.js";
import doctorRouter from "./routes/doctor.routes.js";
import connectDB from "./DB/connect.js";
import { GlobalErrorHandling } from "./services/errorHandling.js";
const app = express();

dotenv.config({ path: "./.env" });

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
const port = parseInt(process.env.PORT);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
