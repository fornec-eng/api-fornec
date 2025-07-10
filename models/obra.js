const mongoose = require("mongoose")

const obraSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "Nome da obra é obrigatório"],
      trim: true,
    },
    endereco: {
      type: String,
      required: [true, "Endereço da obra é obrigatório"],
      trim: true,
    },
    cliente: {
      type: String,
      required: [true, "Cliente é obrigatório"],
      trim: true,
    },
    valorContrato: {
      type: Number,
      required: [true, "Valor do contrato é obrigatório"],
      min: [0, "Valor do contrato deve ser positivo"],
    },
    dataInicio: {
      type: Date,
      required: [true, "Data de início é obrigatória"],
    },
    dataPrevisaoTermino: {
      type: Date,
      required: [true, "Data de previsão de término é obrigatória"],
    },
    dataTermino: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["planejamento", "em_andamento", "pausada", "concluida", "cancelada"],
      default: "planejamento",
    },
    descricao: {
      type: String,
      trim: true,
      default: "",
    },
    observacoes: {
      type: String,
      trim: true,
      default: "",
    },
    spreadsheetId: {
      type: String,
      trim: true,
      default: null,
      index: true, // Para facilitar buscas
    },
    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Índices para melhor performance
obraSchema.index({ nome: 1 })
obraSchema.index({ cliente: 1 })
obraSchema.index({ status: 1 })
obraSchema.index({ dataInicio: -1 })
obraSchema.index({ spreadsheetId: 1 })

module.exports = mongoose.model("Obra", obraSchema)
