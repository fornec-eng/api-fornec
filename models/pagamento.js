const mongoose = require("mongoose")

const pagamentoSchema = new mongoose.Schema(
  {
    // Campo obrigatório para identificar o tipo de pagamento
    tipo: {
      type: String,
      enum: ["material", "mao_obra", "pagamento_semanal"],
      required: [true, "Tipo de pagamento é obrigatório"],
    },

    // ==================== CAMPOS COMUNS ====================
    obraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Obra",
      default: null,
    },
    status: {
      type: String,
      enum: ["pendente_associacao", "associado", "cancelado"],
      default: "pendente_associacao",
    },
    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    observacoes: {
      type: String,
      default: "",
    },

    // ==================== CAMPOS PARA MATERIAL ====================
    // Obrigatórios apenas quando tipo = "material"
    nrNota: {
      type: String,
      required: function () {
        return this.tipo === "material"
      },
    },
    descricao: {
      type: String,
      required: function () {
        return this.tipo === "material"
      },
    },
    data: {
      type: Date,
      required: function () {
        return this.tipo === "material"
      },
    },
    localCompra: {
      type: String,
      default: "",
    },
    valor: {
      type: Number,
      required: function () {
        return this.tipo === "material"
      },
      min: 0,
    },
    solicitante: {
      type: String,
      default: "",
    },
    formaPagamento: {
      type: String,
      enum: ["pix", "transferencia", "avista", "cartao", "boleto", "outro"],
      default: "pix",
    },

    // ==================== CAMPOS PARA MÃO DE OBRA ====================
    // Obrigatórios apenas quando tipo = "mao_obra"
    nome: {
      type: String,
      required: function () {
        return this.tipo === "mao_obra" || this.tipo === "pagamento_semanal"
      },
    },
    funcao: {
      type: String,
      required: function () {
        return this.tipo === "mao_obra" || this.tipo === "pagamento_semanal"
      },
    },
    dataInicio: {
      type: Date,
      required: function () {
        return this.tipo === "mao_obra" || this.tipo === "pagamento_semanal"
      },
    },
    dataFim: {
      type: Date,
      required: function () {
        return this.tipo === "mao_obra"
      },
    },
    contaBancaria: {
      type: String,
      required: function () {
        return this.tipo === "mao_obra"
      },
    },
    valorTotal: {
      type: Number,
      required: function () {
        return this.tipo === "mao_obra"
      },
      min: 0,
    },
    numeroParcelas: {
      type: Number,
      default: 1,
      min: 1,
    },
    dataPagamento: {
      type: Date,
      required: function () {
        return this.tipo === "mao_obra"
      },
    },
    statusPagamento: {
      type: String,
      enum: ["previsto", "pago", "em atraso", "cancelado"],
      default: "previsto",
    },
    valorParcela: {
      type: Number,
      default: function () {
        if (this.tipo === "mao_obra" && this.valorTotal && this.numeroParcelas) {
          return this.valorTotal / this.numeroParcelas
        }
        return 0
      },
    },

    // ==================== CAMPOS PARA PAGAMENTO SEMANAL ====================
    // Obrigatórios apenas quando tipo = "pagamento_semanal"
    dataFimContrato: {
      type: Date,
      required: function () {
        return this.tipo === "pagamento_semanal"
      },
    },
    tipoContratacao: {
      type: String,
      required: function () {
        return this.tipo === "pagamento_semanal"
      },
    },
    valorPagar: {
      type: Number,
      required: function () {
        return this.tipo === "pagamento_semanal"
      },
      min: 0,
    },
    chavePix: {
      type: String,
      required: function () {
        return this.tipo === "pagamento_semanal"
      },
    },
    nomeChavePix: {
      type: String,
      required: function () {
        return this.tipo === "pagamento_semanal"
      },
    },
    qualificacaoTecnica: {
      type: String,
      required: function () {
        return this.tipo === "pagamento_semanal"
      },
    },
    valorVT: {
      type: Number,
      default: 0,
      min: 0,
    },
    valorVA: {
      type: Number,
      default: 0,
      min: 0,
    },
    valorVAVT: {
      type: Number,
      default: function () {
        if (this.tipo === "pagamento_semanal") {
          return this.valorVA + this.valorVT
        }
        return 0
      },
    },
    totalReceber: {
      type: Number,
      default: function () {
        if (this.tipo === "pagamento_semanal") {
          return this.valorPagar + this.valorVA + this.valorVT
        }
        return 0
      },
    },
    statusPagamentoSemanal: {
      type: String,
      enum: ["pagar", "pagamento efetuado", "cancelado"],
      default: "pagar",
    },
    semana: {
      type: Number,
      required: function () {
        return this.tipo === "pagamento_semanal"
      },
      min: 1,
      max: 53,
    },
    ano: {
      type: Number,
      required: function () {
        return this.tipo === "pagamento_semanal"
      },
      min: 2020,
      max: 2050,
    },
    dataPagamentoEfetuado: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Middleware para calcular valores automaticamente
pagamentoSchema.pre("save", function (next) {
  // Cálculos para mão de obra
  if (this.tipo === "mao_obra" && this.valorTotal && this.numeroParcelas) {
    this.valorParcela = this.valorTotal / this.numeroParcelas
  }

  // Cálculos para pagamento semanal
  if (this.tipo === "pagamento_semanal") {
    this.valorVAVT = this.valorVA + this.valorVT
    this.totalReceber = this.valorPagar + this.valorVA + this.valorVT

    // Atualizar data de pagamento se status mudou para "pagamento efetuado"
    if (this.statusPagamentoSemanal === "pagamento efetuado" && !this.dataPagamentoEfetuado) {
      this.dataPagamentoEfetuado = new Date()
    }
  }

  next()
})

// Índices para melhor performance
pagamentoSchema.index({ tipo: 1 })
pagamentoSchema.index({ obraId: 1 })
pagamentoSchema.index({ status: 1 })
pagamentoSchema.index({ statusPagamento: 1 })
pagamentoSchema.index({ statusPagamentoSemanal: 1 })
pagamentoSchema.index({ data: -1 })
pagamentoSchema.index({ dataInicio: -1 })
pagamentoSchema.index({ dataPagamento: 1 })
pagamentoSchema.index({ semana: 1, ano: 1 })
pagamentoSchema.index({ nrNota: 1 })
pagamentoSchema.index({ nome: 1 })
pagamentoSchema.index({ funcao: 1 })

module.exports = mongoose.model("Pagamento", pagamentoSchema)
