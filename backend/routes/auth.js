const express = require("express")
const AuthController = require("../controllers/authController")
const { autenticar } = require("../middlewares/autenticar")

const router = express.Router()

// Log para debug
router.use((req, res, next) => {
  console.log(`🔍 Auth Route: ${req.method} ${req.path}`)
  next()
})

// Rotas públicas (sem autenticação)
router.post("/cadastrar-empresa", AuthController.cadastrarEmpresa)
router.post("/cadastrar-funcionario", AuthController.cadastrarFuncionario)
router.post("/login-empresa", AuthController.loginEmpresa)
router.post("/login-funcionario", AuthController.loginFuncionario)

// Rotas protegidas (com autenticação)
router.get("/usuarios", autenticar, AuthController.listarUsuarios)
router.put("/usuarios/:id/status", autenticar, AuthController.alterarStatusFuncionario)

// Log das rotas registradas
console.log("📋 Rotas de autenticação registradas:")
console.log("  POST /cadastrar-empresa")
console.log("  POST /cadastrar-funcionario")
console.log("  POST /login-empresa")
console.log("  POST /login-funcionario")
console.log("  GET /usuarios")
console.log("  PUT /usuarios/:id/status")

module.exports = router
