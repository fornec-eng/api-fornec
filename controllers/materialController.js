const Material = require("../models/material")

class MaterialController {
  // Criar novo material
  async create(req, res) {
    try {
      const materialData = {
        ...req.body,
        criadoPor: req.userID,
      }

      const material = await Material.create(materialData)

      return res.status(201).json({
        error: false,
        message: "Material criado com sucesso",
        material,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao criar material",
        details: error.message,
      })
    }
  }

  // Listar todos os materiais
  async readAll(req, res) {
    try {
      const { page = 1, limit = 10, obraId, solicitante, localCompra, formaPagamento, statusPagamento } = req.query

      const filter = {}
      if (obraId) filter.obraId = obraId
      if (solicitante) filter.solicitante = new RegExp(solicitante, "i")
      if (localCompra) filter.localCompra = new RegExp(localCompra, "i")
      if (formaPagamento) filter.formaPagamento = formaPagamento
      if (statusPagamento) filter.statusPagamento = statusPagamento

      const skip = (page - 1) * limit

      const materiais = await Material.find(filter)
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")
        .sort({ data: -1 })
        .limit(Number.parseInt(limit))
        .skip(skip)

      const total = await Material.countDocuments(filter)

      return res.json({
        error: false,
        materiais,
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
        message: "Erro ao listar materiais",
        details: error.message,
      })
    }
  }

  // Buscar material por ID
  async readById(req, res) {
    try {
      const material = await Material.findById(req.params.id)
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")

      if (!material) {
        return res.status(404).json({
          error: true,
          message: "Material não encontrado",
        })
      }

      return res.json({
        error: false,
        material,
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao buscar material",
        details: error.message,
      })
    }
  }

  // Atualizar material
  async update(req, res) {
    try {
      const material = await Material.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate("criadoPor", "nome email")
        .populate("obraId", "nome cliente")

      if (!material) {
        return res.status(404).json({
          error: true,
          message: "Material não encontrado",
        })
      }

      return res.json({
        error: false,
        message: "Material atualizado com sucesso",
        material,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao atualizar material",
        details: error.message,
      })
    }
  }

  // Deletar material
  async delete(req, res) {
    try {
      const material = await Material.findByIdAndDelete(req.params.id)

      if (!material) {
        return res.status(404).json({
          error: true,
          message: "Material não encontrado",
        })
      }

      return res.json({
        error: false,
        message: "Material deletado com sucesso",
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao deletar material",
        details: error.message,
      })
    }
  }
}

module.exports = new MaterialController()
