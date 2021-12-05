import multer from "multer";
import path from "path";
import fs from "fs";
import Joi from "joi";
import { User } from "../../models";
import bcrypt from "bcrypt";
import CustomErrorHandler from "../../services/CustomErrorHandler";
import mongoose from "mongoose";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const handleMultipartData = multer({
  storage,
  limits: { fileSize: 1000000 * 2 },
}).fields([
  { name: "profilePic", maxCount: 1 },
  { name: "coverPic", maxCount: 1 },
]);

const updateProfile = {
  async update(req, res, next) {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(CustomErrorHandler.objectIdNotValid());
    }
    const userExists = await User.exists({ _id: req.params.id });
    if (!userExists) {
      return next(CustomErrorHandler.notFound("User doesn't exist!"));
    }
    if (req.user._id == req.params.id) {
      //multipart form data
      handleMultipartData(req, res, async (err) => {
        if (err) {
          return next(CustomErrorHandler.serverError(err.message));
        }
        let profilePicFilePath;
        let coverPicFilePath;
        if (req.files.profilePic) {
          profilePicFilePath = req.files.profilePic[0].path;
        }
        if (req.files.coverPic) {
          coverPicFilePath = req.files.coverPic[0].path;
        }
        //validation
        const profileSchema = Joi.object({
          name: Joi.string().min(3).max(20),
          username: Joi.string().min(3).max(20).required(),
          password: Joi.string()
            .min(6)
            .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
          repeatPassword: Joi.ref("password"),
          profilePic: Joi.string(),
          coverPic: Joi.string(),
          isHidden: Joi.boolean(),
        });
        const { error } = profileSchema.validate(req.body);
        if (error) {
          //Delete the uploaded file
          fs.unlink(`${appRoot}/${profilePicFilePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
          });
          fs.unlink(`${appRoot}/${coverPicFilePath}`, (err) => {
            if (err) {
              return next(CustomErrorHandler.serverError(err.message));
            }
          });

          return next(error);
          // rootfolder/uploads/filename.png
        }

        const { name, username, password, isHidden } = req.body;
        const { profilePic, coverPic } = req.files;
        let hashedPassword;
        if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
        }
        let document;
        const previousUsername = req.user.username;
        try {
          if (previousUsername != username) {
            const usernameExist = await User.exists({ username: username });
            if (usernameExist) {
              //Delete the uploaded file
              fs.unlink(`${appRoot}/${profilePicFilePath}`, (err) => {
                if (err) {
                  return next(CustomErrorHandler.serverError(err.message));
                }
              });
              fs.unlink(`${appRoot}/${coverPicFilePath}`, (err) => {
                if (err) {
                  return next(CustomErrorHandler.serverError(err.message));
                }
              });
              return next(CustomErrorHandler.usernameNotAvailable());
            } else {
              try {
                //delete previous images from server if new images are being uploaded
                const userRecord = await User.findOne({
                  _id: req.user._id,
                }).select("profilePic coverPic");
                if (req.files.profilePic) {
                  fs.unlink(`${appRoot}/${userRecord.profilePic}`, (err) => {
                    if (err) {
                      return next(CustomErrorHandler.serverError(err.message));
                    }
                  });
                }
                if (req.files.coverPic) {
                  fs.unlink(`${appRoot}/${userRecord.coverPic}`, (err) => {
                    if (err) {
                      return next(CustomErrorHandler.serverError(err.message));
                    }
                  });
                }

                document = await User.findOneAndUpdate(
                  {
                    _id: req.params.id,
                  },
                  {
                    name,
                    username,
                    password: hashedPassword,
                    isHidden,
                    ...(req.files.profilePic && {
                      profilePic: profilePicFilePath,
                    }),
                    ...(req.files.coverPic && { coverPic: coverPicFilePath }),
                  },
                  { new: true }
                );
              } catch (err) {
                return next(err);
              }
            }
          }

          if (previousUsername == username) {
            try {
              //delete previous images from server if new images are being uploaded
              const userRecord = await User.findOne({
                _id: req.user._id,
              }).select("profilePic coverPic");
              if (req.files.profilePic) {
                fs.unlink(`${appRoot}/${userRecord.profilePic}`, (err) => {
                  if (err) {
                    return next(CustomErrorHandler.serverError(err.message));
                  }
                });
              }
              if (req.files.coverPic) {
                fs.unlink(`${appRoot}/${userRecord.coverPic}`, (err) => {
                  if (err) {
                    return next(CustomErrorHandler.serverError(err.message));
                  }
                });
              }

              document = await User.findOneAndUpdate(
                {
                  _id: req.params.id,
                },
                {
                  name,
                  username,
                  password: hashedPassword,
                  isHidden,
                  ...(req.files.profilePic && {
                    profilePic: profilePicFilePath,
                  }),
                  ...(req.files.coverPic && { coverPic: coverPicFilePath }),
                },
                { new: true }
              );
            } catch (err) {
              return next(err);
            }
          }
          res.status(201).json(document);
        } catch (err) {
          return next(err);
        }
      });
    }
  },
};

export default updateProfile;
