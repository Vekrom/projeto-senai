import { Routes, Route, Navigate } from 'react-router-dom';
import ListaProdutos from './componentes/produtos/ListaProdutos';
import DashboardEmpresa from './componentes/empresa/DashboardEmpresa';
import DashboardFuncionario from './componentes/funcionario/DashboardFuncionario';
import LoginCardFlipper from "./componentes/autentificacao/LoginCardFliper";
import EsqueciSenhaEmpresa from './componentes/autentificacao/EsqueciSenhaEmpresa';
import EsqueciSenhaFuncionario from './componentes/autentificacao/EsqueciSenhaFuncionario';
import CadastroEmpresa from './componentes/autentificacao/CadastroEmpresa';
import CadastroFuncionario from './componentes/autentificacao/CadastroFuncionario';
import LoginEmpresa from './componentes/autentificacao/LoginEmpresa';
import LoginFuncionario from './componentes/autentificacao/LoginFuncionario';



export default function RotasApp({ logado, aoLogar, aoDeslogar }) {
  const tipo = localStorage.getItem('tipo');

  return (
    <Routes>
      <Route
        path="/login"
        element={
          logado ? (
            tipo === 'empresa' ? (
              <Navigate to="/dashboard-empresa" />
            ) : (
              <Navigate to="/dashboard-funcionario" />
            )
          ) : (
            <LoginCardFlipper />
          )
        }
      />
      <Route path="/login-cardflipper" element={<LoginCardFlipper />} />
      <Route path="/login-funcionario" element={<LoginFuncionario aoLogar={aoLogar} />} />
      <Route path="/login-empresa" element={<LoginEmpresa aoLogar={aoLogar} />} />
      <Route path="/esqueci-senha-funcionario" element={<EsqueciSenhaFuncionario />} />
      <Route path="/cadastro-empresa" element={<CadastroEmpresa />} />
      <Route path="/cadastro-funcionario" element={<CadastroFuncionario />} />
      <Route path="/esqueci-senha-empresa" element={<EsqueciSenhaEmpresa />} />
      <Route path="/produtos" element={<ListaProdutos produtos={[]} aoExcluir={() => {}} aoEditar={() => {}} aoDeslogar={aoDeslogar} />} />
      <Route path="/dashboard-empresa" element={<DashboardEmpresa />} />
      <Route path="/dashboard-funcionario" element={<DashboardFuncionario />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
