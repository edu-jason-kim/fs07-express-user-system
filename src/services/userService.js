import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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
  const hashedPassword = await hashPassword(user.password);
  const newUser = await userRepository.save({
    ...user,
    password: hashedPassword,
  });

  // 사용자 데이터 응답
  return filterSensitiveUserData(newUser);
}

async function getUser(email, password) {
  // email을 통해 사용자 정보를 가져온다
  const user = await userRepository.findByEmail(email);

  // 사용자 정보가 없으면 401 에러 발생
  if (!user) {
    const error = new Error("Unauthorized");
    error.code = 401;
    throw error;
  }

  await verifyPassword(password, user.password);

  // 사용자 데이터 응답
  return filterSensitiveUserData(user);
}

function updateUser(id, data) {
  return userRepository.update(id, data);
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(inputPassword, hashedPassword) {
  const isMatch = await bcrypt.compare(inputPassword, hashedPassword);
  if (!isMatch) {
    const error = new Error("Unauthorized");
    error.code = 401;
    throw error;
  }
}

function filterSensitiveUserData(user) {
  const { password, refreshToken, ...rest } = user;
  return rest;
}

function createToken(user, type) {
  const payload = { userId: user.id, name: user.name };
  const options = { expiresIn: type === "refresh" ? "2w" : "1h" };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}

async function refreshToken(userId, refreshToken) {
  const user = await userRepository.findById(userId);

  if (!user || user.refreshToken !== refreshToken) {
    const error = new Error("Unauthorized");
    error.code = 401;
    throw error;
  }

  return createToken(user);
}

export default {
  createUser,
  getUser,
  updateUser,
  createToken,
  refreshToken,
};
