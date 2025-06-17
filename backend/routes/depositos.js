const express = require("express")
const DepositoController = require("../controllers/depositoController")
const { autenticar } = require("../middlewares/autenticar")

const router = express.Router()

// Todas as rotas precisam de autenticação
router.use(autenticar)

router.get("/", DepositoController.listar)
router.post("/", DepositoController.criar)
router.put("/:id", DepositoController.atualizar)
router.delete("/:id", DepositoController.excluir)

module.exports = router
