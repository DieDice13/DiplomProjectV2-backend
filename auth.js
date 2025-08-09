import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export function getUserId(req) {
  console.log("📦 Все заголовки:", req.headers); // ✅ Лог всех заголовков

  const auth = req.headers.get("authorization");
  console.log("💡 Заголовок Authorization:", auth);

  if (!auth) return null;

  const token = auth.replace("Bearer ", "");
  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    return userId;
  } catch {
    return null;
  }
}
