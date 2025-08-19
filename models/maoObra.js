// maoObra.js - Model corrigido
const mongoose = require("mongoose")

const maoObraSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, "Nome é obrigatório"],
      trim: true,
      maxlength: [100, "Nome deve ter no máximo 100 caracteres"],
    },
    funcao: {
      type: String,
      required: [true, "Função é obrigatória"],
      trim: true,
      maxlength: [50, "Função deve ter no máximo 50 caracteres"],
    },
    tipoContratacao: {
      type: String,
      enum: {
        values: ["clt", "pj", "diaria", "empreitada", "temporario"],
        message: "Tipo de contratação deve ser: clt, pj, diaria, empreitada ou temporario"
      },
      required: [true, "Tipo de contratação é obrigatório"],
    },
    valor: {
      type: Number,
      required: [true, "Valor é obrigatório"],
      min: [0, "Valor deve ser positivo"],
      validate: {
        validator: function(v) {
          return v >= 0;
        },
        message: "Valor deve ser maior ou igual a zero"
      }
    },
    inicioContrato: {
      type: Date,
      required: [true, "Data de início do contrato é obrigatória"],
      validate: {
        validator: function(v) {
          return v instanceof Date && !isNaN(v);
        },
        message: "Data de início deve ser uma data válida"
      }
    },
    fimContrato: {
      type: Date,
      required: [true, "Data de fim do contrato é obrigatória"],
      validate: {
        validator: function(v) {
          return v instanceof Date && !isNaN(v);
        },
        message: "Data de fim deve ser uma data válida"
      }
    },
    diaPagamento: {
      type: Number,
      required: [true, "Dia do pagamento é obrigatório"],
      min: [1, "Dia deve ser entre 1 e 31"],
      max: [31, "Dia deve ser entre 1 e 31"],
      validate: {
        validator: function(v) {
          return Number.isInteger(v) && v >= 1 && v <= 31;
        },
        message: "Dia do pagamento deve ser um número inteiro entre 1 e 31"
      }
    },
    formaPagamento: {
      type: String,
      enum: {
        values: ["pix", "transferencia", "avista", "cartao", "boleto", "cheque", "outro"],
        message: "Forma de pagamento deve ser: pix, transferencia, avista, cartao, boleto, cheque ou outro"
      },
      default: "pix",
    },
    chavePixBoleto: {
      type: String,
      trim: true,
      default: "",
      maxlength: [100, "Chave PIX/Boleto deve ter no máximo 100 caracteres"],
    },
    obraId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Obra",
      default: null, // null = gasto geral da Fornec
    },
    status: {
      type: String,
      enum: {
        values: ["ativo", "inativo", "finalizado"],
        message: "Status deve ser: ativo, inativo ou finalizado"
      },
      default: "ativo",
    },
    statusPagamento: {
      type: String,
      enum: {
        values: ["pendente", "efetuado", "em_processamento", "cancelado", "atrasado"],
        message: "Status de pagamento deve ser: pendente, efetuado, em_processamento, cancelado ou atrasado"
      },
      default: "pendente",
    },
    observacoes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Observações devem ter no máximo 500 caracteres"],
    },
    criadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Usuário criador é obrigatório"],
    },
  },
  {
    timestamps: true,
    // Adicionar virtuals no JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

// Validação customizada para data de fim
maoObraSchema.pre("save", function (next) {
  // Verificar se as datas são válidas
  if (this.inicioContrato && this.fimContrato) {
    if (this.fimContrato <= this.inicioContrato) {
      return next(new Error("Data de fim deve ser posterior à data de início"))
    }
  }
  
  // Validar valor
  if (this.valor < 0) {
    return next(new Error("Valor deve ser positivo"))
  }
  
  next()
})

// Validação customizada para atualização
maoObraSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate()
  
  // Se estamos atualizando as datas, validar
  if (update.inicioContrato && update.fimContrato) {
    const inicio = new Date(update.inicioContrato)
    const fim = new Date(update.fimContrato)
    
    if (fim <= inicio) {
      return next(new Error("Data de fim deve ser posterior à data de início"))
    }
  }
  
  // Se estamos atualizando o valor, validar
  if (update.valor !== undefined && update.valor < 0) {
    return next(new Error("Valor deve ser positivo"))
  }
  
  next()
})

// Virtual para calcular duração do contrato em dias
maoObraSchema.virtual('duracaoContrato').get(function() {
  if (this.inicioContrato && this.fimContrato) {
    const diffTime = Math.abs(this.fimContrato - this.inicioContrato)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  return 0
})

// Virtual para verificar se o contrato está ativo
maoObraSchema.virtual('contratoAtivo').get(function() {
  const hoje = new Date()
  return this.inicioContrato <= hoje && this.fimContrato >= hoje && this.status === 'ativo'
})

// Virtual para verificar se o pagamento está em atraso
maoObraSchema.virtual('pagamentoAtrasado').get(function() {
  if (this.statusPagamento === 'efetuado') return false
  
  const hoje = new Date()
  const diaAtual = hoje.getDate()
  
  // Se o dia do pagamento já passou no mês atual e ainda está pendente
  return diaAtual > this.diaPagamento && this.statusPagamento === 'pendente'
})

// Índices para melhor performance
maoObraSchema.index({ nome: 1 })
maoObraSchema.index({ funcao: 1 })
maoObraSchema.index({ obraId: 1 })
maoObraSchema.index({ status: 1 })
maoObraSchema.index({ statusPagamento: 1 })
maoObraSchema.index({ criadoPor: 1 })
maoObraSchema.index({ inicioContrato: 1, fimContrato: 1 })
maoObraSchema.index({ createdAt: -1 })

// Índice composto para consultas por obra e status
maoObraSchema.index({ obraId: 1, status: 1 })
maoObraSchema.index({ obraId: 1, statusPagamento: 1 })

module.exports = mongoose.model("MaoObra", maoObraSchema)