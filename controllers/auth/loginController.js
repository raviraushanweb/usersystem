import Joi from "joi";
import { User, RefreshToken } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import bcrypt from "bcrypt";
import JwtService from "../../services/JwtService";
import { REFRESH_SECRET } from "../../config";

const loginController = {
  async login(req, res, next) {
    const { email, username, password } = req.body;
    //validation
    if (email) {
      const emailSchema = Joi.object({
        email: Joi.string().max(50).required(),
        password: Joi.string()
          .min(6)
          .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
      });
      const { error } = emailSchema.validate(req.body);
      if (error) {
        return next(error);
      }
    }
    if (username) {
      const usernameSchema = Joi.object({
        username: Joi.string().min(3).max(20).required(),
        password: Joi.string()
          .min(6)
          .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
      });
      const { error } = usernameSchema.validate(req.body);
      if (error) {
        return next(error);
      }
    }
    let user;
    let access_token;
    let refresh_token;
    try {
      if (email) {
        user = await User.findOne({ email: email });
        if (!user) {
          return next(CustomErrorHandler.wrongCredentials());
        }
      }
      if (username) {
        user = await User.findOne({ username: username });
        if (!user) {
          return next(CustomErrorHandler.wrongCredentials());
        }
      }
      //compare the password
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return next(CustomErrorHandler.wrongCredentials());
      }

      //Token
      access_token = JwtService.sign({
        _id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
      });
      refresh_token = JwtService.sign(
        {
          _id: user._id,
          username: user.username,
          isAdmin: user.isAdmin,
        },
        "1y",
        REFRESH_SECRET
      );
      //add refreshToken to the db,
      await RefreshToken.create({ token: refresh_token });
    } catch (err) {
      return next(err);
    }
    res.status(200).json({ access_token, refresh_token });
  },
  async logout(req, res, next) {
    //validation
    const refreshSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });
    const { error } = refreshSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    try {
      await RefreshToken.deleteOne({ token: req.body.refresh_token });
    } catch (err) {
      return next(new Error("Something went wrong with the database!"));
    }
    res.status(200).json({ status: 1 });
  },
};

export default loginController;
