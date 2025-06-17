"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import TelaLogin from "./componentes/autentificacao/TelaLogin"
import CadastroEmpresa from "./componentes/autentificacao/CadastroEmpresa"
import CadastroFuncionario from "./componentes/autentificacao/CadastroFuncionario"
import DashboardEmpresa from "./componentes/empresa/DashboardEmpresa"
import DashboardFuncionario from "./componentes/funcionario/DashboardFuncionario"
import { setAuthToken } from "./axiosConfig"

function App() {
  const [estaLogado, setEstaLogado] = useState(false)
  const [tipoUsuario, setTipoUsuario] = useState(null)
  const [carregandoAuth, setCarregandoAuth] = useState(true)

  // Verificar se usuário já está logado ao carregar a página
  useEffect(() => {
    const token = localStorage.getItem("token")
    const tipo = localStorage.getItem("tipo")

    if (token && tipo) {
      setAuthToken(token)
      setEstaLogado(true)
      setTipoUsuario(tipo)
    }

    setCarregandoAuth(false)
  }, [])

  // Função para fazer login
  function handleLogin() {
    const tipo = localStorage.getItem("tipo")
    setEstaLogado(true)
    setTipoUsuario(tipo)
  }

  // Função para fazer logout
  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("tipo")
    setEstaLogado(false)
    setTipoUsuario(null)
    setAuthToken(null)
  }

  // Mostrar loading enquanto verifica autenticação
  if (carregandoAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#004d40]">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="App">
        <Routes>
          {/* Rota de Login */}
          <Route
            path="/login"
            element={
              estaLogado ? (
                <Navigate to={tipoUsuario === "empresa" ? "/dashboard-empresa" : "/dashboard-funcionario"} replace />
              ) : (
                <TelaLogin aoLogar={handleLogin} />
              )
            }
          />

          {/* Rotas de Cadastro */}
          <Route
            path="/cadastro-empresa"
            element={
              estaLogado ? (
                <Navigate to="/dashboard-empresa" replace />
              ) : (
                <CadastroEmpresa aoVoltar={() => window.history.back()} />
              )
            }
          />

          <Route
            path="/cadastro-funcionario"
            element={
              estaLogado ? (
                <Navigate to="/dashboard-funcionario" replace />
              ) : (
                <CadastroFuncionario aoVoltar={() => window.history.back()} />
              )
            }
          />

          {/* Dashboard da Empresa */}
          <Route
            path="/dashboard-empresa"
            element={
              estaLogado && tipoUsuario === "empresa" ? (
                <DashboardEmpresa aoDeslogar={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Dashboard do Funcionário */}
          <Route
            path="/dashboard-funcionario"
            element={
              estaLogado && tipoUsuario === "funcionario" ? (
                <DashboardFuncionario aoDeslogar={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Rota padrão - redireciona baseado no estado de login */}
          <Route
            path="/"
            element={
              estaLogado ? (
                <Navigate to={tipoUsuario === "empresa" ? "/dashboard-empresa" : "/dashboard-funcionario"} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Rota 404 - qualquer rota não encontrada vai para login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
