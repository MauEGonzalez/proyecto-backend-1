import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  age: { type: Number, required: true },
  password: { type: String, required: true },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "carts",
  },
  role: { type: String, default: "user" },
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(10));
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isValidPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

export const UserModel = mongoose.model("users", userSchema);
