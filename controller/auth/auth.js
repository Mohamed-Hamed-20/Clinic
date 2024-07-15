import GoogleAuth from "../../services/googleAuth.js";
import userModel from "../../DB/models/user.model.js";
import { roles } from "../../middleware/auth.js";
import { env } from "../../services/env.js";
import { asyncHandler, CustomError } from "../../services/errorHandling.js";
import { hashpassword, verifypass } from "../../services/hashpassword.js";
import { sanitizeUser } from "../../services/sanitize.data.js";
import { sendCode, sendconfirmEmail } from "../../services/sendEmail.js";
import { generateToken, verifyToken } from "../../services/Token.js";
// import { sendconfirmEmail } from "../../services/sendEmail.js";

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const userAgent = req.headers["user-agent"];

  // get user frm DB
  const user = await userModel
    .findOne({ $or: [{ email: email }, { phone: email }] }) // corrected query syntax
    .lean()
    .select(
      "name email password phone gender birthdate role isconfrimed Agents Activecode"
    );

  // if not user
  if (!user) {
    const error = new Error("Invalid Email or password");
    error.cause = 400;
    return next(error);
  }

  // verify password
  const matched = await verifypass({
    password: password,
    hashpassword: user.password,
  });

  // if invaild password
  if (!matched) {
    const error = new Error("Invalid Email or password");
    error.cause = 400;
    return next(error);
  }

  // Email not confirmed
  if (!user.isconfrimed) {
    const error = new Error("you need to confirm your email");
    error.cause = 400;
    return next(error);
  }

  // if its new agent
  if (!user.Agents.includes(userAgent)) {
    return next(
      new Error("You are trying to log in from a new device", { cause: 401 })
    );
  }

  //generate acess token
  const accessToken = await generateToken({
    payload: { userId: user._id, userAgent, IpAddress: req.ip },
    signature: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: process.env.accessExpireIn,
  });

  //generate refresh token
  const refreshToken = await generateToken({
    payload: { userId: user._id, userAgent, IpAddress: req.ip },
    signature: process.env.REFRESH_TOKEN_SECRET,
    expiresIn: process.env.REFRESH_ExpireIn,
  });

  // Set cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.MOOD === env.prod,
    sameSite: "strict",
    maxAge: 1 * 3600 * 1000, // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.MOOD === env.prod,
    sameSite: "strict",
    maxAge: 5 * 24 * 3600 * 1000, // 5 days
  });

  return res.json({ message: "Login successfully", user: sanitizeUser(user) });
});

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, gender, birthdate } = req.body;
  const userAgent = req.headers["user-agent"];
  const check = await userModel.findOne({ $or: [{ email }, { phone }] });

  // check if email or phone is duplicated
  if (check) {
    let message = "";
    check.phone === phone
      ? (message = "phone number Is Already Exist")
      : (message = "Email Is Already Exist");
    return next(new Error(message), { cause: 400 });
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
  const link = `${frontEndURL}confirmEmail`;
  const sendedPromise = sendconfirmEmail(user, link);

  // safe object data
  const userPromise = user.save();

  const [issend, userData] = await Promise.all([sendedPromise, userPromise]);

  return !issend || !userData
    ? next(new Error("SERVER ERROR !", { code: 500 }))
    : res.status(201).json({
        message: "Created success & check your Inbox",
        user: sanitizeUser(userData),
      });
});

export const confirmEmail = asyncHandler(async (req, res, next) => {
  const key = req.params.token;
  const userAgent = req.headers["user-agent"];

  const decode = await verifyToken({
    token: key,
    signature: process.env.DEFAULT_SIGNATURE,
  });

  if (!decode || !decode.userId) {
    return next(new Error("Invaild Key or payload", { cause: 400 }));
  }

  const user = await userModel
    .findByIdAndUpdate(
      { _id: decode.userId },
      { isconfrimed: true, $addToSet: { Agents: userAgent } },
      { new: true }
    )
    .lean()
    .select(
      "name email password phone gender birthdate role isconfrimed Agents Activecode"
    );

  if (!user) {
    return next(new Error("SERVER ERROR :(", { cause: 500 }));
  }

  //generate acess token
  const accessToken = await generateToken({
    payload: { userId: user._id, userAgent, IpAddress: req.ip },
    signature: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: process.env.accessExpireIn,
  });

  //generate refresh token
  const refreshToken = await generateToken({
    payload: { userId: user._id, userAgent, IpAddress: req.ip },
    signature: process.env.REFRESH_TOKEN_SECRET,
    expiresIn: process.env.REFRESH_ExpireIn,
  });

  // Set cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.MOOD === env.prod,
    sameSite: "strict",
    maxAge: 1 * 3600 * 1000, // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.MOOD === env.prod,
    sameSite: "strict",
    maxAge: 5 * 24 * 3600 * 1000, // 5 days
  });

  return res.json({ message: "Login successfully", user: sanitizeUser(user) });
});

/**
 * @desc    Send verification code to user email or phone
 * @route   POST /api/v1/auth/sendverifyCode
 * @access  Public
 */
export const sendVerifyCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Find user by email or phone
  const user = await userModel
    .findOne({ $or: [{ email }, { phone: email }] })
    .select("email phone Activecode");

  // If user not found, throw error
  if (!user) {
    return new CustomError("Invalid Email or Phone", 400);
  }

  // Generate and send verification code
  const code = await sendCode({ name: user.name, email: user.email });

  // If code sending fails, throw server error
  if (!code) {
    return new CustomError(
      "SERVER ERROR: Unable to send email, try later",
      500
    );
  }

  // Update user with the new active code
  user.Activecode = code;

  const updatedUser = await user.save();

  // If user update fails, throw server error
  if (!updatedUser) {
    return new CustomError("SERVER ERROR: Unable to update user", 500);
  }

  // Send success response
  return res.status(200).json({ message: "Code sent successfully" });
});

export const verifySendcode = asyncHandler(async (req, res, next) => {
  const { code, email } = req.body;
  console.log({ code, email });
  const userAgent = req.headers["user-agent"];

  // Find user by email or phone
  const user = await userModel
    .findOne({ $or: [{ email }, { phone: email }] })
    .select("email phone Activecode")
    .lean();

  // If user not found, throw error
  if (!user) {
    return new CustomError("Invalid Email or Phone", 400);
  }

  if (!user.Activecode || user.Activecode !== code) {
    return next(new Error(" Invaild Code", { cause: 400 }));
  }

  const updatedUser = await userModel.findByIdAndUpdate(
    { _id: user._id },
    {
      isconfrimed: true,
      $addToSet: { Agents: userAgent },
      $unset: { Activecode: "" },
    },
    { new: true }
  );

  // If user update fails, throw server error
  if (!updatedUser) {
    return new CustomError("SERVER ERROR: Unable to update user", 500);
  }

  // Send success response
  return res.status(200).json({ message: "verifiyed Successfully" });
});

// generate url auth
export const googleUrlAuth = asyncHandler(async (req, res, next) => {
  const googleAuth = new GoogleAuth();
  const url = await googleAuth.generateAuthUrl();
  return res.status(200).json({ message: " url created successfully ", url });
});

export const googleCallBack = asyncHandler(async (req, res, next) => {
  console.log({ query: req.query });
  console.log({ body: req.body });
  console.log({ params: req.params });
  const code = req.query.code;
  const googleAuth = new GoogleAuth();

  const user = await googleAuth.getUserInfo(code);
  return res.json({ user });
  // return res.json({ query: req.query, params: req.params, body: req.body });
});
