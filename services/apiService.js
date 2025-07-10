// Arquivo de referência para o frontend - apiService.js
// Este arquivo mostra como o frontend deve fazer as chamadas para a API

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000"

class ApiService {
  constructor() {
    this.token = localStorage.getItem("auth_token")
  }

  // Configurar headers padrão
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  // Método genérico para fazer requisições
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: this.getHeaders(),
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`Erro na requisição para ${endpoint}:`, error)
      throw error
    }
  }

  // ==================== AUTENTICAÇÃO ====================
  async login(email, senha) {
    return this.request("/login", {
      method: "POST",
      body: JSON.stringify({ data: { email, senha } }),
    })
  }

  setToken(token) {
    this.token = token
    localStorage.setItem("auth_token", token)
  }

  // ==================== OBRAS ====================
  obras = {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString()
      return this.request(`/obras${queryString ? `?${queryString}` : ""}`)
    },

    getById: (id) => this.request(`/obras/${id}`),

    create: (data) =>
      this.request("/obras", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      this.request(`/obras/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id) =>
      this.request(`/obras/${id}`, {
        method: "DELETE",
      }),
  }

  // ==================== MATERIAIS ====================
  materiais = {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString()
      return this.request(`/materiais${queryString ? `?${queryString}` : ""}`)
    },

    getById: (id) => this.request(`/materiais/${id}`),

    create: (data) =>
      this.request("/materiais", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      this.request(`/materiais/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id) =>
      this.request(`/materiais/${id}`, {
        method: "DELETE",
      }),
  }

  // ==================== MÃO DE OBRA ====================
  maoObra = {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString()
      return this.request(`/mao-obra${queryString ? `?${queryString}` : ""}`)
    },

    getById: (id) => this.request(`/mao-obra/${id}`),

    create: (data) =>
      this.request("/mao-obra", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      this.request(`/mao-obra/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id) =>
      this.request(`/mao-obra/${id}`, {
        method: "DELETE",
      }),
  }

  // ==================== EQUIPAMENTOS ====================
  equipamentos = {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString()
      return this.request(`/equipamentos${queryString ? `?${queryString}` : ""}`)
    },

    getById: (id) => this.request(`/equipamentos/${id}`),

    create: (data) =>
      this.request("/equipamentos", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      this.request(`/equipamentos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id) =>
      this.request(`/equipamentos/${id}`, {
        method: "DELETE",
      }),
  }

  // ==================== CONTRATOS ====================
  contratos = {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString()
      return this.request(`/contratos${queryString ? `?${queryString}` : ""}`)
    },

    getById: (id) => this.request(`/contratos/${id}`),

    create: (data) =>
      this.request("/contratos", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      this.request(`/contratos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id) =>
      this.request(`/contratos/${id}`, {
        method: "DELETE",
      }),
  }

  // ==================== OUTROS GASTOS ====================
  outrosGastos = {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString()
      return this.request(`/outros-gastos${queryString ? `?${queryString}` : ""}`)
    },

    getById: (id) => this.request(`/outros-gastos/${id}`),

    create: (data) =>
      this.request("/outros-gastos", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      this.request(`/outros-gastos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id) =>
      this.request(`/outros-gastos/${id}`, {
        method: "DELETE",
      }),
  }

  // ==================== CRONOGRAMA ====================
  cronograma = {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString()
      return this.request(`/cronograma${queryString ? `?${queryString}` : ""}`)
    },

    getById: (id) => this.request(`/cronograma/${id}`),

    getByObra: (obraId) => this.request(`/cronograma/obra/${obraId}`),

    create: (data) =>
      this.request("/cronograma", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      this.request(`/cronograma/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id) =>
      this.request(`/cronograma/${id}`, {
        method: "DELETE",
      }),
  }

  // ==================== PAGAMENTOS SEMANAIS ====================
  // Método principal usado pelo frontend para buscar todos os pagamentos
  async buscarTodosPagamentosSemanais() {
    return this.request("/pagamentos/semanais")
  }

  // Buscar gastos futuros
  async buscarGastosFuturos() {
    return this.request("/pagamentos/futuros")
  }

  // Marcar pagamento como efetuado
  async marcarPagamentoEfetuado(obraId, pagamentoId) {
    if (obraId && pagamentoId) {
      return this.request(`/pagamentos/${obraId}/${pagamentoId}/efetuado`, {
        method: "PUT",
      })
    } else if (pagamentoId) {
      return this.request(`/pagamentos/${pagamentoId}/efetuado`, {
        method: "PUT",
      })
    } else {
      throw new Error("ID do pagamento é obrigatório")
    }
  }

  // ==================== PAGAMENTOS (SISTEMA NOVO) ====================
  pagamentos = {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString()
      return this.request(`/pagamentos${queryString ? `?${queryString}` : ""}`)
    },

    getById: (id) => this.request(`/pagamentos/${id}`),

    create: (data) =>
      this.request("/pagamentos", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id, data) =>
      this.request(`/pagamentos/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id) =>
      this.request(`/pagamentos/${id}`, {
        method: "DELETE",
      }),

    // Operações específicas
    associarObra: (id, obraId) =>
      this.request(`/pagamentos/${id}/associar-obra`, {
        method: "PUT",
        body: JSON.stringify({ obraId }),
      }),

    marcarEfetuado: (id) =>
      this.request(`/pagamentos/${id}/efetuado`, {
        method: "PUT",
      }),

    atualizarStatus: (id, status) =>
      this.request(`/pagamentos/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ statusPagamento: status }),
      }),
  }

  // ==================== GOOGLE SHEETS ====================
  googleSheets = {
    listFolders: () => this.request("/google/drive/folders"),

    listFiles: (folderId) => this.request(`/google/drive/${folderId}`),

    createSpreadsheet: (title) =>
      this.request("/google/sheets/create", {
        method: "POST",
        body: JSON.stringify({ title }),
      }),

    copySpreadsheet: (templateId, newTitle, folderId) =>
      this.request("/google/sheets/copy", {
        method: "POST",
        body: JSON.stringify({
          data: { templateId, newTitle, folderId },
        }),
      }),

    getSpreadsheetData: (spreadsheetId, range) =>
      this.request("/google/sheets/data", {
        method: "POST",
        body: JSON.stringify({
          data: { spreadsheetId, range },
        }),
      }),

    updateSpreadsheetData: (spreadsheetId, range, values) =>
      this.request("/google/sheets/update", {
        method: "PUT",
        body: JSON.stringify({ spreadsheetId, range, values }),
      }),

    addSheet: (spreadsheetId, newSheetTitle) =>
      this.request("/google/sheets/add-sheet", {
        method: "POST",
        body: JSON.stringify({ spreadsheetId, newSheetTitle }),
      }),

    renameSheet: (spreadsheetId, sheetId, newTitle) =>
      this.request("/google/sheets/rename-sheet", {
        method: "POST",
        body: JSON.stringify({ spreadsheetId, sheetId, newTitle }),
      }),
  }
}

// Exportar uma instância única
const apiService = new ApiService()
export default apiService
