"use client"

import { useState, useEffect, useCallback } from "react"
import api from "../../axiosConfig"

export default function RelatoriosFuncionario() {
  const [relatorioSelecionado, setRelatorioSelecionado] = useState("estoque-baixo")
  const [dados, setDados] = useState([])
  const [carregando, setCarregando] = useState(false)

  const buscarDados = useCallback(async () => {
    setCarregando(true)
    try {
      let endpoint = ""
      switch (relatorioSelecionado) {
        case "estoque-baixo":
          endpoint = "/api/produtos/estoque-baixo"
          break
        case "validade":
          endpoint = "/api/produtos/vencendo"
          break
        case "sem-estoque":
          endpoint = "/api/produtos/sem-estoque"
          break
        default:
          endpoint = "/api/produtos/estoque-baixo"
      }

      const response = await api.get(endpoint)
      setDados(response.data)
    } catch (error) {
      console.error("Erro ao buscar dados do relatório:", error)
      setDados([])
    } finally {
      setCarregando(false)
    }
  }, [relatorioSelecionado])

  useEffect(() => {
    buscarDados()
  }, [buscarDados])

  function formatarData(data) {
    if (!data) return "N/A"
    return new Date(data).toLocaleDateString("pt-BR")
  }

  function calcularDiasParaVencer(dataValidade) {
    if (!dataValidade) return null
    const hoje = new Date()
    const validade = new Date(dataValidade)
    const diffTime = validade - hoje
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-xl -m-6 mb-6">
        <h3 className="text-xl font-bold">Relatórios</h3>
      </div>

      {/* Seletor de Relatório */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Relatório:</label>
        <select
          value={relatorioSelecionado}
          onChange={(e) => setRelatorioSelecionado(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="estoque-baixo">Produtos com Estoque Baixo</option>
          <option value="validade">Produtos Vencendo</option>
          <option value="sem-estoque">Produtos Sem Estoque</option>
        </select>
      </div>

      {/* Tabela de Dados */}
      {carregando ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Carregando relatório...</p>
        </div>
      ) : dados.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum dado encontrado</h3>
          <p className="text-gray-600">Não há produtos para este relatório</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Depósito
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                {relatorioSelecionado === "estoque-baixo" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Mínimo
                  </th>
                )}
                {relatorioSelecionado === "validade" && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Validade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dias Restantes
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dados.map((produto, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{produto.nome}</div>
                    <div className="text-sm text-gray-500">{produto.descricao}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.codigo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.deposito_nome}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-semibold ${
                        produto.quantidade === 0
                          ? "text-red-600"
                          : produto.quantidade <= produto.estoque_minimo
                            ? "text-orange-600"
                            : "text-gray-900"
                      }`}
                    >
                      {produto.quantidade}
                    </span>
                  </td>
                  {relatorioSelecionado === "estoque-baixo" && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{produto.estoque_min}</td>
                  )}
                  {relatorioSelecionado === "validade" && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatarData(produto.validade)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            calcularDiasParaVencer(produto.validade) <= 3
                              ? "text-red-600"
                              : calcularDiasParaVencer(produto.validade) <= 7
                                ? "text-orange-600"
                                : "text-yellow-600"
                          }`}
                        >
                          {calcularDiasParaVencer(produto.validade)} dias
                        </span>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
