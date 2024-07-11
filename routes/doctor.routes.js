import express from "express";
import * as dc from "../controller/doctor/doctor.js";
import { valid } from "../middleware/validation.js";
import * as schema from "../controller/doctor/doctor.vaild.js";

const router = express.Router();

router.post("/create", valid(schema.createDoctor), dc.createDoctor);

export default router;
