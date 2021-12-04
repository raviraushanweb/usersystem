import Joi from "joi";
import { REFRESH_SECRET } from "../../config";
import { RefreshToken, User } from "../../models";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import JwtService from "../../services/JwtService";

const refreshController = {
  async refresh(req, res, next) {
    //validation
    const refreshSchema = Joi.object({
      refresh_token: Joi.string().required(),
    });
    const { error } = refreshSchema.validate(req.body);
    if (error) {
      return next(error);
    }
    //database
    let refreshtoken;
    let access_token;
    let refresh_token;
    try {
      refreshtoken = await RefreshToken.findOne({
        token: req.body.refresh_token,
      });
      if (!refreshtoken) {
        return next(CustomErrorHandler.unAuthorized("Invalid refresh token!"));
      }
      let userId;
      try {
        const { _id } = await JwtService.verify(
          refreshtoken.token,
          REFRESH_SECRET
        );
        userId = _id;
      } catch (err) {
        return next(CustomErrorHandler.unAuthorized("Invalid refresh token!"));
      }

      const user = await User.findOne({ _id: userId });
      if (!user) {
        return next(CustomErrorHandler.unAuthorized("No user found!"));
      }

      //Token
      access_token = JwtService.sign({
        _id: user._id,
        username: user.username,
      });
      refresh_token = JwtService.sign(
        {
          _id: user._id,
          username: user.username,
        },
        "1y",
        REFRESH_SECRET
      );

      //database whitelist
      await RefreshToken.create({ token: refresh_token });
    } catch (err) {
      return next(new Error("Something went wrong " + err.message));
    }
    res.status(200).json({ access_token, refresh_token });
  },
};

export default refreshController;
