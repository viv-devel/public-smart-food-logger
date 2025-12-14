import type { HttpFunction } from "@google-cloud/functions-framework";

export const recaptchaVerifier: HttpFunction = (req, res) => {
  // CORS configuration
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Max-Age", "3600");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { token } = req.body;

  if (token) {
    res.status(200).json({ success: true, score: 0.9 });
  } else {
    res.status(200).json({ success: false, error: "reCAPTCHA token missing" });
  }
};
