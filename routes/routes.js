const { Router, json } = require("express");

const authMidd = require("../middlewares/auth.js");

const LoginController = require("../controllers/loginController")

const routes = new Router();

// Login
routes.post("/login", LoginController.login);

routes.get("/", (req, res, next) => {
  res.status(200).json({
    status: "Sucess",
    msg: "Api Fornec rodando!",
  });
});

routes.use((req, res, next) => {
  res.status(404).json({
    error: true,
    msg: "Not Found",
  });
});

routes.use((error, req, res, next) => {
  console.log(error);
  return res.status(500).json({
    errror: true,
    message: "Internal Server Error",
  });
});

module.exports = routes;
