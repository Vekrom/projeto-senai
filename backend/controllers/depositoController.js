const conexao = require("../config/database")

class DepositoController {
  // Listar depósitos da empresa
  static async listar(req, res) {
    try {
      const { empresa_id } = req.usuario

      const sql = `
        SELECT 
          d.*,
          COUNT(e.id) as total_produtos,
          COALESCE(SUM(e.quantidade), 0) as total_itens
        FROM depositos d
        LEFT JOIN estoque e ON d.id = e.deposito_id
        WHERE d.empresa_id = ? AND d.status = 'ativo'
        GROUP BY d.id
        ORDER BY d.nome
      `

      const [depositos] = await conexao.query(sql, [empresa_id])
      res.json(depositos)
    } catch (error) {
      console.error("Erro ao listar depósitos:", error)
      res.status(500).json({ erro: "Erro ao buscar depósitos" })
    }
  }

  // Criar depósito
  static async criar(req, res) {
    try {
      const { empresa_id } = req.usuario
      const { nome, descricao, endereco } = req.body

      if (!nome) {
        return res.status(400).json({ erro: "Nome é obrigatório" })
      }

      // Verificar se já existe depósito com mesmo nome na empresa
      const [depositoExiste] = await conexao.query(
        "SELECT id FROM depositos WHERE empresa_id = ? AND nome = ? AND status = ?",
        [empresa_id, nome, "ativo"],
      )

      if (depositoExiste.length > 0) {
        return res.status(400).json({ erro: "Já existe um depósito com este nome" })
      }

      const [resultado] = await conexao.query(
        "INSERT INTO depositos (empresa_id, nome, descricao, endereco, status) VALUES (?, ?, ?, ?, ?)",
        [empresa_id, nome, descricao, endereco, "ativo"],
      )

      res.status(201).json({
        mensagem: "Depósito criado com sucesso",
        id: resultado.insertId,
      })
    } catch (error) {
      console.error("Erro ao criar depósito:", error)
      res.status(500).json({ erro: "Erro ao criar depósito" })
    }
  }

  // Atualizar depósito
  static async atualizar(req, res) {
    try {
      const { id } = req.params
      const { empresa_id } = req.usuario
      const { nome, descricao, endereco } = req.body

      if (!nome) {
        return res.status(400).json({ erro: "Nome é obrigatório" })
      }

      // Verificar se depósito pertence à empresa
      const [deposito] = await conexao.query("SELECT id FROM depositos WHERE id = ? AND empresa_id = ?", [
        id,
        empresa_id,
      ])

      if (deposito.length === 0) {
        return res.status(404).json({ erro: "Depósito não encontrado" })
      }

      // Verificar se já existe outro depósito com mesmo nome na empresa
      const [depositoExiste] = await conexao.query(
        "SELECT id FROM depositos WHERE empresa_id = ? AND nome = ? AND id != ? AND status = ?",
        [empresa_id, nome, id, "ativo"],
      )

      if (depositoExiste.length > 0) {
        return res.status(400).json({ erro: "Já existe um depósito com este nome" })
      }

      await conexao.query("UPDATE depositos SET nome = ?, descricao = ?, endereco = ? WHERE id = ?", [
        nome,
        descricao,
        endereco,
        id,
      ])

      res.json({ mensagem: "Depósito atualizado com sucesso" })
    } catch (error) {
      console.error("Erro ao atualizar depósito:", error)
      res.status(500).json({ erro: "Erro ao atualizar depósito" })
    }
  }

  // Excluir depósito
  static async excluir(req, res) {
    try {
      const { id } = req.params
      const { empresa_id } = req.usuario

      // Verificar se depósito pertence à empresa
      const [deposito] = await conexao.query("SELECT id FROM depositos WHERE id = ? AND empresa_id = ?", [
        id,
        empresa_id,
      ])

      if (deposito.length === 0) {
        return res.status(404).json({ erro: "Depósito não encontrado" })
      }

      // Verificar se há produtos no depósito
      const [produtosNoDeposito] = await conexao.query(
        "SELECT COUNT(*) as total FROM estoque WHERE deposito_id = ? AND quantidade > 0",
        [id],
      )

      if (produtosNoDeposito[0].total > 0) {
        return res.status(400).json({
          erro: "Não é possível excluir depósito com produtos em estoque",
        })
      }

      // Marcar como inativo em vez de deletar
      await conexao.query("UPDATE depositos SET status = ? WHERE id = ?", ["inativo", id])

      res.json({ mensagem: "Depósito deletado com sucesso" })
    } catch (error) {
      console.error("Erro ao deletar depósito:", error)
      res.status(500).json({ erro: "Erro ao deletar depósito" })
    }
  }
}

module.exports = DepositoController
