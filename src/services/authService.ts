import { delay } from "./mockApi";

// Public fixed code for this simulation only. Replace this entire service for real authentication.
export const DEMO_OTP = "123456";
const CHALLENGE_KEY = "easydry-demo-otp-challenge";
interface Challenge {
  phone: string;
  expiresAt: number;
}
let pendingChallenge: Challenge | null = null;
function readChallenge(): Challenge | null {
  try {
    const saved = sessionStorage.getItem(CHALLENGE_KEY);
    if (saved) return JSON.parse(saved) as Challenge;
  } catch {
    /* Private browsing or non-browser test environments can use memory. */
  }
  return pendingChallenge;
}
function saveChallenge(challenge: Challenge | null) {
  pendingChallenge = challenge;
  try {
    if (challenge)
      sessionStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenge));
    else sessionStorage.removeItem(CHALLENGE_KEY);
  } catch {
    /* Keep the mock functional when session storage is unavailable. */
  }
}
export const authService = {
  async sendOtp(phone: string) {
    await delay();
    if (!/^[6-9]\d{9}$/.test(phone))
      throw new Error("Enter a valid 10-digit Indian mobile number.");
    saveChallenge({ phone, expiresAt: Date.now() + 300000 });
    return { expiresIn: 300 };
  },
  async verifyOtp(phone: string, code: string) {
    await delay(750);
    const challenge = readChallenge();
    if (
      !challenge ||
      challenge.phone !== phone ||
      Date.now() > challenge.expiresAt
    )
      throw new Error(
        "Your code has expired. Tap Fill demo code or resend to start again.",
      );
    if (code.replace(/\s/g, "") !== DEMO_OTP)
      throw new Error(
        "That code is incorrect. Enter 123456 or tap Fill demo code below.",
      );
    saveChallenge(null);
    return { phone };
  },
};
