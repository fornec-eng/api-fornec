const Obra = require("../models/obra")
const User = require("../models/users")

class ObraController {
  // Criar nova obra
  async create(req, res) {
    try {
      const obraData = {
        ...req.body,
        criadoPor: req.userID,
      }

      const obra = await Obra.create(obraData)

      return res.status(201).json({
        error: false,
        message: "Obra criada com sucesso",
        obra,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao criar obra",
        details: error.message,
      })
    }
  }

  async readAll(req, res) {
    try {
      const { page = 1, limit = 10, status, cliente, nome } = req.query

      const filter = {}
      if (status) filter.status = status
      if (cliente) filter.cliente = new RegExp(cliente, "i")
      if (nome) filter.nome = new RegExp(nome, "i")

      // Se não for Admin, filtrar apenas obras permitidas
      if (req.userRole !== "Admin") {
        const usuario = await User.findById(req.userID).select("obrasPermitidas")
        if (usuario && usuario.obrasPermitidas.length > 0) {
          filter._id = { $in: usuario.obrasPermitidas }
        } else {
          // Se usuário não tem obras permitidas, retorna lista vazia
          return res.json({
            error: false,
            obras: [],
            pagination: {
              page: Number.parseInt(page),
              limit: Number.parseInt(limit),
              total: 0,
              pages: 0,
            },
          })
        }
      }

      const skip = (page - 1) * limit

      const obras = await Obra.find(filter)
        .populate("criadoPor", "nome email")
        .sort({ createdAt: -1 })
        .limit(Number.parseInt(limit))
        .skip(skip)

      const total = await Obra.countDocuments(filter)

      return res.json({
        error: false,
        obras,
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
        message: "Erro ao listar obras",
        details: error.message,
      })
    }
  }

  async readById(req, res) {
    try {
      const filter = { _id: req.params.id }

      // Se não for Admin, verificar se tem permissão para ver esta obra
      if (req.userRole !== "Admin") {
        const usuario = await User.findById(req.userID).select("obrasPermitidas")
        if (!usuario || !usuario.obrasPermitidas.includes(req.params.id)) {
          return res.status(403).json({
            error: true,
            message: "Acesso negado a esta obra",
          })
        }
      }

      const obra = await Obra.findById(req.params.id).populate("criadoPor", "nome email")

      if (!obra) {
        return res.status(404).json({
          error: true,
          message: "Obra não encontrada",
        })
      }

      return res.json({
        error: false,
        obra,
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao buscar obra",
        details: error.message,
      })
    }
  }

  // Atualizar obra
  async update(req, res) {
    try {
      const obra = await Obra.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(
        "criadoPor",
        "nome email",
      )

      if (!obra) {
        return res.status(404).json({
          error: true,
          message: "Obra não encontrada",
        })
      }

      return res.json({
        error: false,
        message: "Obra atualizada com sucesso",
        obra,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao atualizar obra",
        details: error.message,
      })
    }
  }

  // Deletar obra
  async delete(req, res) {
    try {
      const obra = await Obra.findByIdAndDelete(req.params.id)

      if (!obra) {
        return res.status(404).json({
          error: true,
          message: "Obra não encontrada",
        })
      }

      return res.json({
        error: false,
        message: "Obra deletada com sucesso",
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao deletar obra",
        details: error.message,
      })
    }
  }

  // Atualizar spreadsheetId da obra
  async updateSpreadsheetId(req, res) {
    try {
      const { spreadsheetId } = req.body

      if (!spreadsheetId) {
        return res.status(400).json({
          error: true,
          message: "spreadsheetId é obrigatório",
        })
      }

      const obra = await Obra.findByIdAndUpdate(
        req.params.id,
        { spreadsheetId },
        { new: true, runValidators: true },
      ).populate("criadoPor", "nome email")

      if (!obra) {
        return res.status(404).json({
          error: true,
          message: "Obra não encontrada",
        })
      }

      return res.json({
        error: false,
        message: "Planilha associada à obra com sucesso",
        obra,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao associar planilha à obra",
        details: error.message,
      })
    }
  }

  // Buscar obra por spreadsheetId
  async getBySpreadsheetId(req, res) {
    try {
      const obra = await Obra.findOne({ spreadsheetId: req.params.spreadsheetId }).populate("criadoPor", "nome email")

      if (!obra) {
        return res.status(404).json({
          error: true,
          message: "Obra não encontrada para esta planilha",
        })
      }

      return res.json({
        error: false,
        obra,
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao buscar obra por planilha",
        details: error.message,
      })
    }
  }

  // Relatório de gastos por obra
  async relatorioGastos(req, res) {
    try {
      const { id } = req.params

      const obra = await Obra.findById(id)
      if (!obra) {
        return res.status(404).json({
          error: true,
          message: "Obra não encontrada",
        })
      }

      // Aqui você pode implementar a lógica para buscar todos os gastos relacionados à obra
      // usando os outros modelos (MaoObra, Material, etc.)

      return res.json({
        error: false,
        obra,
        message: "Relatório de gastos - implementar busca nos outros modelos",
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao gerar relatório",
        details: error.message,
      })
    }
  }

  async getObrasAtivas(req, res) {
    try {
      const obrasAtivas = await Obra.find({
        status: { $in: ["planejamento", "em_andamento"] },
      })
        .select("_id nome cliente status")
        .sort({ nome: 1 })

      return res.json({
        error: false,
        obras: obrasAtivas,
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao listar obras ativas",
        details: error.message,
      })
    }
  }
}

module.exports = new ObraController()
