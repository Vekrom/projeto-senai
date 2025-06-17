export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#08584F" }}>
      <div className="flex flex-col items-center">
        {/* Ícone de funcionário segurando caixa */}
        <div className="mb-6">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            {/* Corpo */}
            <circle cx="36" cy="36" r="34" fill="#01382e" />
            {/* Cabeça */}
            <circle cx="36" cy="26" r="8" fill="#C9A94B" />
            {/* Braços */}
            <rect x="18" y="38" width="36" height="8" rx="4" fill="#C9A94B" />
            {/* Caixa */}
            <rect x="28" y="38" width="16" height="14" rx="2" fill="#C9A94B" stroke="#fff" strokeWidth="2"/>
            {/* Pernas */}
            <rect x="31" y="54" width="4" height="10" rx="2" fill="#C9A94B" />
            <rect x="37" y="54" width="4" height="10" rx="2" fill="#C9A94B" />
          </svg>
        </div>
        {/* Texto e pontinhos animados */}
        <h2 className="text-2xl font-bold text-[#C9A94B] mb-2 tracking-wide drop-shadow flex items-center">
          Carregando
          <span className="ml-1 loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </h2>
        <p className="text-white text-lg font-medium">Aguarde um instante</p>
      </div>
      <style>{`
        .loading-dots span {
          animation: blink 1.4s infinite both;
          font-size: 1.5em;
          color: #C9A94B;
        }
        .loading-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .loading-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0; }
          40% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}