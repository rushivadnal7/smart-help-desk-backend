import jwt from "jsonwebtoken";

const SECRET = 'changeme123';
// const SECRET = process.env.JWT_SECRET!;
const TTL_MIN = Number(process.env.ACCESS_TOKEN_TTL_MIN || 60);

export function signJwt(payload: object) {
  console.log("JWT_SECRET is:", process.env.JWT_SECRET);

  return jwt.sign(payload, SECRET, { expiresIn: `${TTL_MIN}m` });
}

export function verifyJwt<T>(token: string): T {
  return jwt.verify(token, SECRET) as T;
}
