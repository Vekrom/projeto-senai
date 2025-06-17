"use client"

import { useState, useEffect, useCallback } from "react"
import api from "../../axiosConfig"
import ModalAdicionarProduto from "../produtos/ModalAdicionarProduto"
import ModalEditarProduto from "../produtos/ModalEditarProduto"

export default function GerenciarProdutos({ aoAtualizarEstatisticas }) {
  const [produtos, setProdutos] = useState([])
  const [depositos, setDepositos] = useState([])
  const [depositoSelecionado, setDepositoSelecionado] = useState("")
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [filtro, setFiltro] = useState("")

  // Usar useCallback para buscarProdutos para evitar re-criação desnecessária
  const buscarProdutos = useCallback(async () => {
    setCarregando(true)
    try {
      let response
      if (depositoSelecionado) {
        console.log("Buscando produtos para depósito:", depositoSelecionado)
        response = await api.get(`/produtos/${depositoSelecionado}`)
      } else {
        console.log("Buscando todos os produtos")
        response = await api.get("/produtos")
      }
      console.log("Produtos encontrados:", response.data)
      setProdutos(response.data)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      setProdutos([])
    } finally {
      setCarregando(false)
    }
  }, [depositoSelecionado])

  // Função para buscar depósitos
  async function buscarDepositos() {
    try {
      const response = await api.get("/depositos")
      setDepositos(response.data)
      if (response.data.length > 0) {
        setDepositoSelecionado(response.data[0].id)
      }
    } catch (error) {
      console.error("Erro ao buscar depósitos:", error)
    }
  }

  useEffect(() => {
    buscarDepositos()
  }, [])

  // Agora buscarProdutos está nas dependências corretamente
  useEffect(() => {
    if (depositoSelecionado) {
      buscarProdutos()
    }
  }, [depositoSelecionado, buscarProdutos])

  async function handleExcluirProduto(id) {
    if (!window.confirm("Deseja realmente excluir este produto?")) return

    try {
      await api.delete(`/produtos/${id}`)
      buscarProdutos()
      aoAtualizarEstatisticas()
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      alert("Erro ao excluir produto")
    }
  }

  function handleAtualizarLista() {
    buscarProdutos()
    aoAtualizarEstatisticas()
  }

  const produtosFiltrados = produtos.filter((produto) => produto.nome.toLowerCase().includes(filtro.toLowerCase()))

  return (
    <div className="space-y-6 bg-green-50 p-6 rounded-xl">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center bg-gradient-to-r from-[#015D4F] to-[#4caf50] p-4 rounded-lg shadow-md text-white">
        <h2 className="text-2xl font-bold text-white">Gerenciar Produtos</h2>
        <button
          onClick={() => setMostrarModalAdicionar(true)}
          className="bg-[#4caf50] hover:bg-[#45a049] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Adicionar Produto</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-100/70 p-4 rounded-lg border border-green-200">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecionar Depósito:</label>
          <select
            value={depositoSelecionado}
            onChange={(e) => setDepositoSelecionado(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Produto:</label>
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Digite o nome do produto..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
          />
        </div>
      </div>

      {/* Botão Novo Produto centralizado */}
      {depositos.length > 0 && (
        <div className="text-center">
          <button
            onClick={() => setMostrarModalAdicionar(true)}
            className="bg-[#015D4F] hover:bg-[#015D4F]/80 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 mx-auto shadow-md"
          >
            <span>📦</span>
            <span>Novo Produto</span>
          </button>
        </div>
      )}

      {/* Lista de Produtos */}
      {carregando ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4caf50]"></div>
          <p className="mt-2 text-gray-600">Carregando produtos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtosFiltrados.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-green-100/50 rounded-lg border border-green-200 shadow-inner">
              {depositoSelecionado ? (
                filtro ? (
                  <div className="text-gray-500">
                    <p>Nenhum produto encontrado com esse nome</p>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <p>Nenhum produto encontrado neste depósito</p>
                    <button
                      onClick={() => setMostrarModalAdicionar(true)}
                      className="mt-4 bg-[#4caf50] hover:bg-[#45a049] text-white px-6 py-2 rounded-lg"
                    >
                      ➕ Adicionar Primeiro Produto
                    </button>
                  </div>
                )
              ) : (
                <div className="text-gray-500">
                  <p>Selecione um depósito para ver os produtos</p>
                  {depositos.length === 0 && <p className="mt-2 text-sm">Você precisa criar um depósito primeiro</p>}
                </div>
              )}
            </div>
          ) : (
            produtosFiltrados.map((produto) => (
              <div
                key={produto.id}
                className="bg-white rounded-lg shadow-md border-2 border-[#015D4F]/30 p-6 hover:shadow-lg hover:border-[#015D4F]/60 transition-all duration-200"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#015D4F]/20 rounded-lg flex items-center justify-center border border-[#015D4F]/30">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{produto.nome}</h3>
                    <p className="text-sm text-gray-600">{produto.quantidade || 0} unidades</p>
                  </div>
                </div>

                {produto.descricao && <p className="text-sm text-gray-600 mb-3">{produto.descricao}</p>}

                <div className="text-sm text-gray-600 mb-4">
                  <p>Preço: R$ {typeof produto.preco_venda === "number" ? produto.preco_venda.toFixed(2) : "---"}</p>
                  <p>
                    Validade:{" "}
                    {produto.validade ? new Date(produto.validade).toLocaleDateString("pt-BR") : "Sem validade"}
                  </p>
                  <p>Estoque mín.: {produto.estoque_minimo || 0}</p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setProdutoSelecionado(produto)}
                    className="flex-1 bg-[#015D4F] hover:bg-[#015D4F]/80 text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluirProduto(produto.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modais */}
      {mostrarModalAdicionar && (
        <ModalAdicionarProduto
          depositos={depositos}
          depositoSelecionado={depositoSelecionado}
          aoFechar={() => setMostrarModalAdicionar(false)}
          aoAtualizar={handleAtualizarLista}
        />
      )}

      {produtoSelecionado && (
        <ModalEditarProduto
          produto={produtoSelecionado}
          depositos={depositos}
          depositoAtual={depositoSelecionado}
          aoFechar={() => setProdutoSelecionado(null)}
          aoAtualizar={handleAtualizarLista}
        />
      )}
    </div>
  )
}
