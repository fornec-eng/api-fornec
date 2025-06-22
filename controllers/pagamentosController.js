const Pagamento = require("../models/pagamentos")

class PagamentosController {
  // ==================== OPERAÇÕES GERAIS ====================

  /**
   * Listar todos os pagamentos (obras) com paginação
   */
  async list(req, res) {
    try {
      const limit = Number.parseInt(req.query.limit) || 10
      const page = Number.parseInt(req.query.page) || 1
      const skip = (page - 1) * limit

      const pagamentos = await Pagamento.find({}).limit(limit).skip(skip).sort({ createdAt: -1 })

      const total = await Pagamento.countDocuments()

      return res.json({
        error: false,
        pagamentos,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
        },
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao listar pagamentos",
        details: error.message,
      })
    }
  }

  /**
   * Buscar um pagamento específico pelo ID
   */
  async listOne(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      return res.json({ error: false, pagamento })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao buscar pagamento",
        details: error.message,
      })
    }
  }

  /**
   * Criar um novo pagamento (obra)
   */
  async create(req, res) {
    try {
      const { obra, gastos, contratos, cronograma, pagamentosSemanais } = req.body

      const novoPagamento = await Pagamento.create({
        obra,
        gastos: gastos || [],
        contratos: contratos || [],
        cronograma: cronograma || [],
        pagamentosSemanais: pagamentosSemanais || [],
      })

      return res.status(201).json({
        error: false,
        message: "Pagamento criado com sucesso!",
        pagamento: novoPagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao criar pagamento",
        details: error.message,
      })
    }
  }

  /**
   * Atualizar informações da obra
   */
  async updateObra(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      // Atualizar dados da obra
      Object.assign(pagamento.obra, req.body)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Obra atualizada com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao atualizar obra",
        details: error.message,
      })
    }
  }

  /**
   * Deletar um pagamento
   */
  async delete(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      await Pagamento.deleteOne({ _id: req.params.id })

      return res.json({
        error: false,
        message: "Pagamento deletado com sucesso!",
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao deletar pagamento",
        details: error.message,
      })
    }
  }

  // ==================== GASTOS ====================

  /**
   * Adicionar gasto a uma obra
   */
  async addGasto(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      pagamento.gastos.push(req.body)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Gasto adicionado com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao adicionar gasto",
        details: error.message,
      })
    }
  }

  /**
   * Atualizar um gasto específico
   */
  async updateGasto(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      const gasto = pagamento.gastos.id(req.params.gastoId)
      if (!gasto) {
        return res.status(404).json({
          error: true,
          message: "Gasto não encontrado!",
        })
      }

      Object.assign(gasto, req.body)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Gasto atualizado com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao atualizar gasto",
        details: error.message,
      })
    }
  }

  /**
   * Remover um gasto
   */
  async removeGasto(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      pagamento.gastos.pull(req.params.gastoId)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Gasto removido com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao remover gasto",
        details: error.message,
      })
    }
  }

  // ==================== CONTRATOS ====================

  /**
   * Adicionar contrato a uma obra
   */
  async addContrato(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      pagamento.contratos.push(req.body)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Contrato adicionado com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao adicionar contrato",
        details: error.message,
      })
    }
  }

  /**
   * Atualizar um contrato específico
   */
  async updateContrato(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      const contrato = pagamento.contratos.id(req.params.contratoId)
      if (!contrato) {
        return res.status(404).json({
          error: true,
          message: "Contrato não encontrado!",
        })
      }

      Object.assign(contrato, req.body)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Contrato atualizado com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao atualizar contrato",
        details: error.message,
      })
    }
  }

  /**
   * Remover um contrato
   */
  async removeContrato(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      pagamento.contratos.pull(req.params.contratoId)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Contrato removido com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao remover contrato",
        details: error.message,
      })
    }
  }

  // ==================== CRONOGRAMA ====================

  /**
   * Adicionar etapa ao cronograma
   */
  async addEtapaCronograma(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      pagamento.cronograma.push(req.body)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Etapa adicionada ao cronograma com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao adicionar etapa ao cronograma",
        details: error.message,
      })
    }
  }

  /**
   * Atualizar uma etapa do cronograma
   */
  async updateEtapaCronograma(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      const etapa = pagamento.cronograma.id(req.params.etapaId)
      if (!etapa) {
        return res.status(404).json({
          error: true,
          message: "Etapa não encontrada!",
        })
      }

      Object.assign(etapa, req.body)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Etapa do cronograma atualizada com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao atualizar etapa do cronograma",
        details: error.message,
      })
    }
  }

  /**
   * Remover uma etapa do cronograma
   */
  async removeEtapaCronograma(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      pagamento.cronograma.pull(req.params.etapaId)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Etapa removida do cronograma com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao remover etapa do cronograma",
        details: error.message,
      })
    }
  }

  // ==================== PAGAMENTOS SEMANAIS ====================

  /**
   * Adicionar pagamento semanal
   */
  async addPagamentoSemanal(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      pagamento.pagamentosSemanais.push(req.body)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Pagamento semanal adicionado com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao adicionar pagamento semanal",
        details: error.message,
      })
    }
  }

  /**
   * Atualizar um pagamento semanal específico
   */
  async updatePagamentoSemanal(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      const pagamentoSemanal = pagamento.pagamentosSemanais.id(req.params.pagamentoSemanalId)
      if (!pagamentoSemanal) {
        return res.status(404).json({
          error: true,
          message: "Pagamento semanal não encontrado!",
        })
      }

      Object.assign(pagamentoSemanal, req.body)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Pagamento semanal atualizado com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao atualizar pagamento semanal",
        details: error.message,
      })
    }
  }

  /**
   * Remover um pagamento semanal
   */
  async removePagamentoSemanal(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      pagamento.pagamentosSemanais.pull(req.params.pagamentoSemanalId)
      await pagamento.save()

      return res.json({
        error: false,
        message: "Pagamento semanal removido com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao remover pagamento semanal",
        details: error.message,
      })
    }
  }

  /**
   * Marcar pagamento semanal como efetuado
   */
  async marcarPagamentoEfetuado(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      const pagamentoSemanal = pagamento.pagamentosSemanais.id(req.params.pagamentoSemanalId)
      if (!pagamentoSemanal) {
        return res.status(404).json({
          error: true,
          message: "Pagamento semanal não encontrado!",
        })
      }

      pagamentoSemanal.status = "pagamento efetuado"
      await pagamento.save()

      return res.json({
        error: false,
        message: "Pagamento marcado como efetuado com sucesso!",
        pagamento,
      })
    } catch (error) {
      return res.status(400).json({
        error: true,
        message: "Erro ao marcar pagamento como efetuado",
        details: error.message,
      })
    }
  }

  /**
   * Listar pagamentos semanais pendentes
   */
  async listarPagamentosPendentes(req, res) {
    try {
      const pagamentos = await Pagamento.find({
        "pagamentosSemanais.status": "pagar",
      })

      const pagamentosPendentes = []

      pagamentos.forEach((pagamento) => {
        const pendentes = pagamento.pagamentosSemanais.filter((ps) => ps.status === "pagar")
        pendentes.forEach((pendente) => {
          pagamentosPendentes.push({
            obraId: pagamento._id,
            obraNome: pagamento.obra.nome,
            pagamentoSemanal: pendente,
          })
        })
      })

      return res.json({
        error: false,
        pagamentosPendentes,
        total: pagamentosPendentes.length,
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao listar pagamentos pendentes",
        details: error.message,
      })
    }
  }

  // ==================== RELATÓRIOS ====================

  /**
   * Gerar relatório financeiro de uma obra
   */
  async relatorioFinanceiro(req, res) {
    try {
      const pagamento = await Pagamento.findById(req.params.id)

      if (!pagamento) {
        return res.status(404).json({
          error: true,
          message: "Pagamento não encontrado!",
        })
      }

      const totalGastos = pagamento.gastos.reduce((acc, gasto) => acc + gasto.valor, 0)
      const totalContratos = pagamento.contratos.reduce((acc, contrato) => acc + contrato.valorTotal, 0)
      const totalPagamentosSemanais = pagamento.pagamentosSemanais.reduce((acc, ps) => acc + ps.totalReceber, 0)
      const pagamentosEfetuados = pagamento.pagamentosSemanais
        .filter((ps) => ps.status === "pagamento efetuado")
        .reduce((acc, ps) => acc + ps.totalReceber, 0)
      const pagamentosPendentes = pagamento.pagamentosSemanais
        .filter((ps) => ps.status === "pagar")
        .reduce((acc, ps) => acc + ps.totalReceber, 0)

      const relatorio = {
        obra: pagamento.obra,
        resumoFinanceiro: {
          orcamentoTotal: pagamento.obra.orcamento,
          totalGasto: pagamento.valorTotalGasto,
          saldoRestante: pagamento.saldoRestante,
          statusOrcamento: pagamento.statusOrcamento,
          percentualGasto: ((pagamento.valorTotalGasto / pagamento.obra.orcamento) * 100).toFixed(2),
        },
        detalhamentoGastos: {
          materiais: {
            total: totalGastos,
            quantidade: pagamento.gastos.length,
          },
          contratos: {
            total: totalContratos,
            quantidade: pagamento.contratos.length,
          },
          pagamentosSemanais: {
            total: totalPagamentosSemanais,
            efetuados: pagamentosEfetuados,
            pendentes: pagamentosPendentes,
            quantidade: pagamento.pagamentosSemanais.length,
          },
        },
        cronograma: {
          totalEtapas: pagamento.cronograma.length,
          concluidas: pagamento.cronograma.filter((e) => e.status === "concluida").length,
          emAndamento: pagamento.cronograma.filter((e) => e.status === "em andamento").length,
          previstas: pagamento.cronograma.filter((e) => e.status === "previsto").length,
          percentualConcluido: pagamento.percentualConcluido,
        },
        diasRestantes: pagamento.diasRestantes,
      }

      return res.json({
        error: false,
        relatorio,
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao gerar relatório financeiro",
        details: error.message,
      })
    }
  }

  /**
   * Relatório de pagamentos semanais por período
   */
  async relatorioPagamentosSemanais(req, res) {
    try {
      const { semana, ano, status } = req.query

      const filtro = {}
      if (semana) filtro["pagamentosSemanais.semana"] = Number.parseInt(semana)
      if (ano) filtro["pagamentosSemanais.ano"] = Number.parseInt(ano)
      if (status) filtro["pagamentosSemanais.status"] = status

      const pagamentos = await Pagamento.find(filtro)

      const relatorio = []

      pagamentos.forEach((pagamento) => {
        let pagamentosSemanaisFiltrados = pagamento.pagamentosSemanais

        if (semana) {
          pagamentosSemanaisFiltrados = pagamentosSemanaisFiltrados.filter(
            (ps) => ps.semana === Number.parseInt(semana),
          )
        }
        if (ano) {
          pagamentosSemanaisFiltrados = pagamentosSemanaisFiltrados.filter((ps) => ps.ano === Number.parseInt(ano))
        }
        if (status) {
          pagamentosSemanaisFiltrados = pagamentosSemanaisFiltrados.filter((ps) => ps.status === status)
        }

        pagamentosSemanaisFiltrados.forEach((ps) => {
          relatorio.push({
            obraId: pagamento._id,
            obraNome: pagamento.obra.nome,
            pagamentoSemanal: ps,
          })
        })
      })

      const totalValor = relatorio.reduce((acc, item) => acc + item.pagamentoSemanal.totalReceber, 0)

      return res.json({
        error: false,
        relatorio,
        resumo: {
          totalPagamentos: relatorio.length,
          valorTotal: totalValor,
          filtros: { semana, ano, status },
        },
      })
    } catch (error) {
      return res.status(500).json({
        error: true,
        message: "Erro ao gerar relatório de pagamentos semanais",
        details: error.message,
      })
    }
  }
}

module.exports = new PagamentosController()
