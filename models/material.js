const mongoose = require("mongoose")

const pagamentoSchema = new mongoose.Schema(
  {
    valor: {
      type: Number,
      required: [true, "Valor do pagamento é obrigatório"],
      min: [0, "Valor deve ser positivo"],
    },
    tipoPagamento: {
      type: String,
      required: [true, "Tipo de pagamento é obrigatório"],
      enum: ["avista", "parcelado", "mensal", "por_etapa", "pix", "transferencia", "cartao", "boleto", "cheque"],
      trim: true,
    },
    dataPagamento: {
      type: Date,
      required: [true, "Data de pagamento é obrigatória"],
    },
    statusPagamento: {
      type: String,
      enum: ["pendente", "efetuado", "pago", "em_processamento", "cancelado", "atrasado"],
      default: "pendente",
    },
    observacoes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

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
      enum: ["pix", "transferencia", "avista", "cartao", "boleto", "parcelado"],
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
    // Status de pagamento do material (campo direto para facilitar atualizações)
    statusPagamento: {
      type: String,
      enum: ["pendente", "efetuado", "pago", "em_processamento", "cancelado", "atrasado"],
      default: "pendente",
    },
    // Array de pagamentos aninhados (para parcelamentos)
    pagamentos: [pagamentoSchema],
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

materialSchema.methods.adicionarPagamento = function (dadosPagamento) {
  this.pagamentos.push(dadosPagamento)
  return this.save()
}

materialSchema.methods.atualizarPagamento = function (pagamentoId, novosDados) {
  const pagamento = this.pagamentos.id(pagamentoId)
  if (pagamento) {
    Object.assign(pagamento, novosDados)
    return this.save()
  }
  throw new Error("Pagamento não encontrado")
}

materialSchema.methods.removerPagamento = function (pagamentoId) {
  const pagamento = this.pagamentos.id(pagamentoId)
  if (pagamento) {
    pagamento.remove()
    return this.save()
  }
  throw new Error("Pagamento não encontrado")
}

materialSchema.methods.buscarPagamento = function (pagamentoId) {
  return this.pagamentos.id(pagamentoId)
}

materialSchema.virtual("valorTotalPagamentos").get(function () {
  return this.pagamentos.reduce((total, pagamento) => total + pagamento.valor, 0)
})

materialSchema.virtual("statusGeralPagamentos").get(function () {
  if (this.pagamentos.length === 0) return "sem_pagamentos"

  const todosPagos = this.pagamentos.every((p) => p.statusPagamento === "efetuado")
  const algumAtrasado = this.pagamentos.some((p) => p.statusPagamento === "atrasado")
  const algumPendente = this.pagamentos.some((p) => p.statusPagamento === "pendente")

  if (todosPagos) return "todos_pagos"
  if (algumAtrasado) return "com_atraso"
  if (algumPendente) return "pendente"

  return "em_processamento"
})

materialSchema.set("toJSON", { virtuals: true })
materialSchema.set("toObject", { virtuals: true })

// Índices
materialSchema.index({ numeroNota: 1 })
materialSchema.index({ data: -1 })
materialSchema.index({ obraId: 1 })
materialSchema.index({ solicitante: 1 })
materialSchema.index({ "pagamentos.statusPagamento": 1 })
materialSchema.index({ "pagamentos.dataPagamento": 1 })

module.exports = mongoose.model("Material", materialSchema)
