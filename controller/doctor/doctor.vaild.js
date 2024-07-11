import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

const doctorFields = {
  desc: joi.string().trim().lowercase().min(10).max(3000),
  experience: joi.string().trim().lowercase().min(2).max(100),
  specification: joi.string().trim().lowercase().min(3).max(100),
};

export const createDoctor = {
  body: joi
    .object({
      name: generalFields.name.required(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      phone: generalFields.PhoneNumber,
      desc: doctorFields.desc,
      gender: generalFields.gender,
      birthdate: generalFields.date,
      experience: doctorFields.experience,
      specification: doctorFields.specification,
    })
    .required(),
};
