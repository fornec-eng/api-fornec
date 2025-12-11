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
equipamentosSchema.methods.adicionarPagamento = function (dadosPagamento) {
  this.pagamentos.push(dadosPagamento)
  return this.save()
}

equipamentosSchema.methods.atualizarPagamento = function (pagamentoId, novosDados) {
  const pagamento = this.pagamentos.id(pagamentoId)
  if (pagamento) {
    Object.assign(pagamento, novosDados)
    return this.save()
  }
  throw new Error("Pagamento não encontrado")
}

equipamentosSchema.methods.removerPagamento = function (pagamentoId) {
  const pagamento = this.pagamentos.id(pagamentoId)
  if (pagamento) {
    pagamento.remove()
    return this.save()
  }
  throw new Error("Pagamento não encontrado")
}

equipamentosSchema.methods.buscarPagamento = function (pagamentoId) {
  return this.pagamentos.id(pagamentoId)
}

// Método virtual para calcular valor total dos pagamentos
equipamentosSchema.virtual("valorTotalPagamentos").get(function () {
  return this.pagamentos.reduce((total, pagamento) => total + pagamento.valor, 0)
})

// Método virtual para obter status geral dos pagamentos
equipamentosSchema.virtual("statusGeralPagamentos").get(function () {
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
equipamentosSchema.set("toJSON", { virtuals: true })
equipamentosSchema.set("toObject", { virtuals: true })

// Índices
equipamentosSchema.index({ numeroNota: 1 })
equipamentosSchema.index({ item: 1 })
equipamentosSchema.index({ data: -1 })
equipamentosSchema.index({ obraId: 1 })
equipamentosSchema.index({ "pagamentos.statusPagamento": 1 })
equipamentosSchema.index({ "pagamentos.dataPagamento": 1 })

module.exports = mongoose.model("Equipamentos", equipamentosSchema)
