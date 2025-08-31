import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
const MONGO_URI = process.env.MONGO_URI as string;

async function main() {
  try {
    if (!MONGO_URI) {
      throw new Error("❌ MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully!");

    const server = createServer(app);
    server.listen(PORT, () =>
      console.log(`🚀 API listening on http://localhost:${PORT}`)
    );
  } catch (e) {
    console.error("❌ Fatal startup error:", e);
    process.exit(1);
  }
}

main();
