// routes.js
const { Router } = require("express")
const authMidd = require("../middlewares/auth.js")

const LoginController = require("../controllers/loginController")
const userController = require("../controllers/userController.js")
const googleController = require("../controllers/googleController")

// Adicionar a importação do controller de pagamentos após as outras importações
const pagamentosController = require("../controllers/pagamentosController")

const routes = new Router()

// Rota de login
routes.post("/login", LoginController.login)

// Rotas de usuário
routes.get("/list", userController.list)
routes.post("/user", userController.create)

// Rotas protegidas para Admin (gerenciamento geral)
routes.get("/user/:id", authMidd(["Admin"]), userController.listOne)
routes.put("/user/:id", authMidd(["Admin"]), userController.update)
routes.delete("/user/:id", authMidd(["Admin"]), userController.delete)
routes.get("/user/pending", authMidd(["Admin"]), userController.listPendingApprovals)

// Rotas para que o próprio usuário atualize ou delete seu registro
routes.put("/user/self", authMidd(["User", "Admin"]), userController.updateSelf)
routes.delete("/user/self", authMidd(["User", "Admin"]), userController.deleteSelf)

// Rotas do Google Drive e Sheets
routes.get("/google/drive/folders", authMidd(["User", "Admin"]), googleController.listFolders)
routes.get("/google/drive/:folderId", authMidd(["User", "Admin"]), googleController.listFiles)
routes.post("/google/sheets/create", authMidd(["Admin"]), googleController.createSpreadsheet)
routes.post("/google/sheets/data", authMidd(["User", "Admin"]), googleController.getSpreadsheetData)
routes.post("/google/sheets/inventario", googleController.getSpreadsheetData)
routes.get("/google/sheets/fullData", authMidd(["User", "Admin"]), googleController.getFullSpreadsheetData)
routes.post("/google/sheets/copy", authMidd(["Admin"]), googleController.copySpreadsheet)

// Adicionar todas as rotas de pagamentos após as rotas do Google e antes da rota raiz

// Comentar ou remover o middleware de autenticação das rotas de pagamentos para testes

// ==================== ROTAS DE PAGAMENTOS (SEM AUTENTICAÇÃO PARA TESTES) ====================

// Operações gerais
routes.get("/pagamentos", pagamentosController.list)
routes.get("/pagamentos/:id", pagamentosController.listOne)
routes.post("/pagamentos", pagamentosController.create)
routes.put("/pagamentos/:id/obra", pagamentosController.updateObra)
routes.delete("/pagamentos/:id", pagamentosController.delete)

// Gestão de gastos
routes.post("/pagamentos/:id/gastos", pagamentosController.addGasto)
routes.put("/pagamentos/:id/gastos/:gastoId", pagamentosController.updateGasto)
routes.delete("/pagamentos/:id/gastos/:gastoId", pagamentosController.removeGasto)

// Gestão de contratos
routes.post("/pagamentos/:id/contratos", pagamentosController.addContrato)
routes.put("/pagamentos/:id/contratos/:contratoId", pagamentosController.updateContrato)
routes.delete("/pagamentos/:id/contratos/:contratoId", pagamentosController.removeContrato)

// Gestão de cronograma
routes.post("/pagamentos/:id/cronograma", pagamentosController.addEtapaCronograma)
routes.put("/pagamentos/:id/cronograma/:etapaId", pagamentosController.updateEtapaCronograma)
routes.delete("/pagamentos/:id/cronograma/:etapaId", pagamentosController.removeEtapaCronograma)

// Gestão de pagamentos semanais
routes.post("/pagamentos/:id/pagamentos-semanais", pagamentosController.addPagamentoSemanal)
routes.put("/pagamentos/:id/pagamentos-semanais/:pagamentoSemanalId", pagamentosController.updatePagamentoSemanal)
routes.delete("/pagamentos/:id/pagamentos-semanais/:pagamentoSemanalId", pagamentosController.removePagamentoSemanal)
routes.patch(
  "/pagamentos/:id/pagamentos-semanais/:pagamentoSemanalId/efetuado",
  pagamentosController.marcarPagamentoEfetuado,
)
routes.get("/pagamentos/semanais/pendentes", pagamentosController.listarPagamentosPendentes)

// Relatórios
routes.get("/pagamentos/:id/relatorio-financeiro", pagamentosController.relatorioFinanceiro)
routes.get("/pagamentos/relatorio-semanais", pagamentosController.relatorioPagamentosSemanais)

// Rota raiz
routes.get("/", (req, res) => {
  res.status(200).json({
    status: "Success",
    msg: "Api Fornec rodando!",
  })
})

// Tratamento de rotas não encontradas
routes.use((req, res, next) => {
  res.status(404).json({
    error: true,
    msg: "Not Found",
  })
})

// Tratamento de erros internos
routes.use((error, req, res, next) => {
  console.error(error)
  return res.status(500).json({
    error: true,
    message: "Internal Server Error",
  })
})

module.exports = routes