const mongoose = require("mongoose")

const equipamentosSchema = new mongoose.Schema(
  {
    numeroNota: {
      type: String,
      required: [true, "Número da nota é obrigatório"],
      trim: true,
    },
    item: {
      type: String,
      required: [true, "Item é obrigatório"],
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
    descricao: {
      type: String,
      required: [true, "Descrição é obrigatória"],
      trim: true,
    },
    tipoContratacao: {
      type: String,
      required: [true, "Tipo de contratação é obrigatório"],
      enum: ["compra", "aluguel", "leasing", "comodato"],
      trim: true,
    },
    formaPagamento: {
      type: String,
      required: [true, "Forma de pagamento é obrigatória"],
      enum: ["pix", "transferencia", "avista", "cartao", "boleto", "cheque", "outro"],
      trim: true,
    },
    parcelas: {
      type: Number,
      min: [1, "Número de parcelas deve ser positivo"],
      validate: {
        validator: function (v) {
          return this.formaPagamento !== "cartao" || !v || v > 0
        },
        message: "Número de parcelas deve ser positivo",
      },
    },
    diaPagamento: {
      type: Number,
      required: [true, "Dia do pagamento é obrigatório"],
      min: [1, "Dia deve ser entre 1 e 31"],
      max: [31, "Dia deve ser entre 1 e 31"],
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
equipamentosSchema.index({ numeroNota: 1 })
equipamentosSchema.index({ item: 1 })
equipamentosSchema.index({ data: -1 })
equipamentosSchema.index({ obraId: 1 })
equipamentosSchema.index({ statusPagamento: 1 })

module.exports = mongoose.model("Equipamentos", equipamentosSchema)
