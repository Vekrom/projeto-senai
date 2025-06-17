import { useEffect, useState } from 'react';
import api from '../../axiosConfig';

export default function ConvitesPendentes() {
  const [convites, setConvites] = useState([]);
  const empresaId = localStorage.getItem('empresa_id');

  useEffect(() => {
    async function carregarConvites() {
      try {
        const resposta = await api.get(`/convites-pendentes/${empresaId}`);
        setConvites(resposta.data);
      } catch (erro) {
        console.error('Erro ao carregar convites:', erro);
      }
    }
    carregarConvites();
  }, [empresaId]);

  async function responderConvite(id, acao) {
    try {
      await api.put(`/convites/${id}/${acao}`);
      setConvites(convites.filter(convite => convite.id !== id));
    } catch (erro) {
      console.error('Erro ao responder convite:', erro);
    }
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Convites Pendentes</h2>
      {convites.length === 0 ? (
        <p className="text-sm text-gray-600">Nenhum convite pendente.</p>
      ) : (
        <ul className="space-y-2">
          {convites.map(convite => (
            <li key={convite.id} className="flex justify-between items-center border p-3 rounded">
              <span>Funcionário #{convite.usuario_id}</span>
              <div className="space-x-2">
                <button
                  onClick={() => responderConvite(convite.id, 'aceitar')}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                >
                  Aceitar
                </button>
                <button
                  onClick={() => responderConvite(convite.id, 'recusar')}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Recusar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
