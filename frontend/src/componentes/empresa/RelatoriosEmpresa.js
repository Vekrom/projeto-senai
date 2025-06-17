"use client"

import { useState, useEffect } from "react"
import api from "../../axiosConfig"

export default function RelatoriosEmpresa({ estatisticas }) {
  const [abaAtiva, setAbaAtiva] = useState("resumo")
  const [produtosEstoqueBaixo, setProdutosEstoqueBaixo] = useState([])
  const [produtosVencendo, setProdutosVencendo] = useState([])
  const [carregandoEstoqueBaixo, setCarregandoEstoqueBaixo] = useState(false)
  const [carregandoVencendo, setCarregandoVencendo] = useState(false)

  useEffect(() => {
    if (abaAtiva === "resumo") {
      buscarProdutosEstoqueBaixo()
      buscarProdutosVencendo()
    }
  }, [abaAtiva])

  async function buscarProdutosEstoqueBaixo() {
    setCarregandoEstoqueBaixo(true)
    try {
      const response = await api.get("/produtos/estoque-baixo")
      setProdutosEstoqueBaixo(response.data)
    } catch (error) {
      console.error("Erro ao buscar produtos com estoque baixo:", error)
    } finally {
      setCarregandoEstoqueBaixo(false)
    }
  }

  async function buscarProdutosVencendo() {
    setCarregandoVencendo(true)
    try {
      const response = await api.get("/produtos/validade-proxima")
      setProdutosVencendo(response.data)
    } catch (error) {
      console.error("Erro ao buscar produtos vencendo:", error)
    } finally {
      setCarregandoVencendo(false)
    }
  }

  function exportarRelatorio(tipo) {
    let dados = []
    let nomeArquivo = ""

    if (tipo === "estoque-baixo") {
      dados = produtosEstoqueBaixo
      nomeArquivo = "relatorio-estoque-baixo.csv"
    } else if (tipo === "vencendo") {
      dados = produtosVencendo
      nomeArquivo = "relatorio-produtos-vencendo.csv"
    }

    if (dados.length === 0) {
      alert("Não há dados para exportar")
      return
    }

    // Criar CSV
    const headers = Object.keys(dados[0]).join(",")
    const csv = [headers, ...dados.map((item) => Object.values(item).join(","))].join("\n")

    // Download
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = nomeArquivo
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const abas = [
    { id: "resumo", nome: "Resumo Geral", icone: "📊" },
    { id: "estoque-baixo", nome: "Estoque Baixo", icone: "⚠️" },
    { id: "validade", nome: "Validade", icone: "📅" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
        <div className="text-sm text-gray-600">Última atualização: {new Date().toLocaleString("pt-BR")}</div>
      </div>

      {/* Navegação das Abas de Relatórios */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {abas.map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  abaAtiva === aba.id
                    ? "border-[#4caf50] text-[#4caf50]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>{aba.icone}</span>
                  <span>{aba.nome}</span>
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        <div className="p-6">
          {/* Aba Resumo Geral */}
          {abaAtiva === "resumo" && (
            <div className="space-y-6">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800">Total de Produtos</h3>
                  <p className="text-3xl font-bold text-blue-600">{estatisticas.totalProdutos}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800">Total de Depósitos</h3>
                  <p className="text-3xl font-bold text-green-600">{estatisticas.totalDepositos}</p>
                </div>

                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <h3 className="text-lg font-semibold text-red-800">Estoque Baixo</h3>
                  <p className="text-3xl font-bold text-red-600">{estatisticas.produtosEstoqueBaixo}</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <h3 className="text-lg font-semibold text-orange-800">Produtos Vencendo</h3>
                  <p className="text-3xl font-bold text-orange-600">{estatisticas.produtosVencendo}</p>
                </div>
              </div>

              {/* Produtos com Estoque Baixo */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Produtos com Estoque Baixo</h3>
                  <button
                    onClick={() => exportarRelatorio("estoque-baixo")}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    📊 Exportar CSV
                  </button>
                </div>

                {carregandoEstoqueBaixo ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                  </div>
                ) : produtosEstoqueBaixo.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum produto com estoque baixo</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depósito</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantidade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Estoque Mín.
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {produtosEstoqueBaixo.slice(0, 5).map((produto, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {produto.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {produto.deposito_nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                              {produto.quantidade}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.estoque_min}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {produtosEstoqueBaixo.length > 5 && (
                      <div className="text-center py-2">
                        <button
                          onClick={() => setAbaAtiva("estoque-baixo")}
                          className="text-[#4caf50] hover:text-[#45a049] text-sm font-medium"
                        >
                          Ver todos ({produtosEstoqueBaixo.length} produtos)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Produtos Vencendo */}
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Produtos com Validade Próxima</h3>
                  <button
                    onClick={() => exportarRelatorio("vencendo")}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    📊 Exportar CSV
                  </button>
                </div>

                {carregandoVencendo ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                  </div>
                ) : produtosVencendo.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum produto com validade próxima</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depósito</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantidade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Dias Restantes
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {produtosVencendo.slice(0, 5).map((produto, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {produto.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {produto.deposito_nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.quantidade}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(produto.validade).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`font-semibold ${
                                  produto.dias_restantes <= 7
                                    ? "text-red-600"
                                    : produto.dias_restantes <= 30
                                      ? "text-orange-600"
                                      : "text-yellow-600"
                                }`}
                              >
                                {produto.dias_restantes} dias
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {produtosVencendo.length > 5 && (
                      <div className="text-center py-2">
                        <button
                          onClick={() => setAbaAtiva("validade")}
                          className="text-[#4caf50] hover:text-[#45a049] text-sm font-medium"
                        >
                          Ver todos ({produtosVencendo.length} produtos)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Aba Estoque Baixo */}
          {abaAtiva === "estoque-baixo" && (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Relatório Detalhado - Estoque Baixo</h3>
                <p className="text-gray-600">Produtos que estão abaixo do estoque mínimo configurado</p>
              </div>

              {carregandoEstoqueBaixo ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  <p className="mt-2 text-gray-600">Carregando...</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depósito</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantidade Atual
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Estoque Mínimo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diferença</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {produtosEstoqueBaixo.map((produto, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {produto.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {produto.deposito_nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                              {produto.quantidade}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.estoque_min}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                              -{produto.estoque_min - produto.quantidade}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Aba Validade */}
          {abaAtiva === "validade" && (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Relatório Detalhado - Validade</h3>
                <p className="text-gray-600">Produtos próximos do vencimento ou já vencidos</p>
              </div>

              {carregandoVencendo ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                  <p className="mt-2 text-gray-600">Carregando...</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Depósito</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantidade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {produtosVencendo.map((produto, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {produto.nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {produto.deposito_nome}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.quantidade}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(produto.validade).toLocaleDateString("pt-BR")}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  produto.dias_restantes <= 0
                                    ? "bg-red-100 text-red-800"
                                    : produto.dias_restantes <= 7
                                      ? "bg-red-100 text-red-800"
                                      : produto.dias_restantes <= 30
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {produto.dias_restantes <= 0
                                  ? "Vencido"
                                  : produto.dias_restantes <= 7
                                    ? "Crítico"
                                    : produto.dias_restantes <= 30
                                      ? "Atenção"
                                      : "Próximo"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
