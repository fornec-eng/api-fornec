// scripts/associar-obras-antigas.js
const mongoose = require("mongoose")
require("dotenv").config()

// Importar os models
const User = require("../models/users")
const Obra = require("../models/obra")

// Conectar ao banco
const conectarBanco = async () => {
  try {
    const DB_PASS = process.env.DB_PASS
    const DB_HOST = process.env.DB_HOST
    const DB_USER = process.env.DB_USER
    const DB_NAME = process.env.DB_NAME

    await mongoose.connect(
      `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }
    )
    console.log("✅ Conectado ao banco de dados!")
  } catch (error) {
    console.error("❌ Erro ao conectar ao banco:", error)
    process.exit(1)
  }
}

// Função principal para associar obras
const associarObrasAntigas = async () => {
  try {
    console.log("🔄 Iniciando processo de associação de obras antigas...\n")

    // Buscar todas as obras
    const obras = await Obra.find({})
    console.log(`📋 Encontradas ${obras.length} obras no banco\n`)

    // Buscar todos os usuários Admin
    const admins = await User.find({ role: "Admin" })
    console.log(`👥 Encontrados ${admins.length} usuários Admin\n`)

    if (admins.length === 0) {
      console.log("❌ Nenhum usuário Admin encontrado!")
      return
    }

    // Opção 1: Associar todas as obras ao primeiro Admin encontrado
    const adminPrincipal = admins[0]
    console.log(`🎯 Associando todas as obras ao Admin: ${adminPrincipal.nome} (${adminPrincipal.email})`)

    // IDs de todas as obras
    const idsObras = obras.map(obra => obra._id)

    // Atualizar o usuário Admin com todas as obras
    await User.findByIdAndUpdate(adminPrincipal._id, {
      $set: { obrasPermitidas: idsObras }
    })

    console.log(`✅ ${idsObras.length} obras associadas ao usuário ${adminPrincipal.nome}!`)

    // Verificação
    const usuarioAtualizado = await User.findById(adminPrincipal._id)
    console.log(`🔍 Verificação: usuário agora tem ${usuarioAtualizado.obrasPermitidas.length} obras permitidas`)

    // Mostrar detalhes das obras associadas
    console.log("\n📝 Obras associadas:")
    for (let i = 0; i < obras.length; i++) {
      const obra = obras[i]
      console.log(`   ${i + 1}. ${obra.nome} (ID: ${obra._id})`)
    }

  } catch (error) {
    console.error("❌ Erro durante a associação:", error)
  }
}

// Função alternativa: associar obras aos seus criadores
const associarObrasAosCriadores = async () => {
  try {
    console.log("🔄 Associando obras aos seus criadores...\n")

    const obras = await Obra.find({}).populate('criadoPor')
    
    // Agrupar obras por criador
    const obrasPorCriador = {}
    
    for (const obra of obras) {
      if (obra.criadoPor) {
        const criadorId = obra.criadoPor._id.toString()
        if (!obrasPorCriador[criadorId]) {
          obrasPorCriador[criadorId] = {
            usuario: obra.criadoPor,
            obras: []
          }
        }
        obrasPorCriador[criadorId].obras.push(obra._id)
      }
    }

    // Atualizar cada usuário com suas obras
    for (const [criadorId, dados] of Object.entries(obrasPorCriador)) {
      await User.findByIdAndUpdate(criadorId, {
        $set: { obrasPermitidas: dados.obras }
      })
      
      console.log(`✅ ${dados.obras.length} obras associadas ao usuário ${dados.usuario.nome}`)
    }

    console.log("\n🎉 Associação por criadores concluída!")

  } catch (error) {
    console.error("❌ Erro durante a associação por criadores:", error)
  }
}

// Função para associar todas as obras a todos os Admins
const associarObrasATodosAdmins = async () => {
  try {
    console.log("🔄 Associando todas as obras a todos os Admins...\n")

    const obras = await Obra.find({})
    const admins = await User.find({ role: "Admin" })
    
    const idsObras = obras.map(obra => obra._id)

    for (const admin of admins) {
      await User.findByIdAndUpdate(admin._id, {
        $set: { obrasPermitidas: idsObras }
      })
      console.log(`✅ ${idsObras.length} obras associadas ao Admin ${admin.nome}`)
    }

    console.log("\n🎉 Todas as obras foram associadas a todos os Admins!")

  } catch (error) {
    console.error("❌ Erro durante a associação:", error)
  }
}

// Menu interativo
const executarScript = async () => {
  await conectarBanco()

  console.log("🚀 SCRIPT DE ASSOCIAÇÃO DE OBRAS ANTIGAS")
  console.log("=====================================\n")
  console.log("Escolha uma opção:")
  console.log("1 - Associar todas as obras ao primeiro Admin")
  console.log("2 - Associar obras aos seus criadores originais")
  console.log("3 - Associar todas as obras a todos os Admins")
  console.log("")

  // Para executar, descomente uma das opções abaixo:
  
  // OPÇÃO 1: Todas as obras para o primeiro Admin
  await associarObrasAntigas()
  
  // OPÇÃO 2: Obras para seus criadores (descomente para usar)
  // await associarObrasAosCriadores()
  
  // OPÇÃO 3: Todas as obras para todos os Admins (descomente para usar)
  // await associarObrasATodosAdmins()

  console.log("\n🏁 Processo finalizado!")
  process.exit(0)
}

// Executar o script
if (require.main === module) {
  executarScript()
}

module.exports = {
  associarObrasAntigas,
  associarObrasAosCriadores,
  associarObrasATodosAdmins
}