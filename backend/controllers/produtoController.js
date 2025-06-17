const conexao = require("../config/database")

class ProdutoController {
  // Listar produtos da empresa (adaptado para nova estrutura)
  static async listar(req, res) {
    try {
      const { empresa_id } = req.usuario
      const { deposito_id } = req.params

      let sql, params

      if (deposito_id) {
        // Listar produtos de um depósito específico
        sql = `
          SELECT 
            p.*,
            c.nome as categoria_nome,
            COALESCE(e.quantidade, 0) as quantidade,
            COALESCE(e.quantidade_reservada, 0) as quantidade_reservada,
            d.nome as deposito_nome
          FROM produtos p
          LEFT JOIN categorias c ON p.categoria_id = c.id
          LEFT JOIN estoque e ON p.id = e.produto_id AND e.deposito_id = ?
          LEFT JOIN depositos d ON e.deposito_id = d.id
          WHERE p.empresa_id = ? AND p.status = 'ativo'
          ORDER BY p.nome
        `
        params = [deposito_id, empresa_id]
      } else {
        // Listar todos os produtos da empresa
        sql = `
          SELECT 
            p.*,
            c.nome as categoria_nome,
            COALESCE(SUM(e.quantidade), 0) as quantidade_total,
            COALESCE(SUM(e.quantidade_reservada), 0) as quantidade_reservada_total
          FROM produtos p
          LEFT JOIN categorias c ON p.categoria_id = c.id
          LEFT JOIN estoque e ON p.id = e.produto_id
          WHERE p.empresa_id = ? AND p.status = 'ativo'
          GROUP BY p.id
          ORDER BY p.nome
        `
        params = [empresa_id]
      }

      const [produtos] = await conexao.query(sql, params)
      res.json(produtos)
    } catch (error) {
      console.error("Erro ao listar produtos:", error)
      res.status(500).json({ erro: "Erro ao buscar produtos" })
    }
  }

  // Cadastrar produto (adaptado para nova estrutura)
  static async cadastrar(req, res) {
    const connection = await conexao.getConnection()

    try {
      await connection.beginTransaction()

      const { empresa_id } = req.usuario
      const {
        codigo,
        nome,
        descricao,
        categoria_id,
        unidade_medida,
        preco_custo,
        preco,
        estoque_min,
        validade,
        deposito_id,
        quantidade,
      } = req.body

      if (!nome || !deposito_id) {
        return res.status(400).json({ erro: "Nome e depósito são obrigatórios" })
      }

      // Verificar se depósito pertence à empresa
      const [deposito] = await connection.query("SELECT id FROM depositos WHERE id = ? AND empresa_id = ?", [
        deposito_id,
        empresa_id,
      ])

      if (deposito.length === 0) {
        return res.status(404).json({ erro: "Depósito não encontrado" })
      }

      // Verificar se código já existe na empresa
      if (codigo) {
        const [codigoExiste] = await connection.query("SELECT id FROM produtos WHERE empresa_id = ? AND codigo = ?", [
          empresa_id,
          codigo,
        ])

        if (codigoExiste.length > 0) {
          return res.status(400).json({ erro: "Código do produto já existe" })
        }
      }

      // Inserir produto
      const [produtoResult] = await connection.query(
        `INSERT INTO produtos 
         (empresa_id, categoria_id, codigo, nome, descricao, unidade_medida, 
          preco_custo, preco_venda, estoque_minimo, validade, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ativo')`,
        [
          empresa_id,
          categoria_id,
          codigo,
          nome,
          descricao,
          unidade_medida || "UN",
          preco_custo,
          preco || preco_custo,
          estoque_min || 0,
          validade || null,
        ],
      )

      const produto_id = produtoResult.insertId

      // Inserir estoque inicial se quantidade > 0
      const quantidadeInicial = Number.parseInt(quantidade) || 0
      if (quantidadeInicial > 0) {
        await connection.query("INSERT INTO estoque (produto_id, deposito_id, quantidade) VALUES (?, ?, ?)", [
          produto_id,
          deposito_id,
          quantidadeInicial,
        ])

        // Registrar movimentação inicial
        await connection.query(
          `INSERT INTO movimentacoes 
           (produto_id, deposito_id, usuario_id, tipo, quantidade, quantidade_anterior, quantidade_atual, motivo)
           VALUES (?, ?, ?, 'entrada', ?, 0, ?, 'Estoque inicial')`,
          [produto_id, deposito_id, req.usuario.id, quantidadeInicial, quantidadeInicial],
        )
      }

      await connection.commit()

      res.status(201).json({
        mensagem: "Produto criado com sucesso",
        id: produto_id,
      })
    } catch (error) {
      await connection.rollback()
      console.error("Erro ao criar produto:", error)
      res.status(500).json({ erro: "Erro ao criar produto" })
    } finally {
      connection.release()
    }
  }

