import type { HttpFunction } from "@google-cloud/functions-framework";

export const healthChecker: HttpFunction = (req, res) => {
  // CORS configuration
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Max-Age", "3600");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "GET") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  res.status(200).json({
    status: "OK",
    function: "healthChecker",
    timestamp: new Date().toISOString(),
  });
};
