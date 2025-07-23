import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import userRepository from "../../repositories/userRepository.js";

const jwtVerify = async (payload, done) => {
  const userId = payload.userId;

  try {
    const user = await userRepository.findById(userId);
    if (!user) {
      return done(null, false);
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
};

const accessTokenStrategy = new JwtStrategy(
  // option
  {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  },
  // verify
  jwtVerify
);

const refreshTokenStrategy = new JwtStrategy(
  // option
  {
    secretOrKey: process.env.JWT_SECRET,
    jwtFromRequest: (req) => req.cookies.refreshToken
  },
  // verify
  jwtVerify
);

export default {
  accessTokenStrategy,
  refreshTokenStrategy,
};
