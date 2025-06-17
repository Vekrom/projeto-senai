"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api, { setAuthToken } from "../../axiosConfig"

export default function LoginFuncionario({ aoLogar }) {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState("")
  const [carregando, setCarregando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro("")
    setCarregando(true)

    try {
      console.log("Tentando login funcionário com:", { usuario })

      const response = await api.post("/api/auth/login-funcionario", {
        usuario,
        senha,
      })

      console.log("Resposta do login:", response.data)

      const { token, tipo } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("tipo", tipo)
      setAuthToken(token)
      aoLogar()
      navigate("/dashboard-funcionario")
    } catch (error) {
      console.error("Erro no login:", error)
      setErro(error.response?.data?.erro || "Erro ao fazer login")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-green-800 text-center">Login Funcionário 👨‍💼</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-green-900 font-semibold mb-2">Usuário</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 bg-white"
            placeholder="Digite seu usuário"
            required
          />
        </div>

        <div>
          <label className="block text-green-900 font-semibold mb-2">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 bg-white"
            placeholder="Digite sua senha"
            required
          />
        </div>

        {erro && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{erro}</div>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-gradient-to-r from-green-700 via-green-600 to-green-500 hover:from-green-800 hover:to-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition disabled:opacity-50"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </>
  )
}
