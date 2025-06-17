import axios from "axios"

// Configuração base do axios
const api = axios.create({
  baseURL: "http://localhost:3001", // URL do seu backend
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor para adicionar o token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log(`🚀 Fazendo requisição: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`)
    return config
  },
  (error) => {
    console.error("Erro na requisição:", error)
    return Promise.reject(error)
  },
)

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Resposta recebida: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error(`❌ Erro na resposta: ${error.response?.status} ${error.config?.url}`)

    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem("token")
      localStorage.removeItem("tipo")
      window.location.href = "/login"
    }

    return Promise.reject(error)
  },
)

// Função para definir o token de autenticação
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    localStorage.setItem("token", token)
  } else {
    delete api.defaults.headers.common["Authorization"]
    localStorage.removeItem("token")
  }
}

// Configurar token se já existir no localStorage
const token = localStorage.getItem("token")
if (token) {
  setAuthToken(token)
}

export default api
