const mongoose = require("mongoose")

const entradaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "Nome é obrigatório"],
      trim: true,
    },
    valor: {
      type: Number,
      required: [true, "Valor é obrigatório"],
      min: [0, "Valor deve ser positivo"],
    },
    data: {
      type: Date,
      required: [true, "Data é obrigatória"],
    },
    observacoes: {
      type: String,
      trim: true,
      default: "",
    },
    obraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Obra",
      default: null, // null = entrada geral da empresa
    },
    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    statusRecebimento: {
      type: String,
      enum: ["pendente", "recebido", "em_processamento", "cancelado", "atrasado"],
      default: "recebido",
    },
  },
  {
    timestamps: true,
  },
)

// Índices para otimização de consultas
entradaSchema.index({ categoria: 1 })
entradaSchema.index({ data: -1 })
entradaSchema.index({ obraId: 1 })
entradaSchema.index({ cliente: 1 })
entradaSchema.index({ statusRecebimento: 1 })
entradaSchema.index({ nome: 1 })

module.exports = mongoose.model("Entrada", entradaSchema)
 