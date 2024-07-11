import userModel from "../../DB/models/user.model.js";
import { roles } from "../../middleware/auth.js";
import { asyncHandler } from "../../services/errorHandling.js";
import { hashpassword } from "../../services/hashpassword.js";
import { sanitizeUser } from "../../services/sanitize.data.js";
import { sendconfirmEmail } from "../../services/sendEmail.js";
// import { sendconfirmEmail } from "../../services/sendEmail.js";

export const login = asyncHandler(async (req, res, next) => {
  console.log("hellow");
  const hi = 1;
  hi = 2;
  res.json({ hi: "helow" });
});

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, gender, birthdate } = req.body;
  const userAgent = req.headers["user-agent"];
  const check = await userModel.findOne({ $or: [{ email, phone }] });

  // check if email or phone is duplicated
  if (check) {
    let message = "";
    check.phone === phone
      ? (message = "phone number Is Already Exist")
      : (message = "Email Is Already Exist");
    return next(new Error(message), { code: 400 });
  }

  // hash password
  const newPassword = await hashpassword({
    password,
    saltRound: parseInt(process.env.salt_Round),
  });

  const user = new userModel({
    name: name,
    email,
    password: newPassword,
    phone: phone,
    gender: gender,
    birthdate: birthdate,
    role: roles.user,
    isconfrimed: false,
    Agents: [userAgent],
  });

  // send confirm email
  let frontEndURL = req.headers.referer;
  const link = `${frontEndURL}auth/confirm`;
  const sendedPromise = sendconfirmEmail(user, link);

  // safe object data
  const userPromise = user.save();

  const [issend, userData] = await Promise.all([sendedPromise, userPromise]);

  return !issend || !userData
    ? next(new Error("SERVER ERROR !", { code: 500 }))
    : res
        .status(201)
        .json({ message: "Created success & check your Inbox", user: sanitizeUser(userData) });
});
