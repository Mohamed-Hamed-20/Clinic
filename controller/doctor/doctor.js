import doctorModel from "../../DB/models/doctor.model.js";
import { asyncHandler } from "../../services/errorHandling.js";
import { hashpassword } from "../../services/hashpassword.js";

//create doctor
export const createDoctor = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, desc, gender, birthdate } = req.body;
  const { specification, experience } = req.body;

  const check = await doctorModel
    .findOne({ $or: [{ phone }, { email }] })
    .select("name email phone")
    .lean();

  // vaild its not duplicate data
  if (check) {
    let message = "";
    check.email === email
      ? (message = "Email is Already Exist")
      : (message = "Phone is Already Exist");
    return next(new Error({ message }, { code: 400 }));
  }

  const hashPassword = await hashpassword({
    password,
    saltRound: parseInt(process.env.salt_Round),
  });

  // object doctor
  const doctor = {
    name,
    email,
    password: hashPassword,
    phone,
    desc,
    gender,
    birthdate,
    specification,
    experience,
  };

  // create doctor
  const result = await doctorModel.create(doctor);

  if (!result) {
    return next(new Error(" SERVER ERROR ! Try Again Later", { code: 400 }));
  }
  //response
  return res.status(201).json({
    message: "doctor Created successfully",
    code: 201,
    doctor: { email, name },
  });
});
