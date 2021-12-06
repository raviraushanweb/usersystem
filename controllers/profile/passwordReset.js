import { User } from "../../models";
import transporter from "../../services/transporter";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";
import { EMAIL_SECRET, APP_URL, APP_NAME, EMAIL_USERNAME } from "../../config";
import Joi from "joi";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

const resetPassword = async (req, res, next) => {
  try {
    const { id, token } = req.params;
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(CustomErrorHandler.objectIdNotValid());
    }
    const resetSchema = Joi.object({
      password: Joi.string().min(6).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
      repeatPassword: Joi.ref("password"),
    });
    const { error } = resetSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    const result = await User.findOne({ _id: id });
    if (result) {
      const uniqueSecret = EMAIL_SECRET + `${result.password}`;
      const { _id, email } = JwtService.verify(token, uniqueSecret);

      if (email == result.email) {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const document = await User.findOneAndUpdate(
          { email: email },
          {
            password: hashedPassword,
          },
          { new: true }
        );
        return res.status(200).json(document);
      } else {
        return res.status(400).json("Url tempered!");
      }
    } else {
      return next(CustomErrorHandler.notFound());
    }
  } catch (err) {
    return next(err);
  }
};

export default resetPassword;
