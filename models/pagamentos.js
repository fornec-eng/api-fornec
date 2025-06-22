const mongoose = require('mongoose');

// Schema para gastos individuais
const gastoSchema = new mongoose.Schema({
  descricao: {
    type: String,
    required: true
  },
  categoria: {
    type: String,
    required: true
  },
  valor: {
    type: Number,
    required: true,
    min: 0
  },
  data: {
    type: Date,
    default: Date.now
  },
  fornecedor: String,
  observacoes: String
}, { timestamps: true });

// Schema para contratos
const contratoSchema = new mongoose.Schema({
  nomeContratado: {
    type: String,
    required: true
  },
  servico: {
    type: String,
    required: true
  },
  valorTotal: {
    type: Number,
    required: true,
    min: 0
  },
  dataInicio: Date,
  dataFim: Date,
  status: {
    type: String,
    enum: ['ativo', 'concluido', 'cancelado'],
    default: 'ativo'
  },
  observacoes: String
}, { timestamps: true });

// Schema para cronograma
const cronogramaSchema = new mongoose.Schema({
  etapa: {
    type: String,
    required: true
  },
  descricao: String,
  dataInicio: Date,
  dataFim: Date,
  status: {
    type: String,
    enum: ['previsto', 'em andamento', 'concluida', 'atrasada'],
    default: 'previsto'
  },
  responsavel: String,
  percentualConcluido: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  }
}, { timestamps: true });

// Schema para pagamentos semanais
const pagamentoSemanalSchema = new mongoose.Schema({
  semana: {
    type: Number,
    required: true,
    min: 1,
    max: 53
  },
  ano: {
    type: Number,
    required: true
  },
  totalReceber: {
    type: Number,
    required: true,
    min: 0
  },
  dataVencimento: Date,
  status: {
    type: String,
    enum: ['pagar', 'pagamento efetuado'],
    default: 'pagar'
  },
  dataPagamento: Date,
  observacoes: String
}, { timestamps: true });

// Schema para obra
const obraSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  dataInicio: {
    type: Date,
    required: true
  },
  dataFinalEntrega: {
    type: Date,
    required: true
  },
  orcamento: {
    type: Number,
    required: true,
    min: 0
  },
  descricao: String,
  endereco: String,
  responsavel: String,
  status: {
    type: String,
    enum: ['planejamento', 'em andamento', 'concluida', 'pausada', 'cancelada'],
    default: 'planejamento'
  }
});

// Schema principal do pagamento (que representa uma obra completa)
const pagamentoSchema = new mongoose.Schema({
  obra: {
    type: obraSchema,
    required: true
  },
  gastos: [gastoSchema],
  contratos: [contratoSchema],
  cronograma: [cronogramaSchema],
  pagamentosSemanais: [pagamentoSemanalSchema]
}, { timestamps: true });

// Virtuals para cálculos automáticos
pagamentoSchema.virtual('valorTotalGasto').get(function() {
  const totalGastos = this.gastos.reduce((acc, gasto) => acc + gasto.valor, 0);
  const totalContratos = this.contratos.reduce((acc, contrato) => acc + contrato.valorTotal, 0);
  const totalPagamentosSemanais = this.pagamentosSemanais.reduce((acc, ps) => acc + ps.totalReceber, 0);
  return totalGastos + totalContratos + totalPagamentosSemanais;
});

pagamentoSchema.virtual('saldoRestante').get(function() {
  return this.obra.orcamento - this.valorTotalGasto;
});

pagamentoSchema.virtual('statusOrcamento').get(function() {
  const percentualGasto = (this.valorTotalGasto / this.obra.orcamento) * 100;
  if (percentualGasto <= 70) return 'dentro do orçamento';
  if (percentualGasto <= 90) return 'atenção';
  if (percentualGasto <= 100) return 'próximo do limite';
  return 'acima do orçamento';
});

pagamentoSchema.virtual('percentualConcluido').get(function() {
  if (this.cronograma.length === 0) return 0;
  const concluidas = this.cronograma.filter(etapa => etapa.status === 'concluida').length;
  return Math.round((concluidas / this.cronograma.length) * 100);
});

pagamentoSchema.virtual('diasRestantes').get(function() {
  const hoje = new Date();
  const dataFim = new Date(this.obra.dataFinalEntrega);
  const diffTime = dataFim.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Configurar virtuals para JSON
pagamentoSchema.set('toJSON', { virtuals: true });
pagamentoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Pagamento', pagamentoSchema);