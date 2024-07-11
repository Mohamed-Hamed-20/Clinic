import { model, Schema } from "mongoose";

const doctorSchema = new Schema(
  {
    name: {
      type: String,
      minlength: 3,
      maxlength: 66,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      minlength: 5,
      maxlength: 77,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      minlength: 6,
      maxlength: 80,
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^\d{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    desc: {
      type: String,
      min: 10,
      max: 3000,
    },
    specification: {
      type: String,
      min: 3,
      max: 100,
    },
    experience: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    gender: {
      type: String,
      lowercase: true,
      enum: ["male", "female"],
      default: "male",
    },
    birthdate: {
      type: Date,
      required: false,
    },
    imgUrl: {
      type: String,
      minlength: 5,
      maxlength: 500,
      default:
        "https://mohamed-files.s3.amazonaws.com/default-avatar-icon-of-social-media-user-vector.jpg",
    },
    role: {
      type: String,
      enum: ["doctor", "user"],
      default: "doctor",
      required: true,
    },
    isconfrimed: {
      type: Boolean,
      default: false,
      required: false,
    },
    Activecode: {
      type: String,
      min: 6,
      max: 500,
      required: false,
    },
    Agents: [
      {
        type: String,
        required: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

doctorSchema.index({ email: 1 }, { unique: true });
doctorSchema.index({ name: 1 });

const doctorModel = model("doctor", doctorSchema);

export default doctorModel;
