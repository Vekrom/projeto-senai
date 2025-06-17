const express = require("express")
const ProdutoController = require("../controllers/produtoController")
const { autenticar } = require("../middlewares/autenticar")

const router = express.Router()

// Todas as rotas precisam de autenticação
router.use(autenticar)

// Rotas de relatórios (devem vir antes das rotas com parâmetros)
router.get("/estoque-baixo", ProdutoController.estoqueBaixo)
router.get("/validade-proxima", ProdutoController.validadeProxima)

// Rotas CRUD
router.get("/", ProdutoController.listar)
router.get("/:deposito_id", ProdutoController.listar)
router.post("/", ProdutoController.cadastrar)
router.put("/:id", ProdutoController.atualizar)
router.delete("/:id", ProdutoController.excluir)

module.exports = router
