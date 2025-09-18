import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const Env = {
  baseUrl: process.env.BASE_URL ?? "https://app.cymulate.com/cym",
  email: process.env.CY_MAIL ?? "",
  password: process.env.CY_PASS ?? "",

  assertCreds() {
    if (!this.email || !this.password) {
      throw new Error("Environment variables CY_MAIL and CY_PASS must be set");
    }
  },
};
