import {
  AppstoreOutlined,
  PlusOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { Badge, Button, Col, Row, Table, Tag, Typography } from "antd";
import axios from "axios";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card } from "../Cliente/ClientesDashboard/ClientesDashboard";

export default function Maquinas() {
  const [maquinas, setMaquinas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modoExibicao, setModoExibicao] = useState("tabela");
  const [rows, setRows] = useState([]);

  const { setDataUser, loading, authInfo, setNotiMessage } =
    useContext(AuthContext);
  const { dataUser } = authInfo;
  let navigate = useNavigate();
  const token = authInfo?.dataUser?.token;
  useEffect(() => {
    dataData();

    const intervalId = setInterval(() => {
      dataData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const isMobile = window.innerWidth < 800;

  const dataData = () => {
    setIsLoading(true);
    axios
      .get(`${process.env.REACT_APP_SERVIDOR}/maquinas`, {
        headers: {
          "x-access-token": token,
          "content-type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setIsLoading(false);
          setMaquinas(res.data);
        } else {
          throw new Error();
        }
      })
      .catch((err) => {
        setIsLoading(false);
        if ([401, 403].includes(err.response.status)) {
          setNotiMessage({
            type: "error",
            message:
              "A sua sessão expirou, para continuar faça login novamente.",
          });
          setDataUser(null);
        }
      });
  };

useEffect(() => {
  const maquinasAdaptadas = maquinas?.map(
    ({ nome, store_id, descricao, status, maquininha_serial, ...rest }) => ({
      nomeMaquina: nome,                  // Renomeia `nome` para `nomeMaquina`
      mercadoPagoId: store_id,            // Renomeia `store_id` para `mercadoPagoId`
      idPseg: maquininha_serial ?? "-",    // Usa `maquininha_serial` ou "-" se for `null` ou `undefined`
      loja: descricao,                    // Renomeia `descricao` para `loja`
      status: 
        status === "OFFLINE" ? "Inativa" : 
        status === "PAGAMENTO_RECENTE" ? "Recente" : "Ativa",  // Condição para o status
      atividadeOntem: "-",                // Adiciona `atividadeOntem` com valor padrão "-"
      ...rest                             // Mantém todas as outras propriedades
    })
  );

  setRows(maquinasAdaptadas);             // Atualiza o estado `rows` com as máquinas adaptadas
}, [maquinas]);


  const handleMaquinaClick = (maquina) => {
    const {
      id,
      nomeMaquina,
      mercadoPagoId,
      pulso,
      estoque,
      loja,
      maquininha_serial,
      status,
    } = maquina;
    const maquinaInfos = {
      nome: nomeMaquina,
      storeId: mercadoPagoId,
      pulso,
      estoque,
      descricao: loja,
      maquininha_serial,
      status,
    };
    navigate(`/pagamentos/${id}`, {
      state: maquinaInfos,
    });
  };

  console.log("MAQUINAS", maquinas[0]);

  const columns = [
    {
      title: "Nome da máquina",
      dataIndex: "nomeMaquina",
      key: "nomeMaquina",
    },
    {
      title: "ID MP",
      dataIndex: "mercadoPagoId",
      key: "mercadoPagoId",
    },
    {
      title: "ID PSEG",
      dataIndex: "idPseg",
      key: "idPseg",
    },
    {
      title: "Loja",
      dataIndex: "loja",
      key: "loja",
    },
 
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (value) => {
          let color, textColor;
          if (value === "Inativa") {
            color = "#FEF0F4";
            textColor = "#D50B3E";
          } else if (value === "Recente") {
            color = "#E6F7FF";
            textColor = "#1890FF";
          } else {
            color = "#EEFBF4";
            textColor = "#17663A";
          }
          return (
            <Tag
              color={color}
              style={{
                borderRadius: "8px",
                color: textColor,
              }}
            >
              {value}
            </Tag>
          );
        },
      },
    {
      title: "Atividade ontem",
      dataIndex: "atividadeOntem",
      key: "atividadeOntem",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", width: "100%", paddingRight: "15px" }}>
      <Row
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {" "}
          <Typography style={{ fontSize: "28px", fontWeight: "700" }}>
            Máquinas
          </Typography>
          <div
            onClick={() =>
              setModoExibicao((prev) =>
                prev === "blocos" ? "tabela" : "blocos"
              )
            }
            style={{
              cursor: "pointer",
              gap: "5px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {modoExibicao === "blocos"
              ? "Exibir em tabela"
              : "Exibir em blocos"}
            {modoExibicao === "blocos" ? (
              <TableOutlined />
            ) : (
              <AppstoreOutlined />
            )}
          </div>
        </div>

        {/*<Button
          style={{
            backgroundColor: "#00ACFF",
            borderRadius: "8px",
            color: "white",
            padding: "20px 10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Nova máquina
          <PlusOutlined />
        </Button> */}
      </Row>
      <Row style={{ width: "100%", marginTop: "20px" }}>
        {" "}
        {modoExibicao === "tabela" && (
          <Table
            columns={columns}
            dataSource={rows}
            locale={{
              emptyText: (
                <div>Não foram encontrados resultados para sua pesquisa.</div>
              ),
            }}
            style={{ width: "100%", overflowX: "auto" }}
            onRow={(record) => {
              return {
                onClick: () => handleMaquinaClick(record),
              };
            }}
          />
        )}
      </Row>
      {modoExibicao === "blocos" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(1, 1fr)" : "repeat(3, 1fr)",
            gridGap: "20px",
          }}
        >
          {maquinas.map((maquina) => {
            const { nome, store_id, descricao, status, maquininha_serial } =
              maquina;
            return (
              <Card>
                <Row
                  style={{ width: "100%", cursor: "pointer" }}
                  onClick={() =>
                    handleMaquinaClick({
                      nomeMaquina: nome,
                      mercadoPagoId: store_id,
                      loja: descricao,
                      ...maquina,
                    })
                  }
                >
                  <Col style={{ flex: 1 }}>
                    <Typography style={{ fontSize: "18px" }}>{nome}</Typography>
                    <Typography style={{ color: "#55556D" }}>
                      ID MP {store_id}
                    </Typography>
                    <Typography style={{ color: "#55556D" }}>
                      ID PSE {maquininha_serial}
                    </Typography>
                    <Typography style={{ color: "#55556D" }}>
                      Loja {descricao}
                    </Typography>
                  </Col>
                  <Col
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      alignItems: "flex-end",
                      gap: "10px",
                    }}
                  >
                   <Tag
  color={
    status === "OFFLINE" 
      ? "#FEF0F4" 
      : status === "PAGAMENTOS_RECENTES" 
        ? "#E0F3FF"  // cor de fundo azul
        : "#EEFBF4"
  }
  style={{
    borderRadius: "8px",
    color: status === "OFFLINE" 
      ? "#D50B3E" 
      : status === "PAGAMENTOS_RECENTES" 
        ? "#0077B6"  // cor de texto azul escuro
        : "#17663A",
  }}
>

                      {status === "OFFLINE" ? "Inativa" : "Ativa"}
                    </Tag>
                    <div>
                      <Typography style={{ color: "#55556D" }}>
                        Ativ. ontem
                      </Typography>
                      <Typography
                        style={{ color: "#55556D", textAlign: "center" }}
                      >
                        -
                      </Typography>
                    </div>
                  </Col>
                </Row>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
