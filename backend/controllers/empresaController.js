const conexao = require("../config/database")
const bcrypt = require("bcryptjs")

class EmpresaController {
  // Buscar perfil da empresa
  static async buscarPerfil(req, res) {
    try {
      const { empresa_id } = req.usuario

      const sql = `
        SELECT 
          e.id as empresa_id,
          e.nome as empresa_nome,
          e.cnpj,
          e.email as empresa_email,
          e.status,
          u.usuario,
          u.nome_completo,
          u.email as usuario_email
        FROM empresas e
        JOIN usuarios u ON e.id = u.empresa_id
        WHERE e.id = ? AND u.tipo = 'empresa'
        LIMIT 1
      `

      const [rows] = await conexao.query(sql, [empresa_id])

      if (rows.length === 0) {
        return res.status(404).json({ erro: "Empresa não encontrada" })
      }

      const empresa = rows[0]
      res.json(empresa)
    } catch (error) {
      console.error("Erro ao buscar perfil da empresa:", error)
      res.status(500).json({ erro: "Erro ao buscar perfil da empresa" })
    }
  }

  // Atualizar perfil da empresa
  static async atualizarPerfil(req, res) {
    const connection = await conexao.getConnection()

    try {
      await connection.beginTransaction()

      const { empresa_id, id: usuario_id } = req.usuario
      const { nome_empresa, cnpj, email, usuario } = req.body

      if (!nome_empresa || !email || !usuario) {
        return res.status(400).json({ erro: "Nome da empresa, email e usuário são obrigatórios" })
      }

      // Verificar se usuário já existe (exceto o atual)
      const [usuarioExiste] = await connection.query("SELECT id FROM usuarios WHERE usuario = ? AND id != ?", [
        usuario,
        usuario_id,
      ])

      if (usuarioExiste.length > 0) {
        return res.status(400).json({ erro: "Nome de usuário já está em uso" })
      }

      // Atualizar dados da empresa
      await connection.query("UPDATE empresas SET nome = ?, cnpj = ?, email = ? WHERE id = ?", [
        nome_empresa,
        cnpj || null,
        email,
        empresa_id,
      ])

      // Atualizar dados do usuário
      await connection.query("UPDATE usuarios SET usuario = ?, nome_completo = ?, email = ? WHERE id = ?", [
        usuario,
        nome_empresa,
        email,
        usuario_id,
      ])

      await connection.commit()

      res.json({ mensagem: "Perfil atualizado com sucesso" })
    } catch (error) {
      await connection.rollback()
      console.error("Erro ao atualizar perfil:", error)
      res.status(500).json({ erro: "Erro ao atualizar perfil" })
    } finally {
      connection.release()
    }
  }

  // Alterar senha
  static async alterarSenha(req, res) {
    try {
      const { id: usuario_id } = req.usuario
      const { senhaAtual, novaSenha } = req.body

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ erro: "Senha atual e nova senha são obrigatórias" })
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ erro: "A nova senha deve ter pelo menos 6 caracteres" })
      }

      // Buscar senha atual
      const [usuario] = await conexao.query("SELECT senha_hash FROM usuarios WHERE id = ?", [usuario_id])

      if (usuario.length === 0) {
        return res.status(404).json({ erro: "Usuário não encontrado" })
      }

      // Verificar senha atual
      const senhaValida = await bcrypt.compare(senhaAtual, usuario[0].senha_hash)

      if (!senhaValida) {
        return res.status(400).json({ erro: "Senha atual incorreta" })
      }

      // Criptografar nova senha
      const novaSenhaHash = await bcrypt.hash(novaSenha, 10)

      // Atualizar senha
      await conexao.query("UPDATE usuarios SET senha_hash = ? WHERE id = ?", [novaSenhaHash, usuario_id])

      res.json({ mensagem: "Senha alterada com sucesso" })
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      res.status(500).json({ erro: "Erro ao alterar senha" })
    }
  }
}

module.exports = EmpresaController
