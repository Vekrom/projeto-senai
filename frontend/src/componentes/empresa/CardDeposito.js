

export default function CardDeposito({ nome, onEntrar, onEditar, onExcluir, className }) {
  return (
    <div className={`bg-black/60 text-white rounded-lg shadow p-6 flex flex-col gap-4 items-center justify-center border border-transparent hover:border-[#015D4F] transition cursor-pointer ${className}`}>
      <div className="flex w-full justify-between items-center mb-2">
        <span className="text-lg font-semibold">{nome}</span>
        <div className="flex flex-col gap-2">
          <button
            onClick={onEditar}
            className="flex items-center gap-1 text-[#bfa14a] hover:text-[#015D4F] text-sm"
          >
            {/* Ícone de editar (caneta) */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6-6m2 2l-6 6M3 17v4h4l11-11a2.828 2.828 0 00-4-4L3 17z" />
            </svg>
            Editar
          </button>
          <button
            onClick={onExcluir}
            className="flex items-center gap-1 text-red-400 hover:text-red-600 text-sm"
          >
            {/* Ícone de lixeira */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Excluir
          </button>
        </div>
      </div>
      <button
        onClick={onEntrar}
        className="w-full bg-[#015D4F] text-white px-4 py-2 rounded hover:bg-[#013e35] transition font-semibold"
      >
        Entrar
      </button>
    </div>
  );
}
