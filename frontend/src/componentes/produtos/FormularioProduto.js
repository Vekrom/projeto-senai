// FormularioProduto.js
// Formulário para adicionar um novo produto ao estoque

import { useState } from 'react';

export default function FormularioProduto({ aoAdicionar }) {
  // Estados para os campos do formulário
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [validade, setValidade] = useState('');
  const [estoqueMin, setEstoqueMin] = useState('');

  // Função executada ao enviar o formulário
  function enviarFormulario(e) {
    e.preventDefault();

    // Validação simples
    if (nome && quantidade) {
      aoAdicionar({
        nome,
        quantidade: parseInt(quantidade),
        preco: parseFloat(preco),
        validade,
        estoque_min: parseInt(estoqueMin),
      });

      // Limpa os campos
      setNome('');
      setQuantidade('');
      setPreco('');
      setValidade('');
      setEstoqueMin('');
    }
  }

  return (
    <form
      onSubmit={enviarFormulario}
      className="max-w-lg mx-auto bg-[#91592A] p-6 rounded-xl shadow-md space-y-4"
    >
      <h1 className="text-2xl font-bold text-white mb-4 text-center">
        Adicionar Produto
      </h1>

      <input
        value={nome}
        onChange={e => setNome(e.target.value)}
        placeholder="Nome do produto"
        className="w-full p-2 border border-gray-300 rounded text-black"
        required
      />

      <input
        value={quantidade}
        onChange={e => setQuantidade(e.target.value)}
        placeholder="Quantidade"
        type="number"
        className="w-full p-2 border border-gray-300 rounded text-black"
        required
      />

      <input
        value={preco}
        onChange={e => setPreco(e.target.value)}
        placeholder="Preço"
        type="number"
        step="0.01"
        className="w-full p-2 border border-gray-300 rounded text-black"
      />

      <input
        value={validade}
        onChange={e => setValidade(e.target.value)}
        placeholder="Validade"
        type="date"
        className="w-full p-2 border border-gray-300 rounded text-black"
      />

      <input
        value={estoqueMin}
        onChange={e => setEstoqueMin(e.target.value)}
        placeholder="Estoque mínimo"
        type="number"
        className="w-full p-2 border border-gray-300 rounded text-black"
      />

      <button
        type="submit"
        className="w-full bg-white text-[#91592A] font-bold p-2 rounded hover:bg-gray-200"
      >
        Adicionar
      </button>
    </form>
  );
}
