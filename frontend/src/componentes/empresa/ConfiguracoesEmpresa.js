"use client"

import { useState, useEffect } from "react"
import api from "../../axiosConfig"

export default function ConfiguracoesEmpresa({ dadosEmpresa, aoAtualizarDados }) {
  const [formData, setFormData] = useState({
    nome_empresa: "",
    cnpj: "",
    email: "",
    usuario: "",
  })
  const [senhaData, setSenhaData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  })
  const [carregando, setCarregando] = useState(false)
  const [carregandoSenha, setCarregandoSenha] = useState(false)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")

  useEffect(() => {
    if (dadosEmpresa) {
      setFormData({
        nome_empresa: dadosEmpresa.empresa_nome || "",
        cnpj: dadosEmpresa.cnpj || "",
        email: dadosEmpresa.empresa_email || "",
        usuario: dadosEmpresa.usuario || "",
      })
    }
  }, [dadosEmpresa])

  // Função para formatar CNPJ
  function formatarCNPJ(valor) {
    const apenasNumeros = valor.replace(/\D/g, "")
    if (apenasNumeros.length <= 2) {
      return apenasNumeros
    } else if (apenasNumeros.length <= 5) {
      return apenasNumeros.replace(/(\d{2})(\d{0,3})/, "$1.$2")
    } else if (apenasNumeros.length <= 8) {
      return apenasNumeros.replace(/(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3")
    } else if (apenasNumeros.length <= 12) {
      return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, "$1.$2.$3/$4")
    } else {
      return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, "$1.$2.$3/$4-$5")
    }
  }

  function handleChange(e) {
    const { name, value } = e.target

    if (name === "cnpj") {
      const cnpjFormatado = formatarCNPJ(value)
      setFormData((prev) => ({ ...prev, [name]: cnpjFormatado }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  function handleSenhaChange(e) {
    const { name, value } = e.target
    setSenhaData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmitPerfil(e) {
    e.preventDefault()
    setErro("")
    setSucesso("")
    setCarregando(true)

    try {
      const dados = {
        ...formData,
        cnpj: formData.cnpj ? formData.cnpj.replace(/\D/g, "") : "",
      }

      await api.put("/api/empresa/perfil", dados)
      setSucesso("Perfil atualizado com sucesso!")
      aoAtualizarDados()
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      setErro(error.response?.data?.erro || "Erro ao atualizar perfil")
    } finally {
      setCarregando(false)
    }
  }

  async function handleSubmitSenha(e) {
    e.preventDefault()
    setErro("")
    setSucesso("")

    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      setErro("As senhas não coincidem")
      return
    }

    if (senhaData.novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres")
      return
    }

    setCarregandoSenha(true)

    try {
      await api.put("/api/empresa/senha", {
        senhaAtual: senhaData.senhaAtual,
        novaSenha: senhaData.novaSenha,
      })

      setSucesso("Senha alterada com sucesso!")
      setSenhaData({ senhaAtual: "", novaSenha: "", confirmarSenha: "" })
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      setErro(error.response?.data?.erro || "Erro ao alterar senha")
    } finally {
      setCarregandoSenha(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Configurações da Empresa</h2>

      {/* Mensagens de Feedback */}
      {erro && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{erro}</div>}

      {sucesso && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{sucesso}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados da Empresa */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados da Empresa</h3>

          <form onSubmit={handleSubmitPerfil} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
              <input
                type="text"
                name="nome_empresa"
                value={formData.nome_empresa}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
                placeholder="00.000.000/0000-00"
                maxLength="18"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
              <input
                type="text"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-[#4caf50] hover:bg-[#45a049] text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {carregando ? "Salvando..." : "Salvar Alterações"}
            </button>
          </form>
        </div>

        {/* Alterar Senha */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alterar Senha</h3>

          <form onSubmit={handleSubmitSenha} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
              <input
                type="password"
                name="senhaAtual"
                value={senhaData.senhaAtual}
                onChange={handleSenhaChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
                autoComplete="current-password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
              <input
                type="password"
                name="novaSenha"
                value={senhaData.novaSenha}
                onChange={handleSenhaChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                name="confirmarSenha"
                value={senhaData.confirmarSenha}
                onChange={handleSenhaChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
                placeholder="Digite a nova senha novamente"
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={carregandoSenha}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
            >
              {carregandoSenha ? "Alterando..." : "Alterar Senha"}
            </button>
          </form>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações do Sistema</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-medium text-gray-700">Versão do Sistema</p>
            <p className="text-gray-600">Pocket Estoque v2.0.0</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="font-medium text-gray-700">Último Backup</p>
            <p className="text-gray-600">Automático diário</p>
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <p className="font-medium text-gray-700">Suporte</p>
            <p className="text-gray-600">suporte@pocketestoque.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
