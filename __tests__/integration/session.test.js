const request = require("supertest");
const nodemailer = require("nodemailer");
const factory = require("../factories");
const app = require("../../src/app");
const truncate = require("../utils/truncate");

jest.mock("nodemailer");

const transporter = {
  sendMail: jest.fn()
};

describe("Authentication", () => {
  beforeEach(async () => {
    await truncate();
  });

  beforeAll(() => {
    nodemailer.createTestAccount.mockReturnValue(transporter);
  });

  it("should be able to authenticate with valid credentials", async () => {
    const user = await factory.create("User", {
      password: "123123"
    });

    const response = await request(app)
      .post("/sessions")
      .send({
        email: user.email,
        password: "123123"
      });

    expect(response.status).toBe(200);
  });

  it("should not be able to authenticate with invalid credentials", async () => {
    const user = await factory.create("User", {
      password: "123123"
    });

    const response = await request(app)
      .post("/sessions")
      .send({
        email: user.email,
        password: "123456"
      });

    expect(response.status).toBe(401);
  });

  it("should return jwt token when authenticated", async () => {
    const user = await factory.create("User", {
      password: "123123"
    });

    const response = await request(app)
      .post("/sessions")
      .send({
        email: user.email,
        password: "123123"
      });

    expect(response.body).toHaveProperty("token");
  });

  it("should be able to access private routes when authenticated", async () => {
    const user = await factory.create("User");

    const token = await user.generateToken();

    const response = await request(app)
      .get("/dashboard")
      .set("Authorization", `Beader ${token}`);

    expect(response.status).toBe(200);
  });

  it("should not be able to access private routes when not authenticated", async () => {
    const response = await request(app).get("/dashboard");
    expect(response.status).toBe(401);
  });

  it("should not be able to access private routes when token is invalid", async () => {
    const response = await request(app)
      .get("/dashboard")
      .set("Authorization", "Bearer 123213");

    expect(response.status).toBe(401);
  });

  it("should receive email notification when authenticated", async () => {
    const user = await factory.create("User", {
      password: "123123"
    });

    const response = await request(app)
      .post("/sessions")
      .send({
        email: user.email,
        password: "123123"
      });

    expect(transporter.sendMail).toHaveBeenCalledTimes(1);
  });
});
