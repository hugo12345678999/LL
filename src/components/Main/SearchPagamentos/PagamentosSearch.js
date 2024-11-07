import React, { useCallback, useContext, useEffect, useState } from "react";
import LoadingAction from "../../../themes/LoadingAction/LoadingAction";
import "./PagamentosSearch.css";
import { Button, Col, Input, Popover, Row, Table, Tag, Typography } from "antd";
import { AuthContext } from "../../../contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import moment from "moment";
import _, { debounce } from "lodash";
import axios from "axios";
import { useParams } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { DatePicker } from "antd";
import "antd/dist/antd.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import * as links from "../../../utils/links";
import {
  AiOutlineEdit,
  AiFillDelete,
  AiFillDollarCircle,
} from "react-icons/ai";
import qr_code_icon from "../../../assets/images/QR.png";
import notes from "../../../assets/images/notes.png";
import {
  ArrowLeftOutlined,
  FilePdfOutlined,
  FilterFilled,
  FilterOutlined,
  PaperClipOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import iconTransacoes from "../../../assets/images/iconTransacoes.png";
import logoTaxas from "../../../assets/images/logoTaxas.png";
import logoEstornos from "../../../assets/images/logoEstornos.png";
import logoEstoque from "../../../assets/images/logoEstoque.png";
import { endOfWeek, getDay, parseISO, startOfWeek } from "date-fns";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";

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

const PagamentosSearch = (props) => {
  const location = useLocation();
  const maquinaInfos = location.state;
  const { setDataUser, loading, authInfo, setNotiMessage } =
    useContext(AuthContext);
  let navigate = useNavigate();
  const token = authInfo?.dataUser?.token;
  const [isLoading, setIsLoading] = useState(false);
  // const [searchText, setsearchText] = useState('');
  const [searchText, setSearchText] = useState("");
  const [listCanals, setListCanals] = useState([]);
  const [estornos, setEstornos] = useState("");
  const [estoque, setEstoque] = useState("");
  const [cash, setCash] = useState("");
  const [total, setTotal] = useState("");
  const [loadingTable, setLoadingTable] = useState(false);
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [dataMaquinas, setDataMaquinas] = useState(null);
  const [taxas, setTaxas] = useState(0);
  const [creditoRemoto, setCreditoRemoto] = useState(null);

  const isMobile = window.innerWidth < 800;

  useEffect(() => {
    const pegarTaxas = () => {
      const totalTaxas = listCanals.reduce((acc, curr) => {
        return acc + Number(curr.taxas);
      }, 0);

      setTaxas(totalTaxas);
    };
    pegarTaxas();
  }, [listCanals]);

  // const []
  const { id } = useParams();
  const { RangePicker } = DatePicker;
  useEffect(() => {
    getData(id);
    // getMaquinas(id)
  }, []);

  useEffect(() => {
    if (dataFim != null) {
      getPaymentsPeriod(dataInicio, dataFim);
    }
  }, [dataFim]);

  const getData = (id) => {
    if (id.trim() !== "") {
      setLoadingTable(true);
      axios
        .get(`${process.env.REACT_APP_SERVIDOR}/pagamentos/${id}`, {
          headers: {
            "x-access-token": token,
            "content-type": "application/json",
          },
        })
        .then((res) => {
          setLoadingTable(false);
          setEstornos(res.data.estornos);
          setCash(res?.data?.cash);
          setEstoque(res?.data?.estoque);
          setTotal(res.data.total);
          if (res.status === 200 && Array.isArray(res.data.pagamentos)) {
            setListCanals(res.data.pagamentos);
          }
        })
        .catch((err) => {
          setLoadingTable(false);
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
    }
  };

  const getMaquinas = (id) => {
    axios
      .get(`${process.env.REACT_APP_SERVIDOR}/maquinas`, {
        headers: {
          "x-access-token": token,
          "content-type": "application/json",
        },
      })
      .then((res) => {
        if (res.status === 200 && Array.isArray(res.data)) {
          const maquinasData = res.data.find((item) => item.id === id);
          setDataMaquinas(maquinasData ?? null);
        } else {
          throw new Error();
        }
      })
      .catch((err) => {});
  };

  const onSaveCreditoRemoto = () => {
    // check require
    let errorsTemp = {};
    if (creditoRemoto.trim() === "") {
      errorsTemp.valor = "Este campo é obrigatório";
    }
    if (Object.keys(errorsTemp).length > 0) {
      return;
    }

    setIsLoading(true);
    axios
      .post(
        `${process.env.REACT_APP_SERVIDOR}/credito-remoto-cliente`,
        {
          id: id,
          valor: creditoRemoto,
        },
        {
          headers: {
            "x-access-token": token,
            "content-type": "application/json",
          },
        }
      )
      .then((res) => {
        setIsLoading(false);
        setNotiMessage({
          type: "success",
          message: `${res?.data?.retorno}`,
        });
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
        } else {
          setNotiMessage({
            type: "error",
            // message: 'Erro, algo deu errado ' + (err.response?.data?.msg ?? "")
            message: `Erro, algo deu errado ${err.response?.data?.msg}`,
          });
        }
      });
  };

  const getPaymentsPeriod = (dataInicio, dataFim) => {
    if (id.trim() !== "") {
      setLoadingTable(true);
      const url = `${process.env.REACT_APP_SERVIDOR}/pagamentos-periodo/${id}`;
      axios
        .post(
          url,
          {
            dataInicio: dataInicio + "T00:00:00.000Z",
            dataFim: dataFim + "T23:59:00.000Z",
          },
          {
            headers: {
              "x-access-token": token,
              "content-type": "application/json",
            },
          }
        )
        .then((res) => {
          setLoadingTable(false);
          setEstornos(res.data.estornos);
          setCash(res?.data?.cash);
          setTotal(res.data.total);
          if (res.status === 200 && Array.isArray(res.data.pagamentos)) {
            setListCanals(res.data.pagamentos);
          }
        })
        .catch((err) => {
          setLoadingTable(false);
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
    }
  };

  const columns = [
    {
      title: "Data",
      dataIndex: "data",
      key: "data",
      width: 500,
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
      title: "Estornado",
      dataIndex: "estornado",
      key: "estornado",
      width: 100,
      render: (estornado, record) =>
        estornado ? (
          <OverlayTrigger
            key={record.key}
            placement="top"
            overlay={
              <Tooltip id={`tooltip-top-${record.key}`}>
                {record.motivoEstorno
                  ? record.motivoEstorno
                  : "Sem motivo registrado"}
              </Tooltip>
            }
          >
            <span style={{ color: "gray", cursor: "pointer" }}>
              {estornado ? "Estornado" : "Recebido"}
            </span>
          </OverlayTrigger>
        ) : (
          <span style={{ color: estornado ? "gray" : "green" }}>
            {estornado ? "Estornado" : "Recebido"}
          </span>
        ),
    },
  ];

  const onRelatorioHandler = () => {
    if (!dataInicio && !dataFim) {
      setNotiMessage({
        type: "error",
        message:
          "Selecione no calendario a esquerda a data de inicio e firm para gerar o relatorio para essa maquina!",
      });
    } else {
      navigate(`${links.RELATORIO}/${id}`, {
        state: { maquinaInfos, dataInicio, dataFim },
      });
    }
  };

  const pixPayments = listCanals.filter(({ tipo }) => {
    return tipo === "bank_transfer" || tipo === "11";
  });

  const cardPayments = listCanals.filter(({ tipo }) => {
    return (
      tipo === "debit_card" ||
      tipo === "8" ||
      tipo === "credit_card" ||
      tipo === "1"
    );
  });

  const cashPayments = listCanals.filter(({ tipo }) => {
    return tipo === "CASH";
  });

  const otherPayments = listCanals.filter(({ tipo }) => {
    return !tipo;
  });

  return (
    <div className="PagamentosSearch_container">
      {isLoading && <LoadingAction />}
      <Row
        style={{
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ArrowLeftOutlined
            style={{ cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
          <Typography style={{ fontSize: "24px", fontWeight: "700" }}>
            {maquinaInfos.nome}
          </Typography>
          <Tag
            color={
              maquinaInfos.status === "OFFLINE" ||
              maquinaInfos.status === "Inativa"
                ? "#FEF0F4"
                : "#EEFBF4"
            }
            style={{
              borderRadius: "8px",
              color:
                maquinaInfos.status === "OFFLINE" ||
                maquinaInfos.status === "Inativa"
                  ? "#D50B3E"
                  : "#17663A",
            }}
          >
            {maquinaInfos.status}
          </Tag>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            overflow: "auto",
            marginBottom: "20px",
          }}
        >
          <Button
            className="PagamentosSearch_header_editBtn"
            style={{ padding: "20px 12px", borderRadius: "8px", gap: "5px" }}
          >
            <span>Filtrar</span>
            <FilterOutlined />
          </Button>
          <Popover
            content={
              <div style={{ maxWidth: "150px" }}>
                <Col>
                  <label style={{ fontWeight: 700 }}>Valor do crédito:</label>
                  <Input
                    type="text"
                    onChange={(e) => setCreditoRemoto(e.target.value)}
                    value={creditoRemoto}
                    style={{ borderRadius: "8px" }}
                    placeholder="0,00"
                    prefix={<>R$</>}
                  />
                  <div
                    style={{
                      width: "100%",
                      justifyContent: "flex-end",
                      display: "flex",
                    }}
                  >
                    <Button
                      style={{
                        backgroundColor: "#00ACFF",
                        borderRadius: "8px",
                        color: "white",
                        marginTop: "10px",
                      }}
                      onClick={() => {
                        if (creditoRemoto) {
                          onSaveCreditoRemoto();
                        }
                      }}
                    >
                      Enviar
                    </Button>
                  </div>
                </Col>
              </div>
            }
            title="Crédito remoto"
            trigger="click"
          >
            <Button
              className="PagamentosSearch_header_editBtn"
              style={{ padding: "20px 12px", borderRadius: "8px", gap: "5px" }}
            >
              <span>Crédito Remoto</span>
              <WalletOutlined />
            </Button>
          </Popover>

          <Button
            className="PagamentosSearch_header_editBtn"
            style={{ padding: "20px 12px", borderRadius: "8px", gap: "5px" }}
          >
            <span>Gerar PDF</span>
            <FilePdfOutlined />
          </Button>
          <Button
            className="PagamentosSearch_header_editBtn"
            onClick={() => {
              navigate(`${links.EDIT_FORNECEDOR_CANAIS}/${id}`, {
                state: location.state,
              });
            }}
            style={{ padding: "20px 12px", borderRadius: "8px", gap: "5px" }}
          >
            <span>Editar</span>
            <AiOutlineEdit />
          </Button>
        </div>
      </Row>
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(1, 1fr)" : "repeat(4, 1fr)",
          marginBottom: "20px",
          gridGap: "20px",
        }}
      >
        <Card>
          <Row style={{ width: "100%", gap: "20px" }} align="middle">
            <Col>
              <img src={iconTransacoes} alt="icone transações" />
            </Col>

            <Col>
              <Typography style={{ fontSize: "20px", fontWeight: "700" }}>
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(total)}
              </Typography>
              <Typography style={{ color: "#55556D", fontSize: "18px" }}>
                Em transações
              </Typography>
            </Col>
          </Row>
        </Card>{" "}
        <Card>
          <Row style={{ width: "100%", gap: "20px" }} align="middle">
            <Col>
              <img src={logoTaxas} alt="icone transações" />
            </Col>

            <Col>
              <Typography style={{ fontSize: "20px", fontWeight: "700" }}>
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(taxas)}
              </Typography>
              <Typography style={{ color: "#55556D", fontSize: "18px" }}>
                Em taxas
              </Typography>
            </Col>
          </Row>
        </Card>{" "}
        <Card>
          <Row style={{ width: "100%", gap: "20px" }} align="middle">
            <Col>
              <img src={logoEstornos} alt="icone transações" />
            </Col>

            <Col>
              <Typography style={{ fontSize: "20px", fontWeight: "700" }}>
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(estornos)}
              </Typography>
              <Typography style={{ color: "#55556D", fontSize: "18px" }}>
                Em estornos
              </Typography>
            </Col>
          </Row>
        </Card>{" "}
        <Card>
          <Row style={{ width: "100%", gap: "20px" }} align="middle">
            <Col>
              <img src={logoEstoque} alt="icone transações" />
            </Col>

            <Col>
              <Typography style={{ fontSize: "20px", fontWeight: "700" }}>
                {estoque}
              </Typography>
              <Typography style={{ color: "#55556D", fontSize: "18px" }}>
                Estoque da máquina
              </Typography>
            </Col>
          </Row>
        </Card>
      </div>
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
              dadosSemanaPassada={
                calcularSomasPorSemana(listCanals).semanaPassada
              }
              dadosSemanaAtual={calcularSomasPorSemana(listCanals).estaSemana}
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
      <Typography
        style={{
          fontSize: "18px",
          fontWeight: "700",
          marginBottom: "20px",
        }}
      >
        Últimas transações
      </Typography>

      <div style={{ width: "100%", overflow: "auto" }}>
        {" "}
        <Table
          columns={columns}
          dataSource={listCanals}
          pagination={false}
          loading={loadingTable}
          locale={{
            emptyText:
              searchText.trim() !== "" ? (
                "-"
              ) : (
                <div>Não foram encontrados resultados para sua pesquisa.</div>
              ),
          }}
        />
      </div>
    </div>
  );
};

export default PagamentosSearch;
