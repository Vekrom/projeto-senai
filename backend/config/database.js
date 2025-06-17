const mysql = require("mysql2/promise")

const conexao = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "estoque",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

})

// Teste de conexão
async function testarConexao() {
  try {
    const conn = await conexao.getConnection()
    console.log("✅ Conectado ao banco de dados com sucesso!")
    conn.release()
  } catch (err) {
    console.error("❌ Erro ao conectar no banco de dados:", err.message)
  }
}

// Executa o teste ao inicializar
testarConexao()

module.exports = conexao
