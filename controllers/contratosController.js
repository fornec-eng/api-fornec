const Contratos = require("../models/contratos")

class ContratosController {
  // Criar novo contrato
  async create(req, res) {
    try {
      const contratoData = {
        ...req.body,
        criadoPor: req.userID,
      }

      const contrato = await Contratos.create(contratoData)

      return res.status(201).json({
        error: false,
        message: "Contrato criado com sucesso",
        contrato,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao criar contrato",
        details: error.message,
      })
    }
  }

  // Listar todos os contratos
  async readAll(req, res) {
    try {
      const { page = 1, limit = 10, obraId, status, tipoPagamento, nome, statusPagamento } = req.query

      const filter = {}
      if (obraId) filter.obraId = obraId
      if (status) filter.status = status
      if (tipoPagamento) filter.tipoPagamento = tipoPagamento
      if (nome) filter.nome = new RegExp(nome, "i")
      if (statusPagamento) filter.statusPagamento = statusPagamento

      const skip = (page - 1) * limit

      const contratos = await Contratos.find(filter)
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")
        .sort({ createdAt: -1 })
        .limit(Number.parseInt(limit))
        .skip(skip)

      const total = await Contratos.countDocuments(filter)

      return res.json({
        error: false,
        contratos,
        pagination: {
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao listar contratos",
        details: error.message,
      })
    }
  }

  // Buscar contrato por ID
  async readById(req, res) {
    try {
      const contrato = await Contratos.findById(req.params.id)
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")

      if (!contrato) {
        return res.status(404).json({
          error: true,
          message: "Contrato não encontrado",
        })
      }

      return res.json({
        error: false,
        contrato,
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao buscar contrato",
        details: error.message,
      })
    }
  }

  // Atualizar contrato
  async update(req, res) {
    try {
      const contrato = await Contratos.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")

      if (!contrato) {
        return res.status(404).json({
          error: true,
          message: "Contrato não encontrado",
        })
      }

      return res.json({
        error: false,
        message: "Contrato atualizado com sucesso",
        contrato,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao atualizar contrato",
        details: error.message,
      })
    }
  }

  // Deletar contrato
  async delete(req, res) {
    try {
      const contrato = await Contratos.findByIdAndDelete(req.params.id)

      if (!contrato) {
        return res.status(404).json({
          error: true,
          message: "Contrato não encontrado",
        })
      }

      return res.json({
        error: false,
        message: "Contrato deletado com sucesso",
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao deletar contrato",
        details: error.message,
      })
    }
  }
}

module.exports = new ContratosController()
