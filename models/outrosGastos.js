const mongoose = require("mongoose")

// Schema para os pagamentos aninhados
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
      enum: ["pendente", "efetuado", "em_processamento", "cancelado", "atrasado"],
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
  }
)

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
      enum: ["pix", "transferencia", "avista", "cartao", "boleto", "parcelado"],
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
    // Array de pagamentos aninhados
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

// Métodos para gerenciar pagamentos
outrosGastosSchema.methods.adicionarPagamento = function (dadosPagamento) {
  this.pagamentos.push(dadosPagamento)
  return this.save()
}

outrosGastosSchema.methods.atualizarPagamento = function (pagamentoId, novosDados) {
  const pagamento = this.pagamentos.id(pagamentoId)
  if (pagamento) {
    Object.assign(pagamento, novosDados)
    return this.save()
  }
  throw new Error("Pagamento não encontrado")
}

outrosGastosSchema.methods.removerPagamento = function (pagamentoId) {
  const pagamento = this.pagamentos.id(pagamentoId)
  if (pagamento) {
    pagamento.remove()
    return this.save()
  }
  throw new Error("Pagamento não encontrado")
}

outrosGastosSchema.methods.buscarPagamento = function (pagamentoId) {
  return this.pagamentos.id(pagamentoId)
}

// Método virtual para calcular valor total dos pagamentos
outrosGastosSchema.virtual("valorTotalPagamentos").get(function () {
  return this.pagamentos.reduce((total, pagamento) => total + pagamento.valor, 0)
})

// Método virtual para obter status geral dos pagamentos
outrosGastosSchema.virtual("statusGeralPagamentos").get(function () {
  if (this.pagamentos.length === 0) return "sem_pagamentos"

  const todosPagos = this.pagamentos.every(p => p.statusPagamento === "efetuado")
  const algumAtrasado = this.pagamentos.some(p => p.statusPagamento === "atrasado")
  const algumPendente = this.pagamentos.some(p => p.statusPagamento === "pendente")

  if (todosPagos) return "todos_pagos"
  if (algumAtrasado) return "com_atraso"
  if (algumPendente) return "pendente"

  return "em_processamento"
})

// Configurar para incluir virtuals no JSON
outrosGastosSchema.set("toJSON", { virtuals: true })
outrosGastosSchema.set("toObject", { virtuals: true })

// Índices
outrosGastosSchema.index({ categoriaLivre: 1 })
outrosGastosSchema.index({ data: -1 })
outrosGastosSchema.index({ obraId: 1 })
outrosGastosSchema.index({ fornecedor: 1 })
outrosGastosSchema.index({ "pagamentos.statusPagamento": 1 })
outrosGastosSchema.index({ "pagamentos.dataPagamento": 1 })

module.exports = mongoose.model("OutrosGastos", outrosGastosSchema)
