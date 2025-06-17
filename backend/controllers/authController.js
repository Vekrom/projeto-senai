const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const conexao = require("../config/database")

class AuthController {
  // Cadastro de Empresa
  static async cadastrarEmpresa(req, res) {
    const connection = await conexao.getConnection()

    try {
      await connection.beginTransaction()

      const { usuario, senha, nome_empresa, cnpj, email } = req.body

      if (!usuario || !senha) {
        return res.status(400).json({ erro: "Usuário e senha são obrigatórios" })
      }

      // Verificar se usuário já existe
      const [usuarioExiste] = await connection.query("SELECT id FROM usuarios WHERE usuario = ?", [usuario])

      if (usuarioExiste.length > 0) {
        return res.status(409).json({ erro: "Usuário já existe" })
      }

      // Criar empresa
      const [empresaResult] = await connection.query(
        "INSERT INTO empresas (nome, cnpj, email, status) VALUES (?, ?, ?, ?)",
        [nome_empresa || `Empresa de ${usuario}`, cnpj, email, "ativo"],
      )

      const empresa_id = empresaResult.insertId

      // Criar usuário empresa
      const senhaHash = await bcrypt.hash(senha, 10)
      await connection.query(
        `INSERT INTO usuarios (empresa_id, usuario, senha_hash, nome_completo, email, tipo, status) 
         VALUES (?, ?, ?, ?, ?, 'empresa', 'aprovado')`,
        [empresa_id, usuario, senhaHash, nome_empresa, email],
      )

      // Criar depósito padrão
      await connection.query("INSERT INTO depositos (empresa_id, nome, descricao, status) VALUES (?, ?, ?, ?)", [
        empresa_id,
        "Depósito Principal",
        "Depósito padrão da empresa",
        "ativo",
      ])

      // Criar categoria padrão
      await connection.query("INSERT INTO categorias (empresa_id, nome, descricao) VALUES (?, ?, ?)", [
        empresa_id,
        "Geral",
        "Categoria padrão para produtos",
      ])

      await connection.commit()

      res.status(201).json({
        mensagem: "Empresa cadastrada com sucesso!",
        empresa_id,
      })
    } catch (err) {
      await connection.rollback()
      console.error("Erro no cadastro da empresa:", err)

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ erro: "Usuário já existe" })
      }

      res.status(500).json({ erro: "Erro ao cadastrar empresa" })
    } finally {
      connection.release()
    }
  }

  // Cadastro de Funcionário
  static async cadastrarFuncionario(req, res) {
    try {
      const { usuario, senha, empresa_id } = req.body

      if (!usuario || !senha) {
        return res.status(400).json({ erro: "Usuário e senha são obrigatórios" })
      }

      // Verificar se usuário já existe
      const [usuarioExiste] = await conexao.query("SELECT id FROM usuarios WHERE usuario = ?", [usuario])

      if (usuarioExiste.length > 0) {
        return res.status(409).json({ erro: "Usuário já existe" })
      }

      // Verificar se empresa existe (se empresa_id foi fornecido)
      let empresaFinal = empresa_id
      if (empresa_id) {
        const [empresaExiste] = await conexao.query("SELECT id FROM empresas WHERE id = ?", [empresa_id])

        if (empresaExiste.length === 0) {
          return res.status(404).json({ erro: "Empresa não encontrada" })
        }
      } else {
        // Se não forneceu empresa_id, usar empresa padrão (ID 1)
        empresaFinal = 1
      }

      const senhaHash = await bcrypt.hash(senha, 10)

      await conexao.query(
        `INSERT INTO usuarios (empresa_id, usuario, senha_hash, tipo, status) 
         VALUES (?, ?, ?, 'funcionario', 'pendente')`,
        [empresaFinal, usuario, senhaHash],
      )

      res.status(201).json({ mensagem: "Funcionário cadastrado com sucesso" })
    } catch (err) {
      console.error("Erro no cadastro do funcionário:", err)

      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ erro: "Usuário já existe" })
      }

      res.status(500).json({ erro: "Erro ao cadastrar funcionário" })
    }
  }

  // Login de Empresa
  static async loginEmpresa(req, res) {
    try {
      const { usuario, senha } = req.body

      if (!usuario || !senha) {
        return res.status(400).json({ erro: "Usuário e senha são obrigatórios" })
      }

      const sql = `
        SELECT u.*, e.nome as empresa_nome, e.cnpj, e.email as empresa_email
        FROM usuarios u
        JOIN empresas e ON u.empresa_id = e.id
        WHERE u.usuario = ? AND u.tipo = 'empresa' AND u.status = 'aprovado'
      `

      const [rows] = await conexao.query(sql, [usuario])

      if (rows.length === 0) {
        return res.status(401).json({ erro: "Usuário não encontrado ou não aprovado" })
      }

      const user = rows[0]
      const senhaValida = await bcrypt.compare(senha, user.senha_hash)

      if (!senhaValida) {
        return res.status(401).json({ erro: "Senha incorreta" })
      }

      // Atualizar último login
      await conexao.query("UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?", [user.id])

      const token = jwt.sign(
        {
          id: user.id,
          usuario: user.usuario,
          tipo: user.tipo,
          empresa_id: user.empresa_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      res.json({
        token,
        tipo: "empresa",
        usuario: user.usuario,
        empresa_id: user.empresa_id,
        empresa_nome: user.empresa_nome,
      })
    } catch (err) {
      console.error("Erro no login empresa:", err)
      res.status(500).json({ erro: "Erro interno no login" })
    }
  }

  // Login de Funcionário
  static async loginFuncionario(req, res) {
    try {
      const { usuario, senha } = req.body

      if (!usuario || !senha) {
        return res.status(400).json({ erro: "Usuário e senha são obrigatórios" })
      }

      const sql = `
        SELECT u.*, e.nome as empresa_nome
        FROM usuarios u
        JOIN empresas e ON u.empresa_id = e.id
        WHERE u.usuario = ? AND u.tipo = 'funcionario'
      `

      const [rows] = await conexao.query(sql, [usuario])

      if (rows.length === 0) {
        return res.status(401).json({ erro: "Usuário não encontrado" })
      }

      const user = rows[0]
      const senhaValida = await bcrypt.compare(senha, user.senha_hash)

      if (!senhaValida) {
        return res.status(401).json({ erro: "Senha incorreta" })
      }

      // Atualizar último login
      await conexao.query("UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?", [user.id])

      const token = jwt.sign(
        {
          id: user.id,
          usuario: user.usuario,
          tipo: user.tipo,
          empresa_id: user.empresa_id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      res.json({
        token,
        tipo: "funcionario",
        usuario: user.usuario,
        empresa_id: user.empresa_id,
        empresa_nome: user.empresa_nome,
        status: user.status,
      })
    } catch (err) {
      console.error("Erro no login funcionário:", err)
      res.status(500).json({ erro: "Erro interno no login" })
    }
  }

  // Listar usuários da empresa
  static async listarUsuarios(req, res) {
    try {
      const { empresa_id } = req.usuario

      const sql = `
        SELECT id, usuario, nome_completo, tipo, status, ultimo_login, created_at
        FROM usuarios
        WHERE empresa_id = ? AND tipo = 'funcionario'
        ORDER BY created_at DESC
      `

      const [usuarios] = await conexao.query(sql, [empresa_id])
      res.json(usuarios)
    } catch (err) {
      console.error("Erro ao buscar usuários:", err)
      res.status(500).json({ erro: "Erro ao buscar usuários" })
    }
  }

  // Alterar status do funcionário
  static async alterarStatusFuncionario(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body
      const { empresa_id } = req.usuario

      // Verificar se o status é válido
      const statusValidos = ["aprovado", "pendente", "bloqueado"]
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ erro: "Status inválido" })
      }

      // Verificar se o funcionário existe e pertence à empresa
      const [funcionario] = await conexao.query(
        "SELECT id FROM usuarios WHERE id = ? AND empresa_id = ? AND tipo = 'funcionario'",
        [id, empresa_id],
      )

      if (funcionario.length === 0) {
        return res.status(404).json({ erro: "Funcionário não encontrado" })
      }

      // Atualizar o status
      await conexao.query("UPDATE usuarios SET status = ? WHERE id = ?", [status, id])

      res.json({ mensagem: "Status do funcionário atualizado com sucesso" })
    } catch (err) {
      console.error("Erro ao alterar status do funcionário:", err)
      res.status(500).json({ erro: "Erro ao alterar status do funcionário" })
    }
  }
}

module.exports = AuthController
