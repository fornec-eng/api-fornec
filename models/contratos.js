const mongoose = require("mongoose")

const contratosSchema = new mongoose.Schema(
  {
    contratoId: {
      type: String,
      required: [true, "ID do contrato é obrigatório"],
      unique: true,
      trim: true,
    },
    nome: {
      type: String,
      required: [true, "Nome do contrato é obrigatório"],
      trim: true,
    },
    valor: {
      type: Number,
      required: [true, "Valor é obrigatório"],
      min: [0, "Valor deve ser positivo"],
    },
    tipoPagamento: {
      type: String,
      required: [true, "Tipo de pagamento é obrigatório"],
      enum: ["avista", "parcelado", "mensal", "por_etapa"],
      trim: true,
    },
    parcelas: {
      type: Number,
      min: [1, "Número de parcelas deve ser positivo"],
      validate: {
        validator: function (v) {
          return this.tipoPagamento !== "parcelado" || (v && v > 0)
        },
        message: "Parcelas são obrigatórias quando tipo de pagamento é parcelado",
      },
    },
    datasProximasParcelas: [
      {
        type: Date,
        validate: {
          validator: function (v) {
            return (
              this.tipoPagamento !== "parcelado" ||
              (this.datasProximasParcelas && this.datasProximasParcelas.length > 0)
            )
          },
          message: "Datas das parcelas são obrigatórias quando tipo de pagamento é parcelado",
        },
      },
    ],
    inicioContrato: {
      type: Date,
      required: [true, "Data de início do contrato é obrigatória"],
    },
    obraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Obra",
      default: null, // null = gasto geral da Fornec
    },
    status: {
      type: String,
      enum: ["ativo", "finalizado", "cancelado"],
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

// Índices
contratosSchema.index({ contratoId: 1 })
contratosSchema.index({ nome: 1 })
contratosSchema.index({ obraId: 1 })
contratosSchema.index({ status: 1 })
contratosSchema.index({ statusPagamento: 1 })

module.exports = mongoose.model("Contratos", contratosSchema)
