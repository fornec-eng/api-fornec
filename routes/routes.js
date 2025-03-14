// routes.js
const { Router } = require("express");
const authMidd = require("../middlewares/auth.js");

const LoginController = require("../controllers/loginController");
const userController = require("../controllers/userController.js");

const routes = new Router();

// Rota de login
routes.post("/login", LoginController.login);

// Rotas de usuário
routes.get("/list", userController.list);
routes.post("/user", userController.create);

// Rotas protegidas para Admin (gerenciamento geral)
routes.get("/user/:id", authMidd(["Admin"]), userController.listOne);
routes.put("/user/:id", authMidd(["Admin"]), userController.update);
routes.delete("/user/:id", authMidd(["Admin"]), userController.delete);
routes.get("/user/pending", authMidd(["Admin"]), userController.listPendingApprovals);

// Rotas para que o próprio usuário atualize ou delete seu registro
routes.put("/user/self", authMidd(["User", "Admin"]), userController.updateSelf);
routes.delete("/user/self", authMidd(["User", "Admin"]), userController.deleteSelf);

// Rota raiz
routes.get("/", (req, res) => {
  res.status(200).json({
    status: "Success",
    msg: "Api Fornec rodando!",
  });
});

// Tratamento de rotas não encontradas
routes.use((req, res, next) => {
  res.status(404).json({
    error: true,
    msg: "Not Found",
  });
});

// Tratamento de erros internos
routes.use((error, req, res, next) => {
  console.error(error);
  return res.status(500).json({
    error: true,
    message: "Internal Server Error",
  });
});

module.exports = routes;