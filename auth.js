import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function getUserId(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;

  const token = auth.replace("Bearer ", "");
  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    return typeof userId === "string" ? parseInt(userId, 10) : userId;
  } catch {
    return null;
  }
}
