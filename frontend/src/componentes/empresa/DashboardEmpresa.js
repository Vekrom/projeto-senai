"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import api from "../../axiosConfig"
import GerenciarProdutos from "./GerenciarProdutos"
import GerenciarDepositos from "./GerenciarDepositos"
import GerenciarFuncionarios from "./GerenciarFuncionarios"
import RelatoriosEmpresa from "./RelatoriosEmpresa"
import ConfiguracoesEmpresa from "./ConfiguracoesEmpresa"

export default function DashboardEmpresa({ aoDeslogar }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [abaSelecionada, setAbaSelecionada] = useState(() => {
    const params = new URLSearchParams(location.search)
    return params.get("aba") || "produtos"
  })
  const [dadosEmpresa, setDadosEmpresa] = useState({
    empresa_nome: "Carregando...",
    empresa_id: "---",
    usuario: "---",
  })
  const [estatisticas, setEstatisticas] = useState({
    totalProdutos: 0,
    totalDepositos: 0,
    totalFuncionarios: 0,
    produtosEstoqueBaixo: 0,
    produtosVencendo: 0,
  })
  const [mostrarSidebar, setMostrarSidebar] = useState(false)

  useEffect(() => {
    buscarDadosEmpresa()
    buscarEstatisticas()
  }, [])

  useEffect(() => {
    navigate(`/dashboard-empresa?aba=${abaSelecionada}`, { replace: true })
  }, [abaSelecionada, navigate])

  async function buscarDadosEmpresa() {
    try {
      const response = await api.get("/api/empresa/perfil")
      setDadosEmpresa(response.data)
    } catch (error) {
      console.error("Erro ao buscar dados da empresa:", error)

      // Fallback: usar dados do localStorage se disponível
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          setDadosEmpresa({
            empresa_nome: `Empresa ${payload.empresa_id}`,
            empresa_id: payload.empresa_id,
            usuario: payload.usuario,
          })
        } catch (tokenError) {
          console.error("Erro ao decodificar token:", tokenError)
        }
      }
    }
  }

  async function buscarEstatisticas() {
    try {
      console.log("Buscando estatísticas...")
      const promises = []

      // Buscar produtos
      promises.push(api.get("/produtos").catch(() => ({ data: [] })))

      // Buscar depósitos
      promises.push(api.get("/depositos").catch(() => ({ data: [] })))

      // Buscar funcionários
      promises.push(api.get("/api/auth/usuarios").catch(() => ({ data: [] })))

      // Buscar produtos com estoque baixo
      promises.push(api.get("/produtos/estoque-baixo").catch(() => ({ data: [] })))

      // Buscar produtos vencendo
      promises.push(api.get("/produtos/validade-proxima").catch(() => ({ data: [] })))

      const [produtos, depositos, funcionarios, estoqueBaixo, vencendo] = await Promise.all(promises)

      setEstatisticas({
        totalProdutos: produtos.data.length,
        totalDepositos: depositos.data.length,
        totalFuncionarios: funcionarios.data.length,
        produtosEstoqueBaixo: estoqueBaixo.data.length,
        produtosVencendo: vencendo.data.length,
      })
      console.log("Estatísticas atualizadas:", {
        totalProdutos: produtos.data.length,
        totalDepositos: depositos.data.length,
        totalFuncionarios: funcionarios.data.length,
        produtosEstoqueBaixo: estoqueBaixo.data.length,
        produtosVencendo: vencendo.data.length,
      })
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    }
  }

  function handleLogout() {
    aoDeslogar()
    navigate("/login")
  }

  function handleAbaChange(novaAba) {
    setAbaSelecionada(novaAba)
  }

  const abas = [
    { id: "produtos", nome: "Produtos", icone: "📦" },
    { id: "depositos", nome: "Depósitos", icone: "🏪" },
    { id: "funcionarios", nome: "Funcionários", icone: "👥" },
    { id: "relatorios", nome: "Relatórios", icone: "📊" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex">
      {/* Sidebar Vertical à Esquerda */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
        {/* Header do Sidebar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4caf50] to-[#66bb6a] flex items-center justify-center">
              <span className="text-white font-bold text-sm">📦</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Pocket Estoque</h1>
              <p className="text-xs text-gray-500">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* Navegação Vertical */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {abas.map((aba) => (
              <button
                key={aba.id}
                onClick={() => handleAbaChange(aba.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  abaSelecionada === aba.id ? "bg-[#4caf50] text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{aba.icone}</span>
                <span className="font-medium">{aba.nome}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Informações da Empresa */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-[#4caf50] to-[#66bb6a] rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold">PE</span>
            </div>
            <p className="text-xs text-gray-500">Pocket Estoque v2.0</p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col">
        {/* Header Superior */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {abas.find((aba) => aba.id === abaSelecionada)?.nome || "Dashboard"}
              </h2>
              <p className="text-sm text-gray-600">
                Gerencie {abas.find((aba) => aba.id === abaSelecionada)?.nome.toLowerCase()} da sua empresa
              </p>
            </div>
            <button
              onClick={() => setMostrarSidebar(!mostrarSidebar)}
              className="flex items-center space-x-3 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4caf50] to-[#66bb6a] flex items-center justify-center">
                <span className="text-white font-bold text-xs">🏢</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{dadosEmpresa.empresa_nome}</p>
                <p className="text-xs text-gray-500">ID: {dadosEmpresa.empresa_id}</p>
              </div>
              <span className="text-gray-400">▼</span>
            </button>
          </div>
        </header>

        {/* Cards de Estatísticas */}
        <div className="p-6">
          <div className="grid grid-cols-5 gap-4 mb-6 p-2 bg-green-50 rounded-xl border border-green-200">
            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.totalProdutos}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🏪</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Depósitos</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.totalDepositos}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">👥</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Funcionários</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.totalFuncionarios}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-bold text-red-600">{estatisticas.produtosEstoqueBaixo}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Vencendo</p>
              <p className="text-2xl font-bold text-orange-600">{estatisticas.produtosVencendo}</p>
            </div>
          </div>

          {/* Área de Conteúdo Principal */}
          <div className="bg-white/90 rounded-xl shadow-md border border-green-200 p-6">
            {(() => {
              switch (abaSelecionada) {
                case "produtos":
                  return <GerenciarProdutos aoAtualizarEstatisticas={buscarEstatisticas} />
                case "depositos":
                  return <GerenciarDepositos aoAtualizarEstatisticas={buscarEstatisticas} />
                case "funcionarios":
                  return <GerenciarFuncionarios aoAtualizarEstatisticas={buscarEstatisticas} />
                case "relatorios":
                  return <RelatoriosEmpresa estatisticas={estatisticas} />
                case "configuracoes":
                  return <ConfiguracoesEmpresa dadosEmpresa={dadosEmpresa} aoAtualizarDados={buscarDadosEmpresa} />
                default:
                  return <GerenciarProdutos aoAtualizarEstatisticas={buscarEstatisticas} />
              }
            })()}
          </div>
        </div>
      </div>

      {/* Sidebar de Configurações */}
      {mostrarSidebar && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setMostrarSidebar(false)}></div>
          <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Configurações</h3>
                <button onClick={() => setMostrarSidebar(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Empresa</p>
                  <p className="text-lg font-bold text-gray-900">{dadosEmpresa.empresa_nome}</p>
                  <p className="text-sm text-gray-500">ID: {dadosEmpresa.empresa_id}</p>
                </div>

                <button
                  onClick={() => {
                    setAbaSelecionada("configuracoes")
                    setMostrarSidebar(false)
                  }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <span className="text-xl">⚙️</span>
                  <span className="font-medium text-gray-700">Configurações</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 rounded-lg transition-colors duration-200 text-red-600"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium">Sair do Sistema</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
