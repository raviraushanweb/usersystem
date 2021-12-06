import { User } from "../../models";
import transporter from "../../services/transporter";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";
import { EMAIL_SECRET, APP_URL, APP_NAME, EMAIL_USERNAME } from "../../config";

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await User.findOne({ email: email });
    if (result) {
      const uniqueSecret = EMAIL_SECRET + `${result.password}`;
      const token = await JwtService.sign(
        { _id: result._id, email: result.email },
        "1h",
        uniqueSecret
      );
      const userId = result._id;
      const url = `${APP_URL}/api/resetPassword/${userId}/${token}`;
      transporter.sendMail({
        from: `"${APP_NAME}" <${EMAIL_USERNAME}>`,
        to: result.email,
        subject: `${APP_NAME} Password Reset Link`,
        html: `This password reset link is valid for next 1 hour. Please open the url to change your password : <a href="${url}">${url}</a>`,
      });
      return res.status(200).json("Password reset link sent successfully!");
    } else {
      return next(CustomErrorHandler.notFound());
    }
  } catch (err) {
    return next(err);
  }
};

export default forgotPassword;
