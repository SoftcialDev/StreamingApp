//C:\Users\barah\OneDrive\Desktop\StreamingApp\packages\common\src\scripts\getToken.ts
import { login } from "../auth/login";
import dotenv from "dotenv";
dotenv.config();

export async function main(): Promise<void> {
  try {
    const token = await login("barahona0498@gmail.com", "MyStr0ngP@ssword!");
    console.log("ACCESS_TOKEN=", token);
  } catch (err) {
    console.error("Failed to login:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
