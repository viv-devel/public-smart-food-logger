import { describe, it, expect, vi, beforeEach } from "vitest";
import { healthChecker } from "../src/health.js";
import { Request, Response } from "express";

const mockReq = (method: string) => {
  const req: Partial<Request> = {
    method,
  };
  return req as Request;
};

const mockRes = () => {
  const res: Partial<Response> = {};
  res.set = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
};

describe("healthChecker", () => {
  let req: Request;
  let res: Response;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should set CORS headers", () => {
    req = mockReq("GET");
    res = mockRes();

    healthChecker(req, res);

    expect(res.set).toHaveBeenCalledWith("Access-Control-Allow-Origin", "*");
    expect(res.set).toHaveBeenCalledWith(
      "Access-Control-Allow-Methods",
      "GET, OPTIONS",
    );
    expect(res.set).toHaveBeenCalledWith(
      "Access-Control-Allow-Headers",
      "Content-Type",
    );
    expect(res.set).toHaveBeenCalledWith("Access-Control-Max-Age", "3600");
  });

  it("should return 204 for OPTIONS request", () => {
    req = mockReq("OPTIONS");
    res = mockRes();

    healthChecker(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith("");
  });

  it("should return 405 for POST request", () => {
    req = mockReq("POST");
    res = mockRes();

    healthChecker(req, res);

    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.send).toHaveBeenCalledWith("Method Not Allowed");
  });

  it("should return 200 and health status for GET request", () => {
    req = mockReq("GET");
    res = mockRes();

    healthChecker(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "OK",
        function: "healthChecker",
        timestamp: expect.any(String),
      }),
    );
  });
});
