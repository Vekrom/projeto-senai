"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../axiosConfig"

export default function CadastroEmpresa({ aoVoltar }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    usuario: "",
    senha: "",
    confirmarSenha: "",
    nome_empresa: "",
    cnpj: "",
    email: "",
  })
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [carregando, setCarregando] = useState(false)

  // Função para formatar CNPJ
  function formatarCNPJ(valor) {
    // Remove tudo que não é dígito
    const apenasNumeros = valor.replace(/\D/g, "")

    // Aplica a máscara: 00.000.000/0000-00
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
      // Aplica a máscara do CNPJ
      const cnpjFormatado = formatarCNPJ(value)
      setFormData({
        ...formData,
        [name]: cnpjFormatado,
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro("")
    setSucesso("")

    if (formData.senha !== formData.confirmarSenha) {
      setErro("As senhas não coincidem")
      return
    }

    if (formData.senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres")
      return
    }

    // Validar CNPJ se foi preenchido
    if (formData.cnpj && formData.cnpj.replace(/\D/g, "").length !== 14) {
      setErro("CNPJ deve ter 14 dígitos")
      return
    }

    setCarregando(true)

    try {
      // Remove a formatação do CNPJ antes de enviar
      const dadosParaEnvio = {
        usuario: formData.usuario,
        senha: formData.senha,
        nome_empresa: formData.nome_empresa,
        cnpj: formData.cnpj ? formData.cnpj.replace(/\D/g, "") : "", // Remove pontos e barras
        email: formData.email,
      }

      await api.post("/cadastrar-empresa", dadosParaEnvio)

      setSucesso("Empresa cadastrada com sucesso! Redirecionando...")

      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error) {
      console.error("Erro no cadastro:", error)

      // Melhor tratamento de erros
      if (error.code === "ERR_NETWORK") {
        setErro("Erro de conexão. Verifique se o servidor está rodando.")
      } else {
        setErro(error.response?.data?.erro || "Erro ao cadastrar empresa")
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#004d40] via-[#00695c] to-[#004d40] py-8 px-4">
      <div className="bg-[#003d33]/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#00796b]/30 max-h-[90vh] overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-white text-center">Cadastro Empresa 🏢</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 font-medium mb-1">Nome da Empresa *</label>
            <input
              type="text"
              name="nome_empresa"
              value={formData.nome_empresa}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-[#00796b]/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
              placeholder="Nome da sua empresa"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">CNPJ (opcional)</label>
            <input
              type="text"
              name="cnpj"
              value={formData.cnpj}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-[#00796b]/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
              placeholder="00.000.000/0000-00"
              maxLength="18" // Máximo com formatação
            />
            <p className="text-xs text-gray-400 mt-1">Formato: 00.000.000/0000-00</p>
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-[#00796b]/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
              placeholder="email@empresa.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Usuário *</label>
            <input
              type="text"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-[#00796b]/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
              placeholder="Escolha um nome de usuário"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Senha *</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-[#00796b]/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 font-medium mb-1">Confirmar Senha *</label>
            <input
              type="password"
              name="confirmarSenha"
              value={formData.confirmarSenha}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-[#00796b]/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4caf50]"
              placeholder="Digite a senha novamente"
              required
            />
          </div>

          {erro && (
            <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded text-sm">{erro}</div>
          )}

          {sucesso && (
            <div className="bg-green-900/50 border border-green-500 text-white px-4 py-3 rounded text-sm">
              {sucesso}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={aoVoltar}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg shadow transition"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="flex-1 bg-[#00796b] hover:bg-[#00897b] text-white font-medium py-3 px-6 rounded-lg shadow transition disabled:opacity-50"
            >
              {carregando ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
