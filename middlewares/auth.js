import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/JwtService";
import { User } from "../models";

const auth = async (req, res, next) => {
  let authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(CustomErrorHandler.unAuthorized());
  }

  const token = authHeader.split(" ")[1];

  try {
    const { _id, username, isAdmin } = await JwtService.verify(token);
    const userRecord = await User.findOne({ _id: _id });
    const realIsAdmin = userRecord.isAdmin;
    const user = {
      _id,
      username,
      isAdmin: realIsAdmin,
    };
    req.user = user;
    next();
  } catch (err) {
    return next(CustomErrorHandler.unAuthorized());
  }
};

export default auth;
