import React, { useContext, useEffect, useState } from "react";
import "./ClientesDashboard.css";
import { Button, Col, Input, Popover, Row, Table, Tag, Typography } from "antd";
import axios from "axios";
import * as links from "../../../../utils/links";
import { AuthContext } from "../../../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import LoadingAction from "../../../../themes/LoadingAction/LoadingAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { format, parseISO } from "date-fns";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import iconMaquinas from "../../../../assets/images/iconMaquinas.png";
import iconTransacoes from "../../../../assets/images/iconTransacoes.png";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const DonutChart = ({ data }) => {
  const total = data.reduce((sum, point) => sum + point.y, 0);

  // Adicionar a porcentagem a cada ponto de dados
  const dataWithPercentage = data.map((point) => ({
    name: point.name,
    y: point.y,
    percentage: ((point.y / total) * 100).toFixed(1),
    color: point.color ?? "", // Calcular a porcentagem
  }));

  const options = {
    chart: {
      type: "pie",
      width: 250,
      height: 300,
      margin: [0, 0, 40, 0], // Ajuste das margens (topo, direita, fundo, esquerda)
      spacing: [0, 0, 0, 0],
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },

    plotOptions: {
      pie: {
        innerSize: "70%",
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.percentage:.1f}%</b>",
          distance: -20,
          style: {
            color: "black",
            fontWeight: "bold",
            fontSize: "14px",
          },
        },
        borderWidth: 0, // Remove o contorno entre as fatias
      },
    },
    series: [
      {
        name: "Quantidade",
        data: dataWithPercentage,
        showInLegend: true,
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

export const Card = ({ children }) => {
  return (
    <Col
      style={{
        border: "1px solid #EBEBEF",
        padding: "20px",
        borderRadius: "8px",
      }}
    >
      {children}
    </Col>
  );
};

const ClientesDashboard = (props) => {
  const { setDataUser, authInfo, setNotiMessage } = useContext(AuthContext);
  const { dataUser } = authInfo;
  let navigate = useNavigate();

  const token = authInfo?.dataUser?.token;

  const [totalClientes, setTotalClientes] = useState([]);
  const [filteredClients, setFilteredClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allClientesWithMachines, setAllClientesWithMachine] = useState([]);
  const [allAvailableMachines, setAllAvailableMachines] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [valueAllPayments, setValueAllPayments] = useState(null);

  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    dataData();

    const intervalId = setInterval(() => {
      dataData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const filteredClients = totalClientes.filter(({ nome }) =>
      nome.toLowerCase().includes(filterText.toLowerCase())
    );

    if (setFilterText === "") {
      return;
    }

    setFilteredClientes(filteredClients);

    getRows();
  }, [filterText, totalClientes]);

  const dataData = () => {
    setIsLoading(true);
    axios
      .get(`${process.env.REACT_APP_SERVIDOR}/clientes`, {
        headers: {
          "x-access-token": token,
          "content-type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setIsLoading(false);
          setTotalClientes(res.data);
        } else {
          throw new Error();
        }
      })
      .catch((err) => {
        setIsLoading(false);
        if ([401, 403].includes(err.response.status)) {
          // setNotiMessage('A sua sessão expirou, para continuar faça login novamente.');
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
    const fetchMaquinas = async (clientes) => {
      const promises = [];

      clientes.forEach((cliente) => {
        const promise = axios
          .get(
            `${process.env.REACT_APP_SERVIDOR}/maquinas-adm?id=${cliente.id}`,
            {
              headers: {
                "x-access-token": token,
                "content-type": "application/json",
              },
            }
          )
          .then((response) => {
            return {
              cliente: cliente.nome,
              machines: response.data,
            };
          })
          .catch((error) => {
            console.error(
              `Erro ao buscar a máquina ${cliente.nome} do cliente ${cliente.nome}:`,
              error
            );
            return null; // Retorna null em caso de erro
          });

        promises.push(promise);
      });

      const resultados = await Promise.all(promises);

      return resultados;
    };

    fetchMaquinas(totalClientes).then((resultados) => {
      setAllClientesWithMachine(resultados);
    });
  }, [totalClientes, token]);

  useEffect(() => {
    const allMachines = [];

    allClientesWithMachines.forEach(({ machines }) => {
      machines.forEach((machine) => {
        allMachines.push(machine);
      });
    });

    const availableMachines = allMachines.filter(
      ({ status }) => status !== "OFFLINE"
    );

    const fetchPayments = async (clientes) => {
      const promises = [];

      allMachines.forEach(({ id }) => {
        const promise = axios
          .get(`${process.env.REACT_APP_SERVIDOR}/pagamentos-adm/${id}`, {
            headers: {
              "x-access-token": token,
              "content-type": "application/json",
            },
          })
          .then((response) => {
            return response.data;
          })
          .catch((error) => {
            console.error(`Erro ao buscar pagamentos:`, error);
            return null; // Retorna null em caso de erro
          });

        promises.push(promise);
      });

      const resultados = await Promise.all(promises);

      return resultados;
    };

    fetchPayments(allMachines).then((resultados) => {
      setAllPayments(resultados);
    });

    setAllAvailableMachines(availableMachines);
  }, [allClientesWithMachines, token]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const today = new Date();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isToday = (date) => {
    const comparativeDate = new Date(date);
    return (
      comparativeDate.getFullYear() === today.getFullYear() &&
      comparativeDate.getMonth() === today.getMonth() &&
      comparativeDate.getDate() === today.getDate()
    );
  };

  useEffect(() => {
    const fetchTodayPayments = async () => {
      const todayPayments = [];

      allPayments.forEach(({ pagamentos }) => {
        const todayPayment = pagamentos.filter(({ data }) => isToday(data));
        todayPayments.push(...todayPayment);
      });

      const allValueTodayPayments = todayPayments.reduce((acc, curr) => {
        return acc + Number(curr.valor);
      }, 0);

      setValueAllPayments(allValueTodayPayments);
    };

    fetchTodayPayments();
  }, [allPayments]);

  const handleClienteClick = ({
    key,
    client,
    email,
    ativo,
    inclusion,
    maturity,
    last_access,
    mercadoPagoToken,
    pagbankToken,
    pagbankEmail,
  }) => {
    const cliente = {
      key,
      nome: client,
      email,
      ativo,
      dataInclusao: inclusion,
      dataVencimento: maturity,
      ultimoAcesso: last_access,
      mercadoPagoToken,
      pagbankToken,
      pagbankEmail,
    };
    navigate(`${links.CLIENTES_MAQUINAS}/${key}`, {
      state: cliente,
    });
  };

  const columns = [
    {
      title: "Cliente",
      dataIndex: "client",
      key: "client",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value) => {
        return (
          <Tag
            color={value === "INADIMPLENTE" ? "#FEF0F4" : "#EEFBF4"}
            style={{
              borderRadius: "8px",
              color: value === "INADIMPLENTE" ? "#D50B3E" : "#17663A",
            }}
          >
            {value}
          </Tag>
        );
      },
    },
    {
      title: "Nº de máquinas",
      dataIndex: "machines_number",
      key: "machines_number",
    },
    {
      title: "Vencimento",
      dataIndex: "maturity",
      key: "maturity",
    },
    {
      title: "Inclusão",
      dataIndex: "inclusion",
      key: "inclusion",
    },
    {
      title: "Último acesso",
      dataIndex: "last_access",
      key: "last_access",
    },
  ];

  const clientesInadimplentes = totalClientes.filter(({ dataVencimento }) => {
    let dataVencimentoVal = 0;
    const dt = new Date(dataVencimento);
    const dtDateOnly = new Date(
      dt.valueOf() + dt.getTimezoneOffset() * 60 * 1000
    );
    if (dataVencimento) {
      let dataVencimentoDate = new Date(dataVencimento);
      dataVencimentoVal = dataVencimentoDate.getTime() ?? 0;
    }

    const diferencaEmMilissegundos = new Date().getTime() - dataVencimentoVal;
    const diferencaEmDias = Math.floor(
      diferencaEmMilissegundos / (1000 * 60 * 60 * 24)
    );

    return diferencaEmDias > 10;
  });

  const clientesRegulares = totalClientes.filter(({ dataVencimento }) => {
    let dataVencimentoVal = 0;
    const dt = new Date(dataVencimento);
    const dtDateOnly = new Date(
      dt.valueOf() + dt.getTimezoneOffset() * 60 * 1000
    );
    if (dataVencimento) {
      let dataVencimentoDate = new Date(dataVencimento);
      dataVencimentoVal = dataVencimentoDate.getTime() ?? 0;
    }

    const diferencaEmMilissegundos = new Date().getTime() - dataVencimentoVal;
    const diferencaEmDias = Math.floor(
      diferencaEmMilissegundos / (1000 * 60 * 60 * 24)
    );

    return diferencaEmDias < 10;
  });

  const getRows = () => {
    if (filteredClients.length > 0) {
      return filteredClients.map(
        ({
          nome,
          dataVencimento,
          Maquina,
          dataInclusao,
          ultimoAcesso,
          id,
          ...rest
        }) => {
          let dataVencimentoVal = 0;
          const dt = new Date(dataVencimento);
          const dtDateOnly = new Date(
            dt.valueOf() + dt.getTimezoneOffset() * 60 * 1000
          );
          if (dataVencimento) {
            let dataVencimentoDate = new Date(dataVencimento);
            dataVencimentoVal = dataVencimentoDate.getTime() ?? 0;
          }

          const diferencaEmMilissegundos =
            new Date().getTime() - dataVencimentoVal;
          const diferencaEmDias = Math.floor(
            diferencaEmMilissegundos / (1000 * 60 * 60 * 24)
          );

          return {
            key: id,
            client: nome,
            status: diferencaEmDias > 10 ? `INADIMPLENTE` : `REGULAR`,
            machines_number: Maquina.length,
            maturity: format(dtDateOnly, "dd/MM/yyyy"),
            inclusion: format(new Date(dataInclusao), "dd/MM/yyyy - kk:mm"),
            last_access: ultimoAcesso
              ? format(new Date(ultimoAcesso), "dd/MM/yyyy - kk:mm")
              : "--",
            ...rest,
          };
        }
      );
    }

    return totalClientes.map(
      ({
        nome,
        dataVencimento,
        Maquina,
        dataInclusao,
        ultimoAcesso,
        id,
        ...rest
      }) => {
        let dataVencimentoVal = 0;
        const dt = new Date(dataVencimento);
        const dtDateOnly = new Date(
          dt.valueOf() + dt.getTimezoneOffset() * 60 * 1000
        );
        if (dataVencimento) {
          let dataVencimentoDate = new Date(dataVencimento);
          dataVencimentoVal = dataVencimentoDate.getTime() ?? 0;
        }

        const diferencaEmMilissegundos =
          new Date().getTime() - dataVencimentoVal;
        const diferencaEmDias = Math.floor(
          diferencaEmMilissegundos / (1000 * 60 * 60 * 24)
        );

        return {
          key: id,
          client: nome,
          status: diferencaEmDias > 10 ? `INADIMPLENTE` : `REGULAR`,
          machines_number: Maquina.length,
          maturity: format(dtDateOnly, "dd/MM/yyyy"),
          inclusion: format(new Date(dataInclusao), "dd/MM/yyyy - kk:mm"),
          last_access: ultimoAcesso
            ? format(new Date(ultimoAcesso), "dd/MM/yyyy - kk:mm")
            : "--",
          ...rest,
        };
      }
    );
  };

  const machinesNumber = totalClientes.reduce((acc, curr) => {
    return acc + curr.Maquina.length;
  }, 0);

  const isMobile = window.innerWidth < 800;

  return (
    <div style={{ width: "100%" }}>
      {isLoading && <LoadingAction />}
      <div className="Cliente_WarningMsgSpan">
        <span>{dataUser.warningMsg}</span>
      </div>
      <Row
        style={{ width: "100%", alignItems: "center", paddingRight: "15px" }}
      >
        <Col style={{ flex: 1 }}>
          <Typography
            style={{ color: "#121217", fontWeight: "700", fontSize: "20px" }}
          >
            Olá, {dataUser.name}
          </Typography>
          <Typography style={{ color: "#55556D" }}>
            Consulte seu relatório geral
          </Typography>
        </Col>
        <Col
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <Input
            placeholder="Buscar"
            style={{ borderRadius: "8px", maxWidth: "300px" }}
            value={filterText}
            onChange={({ target }) => setFilterText(target.value)}
          />
          <Button
            style={{
              backgroundColor: "#00ACFF",
              color: "white",
              padding: "20px",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              borderRadius: "8px",
            }}
            className="new-client-button"
            onClick={() => navigate(links.ADD_CLIENTES)}
          >
            Novo cliente
            <PlusOutlined />
          </Button>
        </Col>
      </Row>
      <Row
        style={{
          width: "100%",
          paddingRight: "15px",
          marginTop: "20px",
          gap: "20px",
        }}
      >
        <Col
          flex={isMobile ? 1 : 0.3}
          style={{ gap: "20px", display: "flex", flexDirection: "column" }}
        >
          <Card>
            <Row style={{ width: "100%", justifyContent: "center" }}>
              <Typography style={{ fontWeight: "700", fontSize: "18px" }}>
                Status dos clientes
              </Typography>
            </Row>
            <Row style={{ width: "100%", justifyContent: "center" }}>
              <DonutChart
                data={[
                  {
                    name: "Em dia",
                    y: clientesRegulares.length,
                    color: "#2DCA72",
                  },
                  {
                    name: "Inadimplente",
                    y: clientesInadimplentes.length,
                    color: "#F53D6B",
                  },
                ]}
                centerText="teste"
              />
            </Row>
          </Card>
          <Card>
            <Row style={{ width: "100%", gap: "20px" }} align="middle">
              <Col>
                <img src={iconTransacoes} alt="icone transações" />
              </Col>

              <Col>
                <Typography style={{ fontSize: "20px", fontWeight: "700" }}>
                  {valueAllPayments
                    ? Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(valueAllPayments)
                    : "Calculando..."}
                </Typography>
                <Typography style={{ color: "#55556D", fontSize: "18px" }}>
                  Em transações hoje
                </Typography>
              </Col>
            </Row>
          </Card>
          <Card>
            <Row style={{ width: "100%", gap: "20px" }} align="middle">
              <Col>
                <img src={iconMaquinas} alt="icone maquinas ativas" />
              </Col>

              <Col>
                <Typography style={{ fontSize: "20px", fontWeight: "700" }}>
                  {allAvailableMachines.length}
                </Typography>
                <Typography style={{ color: "#55556D", fontSize: "18px" }}>
                  Máquinas online
                </Typography>
              </Col>
            </Row>
          </Card>
          <Card>
            <Row style={{ width: "100%", gap: "20px" }} align="middle">
              <Col>
                <img src={iconMaquinas} alt="icone maquinas ativas" />
              </Col>

              <Col>
                <Typography style={{ fontSize: "20px", fontWeight: "700" }}>
                  {machinesNumber}
                </Typography>
                <Typography style={{ color: "#55556D", fontSize: "18px" }}>
                  Total de máquinas
                </Typography>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col flex={1}>
          {" "}
          <Table
            dataSource={getRows()}
            columns={columns}
            style={{ width: "100%", overflow: "auto" }}
            onRow={(record) => {
              return {
                onClick: () => handleClienteClick(record),
              };
            }}
            pagination={{
              pageSize: 18, // Define o número de linhas por página
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ClientesDashboard;
