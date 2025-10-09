import jwt, { SignOptions, Secret, JwtPayload } from 'jsonwebtoken';

const ACCESS_SECRET: Secret = (process.env.JWT_SECRET || '') as Secret;
const REFRESH_SECRET: Secret = (process.env.REFRESH_SECRET || '') as Secret;

export const generateAccessToken = (payload: object) => {
  const options: SignOptions = { expiresIn: (process.env.ACCESS_TOKEN_EXPIRES_IN as any) || '15m' };
  return jwt.sign(payload as object, ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: object) => {
  const options: SignOptions = { expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN as any) || '7d' };
  return jwt.sign(payload as object, REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, REFRESH_SECRET);
};
