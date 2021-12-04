import mongoose from "mongoose";
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, min: 3, max: 20 },
    username: { type: String, require: true, min: 3, max: 20, unique: true },
    email: { type: String, require: true, max: 50, unique: true },
    password: { type: String, min: 6 },
    profilePic: { type: String, default: "" },
    coverPic: { type: String, default: "" },
    followers: { type: Array, default: [] },
    following: { type: Array, default: [] },
    isSocial: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema, "users");
