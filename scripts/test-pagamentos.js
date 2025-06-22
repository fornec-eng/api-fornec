const axios = require("axios")

const BASE_URL = "http://localhost:4000"
const EMAIL = "admin@fornec.com"
const SENHA = "123456"

let token = ""
let obraId = ""

async function testarAPI() {
  try {
    console.log("🚀 Iniciando testes da API de Pagamentos...\n")

    // 1. Login
    console.log("📝 1. Fazendo login...")
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      data: { email: EMAIL, senha: SENHA },
    })

    token = loginResponse.data.token
    console.log("✅ Login realizado com sucesso!\n")

    // Headers para próximas requisições
    const headers = { Authorization: `Bearer ${token}` }

    // 2. Criar obra
    console.log("🏗️ 2. Criando nova obra...")
    const obraResponse = await axios.post(
      `${BASE_URL}/pagamentos`,
      {
        obra: {
          nome: "Teste - Construção Residencial",
          dataInicio: "2023-07-01",
          dataFinalEntrega: "2023-12-31",
          orcamento: 200000,
        },
      },
      { headers },
    )

    obraId = obraResponse.data.pagamento._id
    console.log(`✅ Obra criada! ID: ${obraId}\n`)

    // 3. Adicionar gasto
    console.log("💰 3. Adicionando gasto...")
    await axios.post(
      `${BASE_URL}/pagamentos/${obraId}/gastos`,
      {
        nrNota: "NF-12345",
        descricao: "Cimento Portland 50kg - Teste",
        data: "2023-07-10",
        localCompra: "Loja de Materiais XYZ",
        valor: 2500,
        solicitante: "João Silva",
        formaPagamento: "pix",
      },
      { headers },
    )
    console.log("✅ Gasto adicionado!\n")

    // 4. Adicionar pagamento semanal
    console.log("📅 4. Adicionando pagamento semanal...")
    await axios.post(
      `${BASE_URL}/pagamentos/${obraId}/pagamentos-semanais`,
      {
        nome: "José Silva - Teste",
        funcao: "Pedreiro",
        dataInicio: "2023-07-01",
        dataFimContrato: "2023-07-31",
        tipoContratacao: "Semanal",
        valorPagar: 1200,
        chavePix: "123.456.789-00",
        nomeChavePix: "José Silva",
        qualificacaoTecnica: "Pedreiro especializado",
        valorVT: 120,
        valorVA: 200,
        status: "pagar",
        semana: 27,
        ano: 2023,
      },
      { headers },
    )
    console.log("✅ Pagamento semanal adicionado!\n")

    // 5. Gerar relatório
    console.log("📊 5. Gerando relatório financeiro...")
    const relatorioResponse = await axios.get(`${BASE_URL}/pagamentos/${obraId}/relatorio-financeiro`, { headers })
    console.log("✅ Relatório gerado!")
    console.log(`Orçamento: R$ ${relatorioResponse.data.relatorio.resumoFinanceiro.orcamentoTotal}`)
    console.log(`Total Gasto: R$ ${relatorioResponse.data.relatorio.resumoFinanceiro.totalGasto}`)
    console.log(`Saldo: R$ ${relatorioResponse.data.relatorio.resumoFinanceiro.saldoRestante}\n`)

    // 6. Listar pagamentos pendentes
    console.log("⏰ 6. Listando pagamentos pendentes...")
    const pendentesResponse = await axios.get(`${BASE_URL}/pagamentos/semanais/pendentes`, { headers })
    console.log(`✅ ${pendentesResponse.data.total} pagamentos pendentes encontrados!\n`)

    // 7. Buscar obra específica
    console.log("🔍 7. Buscando obra específica...")
    const obraEspecificaResponse = await axios.get(`${BASE_URL}/pagamentos/${obraId}`, { headers })
    console.log(`✅ Obra encontrada: ${obraEspecificaResponse.data.pagamento.obra.nome}\n`)

    console.log("🎉 Todos os testes foram executados com sucesso!")
    console.log(`🗑️ Para deletar a obra de teste: DELETE ${BASE_URL}/pagamentos/${obraId}`)
  } catch (error) {
    console.error("❌ Erro durante os testes:", error.response?.data || error.message)
  }
}

// Executar os testes
testarAPI()