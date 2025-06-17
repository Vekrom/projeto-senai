"use client"

import { useState, useEffect, useCallback } from "react"
import api from "../../axiosConfig"

export default function ListaProdutosFuncionario() {
  const [produtos, setProdutos] = useState([])
  const [depositos, setDepositos] = useState([])
  const [depositoSelecionado, setDepositoSelecionado] = useState("")
  const [termoBusca, setTermoBusca] = useState("")
  const [carregando, setCarregando] = useState(false)

  const buscarDepositos = useCallback(async () => {
    try {
      const response = await api.get("/api/depositos")
      setDepositos(response.data)
      if (response.data.length > 0) {
        setDepositoSelecionado(response.data[0].id.toString())
      }
    } catch (error) {
      console.error("Erro ao buscar depósitos:", error)
    }
  }, [])

  const buscarProdutos = useCallback(async () => {
    if (!depositoSelecionado) return

    setCarregando(true)
    try {
      console.log("Buscando produtos para depósito:", depositoSelecionado)
      const response = await api.get(`/api/produtos?deposito=${depositoSelecionado}`)
      setProdutos(response.data)
      console.log("Produtos encontrados:", response.data)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
    } finally {
      setCarregando(false)
    }
  }, [depositoSelecionado])

  // Buscar depósitos ao carregar o componente
  useEffect(() => {
    buscarDepositos()
  }, [buscarDepositos])

  // Buscar produtos quando o depósito selecionado mudar
  useEffect(() => {
    if (depositoSelecionado) {
      buscarProdutos()
    }
  }, [depositoSelecionado, buscarProdutos])

  // Filtrar produtos baseado no termo de busca
  const produtosFiltrados = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      produto.codigo.toLowerCase().includes(termoBusca.toLowerCase()),
  )

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

  function getCorStatus(produto) {
    const diasParaVencer = calcularDiasParaVencer(produto.data_validade)

    if (produto.quantidade === 0) {
      return "bg-red-100 text-red-800 border-red-200"
    }
    if (produto.quantidade <= produto.estoque_minimo) {
      return "bg-orange-100 text-orange-800 border-orange-200"
    }
    if (diasParaVencer !== null && diasParaVencer <= 7) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
    return "bg-green-100 text-green-800 border-green-200"
  }

  function getTextoStatus(produto) {
    const diasParaVencer = calcularDiasParaVencer(produto.data_validade)

    if (produto.quantidade === 0) {
      return "Sem Estoque"
    }
    if (produto.quantidade <= produto.estoque_minimo) {
      return "Estoque Baixo"
    }
    if (diasParaVencer !== null && diasParaVencer <= 7) {
      return `Vence em ${diasParaVencer} dias`
    }
    return "Normal"
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-t-xl -m-6 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Consultar Produtos</h3>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Depósito:</label>
          <select
            value={depositoSelecionado}
            onChange={(e) => setDepositoSelecionado(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Selecione um depósito</option>
            {depositos.map((deposito) => (
              <option key={deposito.id} value={deposito.id}>
                {deposito.nome} ({deposito.total_itens || 0} itens)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar Produto:</label>
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Digite o nome do produto..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Lista de Produtos */}
      {carregando ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Carregando produtos...</p>
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-600">
            {depositoSelecionado ? "Não há produtos neste depósito" : "Selecione um depósito para ver os produtos"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtosFiltrados.map((produto) => {
            const alertaEstoque = produto.quantidade <= (produto.estoque_minimo || 0)
            const alertaValidade = calcularDiasParaVencer(produto.data_validade) <= 7

            return (
              <div
                key={produto.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{produto.nome}</h3>
                    <p className="text-sm text-gray-600">{produto.quantidade || 0} unidades</p>
                  </div>
                </div>

                {/* Alertas */}
                {alertaEstoque && (
                  <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium mb-2">
                    Estoque Baixo
                  </span>
                )}
                {alertaValidade && (
                  <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium mb-2 ml-2">
                    Validade Próxima
                  </span>
                )}

                {produto.descricao && <p className="text-sm text-gray-600 mb-3">{produto.descricao}</p>}

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Preço: R$ {typeof produto.preco_venda === "number" ? produto.preco_venda.toFixed(2) : "---"}</p>
                  <p>Validade: {formatarData(produto.data_validade)}</p>
                  <p>Estoque mín.: {produto.estoque_minimo || 0}</p>
                  {produto.codigo && <p>Código: {produto.codigo}</p>}
                </div>

                {/* Status do produto */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCorStatus(produto)}`}>
                    {getTextoStatus(produto)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
