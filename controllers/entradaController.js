const Entrada = require("../models/entrada")
const mongoose = require("mongoose")

class EntradaController {
  // Criar nova entrada
  async create(req, res) {
    try {
      const entradaData = {
        ...req.body,
        criadoPor: req.userID,
      }

      const entrada = await Entrada.create(entradaData)

      return res.status(201).json({
        error: false,
        message: "Entrada criada com sucesso",
        entrada,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao criar entrada",
        details: error.message,
      })
    }
  }

  // Listar todas as entradas
  async readAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        obraId,
        categoria,
        cliente,
        dataInicio,
        dataFim,
        statusRecebimento,
        nome,
      } = req.query

      const filter = {}
      if (obraId) filter.obraId = obraId
      if (categoria) filter.categoria = categoria
      if (cliente) filter.cliente = new RegExp(cliente, "i")
      if (statusRecebimento) filter.statusRecebimento = statusRecebimento
      if (nome) filter.nome = new RegExp(nome, "i")

      // Filtro de data
      if (dataInicio || dataFim) {
        filter.data = {}
        if (dataInicio) filter.data.$gte = new Date(dataInicio)
        if (dataFim) filter.data.$lte = new Date(dataFim)
      }

      const skip = (page - 1) * limit

      const entradas = await Entrada.find(filter)
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")
        .sort({ data: -1 })
        .limit(Number.parseInt(limit))
        .skip(skip)

      const total = await Entrada.countDocuments(filter)

      return res.json({
        error: false,
        entradas,
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
        message: "Erro ao listar entradas",
        details: error.message,
      })
    }
  }

  // Buscar entrada por ID
  async readById(req, res) {
    try {
      const entrada = await Entrada.findById(req.params.id)
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")

      if (!entrada) {
        return res.status(404).json({
          error: true,
          message: "Entrada não encontrada",
        })
      }

      return res.json({
        error: false,
        entrada,
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao buscar entrada",
        details: error.message,
      })
    }
  }

  // Atualizar entrada
  async update(req, res) {
    try {
      const entrada = await Entrada.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")

      if (!entrada) {
        return res.status(404).json({
          error: true,
          message: "Entrada não encontrada",
        })
      }

      return res.json({
        error: false,
        message: "Entrada atualizada com sucesso",
        entrada,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao atualizar entrada",
        details: error.message,
      })
    }
  }

  // Deletar entrada
  async delete(req, res) {
    try {
      const entrada = await Entrada.findByIdAndDelete(req.params.id)

      if (!entrada) {
        return res.status(404).json({
          error: true,
          message: "Entrada não encontrada",
        })
      }

      return res.json({
        error: false,
        message: "Entrada deletada com sucesso",
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao deletar entrada",
        details: error.message,
      })
    }
  } 

  
}

module.exports = new EntradaController()
