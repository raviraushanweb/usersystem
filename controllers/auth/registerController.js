import Joi from "joi";
import { User, RefreshToken } from "../../models";
import bcrypt from "bcrypt";
import { DEBUG_MODE, REFRESH_SECRET } from "../../config";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";

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
    try {
      const result = await user.save();
      if (DEBUG_MODE == true) {
        //console.log(result);
      }

      access_token = JwtService.sign({
        _id: result._id,
        username: result.username,
      });
      refresh_token = JwtService.sign(
        {
          _id: result._id,
          username: result.username,
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
};

export default registerController;
