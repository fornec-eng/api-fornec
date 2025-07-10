const mongoose = require("mongoose")

const maoObraSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "Nome é obrigatório"],
      trim: true,
    },
    funcao: {
      type: String,
      required: [true, "Função é obrigatória"],
      trim: true,
    },
    tipoContratacao: {
      type: String,
      enum: ["clt", "pj", "diaria", "empreitada", "temporario"],
      required: [true, "Tipo de contratação é obrigatório"],
    },
    valor: {
      type: Number,
      required: [true, "Valor é obrigatório"],
      min: [0, "Valor deve ser positivo"],
    },
    inicioContrato: {
      type: Date,
      required: [true, "Data de início do contrato é obrigatória"],
    },
    fimContrato: {
      type: Date,
      required: [true, "Data de fim do contrato é obrigatória"],
    },
    diaPagamento: {
      type: Number,
      required: [true, "Dia do pagamento é obrigatório"],
      min: [1, "Dia deve ser entre 1 e 31"],
      max: [31, "Dia deve ser entre 1 e 31"],
    },
    formaPagamento: {
      type: String,
      enum: ["pix", "transferencia", "avista", "cartao", "boleto", "cheque", "outro"],
      default: "pix",
    },
    chavePixBoleto: {
      type: String,
      trim: true,
      default: "",
    },
    obraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Obra",
      default: null, // null = gasto geral da Fornec
    },
    status: {
      type: String,
      enum: ["ativo", "inativo", "finalizado"],
      default: "ativo",
    },
    statusPagamento: {
      type: String,
      enum: ["pendente", "efetuado", "em_processamento", "cancelado", "atrasado"],
      default: "pendente",
    },
    observacoes: {
      type: String,
      trim: true,
      default: "",
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

// Validação customizada para data de fim
maoObraSchema.pre("save", function (next) {
  if (this.fimContrato <= this.inicioContrato) {
    next(new Error("Data de fim deve ser posterior à data de início"))
  }
  next()
})

// Índices
maoObraSchema.index({ nome: 1 })
maoObraSchema.index({ funcao: 1 })
maoObraSchema.index({ obraId: 1 })
maoObraSchema.index({ status: 1 })
maoObraSchema.index({ statusPagamento: 1 })

module.exports = mongoose.model("MaoObra", maoObraSchema)
