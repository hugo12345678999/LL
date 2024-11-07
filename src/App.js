import "./App.css";
import PrivateRoute from "./routes/PrivateRoute";
import { Route, Routes } from "react-router-dom";
import NotFound from "./components/NotFound/NotFound";
import SignIn from "./components/Auth/SignIn/SignIn";
import NewSignIn from "./components/Auth/AdminSignIn/SignIn";
import PublicRoute from "./routes/PublicRoute";
import Main from "./components/Layout/Main/Main";
import * as links from "./utils/links";
import DashboardMaquinas from "./components/Main/Dashboard/DashboardMáquinas";
import ClientesDashboard from "./components/Main/Cliente/ClientesDashboard/ClientesDashboard";
import PagamentosSearch from "./components/Main/SearchPagamentos/PagamentosSearch";
import DeletePagamento from "./components/Main/SearchPagamentos/DeletePagamento";
import EditPagamento from "./components/Main/SearchPagamentos/EditPagamento";
import EditCliente from "./components/Main/Cliente/EditCliente/EditCliente";
import DeleteMaquina from "./components/Main/SearchPagamentos/DeleteMaquina";
import ClienteMaquinas from "./components/Main/Cliente/ClienteMaquinas/ClienteMaquinas";
import HelpPage from "./components/Main/HelpPage/HelpPage";
import {
  NotificationContainer,
  NotificationManager,
} from "react-notifications";
import React, { useContext, useEffect } from "react";
import { AuthContext } from "./contexts/AuthContext";
import AddMachine from "./components/Main/AddMachine/AddMachine";
import AddCliente from "./components/Main/Cliente/AddCliente/AddCliente";
import RemoteCredit from "./components/Main/RemoteCredit/RemoteCredit";
import DeleteCliente from "./components/Main/Cliente/DeleteCliente/DeleteCliente";
import Relatorio from "./components/Main/Relatorio/Relatorio/Relatorio";
import TokenHelpPage from "./components/Main/TokenHelpPage/TokenHelpPage";
import AdminPagamentosSearch from "./components/Main/Cliente/AdminSearchPagamentos/AdminPagamentosSearch";
import AdminEditPagamento from "./components/Main/Cliente/AdminSearchPagamentos/AdminEditPagamento";
import AdminDeletePagamento from "./components/Main/Cliente/AdminSearchPagamentos/AdminDeletePagamento";
import ConfigSignIn from "./components/Auth/Config/ConfigSignIn/ConfigSignIn";
import Trocar from "./components/Main/Cliente/Trocar/Trocar";
import AddMaquina from "./components/Main/Cliente/AddMaquina/AddMaquina";
import CreditoRemoto from "./components/Main/Cliente/CreditoRemoto/CreditoRemoto";
import RelatorioAdmin from "./components/Main/Cliente/RelatorioAdmin/RelatorioAdmin";
import AdminDeleteALLPagamentos from "./components/Main/Cliente/AdminSearchPagamentos/AdminDeleteALLPagamentos";
import Maquinas from "./components/Main/Maquinas";

function App() {
  const {
    setDataUser,
    loading,
    notiMessage,
    setNotiMessage,
    notiMessageInfo,
    setNotiMessageInfo,
    authInfo,
  } = useContext(AuthContext);

  const type = authInfo?.dataUser?.type;

  useEffect(() => {
    if (notiMessage) {
      setNotiMessage(null);

      switch (notiMessage.type) {
        case "error":
          NotificationManager.error(notiMessage.message, "Hmm... ");
          break;
        case "success":
          NotificationManager.success(notiMessage.message, "... ");
          break;
        case "info":
          NotificationManager.info(notiMessage.message, "... ");
          break;
        case "warning":
          NotificationManager.warning(notiMessage.message, "... ");
          break;
      }
    }
  }, [notiMessage]);

  // useEffect(() => {
  //     if (notiMessageInfo) {
  //         setNotiMessageInfo(null)
  //         NotificationManager.info(notiMessageInfo, '... ');
  //     }
  // }, [notiMessageInfo])

  return (
    <>
      <NotificationContainer />
      <Routes>
        {
          <>
            <Route
              path={`${links.FORNECEDOR_SEARCH_CANAIS}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <PagamentosSearch />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.CLIENTES_MAQUINAS_FORNECEDOR_SEARCH}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <AdminPagamentosSearch />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.CREDITO_REMOTO_ADM}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <CreditoRemoto />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.EDIT_FORNECEDOR_CANAIS}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <EditPagamento />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.CLIENTES_MAQUINAS_EDIT_FORNECEDOR}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <AdminEditPagamento />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.CLIENTES_MAQUINAS_TROCAR}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <Trocar />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.ADD_CLIENTES_MAQUINA_ADM}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <AddMaquina />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.EDITAR_CLIENTES}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <EditCliente />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.DELETE_FORNECEDOR_CANAIS}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <DeletePagamento />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.CLIENTES_MAQUINAS_DELETE_FORNECEDOR}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <AdminDeletePagamento />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.CLIENTES_MAQUINA_DELETE_PAGAMENTOS}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <AdminDeleteALLPagamentos />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.DELETE_CLIENTE}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <DeleteCliente />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.RELATORIO}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <Relatorio />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.RELATORIO_ADMIN}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <RelatorioAdmin />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.CLIENTES_MAQUINAS}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <ClienteMaquinas />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path="/maquinas"
              element={
                <PrivateRoute>
                  <Main>
                    <Maquinas />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.DELETE_FORNECEDOR}/:id`}
              element={
                <PrivateRoute>
                  <Main>
                    <DeleteMaquina />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.HELP_PAGE}`}
              element={
                <PrivateRoute>
                  <Main>
                    <HelpPage />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={`${links.TOKEN_HELP_PAGE}`}
              element={
                <PrivateRoute>
                  <Main>
                    <TokenHelpPage />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={links.DASHBOARD_FORNECEDOR}
              element={
                <PrivateRoute>
                  <Main>
                    <DashboardMaquinas></DashboardMaquinas>
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={links.DASHBOARD_CLIENTES}
              element={
                <PrivateRoute>
                  <Main>
                    <ClientesDashboard />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={links.ADD_MACHINE}
              element={
                <PrivateRoute>
                  <Main>
                    <AddMachine />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={links.ADD_CLIENTES}
              element={
                <PrivateRoute>
                  <Main>
                    <AddCliente />
                  </Main>
                </PrivateRoute>
              }
            />
            <Route
              path={links.REMOTE_CREDIT}
              element={
                <PrivateRoute>
                  <Main>
                    <RemoteCredit />
                  </Main>
                </PrivateRoute>
              }
            />
          </>
        }
        <Route
          path={links.SIGNIN}
          element={
            <PublicRoute>
              <SignIn />
            </PublicRoute>
          }
        />
        <Route
          path={links.ADMIN_SIGNIN}
          element={
            <PublicRoute>
              <NewSignIn />
            </PublicRoute>
          }
        />
        <Route
          path={links.CONFIG}
          element={
            <PublicRoute>
              <ConfigSignIn />
            </PublicRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
