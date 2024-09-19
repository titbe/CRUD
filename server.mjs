import bodyParser from "body-parser";
import express from "express";
import router from "./routeSP.mjs";
import mongoose from "mongoose";
import routerLogin from "./routeLogin.mjs";
import cookieSession from "cookie-session";
import passport from "passport";
import session from "express-session";
import routerUser from "./routeUser.mjs";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import connectMongoDB from "./connectMongo.mjs";
import cookieParser from "cookie-parser";

const app = express();
dotenv.config();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  express.static(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "client")
  )
);

app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(passport.initialize());

app.use(router);
app.use(routerLogin);
app.use(routerUser);

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

// connectMongoDB();

app.listen(process.env.PORT, async () => {
  console.log(`Listen on Port: ${process.env.PORT}`);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected database");
  } catch (error) {
    console.log(error);
  }
});
