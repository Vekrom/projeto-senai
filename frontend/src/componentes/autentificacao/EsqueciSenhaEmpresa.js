import { useState } from 'react';
import api from '../../axiosConfig';

export default function EsqueciSenhaEmpresa() {
  const [usuario, setUsuario] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleEnviar = async (e) => {
    e.preventDefault();
    try {
      await api.post('/esqueci-senha', { usuario, tipo: 'empresa' });
      setMensagem('Se esse usuário for válido, enviaremos um link.');
    } catch (error) {
      setMensagem('Erro ao enviar solicitação.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Recuperar senha - Empresa</h2>
      <form onSubmit={handleEnviar}>
        <input
          type="text"
          placeholder="Digite seu nome de usuário"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded hover:bg-emerald-700"
        >
          Enviar link de redefinição
        </button>
      </form>
      {mensagem && <p className="mt-4 text-green-600">{mensagem}</p>}
    </div>
  );
}
