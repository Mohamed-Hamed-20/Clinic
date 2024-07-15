import express from "express";
import * as ac from "../controller/auth/auth.js";
import * as vs from "../controller/auth/auth.vaild.js";
import { valid } from "../middleware/validation.js";

const router = express.Router();
// system login
router.post("/register", valid(vs.register), ac.register);
router.post("/login", valid(vs.login), ac.login);
router.get("/confirm/email/:token", valid(vs.confirmEmail), ac.confirmEmail);
router.post("/get/sendverifyCode", valid(vs.verifycode), ac.sendVerifyCode);
router.post("/verify/send/code", valid(vs.verifySendcode), ac.verifySendcode);

// google login

router.get("/google/url", ac.googleUrlAuth);
router.get("/google/callback", ac.googleCallBack);

export default router;
