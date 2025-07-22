import cookieParser from "cookie-parser";
import "dotenv/config";
import express from "express";
import productController from "./controllers/productController.js";
import reviewController from "./controllers/reviewController.js";
import userController from "./controllers/userController.js";
import errorHandler from "./middlewares/errorHandler.js";
import session from "express-session";

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("", userController);
app.use("/products", productController);
app.use("/reviews", reviewController);

app.get("/admin/sessions", (req, res, next) => {
  req.sessionStore.all((err, sessions) => {
    if (err) return next(err);
    res.json(sessions);
  });
});

app.use(errorHandler);

const port = process.env.PORT ?? 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
