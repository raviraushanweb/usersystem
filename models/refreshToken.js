import mongoose from "mongoose";
const Schema = mongoose.Schema;

const refreshToken = new Schema(
  {
    token: { type: String, unique: true },
  },
  { timestamps: false }
);

export default mongoose.model("RefreshToken", refreshToken, "refreshTokens");
