"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api, { setAuthToken } from "../../axiosConfig"

export default function TelaLogin({ aoLogar }) {
  const navigate = useNavigate()
  const [tipoSelecionado, setTipoSelecionado] = useState("empresa") // "empresa" ou "funcionario"
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)
  const [animando, setAnimando] = useState(false)

  // Função para alternar entre empresa e funcionário com animação
  function alternarTipo(tipo) {
    if (tipo === tipoSelecionado) return

    setAnimando(true)
    setErro("")
    setUsuario("")
    setSenha("")

    // Aguarda a animação de saída antes de trocar o conteúdo
    setTimeout(() => {
      setTipoSelecionado(tipo)
      setAnimando(false)
    }, 150)
  }

  // Função para ir para a tela de cadastro
  function irParaCadastro() {
    if (tipoSelecionado === "empresa") {
      navigate("/cadastro-empresa")
    } else {
      navigate("/cadastro-funcionario")
    }
  }

  // Função para fazer login
  async function handleSubmit(e) {
    e.preventDefault()
    setErro("")
    setCarregando(true)

    try {
      const endpoint = tipoSelecionado === "empresa" ? "/api/auth/login-empresa" : "/api/auth/login-funcionario"

      const response = await api.post(endpoint, {
        usuario,
        senha,
      })

      const { token, tipo } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("tipo", tipo)
      setAuthToken(token)
      aoLogar()

      navigate(tipoSelecionado === "empresa" ? "/dashboard-empresa" : "/dashboard-funcionario")
    } catch (error) {
      console.error("Erro no login:", error)
      setErro(error.response?.data?.erro || "Erro ao fazer login")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#004d40] via-[#00695c] to-[#004d40] p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full border-3 border-[#4caf50] flex items-center justify-center bg-[#004d40]/50 backdrop-blur-sm shadow-lg">
            <h1 className="text-xl font-bold text-[#4caf50] tracking-wider">STOCK</h1>
          </div>
        </div>

        {/* Seletor de Tipo - Tabs Profissionais */}
        <div className="bg-[#003d33]/60 backdrop-blur-lg rounded-t-2xl p-1 border border-[#00796b]/30 border-b-0">
          <div className="flex">
            <button
              onClick={() => alternarTipo("empresa")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                tipoSelecionado === "empresa"
                  ? "bg-[#4caf50] text-white shadow-lg transform scale-105"
                  : "text-[#4caf50] hover:bg-[#00796b]/20"
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <span>🏢</span>
                <span>Empresa</span>
              </span>
            </button>
            <button
              onClick={() => alternarTipo("funcionario")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                tipoSelecionado === "funcionario"
                  ? "bg-[#4caf50] text-white shadow-lg transform scale-105"
                  : "text-[#4caf50] hover:bg-[#00796b]/20"
              }`}
            >
              <span className="flex items-center justify-center space-x-2">
                <span>👨‍💼</span>
                <span>Funcionário</span>
              </span>
            </button>
          </div>
        </div>

        {/* Card de Login com Animação */}
        <div className="bg-[#003d33]/80 backdrop-blur-lg rounded-b-2xl shadow-2xl border border-[#00796b]/30 border-t-0 overflow-hidden">
          <div
            className={`transition-all duration-300 ease-in-out ${
              animando ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"
            }`}
          >
            <div className="p-8">
              {/* Título Dinâmico */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Login {tipoSelecionado === "empresa" ? "Empresa" : "Funcionário"}
                </h2>
                <p className="text-sm text-gray-300">
                  {tipoSelecionado === "empresa"
                    ? "Acesse o painel administrativo da sua empresa"
                    : "Acesse o sistema como funcionário"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl bg-black/20 border border-[#00796b]/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4caf50] focus:border-transparent transition-all duration-200"
                      placeholder="Usuário"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-[#4caf50]">👤</span>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="w-full px-4 py-4 rounded-xl bg-black/20 border border-[#00796b]/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4caf50] focus:border-transparent transition-all duration-200"
                      placeholder="Senha"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <span className="text-[#4caf50]">🔒</span>
                    </div>
                  </div>
                </div>

                {erro && (
                  <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded-xl text-sm animate-pulse">
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={carregando}
                  className="w-full bg-gradient-to-r from-[#4caf50] to-[#66bb6a] hover:from-[#388e3c] hover:to-[#4caf50] text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                >
                  {carregando ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Entrando...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-2">
                      <span>Entrar</span>
                      <span>→</span>
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-6 space-y-3">
                <button
                  onClick={irParaCadastro}
                  className="w-full bg-transparent border-2 border-[#4caf50] text-[#4caf50] font-semibold py-3 px-6 rounded-xl hover:bg-[#4caf50] hover:text-white transition-all duration-300 transform hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>Cadastrar novo usuário</span>
                    <span>+</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador Visual */}
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-2">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                tipoSelecionado === "empresa" ? "bg-[#4caf50]" : "bg-gray-600"
              }`}
            ></div>
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                tipoSelecionado === "funcionario" ? "bg-[#4caf50]" : "bg-gray-600"
              }`}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
