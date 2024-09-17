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
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
dotenv.config();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(cookieSession({
//   maxAge: 30 * 24 * 60 * 60 * 1000,
//   keys: 'hieu'
// })
// );

app.use(express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), 'client')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultSecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(router);
app.use(routerLogin);
app.use(routerUser);

app.get('/', (req,res)=>{
  res.sendFile('index.html')
})

const PORT = 3000;

app.listen(PORT, async () => {
  console.log(`Listen on Port: ${PORT}`);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected database");
  } catch (error) {
    console.log(error);
  }
});
