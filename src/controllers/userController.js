import express from "express";
import userService from "../services/userService.js";
import auth from "../middlewares/auth.js";

const userController = express.Router();

userController.post("/users", async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

userController.post("/token-login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await userService.getUser(email, password);
    const accessToken = userService.createToken(user);
    const refreshToken = userService.createToken(user, "refresh");
    await userService.updateUser(user.id, { refreshToken });

    // 쿠키로 토큰을 전달 -> 브라우저 쿠키에 저장 -> 쿠키 헤더를 통해 전달이 된다
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    // Response Body로 토큰을 전달 -> 브라우저 로컬스토리지에 저장 -> Authorization 헤더를 통해 전달이 된다
    return res.json({ accessToken });
  } catch (error) {
    next(error);
  }
});

userController.post(
  "/token/refresh",
  auth.verifyRefreshToken,
  async (req, res, next) => {
    try {
      const { refreshToken } = req.cookies;
      const { userId } = req.user;
      const { accessToken, newRefreshToken } = await userService.refreshToken(
        userId,
        refreshToken
      );
      await userService.updateUser(userId, { refreshToken: newRefreshToken });

      res.cookie("refreshToken", newRefreshToken, {
        path: "/token/refresh",
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });

      return res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  }
);

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
