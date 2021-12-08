import { User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import mongoose from "mongoose";

const isVerified = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(CustomErrorHandler.objectIdNotValid());
    }
    const result = await User.findOne({ _id: userId }).select("isVerified");
    if (result) {
      if (result.isVerified == true) {
        return res.status(200).json({ isVerified: true });
      } else {
        return res.status(200).json({ isVerified: false });
      }
    } else {
      return next(CustomErrorHandler.notFound("User doesn't exist."));
    }
  } catch (err) {
    return next(err);
  }
};

export default isVerified;
