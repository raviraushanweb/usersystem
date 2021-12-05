import express from "express";
import { APP_PORT, DB_URL, DEBUG_MODE } from "./config";
const app = express();
import mongoose from "mongoose";
import routes from "./routes";
import errorHandler from "./middlewares/errorHandler";
import path from "path";
import cors from "cors";

//database connection
mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("DB connected...");
});

global.appRoot = path.resolve(__dirname);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/api", routes);
app.use("/uploads", express.static("uploads"));

app.use(errorHandler);
const PORT = process.env.PORT || APP_PORT;
app.listen(PORT, () => console.log(`Listening on port ${PORT} ....`));
