import { useEffect, useState } from 'react';
import api from '../../axiosConfig';
import ModalEditarProduto from '../produtos/ModalEditarProduto';
import ModalAdicionarProduto from '../produtos/ModalAdicionarProduto';
import TabelaProduto from '../produtos/TabelaProduto';

export default function TelaDeposito({ depositoId, depositoNome, onVoltar }) {
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false);

  useEffect(() => {
    async function carregarProdutos() {
      try {
        const resposta = await api.get(`/produtos/${depositoId}`);
        setProdutos(resposta.data);
      } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
      }
    }
    carregarProdutos();
  }, [depositoId]);

  const editarProduto = (produto) => {
    setProdutoSelecionado(produto);
    setMostrarModalEditar(true);
  };

  const excluirProduto = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        await api.delete(`/produtos/${id}`);
        const resposta = await api.get(`/produtos/${depositoId}`);
        setProdutos(resposta.data);
      } catch (erro) {
        console.error("Erro ao excluir produto:", erro);
      }
    }
  };

  return (
    <div className="w-full h-full text-white p-4">
      <button
        onClick={onVoltar}
        className="flex items-center gap-2 mb-4 text-[#015D4F] bg-white px-4 py-2 rounded shadow hover:bg-[#e6f4f1] font-semibold transition border border-[#015D4F]"
        title="Voltar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Voltar para  depósitos</span>
      </button>

      <h2 className="text-xl font-semibold mb-4">
        Depósito{depositoNome ? ` - ${depositoNome}` : ""}
      </h2>

      <div className="flex justify-end mb-4">
        <button
          onClick={() => setMostrarModalAdicionar(true)}
          className="bg-white text-[#015D4F] border border-[#015D4F] px-4 py-2 rounded shadow-sm hover:bg-[#f5fdfb] font-semibold transition"
        >
          Adicionar Produto
        </button>
      </div>

      <TabelaProduto
        produtos={produtos}
        onEditar={editarProduto}
        onExcluir={excluirProduto}
      />

      {mostrarModalEditar && (
        <ModalEditarProduto
          produto={produtoSelecionado}
          aoFechar={() => setMostrarModalEditar(false)}
          aoAtualizar={() => {
            setMostrarModalEditar(false);
            api.get(`/produtos/${depositoId}`)
              .then((res) => setProdutos(res.data));
          }}
        />
      )}

      {mostrarModalAdicionar && (
        <ModalAdicionarProduto
          depositoId={depositoId}
          onClose={() => setMostrarModalAdicionar(false)}
          onProdutoAdicionado={() => {
            setMostrarModalAdicionar(false);
            api.get(`/produtos/${depositoId}`)
              .then(res => setProdutos(res.data));
          }}
        />
      )}
    </div>
  );
}
