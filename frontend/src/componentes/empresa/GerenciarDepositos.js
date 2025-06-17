"use client"

import { useState, useEffect } from "react"
import api from "../../axiosConfig"

export default function GerenciarDepositos({ aoAtualizarEstatisticas }) {
  const [depositos, setDepositos] = useState([])
  const [mostrarModal, setMostrarModal] = useState(false)
  const [depositoEditando, setDepositoEditando] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    endereco: "",
  })

  useEffect(() => {
    console.log("GerenciarDepositos: Componente montado, buscando depósitos...")
    buscarDepositos()
  }, [])

  async function buscarDepositos() {
    setCarregando(true)
    try {
      console.log("GerenciarDepositos: Fazendo requisição para /depositos")
      const response = await api.get("/depositos")
      console.log("GerenciarDepositos: Depósitos encontrados:", response.data)
      setDepositos(response.data)
    } catch (error) {
      console.error("Erro ao buscar depósitos:", error)
    } finally {
      setCarregando(false)
    }
  }

  function abrirModal(deposito = null) {
    setDepositoEditando(deposito)
    setFormData({
      nome: deposito?.nome || "",
      descricao: deposito?.descricao || "",
      endereco: deposito?.endereco || "",
    })
    setMostrarModal(true)
  }

  function fecharModal() {
    setMostrarModal(false)
    setDepositoEditando(null)
    setFormData({ nome: "", descricao: "", endereco: "" })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      if (depositoEditando) {
        await api.put(`/depositos/${depositoEditando.id}`, formData)
      } else {
        await api.post("/depositos", formData)
      }

      buscarDepositos()
      aoAtualizarEstatisticas()
      fecharModal()
    } catch (error) {
      console.error("Erro ao salvar depósito:", error)
      alert("Erro ao salvar depósito")
    }
  }

  async function handleExcluir(id) {
    if (!window.confirm("Deseja realmente excluir este depósito?")) return

    try {
      await api.delete(`/depositos/${id}`)
      buscarDepositos()
      aoAtualizarEstatisticas()
    } catch (error) {
      console.error("Erro ao excluir depósito:", error)
      alert("Erro ao excluir depósito")
    }
  }

  return (
    <div className="space-y-6 bg-green-50 p-6 rounded-xl">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center bg-gradient-to-r from-[#015D4F] to-[#4caf50] p-4 rounded-lg shadow-md text-white">
        <h2 className="text-2xl font-bold text-white">Gerenciar Depósitos</h2>
        <button
          onClick={() => abrirModal()}
          className="bg-[#4caf50] hover:bg-[#45a049] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Adicionar Depósito</span>
        </button>
      </div>

      {/* Lista de Depósitos */}
      {carregando ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4caf50]"></div>
          <p className="mt-2 text-gray-600">Carregando depósitos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {depositos.length === 0 ? (
            <div className="col-span-full text-center py-8 bg-green-100/50 rounded-lg border border-green-200 shadow-inner">
              <div className="text-gray-500">
                <p>Nenhum depósito cadastrado</p>
                <button
                  onClick={() => abrirModal()}
                  className="mt-4 bg-[#4caf50] hover:bg-[#45a049] text-white px-6 py-2 rounded-lg"
                >
                  ➕ Adicionar Primeiro Depósito
                </button>
              </div>
            </div>
          ) : (
            depositos.map((deposito) => (
              <div
                key={deposito.id}
                className="bg-white rounded-lg shadow-md border-2 border-[#015D4F]/30 p-6 hover:shadow-lg hover:border-[#015D4F]/60 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🏪</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{deposito.nome}</h3>
                      <p className="text-sm text-gray-600">{deposito.total_itens || 0} itens</p>
                    </div>
                  </div>
                </div>

                {deposito.descricao && <p className="text-sm text-gray-600 mb-3">{deposito.descricao}</p>}

                {deposito.endereco && <p className="text-sm text-gray-600 mb-4">📍 {deposito.endereco}</p>}

                <div className="flex space-x-2">
                  <button
                    onClick={() => abrirModal(deposito)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium transition-colors duration-200"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(deposito.id)}
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

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold mb-4">
              {depositoEditando ? "Editar Depósito" : "Adicionar Depósito"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={fecharModal}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#4caf50] hover:bg-[#45a049] text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                >
                  {depositoEditando ? "Atualizar" : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
