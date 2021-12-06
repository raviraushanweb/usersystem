import { EMAIL_SECRET, APP_URL, APP_NAME, EMAIL_USERNAME } from "../../config";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";
import transporter from "../../services/transporter";
import { User } from "../../models";
import mongoose from "mongoose";

const verifyProfile = {
  async sendVerification(req, res, next) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return next(CustomErrorHandler.objectIdNotValid());
      }
      if (req.params.id == req.user._id || req.user.isAdmin) {
        const result = await User.findOne({ _id: req.user._id });
        if (!result.isVerified) {
          const emailToken = JwtService.sign(
            { _id: result._id, email: result.email },
            "1d",
            EMAIL_SECRET
          );
          const url = `${APP_URL}/api/confirmation/${emailToken}`;
          transporter.sendMail({
            from: `"${APP_NAME}" <${EMAIL_USERNAME}>`,
            to: result.email,
            subject: `${APP_NAME} Confirm Your Email`,
            html: `This verification email is valid for next 24 hours. Please click the url to confirm your email: <a href="${url}">${url}</a>`,
          });
          return res.status(200).json("Verification email sent successfully.");
        } else {
          return res.status(409).json("You are already verified!");
        }
      } else {
        return res.status(403).json("You are not logged in!");
      }
    } catch (err) {
      return next(err);
    }
  },

  async acceptVerification(req, res, next) {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(404).json("Please provide valid token!");
      }
      const session = await JwtService.verify(token, EMAIL_SECRET);
      const userId = session._id;
      const userEmail = session._id;
      const record = await User.findOne({ _id: userId });
      if (record) {
        const document = await User.findOneAndUpdate(
          { _id: userId },
          {
            isVerified: true,
          },
          { new: true }
        );
        return res.status(201).json(document);
      } else {
        return res.status(404).json("User doesn't exist");
      }
    } catch (err) {
      return next(err);
    }
  },
};

export default verifyProfile;
