const OutrosGastos = require("../models/outrosGastos")
const mongoose = require("mongoose") // Import mongoose to use ObjectId

class OutrosGastosController {
  // Criar novo gasto
  async create(req, res) {
    try {
      const gastoData = {
        ...req.body,
        criadoPor: req.userID,
      }

      const gasto = await OutrosGastos.create(gastoData)

      return res.status(201).json({
        error: false,
        message: "Gasto criado com sucesso",
        gasto,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao criar gasto",
        details: error.message,
      })
    }
  }

  // Listar todos os gastos
  async readAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        obraId,
        categoriaLivre,
        fornecedor,
        dataInicio,
        dataFim,
        statusPagamento,
      } = req.query

      const filter = {}
      if (obraId) filter.obraId = obraId
      if (categoriaLivre) filter.categoriaLivre = new RegExp(categoriaLivre, "i")
      if (fornecedor) filter.fornecedor = new RegExp(fornecedor, "i")
      if (statusPagamento) filter.statusPagamento = statusPagamento

      // Filtro de data
      if (dataInicio || dataFim) {
        filter.data = {}
        if (dataInicio) filter.data.$gte = new Date(dataInicio)
        if (dataFim) filter.data.$lte = new Date(dataFim)
      }

      const skip = (page - 1) * limit

      const gastos = await OutrosGastos.find(filter)
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")
        .sort({ data: -1 })
        .limit(Number.parseInt(limit))
        .skip(skip)

      const total = await OutrosGastos.countDocuments(filter)

      return res.json({
        error: false,
        gastos,
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
        message: "Erro ao listar gastos",
        details: error.message,
      })
    }
  }

  // Buscar gasto por ID
  async readById(req, res) {
    try {
      const gasto = await OutrosGastos.findById(req.params.id)
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")

      if (!gasto) {
        return res.status(404).json({
          error: true,
          message: "Gasto não encontrado",
        })
      }

      return res.json({
        error: false,
        gasto,
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao buscar gasto",
        details: error.message,
      })
    }
  }

  // Atualizar gasto
  async update(req, res) {
    try {
      const gasto = await OutrosGastos.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")

      if (!gasto) {
        return res.status(404).json({
          error: true,
          message: "Gasto não encontrado",
        })
      }

      return res.json({
        error: false,
        message: "Gasto atualizado com sucesso",
        gasto,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao atualizar gasto",
        details: error.message,
      })
    }
  }

  // Deletar gasto
  async delete(req, res) {
    try {
      const gasto = await OutrosGastos.findByIdAndDelete(req.params.id)

      if (!gasto) {
        return res.status(404).json({
          error: true,
          message: "Gasto não encontrado",
        })
      }

      return res.json({
        error: false,
        message: "Gasto deletado com sucesso",
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao deletar gasto",
        details: error.message,
      })
    }
  }

  // Relatório por categoria
  async relatorioPorCategoria(req, res) {
    try {
      const { obraId, dataInicio, dataFim } = req.query

      const matchStage = {}
      if (obraId) matchStage.obraId = mongoose.Types.ObjectId(obraId)
      if (dataInicio || dataFim) {
        matchStage.data = {}
        if (dataInicio) matchStage.data.$gte = new Date(dataInicio)
        if (dataFim) matchStage.data.$lte = new Date(dataFim)
      }

      const relatorio = await OutrosGastos.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$categoriaLivre",
            totalGasto: { $sum: "$valor" },
            quantidade: { $sum: 1 },
            gastos: { $push: "$$ROOT" },
          },
        },
        { $sort: { totalGasto: -1 } },
      ])

      return res.json({
        error: false,
        relatorio,
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao gerar relatório",
        details: error.message,
      })
    }
  }
}

module.exports = new OutrosGastosController()
