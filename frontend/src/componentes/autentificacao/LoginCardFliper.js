import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginEmpresa from "./LoginEmpresa";
import LoginFuncionario from "./LoginFuncionario";

export default function LoginCardFlipper() {
  const [tipo, setTipo] = useState("empresa"); // valor inicial

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-900">
      <div className="w-[360px] p-6 bg-emerald-800 rounded-2xl shadow-xl text-white relative overflow-hidden">

        {/* Botões de troca */}
        <div className="flex justify-center mb-4 gap-4">
          <button
            className={`px-4 py-2 rounded-full ${tipo === "empresa" ? "bg-black text-white" : "bg-white text-black"}`}
            onClick={() => setTipo("empresa")}
          >
            Empresa
          </button>
          <button
            className={`px-4 py-2 rounded-full ${tipo === "funcionario" ? "bg-black text-white" : "bg-white text-black"}`}
            onClick={() => setTipo("funcionario")}
          >
            Funcionário
          </button>
        </div>

        {/* Animação entre os cards */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tipo}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {tipo === "empresa" ? <LoginEmpresa /> : <LoginFuncionario />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


