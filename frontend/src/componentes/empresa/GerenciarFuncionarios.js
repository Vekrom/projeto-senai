"use client"

import { useState, useEffect } from "react"
import api from "../../axiosConfig"

export default function GerenciarFuncionarios({ aoAtualizarEstatisticas }) {
  const [funcionarios, setFuncionarios] = useState([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    buscarFuncionarios()
  }, [])

  async function buscarFuncionarios() {
    setCarregando(true)
    try {
      const response = await api.get("/api/auth/usuarios")
      setFuncionarios(response.data)
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error)
    } finally {
      setCarregando(false)
    }
  }

  async function alterarStatusFuncionario(id, novoStatus) {
    try {
      await api.put(`/api/auth/usuarios/${id}/status`, { status: novoStatus })
      buscarFuncionarios()
      aoAtualizarEstatisticas()
    } catch (error) {
      console.error("Erro ao alterar status:", error)
      alert("Erro ao alterar status do funcionário")
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "aprovado":
        return "bg-green-100 text-green-800"
      case "pendente":
        return "bg-yellow-100 text-yellow-800"
      case "bloqueado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  function getStatusText(status) {
    switch (status) {
      case "aprovado":
        return "Aprovado"
      case "pendente":
        return "Pendente"
      case "bloqueado":
        return "Bloqueado"
      default:
        return "Desconhecido"
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Funcionários</h2>
        <div className="text-sm text-gray-600">Total: {funcionarios.length} funcionários</div>
      </div>

      {/* Lista de Funcionários */}
      {carregando ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#4caf50]"></div>
          <p className="mt-2 text-gray-600">Carregando funcionários...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funcionário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastrado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {funcionarios.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Nenhum funcionário cadastrado
                    </td>
                  </tr>
                ) : (
                  funcionarios.map((funcionario) => (
                    <tr key={funcionario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">
                              {funcionario.usuario.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {funcionario.nome_completo || funcionario.usuario}
                            </div>
                            <div className="text-sm text-gray-500">@{funcionario.usuario}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(funcionario.status)}`}
                        >
                          {getStatusText(funcionario.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {funcionario.ultimo_login
                          ? new Date(funcionario.ultimo_login).toLocaleDateString("pt-BR")
                          : "Nunca"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(funcionario.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {funcionario.status === "pendente" && (
                          <button
                            onClick={() => alterarStatusFuncionario(funcionario.id, "aprovado")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors duration-200"
                          >
                            Aprovar
                          </button>
                        )}
                        {funcionario.status === "aprovado" && (
                          <button
                            onClick={() => alterarStatusFuncionario(funcionario.id, "bloqueado")}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors duration-200"
                          >
                            Bloquear
                          </button>
                        )}
                        {funcionario.status === "bloqueado" && (
                          <button
                            onClick={() => alterarStatusFuncionario(funcionario.id, "aprovado")}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-colors duration-200"
                          >
                            Desbloquear
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
