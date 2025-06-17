export default function TabelaProduto({ produtos, onEditar, onExcluir }) {

  const getStatus = (produto) => {
    const hoje = new Date();
    const validade = new Date(produto.validade);
    const diasRestantes = Math.floor((validade - hoje) / (1000 * 60 * 60 * 24));

    const status = [];

    if (produto.quantidade <= 0) {
      return [{ texto: "Sem estoque", cor: "bg-red-600 text-white" }];
    }

    status.push({ texto: "Disponível", cor: "bg-green-600 text-white" });

    if (produto.quantidade <= produto.estoque_min) {
      status.push({ texto: "Pouca quantidade", cor: "bg-teal-500 text-white" });
    }

    if (diasRestantes < 0) {
      status.push({ texto: "Vencido", cor: "bg-orange-400 text-white" });
    } else if (diasRestantes <= 60) {
      status.push({ texto: "Próx. validade", cor: "bg-yellow-500 text-white" });
    }

    return status;
  };

  return (
    <div
      className="w-full overflow-x-auto overflow-y-auto rounded shadow border mt-4 bg-[#015D4F]"
      style={{ maxHeight: "60vh", minHeight: "200px" }}
    >
      <table className="min-w-[600px] w-full divide-y divide-gray-300 bg-white text-black">
        <thead className="bg-[#015D4F] text-white">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-medium sticky top-0 z-10 bg-[#015D4F]">ID</th>
            <th className="px-4 py-2 text-left text-sm font-medium sticky top-0 z-10 bg-[#015D4F]">Produto</th>
            <th className="px-4 py-2 text-left text-sm font-medium sticky top-0 z-10 bg-[#015D4F]">Quantidade</th>
            <th className="px-4 py-2 text-left text-sm font-medium sticky top-0 z-10 bg-[#015D4F]">Status</th>
            <th className="px-4 py-2 text-center text-sm font-medium sticky top-0 z-10 bg-[#015D4F]">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {produtos.map((produto) => (
            <tr key={produto.id} className="hover:bg-gray-100 transition">
              <td className="px-4 py-2 text-sm">{produto.id}</td>
              <td className="px-4 py-2 text-sm">{produto.nome}</td>
              <td className="px-4 py-2 text-sm">{produto.quantidade}</td>
              <td className="px-4 py-2 text-sm">
                <div className="flex flex-wrap gap-2">
                  {getStatus(produto).map((s, i) => (
                    <span
                      key={i}
                      className={`w-[120px] h-[32px] flex items-center justify-center rounded text-xs font-semibold ${s.cor}`}
                    >
                      {s.texto}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-2">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEditar(produto)}
                    className="bg-[#015D4F]/90 border border-[#015D4F] text-white px-4 py-1.5 rounded shadow-sm hover:shadow-md hover:bg-[#01443C] flex items-center gap-1 transition-all duration-200"
                    title="Editar"
                  >
                    ✏️ <span>Editar</span>
                  </button>
                  <button
                    onClick={() => onExcluir(produto.id)}
                    className="bg-[#8f2f3f] text-white px-4 py-1.5 rounded shadow-sm hover:bg-[#631623] flex items-center gap-1 transition-all duration-200"
                    title="Excluir"
                  >
                    <span>Excluir</span> 🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
