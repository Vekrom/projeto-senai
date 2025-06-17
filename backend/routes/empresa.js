const express = require("express")
const EmpresaController = require("../controllers/empresaController")
const { autenticarEmpresa } = require("../middlewares/autenticar")

const router = express.Router()

// Todas as rotas precisam de autenticação de empresa
router.use(autenticarEmpresa)

router.get("/perfil", EmpresaController.buscarPerfil)
router.put("/perfil", EmpresaController.atualizarPerfil)
router.put("/senha", EmpresaController.alterarSenha)

module.exports = router
