if(process.env.NODE_ENV!="production"){
     require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbURL=process.env.ATLASDB_URL;

const store=MongoStore.create({
     mongoUrl:dbURL,
     crypto:{
          secret:process.env.SECRET,
     },
     touchAfter:24*3600,
});

store.on("error",()=>{
     console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOption = {
     store,
     secret: process.env.SECRET,
     resave: true,
     saveUninitialized: true,
     cookie: {
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
          maxAge: Date.now(),
          httpOnly: true,
     }
};

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

main().then(() => {
     console.log("Connected to DB");
}).catch(err => {
     console.log(err);
});
async function main() {
     await mongoose.connect(dbURL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
     res.locals.success = req.flash("success");
     res.locals.error = req.flash("error");
     res.locals.currUser = req.user;
     next();
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
     next(new ExpressError(404, "Page not found"));
});

//server error handling
app.use((err, req, res, next) => {
     let { status = 500, message = "Something went wrong" } = err;
     res.status(status).render("error.ejs", { message });
});

const port = 5000;
app.listen(port, () => {
     console.log(`app is listening to ${port}`);
});
