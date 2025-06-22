#!/bin/bash

# Configurações
BASE_URL="http://localhost:4000"
EMAIL="admin@fornec.com"
SENHA="123456"

echo "🚀 Iniciando testes da API de Pagamentos..."

# 1. Fazer login e obter token
echo "📝 1. Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{\"data\":{\"email\":\"$EMAIL\",\"senha\":\"$SENHA\"}}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Erro no login. Verifique as credenciais."
  echo "Resposta: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login realizado com sucesso!"
echo "Token: ${TOKEN:0:20}..."

# 2. Criar uma nova obra
echo "🏗️ 2. Criando nova obra..."
OBRA_RESPONSE=$(curl -s -X POST "$BASE_URL/pagamentos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "obra": {
      "nome": "Teste - Construção Residencial",
      "dataInicio": "2023-07-01",
      "dataFinalEntrega": "2023-12-31",
      "orcamento": 200000
    }
  }')

OBRA_ID=$(echo $OBRA_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$OBRA_ID" ]; then
  echo "❌ Erro ao criar obra."
  echo "Resposta: $OBRA_RESPONSE"
  exit 1
fi

echo "✅ Obra criada com sucesso!"
echo "ID da Obra: $OBRA_ID"

# 3. Adicionar gasto
echo "💰 3. Adicionando gasto..."
GASTO_RESPONSE=$(curl -s -X POST "$BASE_URL/pagamentos/$OBRA_ID/gastos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nrNota": "NF-12345",
    "descricao": "Cimento Portland 50kg - Teste",
    "data": "2023-07-10",
    "localCompra": "Loja de Materiais XYZ",
    "valor": 2500,
    "solicitante": "João Silva",
    "formaPagamento": "pix"
  }')

echo "✅ Gasto adicionado!"

# 4. Adicionar pagamento semanal
echo "📅 4. Adicionando pagamento semanal..."
PAGAMENTO_SEMANAL_RESPONSE=$(curl -s -X POST "$BASE_URL/pagamentos/$OBRA_ID/pagamentos-semanais" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "José Silva - Teste",
    "funcao": "Pedreiro",
    "dataInicio": "2023-07-01",
    "dataFimContrato": "2023-07-31",
    "tipoContratacao": "Semanal",
    "valorPagar": 1200,
    "chavePix": "123.456.789-00",
    "nomeChavePix": "José Silva",
    "qualificacaoTecnica": "Pedreiro especializado",
    "valorVT": 120,
    "valorVA": 200,
    "status": "pagar",
    "semana": 27,
    "ano": 2023
  }')

echo "✅ Pagamento semanal adicionado!"

# 5. Gerar relatório financeiro
echo "📊 5. Gerando relatório financeiro..."
RELATORIO_RESPONSE=$(curl -s -X GET "$BASE_URL/pagamentos/$OBRA_ID/relatorio-financeiro" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Relatório gerado!"
echo "Resumo do relatório:"
echo $RELATORIO_RESPONSE | grep -o '"orcamentoTotal":[^,]*' | cut -d':' -f2
echo $RELATORIO_RESPONSE | grep -o '"totalGasto":[^,]*' | cut -d':' -f2

# 6. Listar pagamentos pendentes
echo "⏰ 6. Listando pagamentos pendentes..."
PENDENTES_RESPONSE=$(curl -s -X GET "$BASE_URL/pagamentos/semanais/pendentes" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Pagamentos pendentes listados!"

# 7. Listar todas as obras
echo "📋 7. Listando todas as obras..."
LISTA_RESPONSE=$(curl -s -X GET "$BASE_URL/pagamentos" \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Obras listadas!"

echo ""
echo "🎉 Todos os testes foram executados com sucesso!"
echo "🗑️ Lembre-se de deletar os dados de teste se necessário:"
echo "   curl -X DELETE \"$BASE_URL/pagamentos/$OBRA_ID\" -H \"Authorization: Bearer $TOKEN\""
