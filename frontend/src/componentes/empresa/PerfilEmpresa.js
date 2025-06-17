import { useState, useEffect } from 'react';

export default function PerfilEmpresa({ aberto, onClose, onLogout, nomeEmpresa }) {
  const [empresaImg, setEmpresaImg] = useState(null);
  const empresaId = localStorage.getItem("empresa_id");

  useEffect(() => {
    // Se quiser carregar imagem salva no localStorage, pode fazer aqui
    // setEmpresaImg(localStorage.getItem('empresa_img'));
  }, []);

  if (!aberto) return null;

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-white text-[#015D4F] shadow-lg z-50 transform transition-transform duration-300 ${
        aberto ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center p-4 border-b">
        {/* Ícone redondo com upload */}
        <label className="mr-3 cursor-pointer group">
          <div className="w-14 h-14 rounded-full bg-[#e6f4f1] flex items-center justify-center overflow-hidden border-4 border-[#015D4F] group-hover:opacity-80 transition">
            {empresaImg ? (
              <img
                src={empresaImg}
                alt="Perfil"
                className="object-cover w-full h-full"
              />
            ) : (
              <svg
                className="w-8 h-8 text-[#015D4F]"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => setEmpresaImg(ev.target.result);
                reader.readAsDataURL(file);
              }
            }}
          />
        </label>
        <span className="font-bold text-lg flex-1">
          {nomeEmpresa || "Perfil da Empresa"}
        </span>
        <button onClick={onClose} className="text-2xl font-bold ml-2">
          &times;
        </button>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <button
          onClick={onLogout}
          className="w-full bg-[#015D4F] text-white px-4 py-2 rounded hover:bg-[#013e35] transition"
        >
          Logout
        </button>
        <div className="bg-white rounded shadow p-4 mt-4">
          <p className="text-gray-700">
            <span className="font-semibold">ID da empresa:</span> {empresaId}
          </p>
        </div>
      </div>
    </div>
  );
}
