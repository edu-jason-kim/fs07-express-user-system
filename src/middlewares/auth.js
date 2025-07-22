import { expressjwt } from "express-jwt";
import userRepository from "../repositories/userRepository.js";

function throwUnauthorizedError() {
  const error = new Error("Unauthorized");
  error.code = 401;
  throw error;
}

async function verifySessionLogin(req, res, next) {
  try {
    // session에 사용자 id가 없으면 throw
    const { userId } = req.session;
    if (!userId) throwUnauthorizedError();

    // 사용자 id로 사용자 정보가 없으면 throw
    const user = await userRepository.findById(userId);
    if (!user) throwUnauthorizedError();

    // 편의성을 위한 유저 정보 전달
    req.user = {
      id: userId,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
}

const verifyAccessToken = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "user",
});

export default {
  verifySessionLogin,
  verifyAccessToken,
};
