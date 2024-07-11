import express from "express";
import * as ac from "../controller/auth/auth.js";
import * as vs from "../controller/auth/auth.vaild.js";
import { valid } from "../middleware/validation.js";

const router = express.Router();
router.post("/register",valid(vs.register), ac.register);
router.post("/login", ac.login);

export default router;
