const MaoObra = require("../models/maoObra")

class MaoObraController {
  // Criar novo registro de mão de obra
  async create(req, res) {
    try {
      const maoObraData = {
        ...req.body,
        criadoPor: req.userID,
      }

      const maoObra = await MaoObra.create(maoObraData)

      return res.status(201).json({
        error: false,
        message: "Registro de mão de obra criado com sucesso",
        maoObra,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao criar registro de mão de obra",
        details: error.message,
      })
    }
  }

  // Listar todos os registros de mão de obra
  async readAll(req, res) {
    try {
      const { page = 1, limit = 10, obraId, status, funcao, nome, statusPagamento } = req.query

      const filter = {}
      if (obraId) filter.obraId = obraId
      if (status) filter.status = status
      if (funcao) filter.funcao = new RegExp(funcao, "i")
      if (nome) filter.nome = new RegExp(nome, "i")
      if (statusPagamento) filter.statusPagamento = statusPagamento

      const skip = (page - 1) * limit

      const maoObra = await MaoObra.find(filter)
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")
        .sort({ createdAt: -1 })
        .limit(Number.parseInt(limit))
        .skip(skip)

      const total = await MaoObra.countDocuments(filter)

      return res.json({
        error: false,
        maoObra,
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
        message: "Erro ao listar registros de mão de obra",
        details: error.message,
      })
    }
  }

  // Buscar registro por ID
  async readById(req, res) {
    try {
      const maoObra = await MaoObra.findById(req.params.id)
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")

      if (!maoObra) {
        return res.status(404).json({
          error: true,
          message: "Registro de mão de obra não encontrado",
        })
      }

      return res.json({
        error: false,
        maoObra,
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao buscar registro de mão de obra",
        details: error.message,
      })
    }
  }

  // Atualizar registro
  async update(req, res) {
    try {
      const maoObra = await MaoObra.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")

      if (!maoObra) {
        return res.status(404).json({
          error: true,
          message: "Registro de mão de obra não encontrado",
        })
      }

      return res.json({
        error: false,
        message: "Registro de mão de obra atualizado com sucesso",
        maoObra,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao atualizar registro de mão de obra",
        details: error.message,
      })
    }
  }

  // Deletar registro
  async delete(req, res) {
    try {
      const maoObra = await MaoObra.findByIdAndDelete(req.params.id)

      if (!maoObra) {
        return res.status(404).json({
          error: true,
          message: "Registro de mão de obra não encontrado",
        })
      }

      return res.json({
        error: false,
        message: "Registro de mão de obra deletado com sucesso",
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao deletar registro de mão de obra",
        details: error.message,
      })
    }
  }
}

module.exports = new MaoObraController()
