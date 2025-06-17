"use client"

import { useState, useEffect } from "react"
import api from "../../axiosConfig"

export default function RelatorioValidade() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [filtro, setFiltro] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")

  useEffect(() => {
    buscarProdutos()
  }, [])

  async function buscarProdutos() {
    setCarregando(true)
    try {
      const response = await api.get("/produtos/validade-proxima")
      setProdutos(response.data)
    } catch (error) {
      console.error("Erro ao buscar produtos com validade próxima:", error)
    } finally {
      setCarregando(false)
    }
  }

  function exportarCSV() {
    if (produtos.length === 0) {
      alert("Não há dados para exportar")
      return
    }

    const headers = ["Produto", "Depósito", "Quantidade", "Validade", "Dias Restantes", "Status"]
    const csvData = produtos.map((produto) => [
      produto.nome,
      produto.deposito_nome,
      produto.quantidade,
      new Date(produto.validade).toLocaleDateString("pt-BR"),
      produto.dias_restantes,
      getStatusText(produto.dias_restantes),
    ])

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-validade-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  function getStatusText(diasRestantes) {
    if (diasRestantes <= 0) return "Vencido"
    if (diasRestantes <= 7) return "Crítico"
    if (diasRestantes <= 30) return "Atenção"
    return "Próximo"
  }

  function getStatusColor(diasRestantes) {
    if (diasRestantes <= 0) return "bg-red-100 text-red-800"
    if (diasRestantes <= 7) return "bg-red-100 text-red-800"
    if (diasRestantes <= 30) return "bg-orange-100 text-orange-800"
    return "bg-yellow-100 text-yellow-800"
  }

  const produtosFiltrados = produtos.filter((produto) => {
    const matchNome =
      produto.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      produto.deposito_nome.toLowerCase().includes(filtro.toLowerCase())

    if (filtroStatus === "todos") return matchNome

    const status = getStatusText(produto.dias_restantes).toLowerCase()
    return matchNome && status === filtroStatus
  })

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Produtos com Validade Próxima</h3>
          <p className="text-gray-600">Produtos próximos do vencimento ou já vencidos</p>
        </div>
        <button
          onClick={exportarCSV}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <span>📊</span>
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar produto:</label>
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar produto ou depósito..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por status:</label>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="todos">Todos</option>
            <option value="vencido">Vencidos</option>
            <option value="crítico">Críticos (≤ 7 dias)</option>
            <option value="atenção">Atenção (≤ 30 dias)</option>
            <option value="próximo">Próximos {'>'} 30 dias</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      {carregando ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="mt-2 text-gray-600">Carregando relatório...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                    Depósito
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                    Validade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                    Dias Restantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-800 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {filtro || filtroStatus !== "todos"
                        ? "Nenhum produto encontrado com esses filtros"
                        : "Nenhum produto com validade próxima"}
                    </td>
                  </tr>
                ) : (
                  produtosFiltrados.map((produto, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{produto.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.deposito_nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.quantidade}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(produto.validade).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`font-semibold ${
                            produto.dias_restantes <= 0
                              ? "text-red-600"
                              : produto.dias_restantes <= 7
                                ? "text-red-600"
                                : produto.dias_restantes <= 30
                                  ? "text-orange-600"
                                  : "text-yellow-600"
                          }`}
                        >
                          {produto.dias_restantes <= 0 ? "Vencido" : `${produto.dias_restantes} dias`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(produto.dias_restantes)}`}
                        >
                          {getStatusText(produto.dias_restantes)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumo */}
      {produtosFiltrados.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-orange-800 mb-2">Resumo</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-orange-700">Total:</span>
              <span className="ml-2 text-orange-900">{produtosFiltrados.length}</span>
            </div>
            <div>
              <span className="font-medium text-red-700">Vencidos:</span>
              <span className="ml-2 text-red-900">{produtosFiltrados.filter((p) => p.dias_restantes <= 0).length}</span>
            </div>
            <div>
              <span className="font-medium text-red-700">Críticos:</span>
              <span className="ml-2 text-red-900">
                {produtosFiltrados.filter((p) => p.dias_restantes > 0 && p.dias_restantes <= 7).length}
              </span>
            </div>
            <div>
              <span className="font-medium text-orange-700">Atenção:</span>
              <span className="ml-2 text-orange-900">
                {produtosFiltrados.filter((p) => p.dias_restantes > 7 && p.dias_restantes <= 30).length}
              </span>
            </div>
            <div>
              <span className="font-medium text-orange-700">Próximos:</span>
              <span className="ml-2 text-orange-900">
                {produtosFiltrados.filter((p) => p.dias_restantes > 30).length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
