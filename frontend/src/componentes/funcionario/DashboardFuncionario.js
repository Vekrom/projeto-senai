"use client"

import { useState, useEffect } from "react"
import api from "../../axiosConfig"
import ListaProdutosFuncionario from "./ListaProdutosFuncionario"
import RelatoriosFuncionario from "./RelatoriosFuncionario"

export default function DashboardFuncionario({ aoDeslogar }) {
  const [abaSelecionada, setAbaSelecionada] = useState("produtos")
  const [estatisticas, setEstatisticas] = useState({
    totalProdutos: 0,
    totalDepositos: 0,
    produtosBaixoEstoque: 0,
    produtosVencendo: 0,
  })

  // Buscar estatísticas do funcionário
  useEffect(() => {
    buscarEstatisticas()
  }, [])

  async function buscarEstatisticas() {
    try {
      console.log("Buscando estatísticas do funcionário...")
      const response = await api.get("/api/produtos/estatisticas")
      setEstatisticas(response.data)
      console.log("Estatísticas atualizadas:", response.data)
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
    }
  }

  function renderConteudo() {
    switch (abaSelecionada) {
      case "produtos":
        return <ListaProdutosFuncionario />
      case "relatorios":
        return <RelatoriosFuncionario />
      default:
        return <ListaProdutosFuncionario />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo e Título */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">📦</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pocket Estoque</h1>
              <p className="text-sm text-gray-500">Sistema de Gestão</p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">funcionário</div>
            <button onClick={aoDeslogar} className="text-gray-600 hover:text-gray-900 font-medium">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setAbaSelecionada("produtos")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                abaSelecionada === "produtos" ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">📦</span>
              <span>Produtos</span>
            </button>

            <button
              onClick={() => setAbaSelecionada("relatorios")}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                abaSelecionada === "relatorios" ? "bg-green-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">📊</span>
              <span>Relatórios</span>
            </button>
          </nav>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          {/* Header da Seção */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {abaSelecionada === "produtos" ? "Produtos" : "Relatórios"}
            </h2>
            <p className="text-gray-600">
              {abaSelecionada === "produtos" ? "Gerencie produtos da sua empresa" : "Visualize relatórios da empresa"}
            </p>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📦</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Produtos</p>
              <p className="text-3xl font-bold text-gray-900">{estatisticas.totalProdutos}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏪</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Depósitos</p>
              <p className="text-3xl font-bold text-gray-900">{estatisticas.totalDepositos}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-3xl font-bold text-red-600">{estatisticas.produtosBaixoEstoque}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-sm font-medium text-gray-600">Vencendo</p>
              <p className="text-3xl font-bold text-orange-600">{estatisticas.produtosVencendo}</p>
            </div>
          </div>

          {/* Conteúdo da Aba Selecionada */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">{renderConteudo()}</div>
        </main>
      </div>
    </div>
  )
}
