const jwt = require("jsonwebtoken")

const autenticar = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ erro: "Token não fornecido" })
  }

  const token = authHeader.replace("Bearer ", "")

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    // Adiciona informações do usuário ao request
    req.usuario = {
      id: payload.id,
      tipo: payload.tipo,
      empresa_id: payload.empresa_id,
      usuario: payload.usuario,
    }

    // Compatibilidade com código antigo
    req.empresa_id = payload.empresa_id
    req.user_id = payload.id
    req.tipo = payload.tipo

    next()
  } catch (err) {
    console.error("Erro ao verificar token:", err.message)
    return res.status(401).json({ erro: "Token inválido" })
  }
}

const autenticarEmpresa = (req, res, next) => {
  autenticar(req, res, () => {
    if (req.usuario.tipo !== "empresa") {
      return res.status(403).json({ erro: "Acesso negado. Apenas empresas." })
    }
    next()
  })
}

const autenticarFuncionario = (req, res, next) => {
  autenticar(req, res, () => {
    if (req.usuario.tipo !== "funcionario") {
      return res.status(403).json({ erro: "Acesso negado. Apenas funcionários." })
    }
    next()
  })
}

module.exports = { autenticar, autenticarEmpresa, autenticarFuncionario }
