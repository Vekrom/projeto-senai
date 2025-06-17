"use client"

import { useState } from "react"
import api from "../../axiosConfig"

export default function ModalAdicionarProduto({ depositos, depositoSelecionado, aoFechar, aoAtualizar }) {
  const [formData, setFormData] = useState({
    nome: "",
    quantidade: "",
    preco: "",
    validade: "",
    estoque_min: "",
    deposito_id: depositoSelecionado || "",
    codigo: "",
    descricao: "",
  })
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState("")

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro("")

    if (!formData.nome || !formData.deposito_id) {
      setErro("Nome e depósito são obrigatórios")
      return
    }

    setCarregando(true)

    try {
      const dados = {
        nome: formData.nome,
        quantidade: Number.parseInt(formData.quantidade) || 0,
        preco: Number.parseFloat(formData.preco) || 0,
        validade: formData.validade || null,
        estoque_min: Number.parseInt(formData.estoque_min) || 0,
        deposito_id: Number.parseInt(formData.deposito_id),
        codigo: formData.codigo || null,
        descricao: formData.descricao || null,
      }

      await api.post("/produtos", dados)
      aoAtualizar()
      aoFechar()
    } catch (error) {
      console.error("Erro ao adicionar produto:", error)
      setErro(error.response?.data?.erro || "Erro ao adicionar produto")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white text-[#015D4F] rounded-lg p-6 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-[#015D4F]">Adicionar Produto</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full p-2 border rounded text-[#015D4F] focus:outline-none focus:ring-2 focus:ring-[#015D4F]"
              placeholder="Nome do produto"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Depósito *</label>
            <select
              name="deposito_id"
              value={formData.deposito_id}
              onChange={handleChange}
              className="w-full p-2 border rounded text-[#015D4F] focus:outline-none focus:ring-2 focus:ring-[#015D4F]"
              required
            >
              <option value="">Selecione um depósito</option>
              {depositos.map((deposito) => (
                <option key={deposito.id} value={deposito.id}>
                  {deposito.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Quantidade</label>
              <input
                type="number"
                name="quantidade"
                value={formData.quantidade}
                onChange={handleChange}
                className="w-full p-2 border rounded text-[#015D4F] focus:outline-none focus:ring-2 focus:ring-[#015D4F]"
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Preço</label>
              <input
                type="number"
                name="preco"
                value={formData.preco}
                onChange={handleChange}
                className="w-full p-2 border rounded text-[#015D4F] focus:outline-none focus:ring-2 focus:ring-[#015D4F]"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Código</label>
            <input
              type="text"
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              className="w-full p-2 border rounded text-[#015D4F] focus:outline-none focus:ring-2 focus:ring-[#015D4F]"
              placeholder="Código do produto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              className="w-full p-2 border rounded text-[#015D4F] focus:outline-none focus:ring-2 focus:ring-[#015D4F]"
              placeholder="Descrição do produto"
              rows="2"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Validade</label>
              <input
                type="date"
                name="validade"
                value={formData.validade}
                onChange={handleChange}
                className="w-full p-2 border rounded text-[#015D4F] focus:outline-none focus:ring-2 focus:ring-[#015D4F]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
              <input
                type="number"
                name="estoque_min"
                value={formData.estoque_min}
                onChange={handleChange}
                className="w-full p-2 border rounded text-[#015D4F] focus:outline-none focus:ring-2 focus:ring-[#015D4F]"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {erro && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">{erro}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={aoFechar}
              className="px-4 py-2 bg-transparent text-[#015D4F] rounded border border-[#015D4F] hover:bg-[#015D4F] hover:text-white transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="px-4 py-2 bg-[#015D4F] text-white rounded hover:bg-[#013e35] transition disabled:opacity-50"
            >
              {carregando ? "Adicionando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
