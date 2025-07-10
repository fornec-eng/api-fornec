const mongoose = require("mongoose")

const outrosGastosSchema = new mongoose.Schema(
  {
    descricao: {
      type: String,
      required: [true, "Descrição é obrigatória"],
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
    categoriaLivre: {
      type: String,
      required: [true, "Categoria é obrigatória"],
      trim: true,
    },
    observacoes: {
      type: String,
      trim: true,
      default: "",
    },
    formaPagamento: {
      type: String,
      enum: ["pix", "transferencia", "avista", "cartao", "boleto", "cheque", "dinheiro", "outro"],
      default: "pix",
    },
    chavePixBoleto: {
      type: String,
      trim: true,
      default: "",
    },
    numeroDocumento: {
      type: String,
      trim: true,
      default: "",
    },
    fornecedor: {
      type: String,
      trim: true,
      default: "",
    },
    obraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Obra",
      default: null, // null = gasto geral da Fornec
    },
    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    statusPagamento: {
      type: String,
      enum: ["pendente", "efetuado", "em_processamento", "cancelado", "atrasado"],
      default: "pendente",
    },
  },
  {
    timestamps: true,
  },
)

// Índices
outrosGastosSchema.index({ categoriaLivre: 1 })
outrosGastosSchema.index({ data: -1 })
outrosGastosSchema.index({ obraId: 1 })
outrosGastosSchema.index({ fornecedor: 1 })
outrosGastosSchema.index({ statusPagamento: 1 })

module.exports = mongoose.model("OutrosGastos", outrosGastosSchema)
