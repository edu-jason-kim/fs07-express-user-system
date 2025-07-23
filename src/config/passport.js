import passport from "passport";
import localStrategy from "../middlewares/passport/localStarategy.js";
import userRepository from "../repositories/userRepository.js";
import jwtStrategy from "../middlewares/passport/jwtStrategy.js";

// 미들웨어에서 넘겨준 사용자 정보로, 실제 세션에 저장할 정보를 등록
passport.serializeUser((user, done) => {
  return done(null, user.id);
});

// serialize user에서 저장이된 정보로, 실제 req.user에 매핑할 사용자 정보를 가져오는 작업
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userRepository.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

passport.use(localStrategy);
passport.use("access-token", jwtStrategy.accessTokenStrategy);
passport.use("refresh-token", jwtStrategy.refreshTokenStrategy);

export default passport;
