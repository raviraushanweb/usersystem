import { User } from "../../models";
import Joi from "joi";
import CustomErrorHandler from "../../services/CustomErrorHandler";

const usernameCheck = {
  async isAvailable(req, res, next) {
    //validation
    const usernameSchema = Joi.object({
      username: Joi.string().min(3).max(20).required(),
    });
    const { error } = usernameSchema.validate(req.body);
    if (error) {
      return next(error);
    }

    // check if user is in the database already
    try {
      const exist = await User.exists({ username: req.body.username });
      if (exist) {
        return res.status(409).json("This username is not available!");
      }
      res.status(200).json("This username is available!");
    } catch (err) {
      return next(err);
    }
  },
};

export default usernameCheck;
