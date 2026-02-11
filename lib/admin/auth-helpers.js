import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || 'default_secret_key';
const SECRET = new TextEncoder().encode(SECRET_KEY);

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export async function signAccessToken(payload) {
     return await new SignJWT(payload)
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime(ACCESS_TOKEN_EXPIRY)
          .sign(SECRET);
}

export async function signRefreshToken(payload) {
     return await new SignJWT(payload)
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime(REFRESH_TOKEN_EXPIRY)
          .sign(SECRET);
}

export async function verifyToken(token) {
     try {
          const { payload } = await jwtVerify(token, SECRET);
          return payload;
     } catch (error) {
          return null;
     }
}
