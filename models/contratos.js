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
      enum: ["pix", "transferencia", "avista", "cartao", "boleto", "Parcelado"],
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

const contratosSchema = new mongoose.Schema(
  {
    contratoId: {
      type: String,
      unique: true,
      trim: true,
    },
    loja: {
      type: String,
      required: [true, "Nome da loja é obrigatório"],
      trim: true,
    },
    valor: {
      type: Number,
      min: [0, "Valor deve ser positivo"],
      default: 0,
    },
    valorInicial: {
      type: Number,
      min: [0, "Valor inicial deve ser positivo"],
      default: 0,
    },
    inicioContrato: {
      type: Date,
      default: null,
    },
    finalContrato: {
      type: Date,
      default: null,
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
    observacoes: {
      type: String,
      trim: true,
      default: "",
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
  }
)

// Middleware para gerar contratoId automaticamente
contratosSchema.pre("save", async function (next) {
  if (!this.contratoId) {
    // Gerar ID único baseado no timestamp e contador
    const timestamp = Date.now().toString().slice(-6)
    const count = await mongoose.model("Contratos").countDocuments()
    this.contratoId = `CONT-${timestamp}-${(count + 1).toString().padStart(4, "0")}`
  }
  next()
})

// Métodos para gerenciar pagamentos
contratosSchema.methods.adicionarPagamento = function (dadosPagamento) {
  this.pagamentos.push(dadosPagamento)
  return this.save()
}

contratosSchema.methods.atualizarPagamento = function (pagamentoId, novosDados) {
  const pagamento = this.pagamentos.id(pagamentoId)
  if (pagamento) {
    Object.assign(pagamento, novosDados)
    return this.save()
  }
  throw new Error("Pagamento não encontrado")
}

contratosSchema.methods.removerPagamento = function (pagamentoId) {
  const pagamento = this.pagamentos.id(pagamentoId)
  if (pagamento) {
    pagamento.remove()
    return this.save()
  }
  throw new Error("Pagamento não encontrado")
}

contratosSchema.methods.buscarPagamento = function (pagamentoId) {
  return this.pagamentos.id(pagamentoId)
}

// Método virtual para calcular valor total dos pagamentos
contratosSchema.virtual("valorTotalPagamentos").get(function () {
  return this.pagamentos.reduce((total, pagamento) => total + pagamento.valor, 0)
})

// Método virtual para obter status geral dos pagamentos
contratosSchema.virtual("statusGeralPagamentos").get(function () {
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
contratosSchema.set("toJSON", { virtuals: true })
contratosSchema.set("toObject", { virtuals: true })

// Índices
contratosSchema.index({ contratoId: 1 })
contratosSchema.index({ loja: 1 })
contratosSchema.index({ obraId: 1 })
contratosSchema.index({ status: 1 })
contratosSchema.index({ "pagamentos.statusPagamento": 1 })
contratosSchema.index({ "pagamentos.dataPagamento": 1 })

module.exports = mongoose.model("Contratos", contratosSchema)