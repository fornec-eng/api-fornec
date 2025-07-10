// validation.js
const { body, validationResult } = require("express-validator")

// Middleware para verificar erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: true,
      message: "Dados inválidos",
      details: errors.array(),
    })
  }
  next()
}

// Validações para Obra
const validateObra = [
  body("nome").notEmpty().withMessage("Nome da obra é obrigatório"),
  body("endereco").notEmpty().withMessage("Endereço é obrigatório"),
  body("cliente").notEmpty().withMessage("Cliente é obrigatório"),
  body("valorContrato").isNumeric().withMessage("Valor do contrato deve ser numérico"),
  body("dataInicio").isISO8601().withMessage("Data de início deve ser uma data válida"),
  body("dataPrevisaoTermino").isISO8601().withMessage("Data de previsão de término deve ser uma data válida"),
  handleValidationErrors,
]

// Validações para Mão de Obra
const validateMaoObra = [
  body("nome").notEmpty().withMessage("Nome é obrigatório"),
  body("funcao").notEmpty().withMessage("Função é obrigatória"),
  body("tipoContratacao")
    .isIn(["clt", "pj", "diaria", "empreitada", "temporario"])
    .withMessage("Tipo de contratação inválido"),
  body("valor").isNumeric().withMessage("Valor deve ser numérico"),
  body("inicioContrato").isISO8601().withMessage("Data de início deve ser uma data válida"),
  body("fimContrato").isISO8601().withMessage("Data de fim deve ser uma data válida"),
  body("diaPagamento").isInt({ min: 1, max: 31 }).withMessage("Dia do pagamento deve ser entre 1 e 31"),
  body("formaPagamento")
    .isIn(["pix", "transferencia", "avista", "cartao", "boleto", "cheque", "outro"])
    .withMessage("Forma de pagamento inválida"),
  body("chavePixBoleto")
    .if(body("formaPagamento").isIn(["pix", "boleto"]))
    .notEmpty()
    .withMessage("Chave Pix / Código de Barras é obrigatório para PIX/Boleto"),
  handleValidationErrors,
]

// Validações para Material
const validateMaterial = [
  body("numeroNota").notEmpty().withMessage("Número da nota é obrigatório"),
  body("data").isISO8601().withMessage("Data deve ser uma data válida"),
  body("localCompra").notEmpty().withMessage("Local da compra é obrigatório"),
  body("valor").isNumeric().withMessage("Valor deve ser numérico"),
  body("solicitante").notEmpty().withMessage("Solicitante é obrigatório"),
  body("formaPagamento")
    .isIn(["pix", "transferencia", "avista", "cartao", "boleto", "cheque", "outro"])
    .withMessage("Forma de pagamento inválida"),
  body("chavePixBoleto")
    .if(body("formaPagamento").isIn(["pix", "boleto"]))
    .notEmpty()
    .withMessage("Chave Pix / Código de Barras é obrigatório para PIX/Boleto"),
  handleValidationErrors,
]

// Validações para Equipamentos
const validateEquipamentos = [
  body("numeroNota").notEmpty().withMessage("Número da nota é obrigatório"),
  body("item").notEmpty().withMessage("Item é obrigatório"),
  body("data").isISO8601().withMessage("Data deve ser uma data válida"),
  body("localCompra").notEmpty().withMessage("Local da compra é obrigatório"),
  body("valor").isNumeric().withMessage("Valor deve ser numérico"),
  body("solicitante").notEmpty().withMessage("Solicitante é obrigatório"),
  body("descricao").notEmpty().withMessage("Descrição é obrigatória"),
  body("tipoContratacao")
    .isIn(["compra", "aluguel", "leasing", "comodato"])
    .withMessage("Tipo de contratação inválido"),
  body("formaPagamento")
    .isIn(["pix", "transferencia", "avista", "cartao", "boleto", "cheque", "outro"])
    .withMessage("Forma de pagamento inválida"),
  body("chavePixBoleto")
    .if(body("formaPagamento").isIn(["pix", "boleto"]))
    .notEmpty()
    .withMessage("Chave Pix / Código de Barras é obrigatório para PIX/Boleto"),
  body("diaPagamento").isInt({ min: 1, max: 31 }).withMessage("Dia do pagamento deve ser entre 1 e 31"),
  handleValidationErrors,
]

// Validações para Outros Gastos
const validateOutrosGastos = [
  body("descricao").notEmpty().withMessage("Descrição é obrigatória"),
  body("valor").isNumeric().withMessage("Valor deve ser numérico"),
  body("data").isISO8601().withMessage("Data deve ser uma data válida"),
  body("categoriaLivre").notEmpty().withMessage("Categoria é obrigatória"),
  body("formaPagamento")
    .isIn(["pix", "transferencia", "avista", "cartao", "boleto", "cheque", "dinheiro", "outro"])
    .withMessage("Forma de pagamento inválida"),
  body("chavePixBoleto")
    .if(body("formaPagamento").isIn(["pix", "boleto"]))
    .notEmpty()
    .withMessage("Chave Pix / Código de Barras é obrigatório para PIX/Boleto"),
  handleValidationErrors,
]

module.exports = {
  validateObra,
  validateMaoObra,
  validateMaterial,
  validateEquipamentos,
  validateOutrosGastos,
  handleValidationErrors,
}
