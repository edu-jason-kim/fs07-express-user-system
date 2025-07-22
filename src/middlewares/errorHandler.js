export default function errorHandler(error, req, res, next) {
  let status = error.code ?? 500;
  console.error(error);

  // express-jwt 미들웨어가 에러를 처리하는 방법이 달라서 아래와 같이 예외처리
  if (error.code === "credentials_required") {
    status = error.status;
  }

  return res.status(status).json({
    path: req.path,
    method: req.method,
    message: error.message ?? "Internal Server Error",
    data: error.data ?? undefined,
    date: new Date(),
  });
}
