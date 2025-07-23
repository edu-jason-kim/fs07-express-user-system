import GoogleStrategy from "passport-google-oauth20";
import userService from "../../services/userService.js";

const googleStrategy = new GoogleStrategy(
  // options
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
  },
  // verify : 사용자가 구글창에서 로그인을 성공하고 실행되는 함수
  async (accessToken, refreshToken, profile, done) => {
    const user = await userService.oauthCreateOrUpdate({
      provider: profile.provider,
      providerId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
    });

    done(null, user);
  }
);

export default googleStrategy;
