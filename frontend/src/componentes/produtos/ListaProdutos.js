"use client"

import { useEffect, useState, useCallback } from "react"
import api from "../../axiosConfig"
import ModalEditarProduto from "./ModalEditarProduto"
import ModalAdicionarProduto from "./ModalAdicionarProduto"

export default function ListaProdutos({ aoDeslogar }) {
  const [produtos, setProdutos] = useState([])
  const [depositos, setDepositos] = useState([])
  const [depositoSelecionado, setDepositoSelecionado] = useState("")
  const [produtoSelecionado, setProdutoSelecionado] = useState(null)
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false)
  const [carregando, setCarregando] = useState(false)

  // Buscar depósitos ao carregar
  useEffect(() => {
    buscarDepositos()
  }, [])

  // Buscar produtos quando depósito mudar
  const buscarProdutos = useCallback(async () => {
    if (!depositoSelecionado) return

    setCarregando(true)
    try {
      const response = await api.get(`/produtos/${depositoSelecionado}`)
      setProdutos(response.data)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
    } finally {
      setCarregando(false)
    }
  }, [depositoSelecionado])

  useEffect(() => {
    buscarProdutos()
  }, [buscarProdutos])

  async function buscarDepositos() {
    try {
      const response = await api.get("/depositos")
      setDepositos(response.data)

      // Selecionar primeiro depósito automaticamente
      if (response.data.length > 0) {
        setDepositoSelecionado(response.data[0].id)
      }
    } catch (error) {
      console.error("Erro ao buscar depósitos:", error)
    }
  }

  async function handleExcluirProduto(id) {
    if (!window.confirm("Deseja realmente excluir este produto?")) return

    try {
      await api.delete(`/produtos/${id}`)
      buscarProdutos() // Recarregar lista
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      alert("Erro ao excluir produto")
    }
  }

  function validadeProxima(dataValidade) {
    if (!dataValidade) return false
    const hoje = new Date()
    const validade = new Date(dataValidade)
    const tresMesesDepois = new Date(hoje)
    tresMesesDepois.setMonth(hoje.getMonth() + 3)
    return validade <= tresMesesDepois
  }

  function formatarData(data) {
    if (!data) return "Sem validade"
    return new Date(data).toLocaleDateString("pt-BR")
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <div className="relative p-10 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-between items-center mb-6 relative">
          {/* Botão de adicionar produto */}
          <button
            onClick={() => setMostrarModalAdicionar(true)}
            className="absolute left-4 top-0 bg-black/60 text-white border border-[#015D4F] px-4 py-2 rounded-lg shadow hover:bg-[#015D4F]/80 hover:text-white transition"
          >
            + Produto
          </button>

          {/* Título */}
          <h2 className="text-xl font-semibold text-[#015D4F] text-center w-full">Produtos Cadastrados</h2>

          {/* Botão logout */}
          {aoDeslogar && (
            <button
              onClick={aoDeslogar}
              className="absolute right-4 top-0 bg-black/60 text-white border border-[#015D4F] px-4 py-2 rounded-lg shadow hover:bg-[#015D4F]/80 hover:text-white transition"
            >
              Logout
            </button>
          )}
        </div>

        {/* Seletor de depósito */}
        <div className="mb-6">
          <label className="block text-[#015D4F] font-semibold mb-2">Selecionar Depósito:</label>
          <select
            value={depositoSelecionado}
            onChange={(e) => setDepositoSelecionado(e.target.value)}
            className="px-4 py-2 border border-[#015D4F] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#015D4F]"
          >
            <option value="">Selecione um depósito</option>
            {depositos.map((deposito) => (
              <option key={deposito.id} value={deposito.id}>
                {deposito.nome} ({deposito.total_itens} itens)
              </option>
            ))}
          </select>
        </div>

        {carregando ? (
          <div className="text-center py-8">
            <div className="text-[#015D4F]">Carregando produtos...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {produtos.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                {depositoSelecionado
                  ? "Nenhum produto encontrado neste depósito"
                  : "Selecione um depósito para ver os produtos"}
              </div>
            ) : (
              produtos.map((produto) => {
                const alertaEstoque = produto.quantidade <= (produto.estoque_minimo || 0)
                const alertaValidade = validadeProxima(produto.validade)

                return (
                  <div
                    key={produto.id}
                    className="bg-black/60 text-white p-4 rounded-xl shadow-md relative border border-[#015D4F] backdrop-blur-sm"
                  >
                    <h3 className="text-lg font-bold mb-2">{produto.nome}</h3>
                    <p>Quantidade: {produto.quantidade || 0}</p>
                    <p>Preço: R$ {typeof produto.preco_venda === "number" ? produto.preco_venda.toFixed(2) : "---"}</p>
                    <p>Validade: {formatarData(produto.validade)}</p>
                    <p>Estoque mín.: {produto.estoque_minimo || 0}</p>

                    {alertaEstoque && (
                      <span className="absolute top-2 right-2 bg-red-500/90 text-white px-2 py-1 rounded text-xs shadow">
                        Estoque Baixo
                      </span>
                    )}
                    {alertaValidade && (
                      <span className="absolute bottom-2 right-2 bg-yellow-400/90 text-black px-2 py-1 rounded text-xs shadow">
                        Validade Próxima
                      </span>
                    )}

                    <div className="mt-4 flex justify-between">
                      <button
                        onClick={() => setProdutoSelecionado(produto)}
                        className="bg-white/90 text-[#015D4F] px-3 py-1 rounded shadow hover:bg-[#015D4F] hover:text-white transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluirProduto(produto.id)}
                        className="bg-red-700/80 text-white px-3 py-1 rounded shadow hover:bg-red-800 transition"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Modal de edição */}
      {produtoSelecionado && (
        <ModalEditarProduto
          produto={produtoSelecionado}
          depositos={depositos}
          depositoAtual={depositoSelecionado}
          aoFechar={() => setProdutoSelecionado(null)}
          aoAtualizar={buscarProdutos}
        />
      )}

      {/* Modal de adicionar */}
      {mostrarModalAdicionar && (
        <ModalAdicionarProduto
          depositos={depositos}
          depositoSelecionado={depositoSelecionado}
          aoFechar={() => setMostrarModalAdicionar(false)}
          aoAtualizar={buscarProdutos}
        />
      )}
    </div>
  )
}
