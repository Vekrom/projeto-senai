import { useState, useEffect } from 'react';
import api from '../../axiosConfig';

export default function ModalDeposito({ aberto, onFechar, editar = false, depositoEditar = {}, onSucesso }) {
const [nome, setNome] = useState('');

useEffect(() => {
    if (editar && depositoEditar?.nome) {
    setNome(depositoEditar.nome);
    } else {
    setNome('');
    }
}, [editar, depositoEditar]);

async function handleSubmit(e) {
    e.preventDefault();
    try {
    const empresa_id = localStorage.getItem('empresa_id');

    if (editar) {
        await api.put(`/depositos/${depositoEditar.id}`, { nome });
    } else {
        await api.post('/depositos', { nome, empresa_id });
    }

    onSucesso();
    onFechar();
    } catch (erro) {
    console.error('Erro ao salvar depósito:', erro);
    }
}

if (!aberto) return null;

return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-[#332f2f]">
        {editar ? 'Editar Depósito' : 'Novo Depósito'}
        </h2>
        <form onSubmit={handleSubmit}>
        <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Nome do depósito"
            required
            className="w-full p-2 mb-4 border rounded text-black focus:outline-none focus:ring-2 focus:ring-[#91592A] focus:border-transparent"
        />
        <div className="flex justify-end space-x-2">
            <button
            type="button"
            onClick={onFechar}
            className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400"
            >
            Cancelar
            </button>
            <button
            type="submit"
            className="px-4 py-2 rounded bg-[#91592A] text-white hover:bg-[#7a4723]"
            >
            Salvar
            </button>
        </div>
        </form>
    </div>
    </div>
);
}