  // Atualizar produto (adaptado para nova estrutura)
  static async atualizar(req, res) {
    const connection = await conexao.getConnection()

    try {
      await connection.beginTransaction()

      const { id } = req.params
      const { empresa_id } = req.usuario
      const { nome, quantidade, preco, validade, estoque_min, deposito_id } = req.body

      if (!nome) {
        return res.status(400).json({ erro: "Nome é obrigatório" })
      }

      // Verificar se produto pertence à empresa
      const [produto] = await connection.query("SELECT id FROM produtos WHERE id = ? AND empresa_id = ?", [
        id,
        empresa_id,
      ])

      if (produto.length === 0) {
        return res.status(404).json({ erro: "Produto não encontrado" })
      }

      // Atualizar dados do produto
      await connection.query(
        `UPDATE produtos 
         SET nome = ?, preco_venda = ?, validade = ?, estoque_minimo = ?
         WHERE id = ?`,
        [nome, preco, validade, estoque_min, id],
      )

      // Se quantidade foi fornecida, atualizar estoque
      if (quantidade !== undefined && deposito_id) {
        const quantidadeNova = Number.parseInt(quantidade)

        // Buscar estoque atual
        const [estoqueAtual] = await connection.query(
          "SELECT quantidade FROM estoque WHERE produto_id = ? AND deposito_id = ?",
          [id, deposito_id],
        )

        if (estoqueAtual.length > 0) {
          const quantidadeAnterior = estoqueAtual[0].quantidade

          // Atualizar estoque
          await connection.query("UPDATE estoque SET quantidade = ? WHERE produto_id = ? AND deposito_id = ?", [
            quantidadeNova,
            id,
            deposito_id,
          ])

          // Registrar movimentação
          await connection.query(
            `INSERT INTO movimentacoes 
             (produto_id, deposito_id, usuario_id, tipo, quantidade, quantidade_anterior, quantidade_atual, motivo)
             VALUES (?, ?, ?, 'ajuste', ?, ?, ?, 'Ajuste via edição')`,
            [
              id,
              deposito_id,
              req.usuario.id,
              Math.abs(quantidadeNova - quantidadeAnterior),
              quantidadeAnterior,
              quantidadeNova,
            ],
          )
        } else {
          // Criar novo registro de estoque
          await connection.query("INSERT INTO estoque (produto_id, deposito_id, quantidade) VALUES (?, ?, ?)", [
            id,
            deposito_id,
            quantidadeNova,
          ])

          // Registrar movimentação
          await connection.query(
            `INSERT INTO movimentacoes 
             (produto_id, deposito_id, usuario_id, tipo, quantidade, quantidade_anterior, quantidade_atual, motivo)
             VALUES (?, ?, ?, 'entrada', ?, 0, ?, 'Estoque inicial via edição')`,
            [id, deposito_id, req.usuario.id, quantidadeNova, quantidadeNova],
          )
        }
      }

      await connection.commit()

      res.json({ mensagem: "Produto atualizado com sucesso" })
    } catch (error) {
      await connection.rollback()
      console.error("Erro ao atualizar produto:", error)
      res.status(500).json({ erro: "Erro ao atualizar produto" })
    } finally {
      connection.release()
    }
  }

  // Excluir produto
  static async excluir(req, res) {
    try {
      const { id } = req.params
      const { empresa_id } = req.usuario

      // Verificar se produto pertence à empresa
      const [produto] = await conexao.query("SELECT id FROM produtos WHERE id = ? AND empresa_id = ?", [id, empresa_id])

      if (produto.length === 0) {
        return res.status(404).json({ erro: "Produto não encontrado" })
      }

      // Marcar como inativo em vez de deletar
      await conexao.query("UPDATE produtos SET status = ? WHERE id = ?", ["inativo", id])

      res.json({ mensagem: "Produto deletado com sucesso" })
    } catch (error) {
      console.error("Erro ao deletar produto:", error)
      res.status(500).json({ erro: "Erro ao deletar produto" })
    }
  }

  // Produtos com estoque baixo
  static async estoqueBaixo(req, res) {
    try {
      const { empresa_id } = req.usuario

      const sql = `
        SELECT 
          p.id,
          p.nome,
          p.estoque_minimo as estoque_min,
          e.quantidade,
          d.nome AS deposito_nome
        FROM produtos p
        JOIN estoque e ON p.id = e.produto_id
        JOIN depositos d ON e.deposito_id = d.id
        WHERE p.empresa_id = ? 
          AND p.status = 'ativo'
          AND e.quantidade <= p.estoque_minimo
        ORDER BY e.quantidade ASC
      `

      const [produtos] = await conexao.query(sql, [empresa_id])
      res.json(produtos)
    } catch (error) {
      console.error("Erro ao buscar produtos com estoque baixo:", error)
      res.status(500).json({ erro: "Erro ao buscar produtos com estoque baixo" })
    }
  }

  // Produtos com validade próxima
  static async validadeProxima(req, res) {
    try {
      const { empresa_id } = req.usuario

      const sql = `
        SELECT 
          p.id,
          p.nome,
          p.validade,
          e.quantidade,
          d.nome AS deposito_nome,
          DATEDIFF(p.validade, CURDATE()) AS dias_restantes
        FROM produtos p
        JOIN estoque e ON p.id = e.produto_id
        JOIN depositos d ON e.deposito_id = d.id
        WHERE p.empresa_id = ? 
          AND p.status = 'ativo'
          AND p.validade IS NOT NULL
          AND DATEDIFF(p.validade, CURDATE()) BETWEEN 0 AND 60
        ORDER BY p.validade ASC
      `

      const [produtos] = await conexao.query(sql, [empresa_id])
      res.json(produtos)
    } catch (error) {
      console.error("Erro ao buscar produtos com validade próxima:", error)
      res.status(500).json({ erro: "Erro ao buscar produtos com validade próxima" })
    }
  }
}

module.exports = ProdutoController
