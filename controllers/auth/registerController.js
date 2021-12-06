import Joi from "joi";
import { User, RefreshToken } from "../../models";
import bcrypt from "bcrypt";
import {
  DEBUG_MODE,
  REFRESH_SECRET,
  EMAIL_SECRET,
  APP_URL,
  APP_NAME,
  EMAIL_USERNAME,
} from "../../config";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";
import transporter from "../../services/transporter";

const registerController = {
  async register(req, res, next) {
    //CHECKLIST
    //validate the data
    //authorise the request
    //check if user already exist in the db
    //prepare model
    //store in the db
    //generate access and refresh token
    //send response
    //validation
    const registerSchema = Joi.object({
      name: Joi.string().min(3).max(20),
      username: Joi.string().min(3).max(20).required(),
      email: Joi.string().max(50).required(),
      password: Joi.string().min(6).pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
      repeatPassword: Joi.ref("password"),
      profilePic: Joi.string(),
      coverPic: Joi.string(),
      followers: Joi.array(),
      following: Joi.array(),
      isSocial: Joi.boolean(),
      isAdmin: Joi.boolean(),
      isHidden: Joi.boolean(),
      isVerified: Joi.boolean(),
    });
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    // check if user is in the database already
    try {
      const exist = await User.exists({ email: req.body.email });
      if (exist) {
        return next(
          CustomErrorHandler.alreadyExist("You have already signed up!")
        );
      }
    } catch (err) {
      return next(err);
    }

    //prepare the model
    const { name, username, email, password, profilePic, coverPic } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    //store in db, generate access and refresh token
    let access_token;
    let refresh_token;
    let result;
    try {
      result = await user.save();
      if (DEBUG_MODE == true) {
        //console.log(result);
      }

      access_token = JwtService.sign({
        _id: result._id,
        username: result.username,
        isAdmin: result.isAdmin,
      });
      refresh_token = JwtService.sign(
        {
          _id: result._id,
          username: result.username,
          isAdmin: result.isAdmin,
        },
        "1y",
        REFRESH_SECRET
      );

      //another way
      const emailToken = JwtService.sign(
        { _id: result._id, email: result.email },
        "1d",
        EMAIL_SECRET
      );
      const url = `${APP_URL}/confirmation/${emailToken}`;
      transporter.sendMail({
        from: `"${APP_NAME}" <${EMAIL_USERNAME}>`,
        to: result.email,
        subject: `${APP_NAME} Confirm Your Email`,
        html: `Please click the url to confirm your email: <a href="${url}">${url}</a>`,
      });

      //add refreshToken to the db,
      await RefreshToken.create({ token: refresh_token });
    } catch (err) {
      return next(err);
    }
    res.status(200).json({ access_token, refresh_token });
  },
};

export default registerController;
