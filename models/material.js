const mongoose = require("mongoose")

const materialSchema = new mongoose.Schema(
  {
    numeroNota: {
      type: String,
      required: [true, "Número da nota é obrigatório"],
      trim: true,
    },
    data: {
      type: Date,
      required: [true, "Data é obrigatória"],
    },
    localCompra: {
      type: String,
      required: [true, "Local da compra é obrigatório"],
      trim: true,
    },
    valor: {
      type: Number,
      required: [true, "Valor é obrigatório"],
      min: [0, "Valor deve ser positivo"],
    },
    solicitante: {
      type: String,
      required: [true, "Solicitante é obrigatório"],
      trim: true,
    },
    formaPagamento: {
      type: String,
      required: [true, "Forma de pagamento é obrigatória"],
      enum: ["pix", "transferencia", "avista", "cartao", "boleto", "cheque", "outro"],
      trim: true,
    },
    chavePixBoleto: {
      type: String,
      trim: true,
      default: "",
    },
    descricao: {
      type: String,
      trim: true,
      default: "",
    },
    obraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Obra",
      default: null, // null = gasto geral da Fornec
    },
    observacoes: {
      type: String,
      trim: true,
      default: "",
    },
    statusPagamento: {
      type: String,
      enum: ["pendente", "efetuado", "em_processamento", "cancelado", "atrasado"],
      default: "pendente",
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

// Índices
materialSchema.index({ numeroNota: 1 })
materialSchema.index({ data: -1 })
materialSchema.index({ obraId: 1 })
materialSchema.index({ solicitante: 1 })
materialSchema.index({ statusPagamento: 1 })

module.exports = mongoose.model("Material", materialSchema)
