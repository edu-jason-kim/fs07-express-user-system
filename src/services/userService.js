import userRepository from "../repositories/userRepository.js";

async function createUser(user) {
  // 이메일로 이미 회원가입된 사용자가 있는지 확인
  const existingUser = await userRepository.findByEmail(user.email);

  // 중복 사용자가 있다면 에러 발생
  if (existingUser) {
    const error = new Error("User already exists");
    error.code = 409;
    error.data = { email: user.email };
    throw error;
  }

  // 회원가입 진행 -> 사용자 생성
  const newUser = await userRepository.save(user);

  // 사용자 데이터 응답
  return filterSensitiveUserData(newUser);
}

function filterSensitiveUserData(user) {
  const { password, ...rest } = user;
  return rest;
}

export default {
  createUser,
};
