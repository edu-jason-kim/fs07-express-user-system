import { expressjwt } from "express-jwt";
import userRepository from "../repositories/userRepository.js";
import reviewRepository from "../repositories/reviewRepository.js";

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

// 기본 값: Authorization 헤더를 통해 토큰을 검증
const verifyAccessToken = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "user",
});

// Cookie 헤더를 통해 토큰을 검증
const verifyRefreshToken = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "user",
  // 토큰을 어디서 꺼낼지 결정하는 함수
  getToken: (req) => req.cookies.refreshToken,
});

async function verifyReviewAuth(req, res, next) {
  const reviewId = req.params.id;
  const userId = req.user.userId;

  try {
    // 리뷰가 없으면 404
    const review = await reviewRepository.getById(reviewId);
    if (!review) {
      const error = new Error("Review not found");
      error.code = 404;
      throw error;
    }

    // 내 리뷰가 아니면 403 (권한없음)
    if (review.authorId !== userId) {
      const error = new Error("Forbidden");
      error.code = 403;
      throw error;
    }

    next();
  } catch (error) {
    next(error);
  }
}

export default {
  verifySessionLogin,
  verifyAccessToken,
  verifyRefreshToken,
  verifyReviewAuth,
};
