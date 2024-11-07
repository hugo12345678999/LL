import React, { useContext, useEffect, useState } from "react";
import "./Dashboard.css";
import { Button, Col, Grid, Modal, Row, Table, Typography } from "antd";
import axios from "axios";
import * as links from "../../../utils/links";
import { AuthContext } from "../../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import LoadingAction from "../../../themes/LoadingAction/LoadingAction";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faCheckCircle,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { FilterFilled, FilterOutlined } from "@ant-design/icons";
import iconTransacoes from "../../../assets/images/iconTransacoes.png";
import logoTaxas from "../../../assets/images/logoTaxas.png";
import logoEstornos from "../../../assets/images/logoEstornos.png";
import moment from "moment";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { endOfWeek, getDay, parseISO, startOfWeek } from "date-fns";

function calcularSomasPorSemana(vendas) {
  const hoje = new Date();
  const inicioSemanaAtual = startOfWeek(hoje, { weekStartsOn: 0 });
  const fimSemanaAtual = endOfWeek(hoje, { weekStartsOn: 0 });

  const inicioSemanaPassada = startOfWeek(
    new Date(inicioSemanaAtual - 7 * 24 * 60 * 60 * 1000),
    { weekStartsOn: 0 }
  );
  const fimSemanaPassada = endOfWeek(
    new Date(fimSemanaAtual - 7 * 24 * 60 * 60 * 1000),
    { weekStartsOn: 0 }
  );

  const somasSemanaAtual = Array(7).fill(0);
  const somasSemanaPassada = Array(7).fill(0);

  vendas.forEach((venda) => {
    const dataVenda = parseISO(venda.data);
    const valor = parseFloat(venda.valor);

    if (dataVenda >= inicioSemanaPassada && dataVenda <= fimSemanaPassada) {
      const diaSemana = getDay(dataVenda);
      somasSemanaPassada[diaSemana] += valor;
    }

    if (dataVenda >= inicioSemanaAtual && dataVenda <= fimSemanaAtual) {
      const diaSemana = getDay(dataVenda);
      somasSemanaAtual[diaSemana] += valor;
    }
  });

  return {
    semanaPassada: somasSemanaPassada,
    estaSemana: somasSemanaAtual,
  };
}

const LineChart = ({ dadosSemanaPassada, dadosSemanaAtual }) => {
  const options = {
    chart: {
      height: 300,
    },
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    xAxis: {
      categories: [
        "Domingo",
        "Segunda",
        "Terça",
        "Quarta",
        "Quinta",
        "Sexta",
        "Sábado",
      ],
      labels: {
        style: {
          color: "#6C6C89",
        },
      },
      lineColor: "#6C6C89",
      lineWidth: 0.1,
    },
    legend: {
      itemStyle: {
        color: "#6C6C89",
      },
    },
    yAxis: {
      title: {
        text: "",
      },
      labels: {
        formatter: function () {
          return `R$ ${this.value.toFixed(2).replace(".", ",")}`;
        },
        style: {
          color: "#6C6C89",
        },
      },
      opposite: true,
    },
    series: [
      {
        name: "Esta semana",
        data: dadosSemanaAtual,
        color: "#00ACFF",
        marker: {
          enabled: false,
        },
        dataLabels: {
          enabled: false,
        },
      },
      {
        name: "Semana passada",
        data: dadosSemanaPassada,
        color: "#ADE4FF",
        marker: {
          enabled: false,
        },
        dataLabels: {
          enabled: false,
        },
      },
    ],
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,
        },
      },
    },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
};

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

