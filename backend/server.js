const app = require("./app")

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log("🚀 ===================================")
  console.log(`🚀 Servidor Pocket Estoque rodando!`)
  console.log(`🚀 Porta: ${PORT}`)
  console.log(`🚀 API: http://localhost:${PORT}/api`)
  console.log(`🚀 Health: http://localhost:${PORT}/api/health`)
  console.log(`🚀 Empresa: http://localhost:${PORT}/api/empresa`)
  console.log("🚀 ===================================")
})

// Tratamento de erros não capturados
process.on("uncaughtException", (err) => {
  console.error("Erro não capturado:", err)
  process.exit(1)
})

process.on("unhandledRejection", (err) => {
  console.error("Promise rejeitada não tratada:", err)
  process.exit(1)
})
