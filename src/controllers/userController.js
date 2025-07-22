import express from "express";
import userService from "../services/userService.js";

const userController = express.Router();

userController.post("/users", async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

userController.post("/session-login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userService.getUser(email, password);

    // 세션에 사용자 정보 저장
    req.session.userId = user.id;

    return res.json(user);
  } catch (error) {
    next(error);
  }
});

userController.delete("/session-logout", async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      next(err);
    } else {
      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
      });

      res.sendStatus(204);
    }
  });
});

export default userController;
