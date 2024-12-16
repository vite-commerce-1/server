import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import Randomstring from "randomstring";
import { Otp } from "./otp.model.js";

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    country: {
      type: String,
    },
    coordinates: {
      type: {
        latitude: {
          type: Number,
        },
        longitude: {
          type: Number,
        },
      },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const userSchema = new Schema({
  username: {
    type: String,
    required: [true, "username is required"],
    unique: [true, "username is already taken"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email is already taken"],
    validate: {
      validator: validator.isEmail,
      message: "Email is invalid",
    },
  },
  image: {
    type: String,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "password is required"],
    minLength: [6, "password must be at least 6 characters"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  address: {
    addressSchema,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  refreshToken: {
    type: String,
  },
  emailVerifiedAt: {
    type: Date,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateOtpCode = async function () {
  const randomstring = Randomstring.generate({
    length: 6,
    charset: "numeric",
  });

  let now = new Date();

  const otp = await Otp.findOneAndUpdate(
    {
      user: this._id,
    },
    {
      otpCode: randomstring,
      validUntil: now.setMinutes(now.getMinutes() + 5),
    },
    {
      new: true,
      upsert: true,
    }
  );
  return otp;
};

const User = mongoose.model("User", userSchema);

export default User;
