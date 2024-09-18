import bodyParser from "body-parser";
import express from "express";
import router from "./routeSP.mjs";
import mongoose from "mongoose";
import routerLogin from "./routeLogin.mjs";
import cookieSession from "cookie-session";
import passport from "passport";
import session from "express-session";
import routerUser from "./routeUser.mjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import connectMongoDB from "./connectMongo.mjs";

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

app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use(passport.initialize());
app.use(passport.session());

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
