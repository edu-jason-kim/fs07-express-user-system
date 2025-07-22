1. `.env`에 데이터베이스 url 업데이트
  ```
  DATABASE_URL=postgresql://codeit:mysecret@localhost:5432/express_user_system?schema=public
  ```

2. migrate: `npm run migrate`

3. `"studio": "prisma studio"` 스크립트 추가 및 스튜디오 들어가서 모델 확인
