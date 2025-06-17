"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api, { setAuthToken } from "../../axiosConfig"

export default function LoginEmpresa({ aoLogar }) {
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
      const response = await api.post("/api/auth/login-empresa", {
        usuario,
        senha,
      })

      const { token, tipo } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("tipo", tipo)
      setAuthToken(token)
      aoLogar()
      navigate("/dashboard-empresa")
    } catch (error) {
      console.error("Erro no login:", error)
      setErro(error.response?.data?.erro || "Erro ao fazer login")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-4 text-blue-800 text-center">Login Empresa 🏢</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-blue-900 font-semibold mb-2">Usuário</label>
          <input
            type="text"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
            placeholder="Digite seu usuário"
            required
          />
        </div>

        <div>
          <label className="block text-blue-900 font-semibold mb-2">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
            placeholder="Digite sua senha"
            required
          />
        </div>

        {erro && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{erro}</div>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-800 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition disabled:opacity-50"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </>
  )
}
