const express = require("express")
const cors = require("cors")
require("dotenv").config()

// Importar rotas
const authRoutes = require("./routes/auth")
const produtoRoutes = require("./routes/produtos")
const depositoRoutes = require("./routes/depositos")
const empresaRoutes = require("./routes/empresa")

const app = express()

// Middlewares globais
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3002", "http://localhost:3003"],
    credentials: true,
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Middleware de log detalhado
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body:", req.body)
  }
  next()
})

// Rotas da API (ordem importante!)
app.use("/api/auth", authRoutes)
app.use("/api/empresa", empresaRoutes)
app.use("/produtos", produtoRoutes)
app.use("/depositos", depositoRoutes)

// Rota de teste
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "API Pocket Estoque funcionando!",
    version: "2.0.0",
    routes: {
      auth: "/api/auth",
      empresa: "/api/empresa",
      produtos: "/produtos",
      depositos: "/depositos",
    },
  })
})

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err)
  res.status(500).json({
    erro: "Erro interno do servidor",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// Rota 404 (deve ser a ÚLTIMA)
app.use("*", (req, res) => {
  console.log(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`)
  res.status(404).json({ erro: "Rota não encontrada" })
})

module.exports = app
