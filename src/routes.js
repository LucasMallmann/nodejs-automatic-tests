const routes = require("express").Router();
const { User } = require("./app/models");
const authMiddleware = require("./app/middlewares/auth");

const SessionController = require("./app/controllers/SessionController");

routes.get("/", async (req, res, next) => {
  const user = await User.create({
    name: "Lucas",
    email: "lucasmallmann76@gmail.com",
    password_hash: "123456"
  });

  return res.json(user);
});

routes.get("/okay", (req, res) => res.status(200).send());

routes.post("/sessions", SessionController.store);

// Routes below are protected
routes.use(authMiddleware);
routes.get("/dashboard", (req, res) => res.status(200).send());

module.exports = routes;
