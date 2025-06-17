"use client"

import { useState, useEffect } from "react"
import api from "../../axiosConfig"

export default function RelatorioSaidas() {
  const [movimentacoes, setMovimentacoes] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [filtro, setFiltro] = useState("")
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")

  useEffect(() => {
    // Definir datas padrão (últimos 30 dias)
    const hoje = new Date()
    const trintaDiasAtras = new Date(hoje)
    trintaDiasAtras.setDate(hoje.getDate() - 30)

    setDataFim(hoje.toISOString().split("T")[0])
    setDataInicio(trintaDiasAtras.toISOString().split("T")[0])

    buscarMovimentacoes()
  }, [])

  async function buscarMovimentacoes() {
    setCarregando(true)
    try {
      // Como não temos endpoint específico para movimentações, vamos simular
      // Em um sistema real, você teria um endpoint como /movimentacoes/saidas
      const response = await api.get("/produtos")

      // Simulando dados de movimentações de saída
      const movimentacoesSimuladas = [
        {
          id: 1,
          produto_nome: "Produto Exemplo 1",
          deposito_nome: "Depósito Principal",
          quantidade: 10,
          data: "2024-01-15",
          usuario: "admin",
          motivo: "Venda",
          tipo: "saida",
        },
        {
          id: 2,
          produto_nome: "Produto Exemplo 2",
          deposito_nome: "Depósito Secundário",
          quantidade: 5,
          data: "2024-01-14",
          usuario: "funcionario1",
          motivo: "Transferência",
          tipo: "saida",
        },
      ]

      setMovimentacoes(movimentacoesSimuladas)
    } catch (error) {
      console.error("Erro ao buscar movimentações:", error)
      setMovimentacoes([])
    } finally {
      setCarregando(false)
    }
  }

  function exportarCSV() {
    if (movimentacoesFiltradas.length === 0) {
      alert("Não há dados para exportar")
      return
    }

    const headers = ["Data", "Produto", "Depósito", "Quantidade", "Usuário", "Motivo"]
    const csvData = movimentacoesFiltradas.map((mov) => [
      new Date(mov.data).toLocaleDateString("pt-BR"),
      mov.produto_nome,
      mov.deposito_nome,
      mov.quantidade,
      mov.usuario,
      mov.motivo,
    ])

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `relatorio-saidas-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const movimentacoesFiltradas = movimentacoes.filter((mov) => {
    const matchNome =
      mov.produto_nome.toLowerCase().includes(filtro.toLowerCase()) ||
      mov.deposito_nome.toLowerCase().includes(filtro.toLowerCase()) ||
      mov.usuario.toLowerCase().includes(filtro.toLowerCase())

    const dataMovimentacao = new Date(mov.data)
    const dataInicioFilter = dataInicio ? new Date(dataInicio) : null
    const dataFimFilter = dataFim ? new Date(dataFim) : null

    const matchData =
      (!dataInicioFilter || dataMovimentacao >= dataInicioFilter) &&
      (!dataFimFilter || dataMovimentacao <= dataFimFilter)

    return matchNome && matchData
  })

  const totalSaidas = movimentacoesFiltradas.reduce((acc, mov) => acc + mov.quantidade, 0)

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Relatório de Saídas</h3>
          <p className="text-gray-600">Histórico de movimentações de saída do estoque</p>
        </div>
        <button
          onClick={exportarCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <span>📊</span>
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar:</label>
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Produto, depósito ou usuário..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data início:</label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data fim:</label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-blue-800 mb-2">Resumo do Período</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-700">Total de movimentações:</span>
            <span className="ml-2 text-blue-900">{movimentacoesFiltradas.length}</span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Total de itens saídos:</span>
            <span className="ml-2 text-blue-900">{totalSaidas} unidades</span>
          </div>
          <div>
            <span className="font-medium text-blue-700">Período:</span>
            <span className="ml-2 text-blue-900">
              {dataInicio && dataFim
                ? `${new Date(dataInicio).toLocaleDateString("pt-BR")} - ${new Date(dataFim).toLocaleDateString("pt-BR")}`
                : "Todos os registros"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabela */}
      {carregando ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Carregando relatório...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Depósito
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Motivo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimentacoesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {filtro || dataInicio || dataFim
                        ? "Nenhuma movimentação encontrada com esses filtros"
                        : "Nenhuma movimentação de saída registrada"}
                    </td>
                  </tr>
                ) : (
                  movimentacoesFiltradas.map((movimentacao, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(movimentacao.data).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {movimentacao.produto_nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movimentacao.deposito_nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                        -{movimentacao.quantidade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movimentacao.usuario}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{movimentacao.motivo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Nota sobre dados simulados */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Dados Simulados</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Este relatório está exibindo dados simulados. Para implementar completamente, você precisará:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Criar uma tabela de movimentações no banco de dados</li>
                <li>Implementar endpoints para registrar e consultar movimentações</li>
                <li>Integrar com as operações de entrada e saída de produtos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
