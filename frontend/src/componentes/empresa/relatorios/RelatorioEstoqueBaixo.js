"use client"

import { useState, useEffect } from "react"
import api from "../../axiosConfig"

export default function RelatorioEstoqueBaixo() {
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [filtro, setFiltro] = useState("")

  useEffect(() => {
    buscarProdutos()
  }, [])

  async function buscarProdutos() {
    setCarregando(true)
    try {
      const response = await api.get("/produtos/estoque-baixo")
      setProdutos(response.data)
    } catch (error) {
      console.error("Erro ao buscar produtos com estoque baixo:", error)
    } finally {
      setCarregando(false)
    }
  }

  function exportarCSV() {
    if (produtos.length === 0) {
      alert("Não há dados para exportar")
      return
    }

    const headers = ["Produto", "Depósito", "Quantidade Atual", "Estoque Mínimo", "Diferença"]
    const csvData = produtos.map((produto) => [
      produto.nome,
      produto.deposito_nome,
      produto.quantidade,
      produto.estoque_min,
      produto.estoque_min - produto.quantidade,
    ])

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-estoque-baixo-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const produtosFiltrados = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      produto.deposito_nome.toLowerCase().includes(filtro.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Produtos com Estoque Baixo</h3>
          <p className="text-gray-600">Produtos que estão abaixo do estoque mínimo configurado</p>
        </div>
        <button
          onClick={exportarCSV}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <span>📊</span>
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filtro */}
      <div className="max-w-md">
        <input
          type="text"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar produto ou depósito..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Tabela */}
      {carregando ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <p className="mt-2 text-gray-600">Carregando relatório...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                    Depósito
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                    Quantidade Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                    Estoque Mínimo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                    Diferença
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {produtosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {filtro ? "Nenhum produto encontrado com esse filtro" : "Nenhum produto com estoque baixo"}
                    </td>
                  </tr>
                ) : (
                  produtosFiltrados.map((produto, index) => {
                    const diferenca = produto.estoque_min - produto.quantidade
                    const criticidade = diferenca > produto.quantidade ? "Crítico" : "Baixo"

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {produto.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.deposito_nome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                          {produto.quantidade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.estoque_min}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">-{diferenca}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              criticidade === "Crítico" ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {criticidade}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumo */}
      {produtosFiltrados.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-red-800 mb-2">Resumo</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-red-700">Total de produtos:</span>
              <span className="ml-2 text-red-900">{produtosFiltrados.length}</span>
            </div>
            <div>
              <span className="font-medium text-red-700">Produtos críticos:</span>
              <span className="ml-2 text-red-900">
                {produtosFiltrados.filter((p) => p.estoque_min - p.quantidade > p.quantidade).length}
              </span>
            </div>
            <div>
              <span className="font-medium text-red-700">Reposição necessária:</span>
              <span className="ml-2 text-red-900">
                {produtosFiltrados.reduce((acc, p) => acc + (p.estoque_min - p.quantidade), 0)} unidades
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