const DashboardFornecedor = (props) => {
  const { setDataUser, loading, authInfo, setNotiMessage } =
    useContext(AuthContext);
  const { dataUser } = authInfo;
  let navigate = useNavigate();
  const token = authInfo?.dataUser?.token;
  const premiumExpiration = authInfo?.dataUser?.premiumExpiration ?? null;
  const hasData = !!authInfo?.dataUser?.hasData;
  const [favorites, setFavorites] = useState([]);
  const [meusFits, setMeusFits] = useState(null);
  const [totalCanais, setTotalCanais] = useState(null);
  const [totalFornecedores, setTotalFornecedores] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataCurrentDetail, setDataCurrentDetail] = useState(null);
  const [machines, setMachines] = useState([]);
  const [rows, setRows] = useState([]);

  // useEffect(() => {
  //     dataData();
  // }, [])

  useEffect(() => {
    dataData();

    const intervalId = setInterval(() => {
      dataData();
    }, 60000);

    // Limpar o intervalo quando o componente for desmontado para evitar vazamento de memória
    return () => clearInterval(intervalId);
  }, []);

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
          setTotalFornecedores(res.data);
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
    const fetchMaquinas = async (maquinas) => {
      const promises = [];

      maquinas.forEach((maquina) => {
        const promise = axios
          .get(`${process.env.REACT_APP_SERVIDOR}/pagamentos/${maquina.id}`, {
            headers: {
              "x-access-token": token,
              "content-type": "application/json",
            },
          })
          .then((response) => {
            return { nome: maquina.nome, payments: response.data };
          })
          .catch((error) => {
            console.error(
              `Erro ao buscar a máquina ${maquina.nome} do cliente ${maquina.nome}:`,
              error
            );
            return null; // Retorna null em caso de erro
          });

        promises.push(promise);
      });

      const resultados = await Promise.all(promises);

      return resultados;
    };

    fetchMaquinas(totalFornecedores).then((resultados) => {
      setMachines(resultados);
    });
  }, [token, totalFornecedores]);

  const handleMaquinaClick = (
    id,
    nome,
    storeId,
    pulso,
    estoque,
    descricao,
    maquininha_serial
  ) => {
    const maquinaInfos = {
      nome,
      storeId,
      pulso,
      estoque,
      descricao,
      maquininha_serial,
    };
    navigate(`${links.FORNECEDOR_SEARCH_CANAIS}/${id}`, {
      state: maquinaInfos,
    });
  };

  const totalPayments = machines.reduce((acc, curr) => {
    return acc + curr.payments.total;
  }, 0);

  const chargeBacks = machines.reduce((acc, curr) => {
    return acc + curr.payments.estornos;
  }, 0);

  let allFees = 0;

  machines.forEach(({ payments }) => {
    payments.pagamentos.forEach(({ taxas }) => {
      allFees += Number(taxas);
    });
  });

  useEffect(() => {
    const getRows = () => {
      const rows = [];
      machines.forEach(({ nome, payments }) => {
        payments.pagamentos.forEach((payment) => {
          rows.push({
            maquina: nome,
            data: payment.data,
            tipo: payment.tipo,
            valor: payment.valor,
            mercadoPagoId: payment.mercadoPagoId,
            status: payment.estornado,
          });
        });
      });

      const sortedRows = rows.sort(
        (a, b) => new Date(a.data) + new Date(b.data)
      );
      setRows(sortedRows);
    };

    getRows();
  }, [machines]);

  const columns = [
    {
      title: "Maquina",
      dataIndex: "maquina",
      key: "maquina",
    },
    {
      title: "Data",
      dataIndex: "data",
      key: "data",
      render: (data) => (
        <span>{moment(data).format("DD/MM/YYYY HH:mm:ss")}</span>
      ),
    },
    {
      title: "Forma de pagamento",
      dataIndex: "tipo",
      key: "tipo",
      render: (tipo, record) => (
        <span>
          {tipo === "bank_transfer"
            ? "PIX"
            : tipo === "CASH"
            ? "Especie"
            : tipo === "debit_card"
            ? "Débito"
            : tipo === "credit_card"
            ? "Crédito"
            : tipo === "1"
            ? "Crédito"
            : tipo === "11"
            ? "PIX"
            : tipo === "8"
            ? "Débito"
            : ""}
        </span>
      ),
    },
    {
      title: "Valor",
      dataIndex: "valor",
      key: "valor",
      render: (valor) =>
        new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(valor),
    },
    {
      title: "Identificador",
      dataIndex: "mercadoPagoId",
      key: "mercadoPagoId",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (estornado) => (
        <span style={{ color: estornado ? "gray" : "green" }}>
          {estornado ? "Estornado" : "Recebido"}
        </span>
      ),
    },
  ];

  const pixPayments = rows.filter(({ tipo }) => {
    return tipo === "bank_transfer" || tipo === "11";
  });

  const cardPayments = rows.filter(({ tipo }) => {
    return (
      tipo === "debit_card" ||
      tipo === "8" ||
      tipo === "credit_card" ||
      tipo === "1"
    );
  });

  const cashPayments = rows.filter(({ tipo }) => {
    return tipo === "CASH";
  });

  const otherPayments = rows.filter(({ tipo }) => {
    return !tipo;
  });

  const isMobile = window.innerWidth < 800;

  return (
    <div>
      {isLoading && <LoadingAction />}
      {/* <div className="WarningMsg">
                    {dataUser.warningMsg}
                </div> */}
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
        {/* <Col
          style={{
            display: "flex",
            flex: 1,
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          <Button
            style={{
              backgroundColor: "transparent",
              padding: "20px",
              justifyContent: "center",
              alignItems: "center",
              display: "flex",
              borderRadius: "8px",
            }}
            className="new-client-button"
            onClick={() => navigate(links.ADD_CLIENTES)}
          >
            Filtrar
            <FilterOutlined />
          </Button>
        </Col>*/}
      </Row>
      <Row
        style={{
          paddingRight: "15px",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div style={{ flex: 1 }}>
          <Card>
            <Row style={{ width: "100%", gap: "20px" }} align="middle">
              <Col>
                <img src={iconTransacoes} alt="icone transações" />
              </Col>

              <Col>
                <Typography style={{ fontSize: "20px", fontWeight: "700" }}>
                  {totalPayments
                    ? Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(totalPayments)
                    : "Calculando..."}
                </Typography>
                <Typography style={{ color: "#55556D", fontSize: "18px" }}>
                  Em transações
                </Typography>
              </Col>
            </Row>
          </Card>
        </div>
        <div style={{ flex: 1 }}>
          <Card>
            <Row style={{ width: "100%", gap: "20px" }} align="middle">
              <Col>
                <img src={logoTaxas} alt="icone transações" />
              </Col>

              <Col>
                <Typography style={{ fontSize: "20px", fontWeight: "700" }}>
                  {allFees
                    ? Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(allFees)
                    : "Calculando..."}
                </Typography>
                <Typography style={{ color: "#55556D", fontSize: "18px" }}>
                  Em taxas
                </Typography>
              </Col>
            </Row>
          </Card>
        </div>
        <div style={{ flex: 1 }}>
          <Card>
            <Row style={{ width: "100%", gap: "20px" }} align="middle">
              <Col>
                <img src={logoEstornos} alt="icone transações" />
              </Col>

              <Col>
                <Typography style={{ fontSize: "20px", fontWeight: "700" }}>
                  {chargeBacks
                    ? Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(chargeBacks)
                    : "Calculando..."}
                </Typography>
                <Typography style={{ color: "#55556D", fontSize: "18px" }}>
                  Em estornos
                </Typography>
              </Col>
            </Row>
          </Card>
        </div>
      </Row>
      <Row
        style={{
          width: "100%",
          marginTop: "20px",
          paddingRight: "15px",
          justifyContent: "space-between",
          flexWrap: !isMobile && "nowrap",
          gap: "20px",
        }}
      >
        <div style={{ flex: isMobile ? 1 : 0.9 }}>
          {" "}
          <Card>
            <LineChart
              dadosSemanaPassada={calcularSomasPorSemana(rows).semanaPassada}
              dadosSemanaAtual={calcularSomasPorSemana(rows).estaSemana}
            />
          </Card>
        </div>
        <div
          style={{
            flex: isMobile ? 1 : 0.2,
            justifyContent: "center",
            display: "flex",
          }}
        >
          <Card>
            {" "}
            <DonutChart
              data={[
                {
                  name: "Pix",
                  y: pixPayments.length,
                  color: "#7047EB",
                },
                {
                  name: "Cartão",
                  y: cardPayments.length,
                  color: "#00ACFF",
                },

                {
                  name: "Espécie",
                  y: cashPayments.length,
                  color: "#FFC233",
                },
                {
                  name: "Outros",
                  y: otherPayments.length,
                  color: "#6C6C89",
                },
              ]}
              centerText="teste"
            />
          </Card>
        </div>
      </Row>
      <Row style={{ width: "100%", paddingRight: "15px", marginTop: "20px" }}>
        {" "}
        <Table
          columns={columns}
          dataSource={rows.slice(0, 5)}
          locale={{
            emptyText: (
              <div>Não foram encontrados resultados para sua pesquisa.</div>
            ),
          }}
          style={{ width: "100%", overflowX: "auto" }}
        />
      </Row>
    </div>
  );
};

export default DashboardFornecedor;
