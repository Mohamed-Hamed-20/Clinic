import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const register = {
  body: joi
    .object({
      name: generalFields.name.required(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      cpassword: joi.string().valid(joi.ref("password")).required(),
      phone: generalFields.PhoneNumber.optional(),
      gender: generalFields.gender.optional(),
      birthdate: generalFields.date.optional(),
    })
    .required(),
};

export const login = {
  body: joi.object({
    email: joi.string().trim().min(5).max(30).required(),
    password: generalFields.password.required(),
  }),
};

export const confirmEmail = {
  params: joi
    .object({
      token: joi.string().trim().min(7).max(222).required(),
    })
    .required(),
};

export const verifycode = {
  body: joi
    .object({
      email: joi.string().trim().min(7).max(222).required(),
    })
    .required(),
};

export const verifySendcode = {
  body: joi.object({
    email: joi.string().trim().min(7).max(222).required(),
    code: joi
      .string()
      .trim()
      .pattern(/^[0-9]{6}$/)
      .required(),
  }),
};
