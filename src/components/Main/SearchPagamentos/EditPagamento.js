import React, { useContext, useEffect, useState } from "react";
import LoadingAction from "../../../themes/LoadingAction/LoadingAction";
import "./EditPagamento.css";
import {
  Badge,
  Button,
  Col,
  DatePicker,
  Input,
  Row,
  Tag,
  Typography,
} from "antd";
import { AuthContext } from "../../../contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import * as links from "../../../utils/links";
import axios from "axios";
import question_icon from "../../../assets/images/question.png";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";

const EditPagamento = (props) => {
  const location = useLocation();
  let navigate = useNavigate();

  const maquinaInfos = location.state;

  const { authInfo, setNotiMessage } = useContext(AuthContext);

  const [data, setData] = useState({
    nome: maquinaInfos?.nome ?? "",
    descricao: maquinaInfos?.descricao ?? "",
    estoque: Number(maquinaInfos?.estoque) ?? 0,
    store_id: Number(maquinaInfos?.storeId) ?? 0,
    maquininha_serial: String(maquinaInfos?.maquininha_serial),
    valorDoPulso: maquinaInfos?.pulso ?? 0,
  });
  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const token = authInfo?.dataUser?.token;

  const { id } = useParams();

  const handleChange = (name, value) => {
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => {
      let errorsTemp = { ...prev };
      delete errorsTemp[name];
      return errorsTemp;
    });
  };

  const onSave = () => {
    // check require
    let errorsTemp = {};
    if (data.nome.trim() === "") {
      errorsTemp.nome = "Este campo é obrigatório";
    }
    if (data.descricao.trim() === "") {
      errorsTemp.descricao = "Este campo é obrigatório";
    }

    if (data.valorDoPulso < 0) {
      errorsTemp.valorDoPulso = "Este campo é obrigatório";
    }
    if (data.estoque < 0) {
      errorsTemp.estoque = "Estoque é obrigatório";
    }
    if (Object.keys(errorsTemp).length > 0) {
      setErrors(errorsTemp);
      return;
    }

    setIsLoading(true);
    axios
      .put(
        `${process.env.REACT_APP_SERVIDOR}/maquina-cliente`,
        {
          id,
          nome: data.nome,
          descricao: data.descricao,
          estoque: Number(data.estoque),
          store_id: String(data.store_id),
          maquininha_serial: String(data.maquininha_serial),
          valorDoPulso: data.valorDoPulso,
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
        navigate(links.DASHBOARD_FORNECEDOR);
      })
      .catch((err) => {
        setIsLoading(false);
        if ([401, 403].includes(err.response.status)) {
          setNotiMessage({
            type: "error",
            message:
              "A sua sessão expirou, para continuar faça login novamente.",
          });
        } else if (err.response.status === 400) {
          setNotiMessage({
            type: "error",
            message: `${err.response.data.error}`,
          });
          setErrors((prev) => ({
            ...prev,
            nome: "Já existe uma máquina com esse nome",
          }));
        } else {
          setNotiMessage({
            type: "error",
            message: "Um erro ocorreu",
          });
        }
      });
  };

  return (
    <div className="PagamentosSearch_container">
      {isLoading && <LoadingAction />}
      <Row style={{ width: "100%", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ArrowLeftOutlined
            style={{ cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
          <Typography style={{ fontSize: "24px", fontWeight: "700" }}>
            Editar máquina
          </Typography>
          <Tag
            color={maquinaInfos.status === "Inativa" ? "#FEF0F4" : "#EEFBF4"}
            style={{
              borderRadius: "8px",
              color: maquinaInfos.status === "Inativa" ? "#D50B3E" : "#17663A",
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
          }}
        >
          <Button
            style={{
              backgroundColor: "transparent",
              borderRadius: "8px",
              padding: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            style={{
              backgroundColor: "#26A95F",
              color: "white",
              borderRadius: "8px",
              padding: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => {
              if (!isLoading) onSave();
            }}
            disabled={isLoading}
          >
            Salvar
            <SaveOutlined />
          </Button>
        </div>
      </Row>
      <Col
        style={{
          width: "100%",
          padding: "20px",
          border: "1px solid #EBEBEF",
          borderRadius: "8px",
          marginTop: "20px",
        }}
      >
        <Row style={{ width: "100%", gap: "20px" }}>
          <Col style={{ width: "50%" }}>
            {" "}
            <label
              className="AddCliente_itemFieldLabel"
              htmlFor="nome"
              style={{ fontWeight: "700" }}
            >
              Nome da máquina
            </label>
            <Input
              placeholder={"Nome da máquina"}
              value={data.nome}
              id="nome"
              type="text"
              name="nome"
              autoComplete="nome"
              onChange={(event) => {
                handleChange("nome", event.target.value);
              }}
              className={`${!!errors.nome ? "AddCliente_inputError" : ""}`}
              style={{ borderRadius: "8px" }}
            />
            {errors.nome && (
              <div className="Update_Pagamento_itemFieldError">
                {errors.nome}
              </div>
            )}
          </Col>
          <Col style={{ flex: 1 }}>
            <label
              className="AddCliente_itemFieldLabel"
              htmlFor="mercadoPagoToken"
              style={{ fontWeight: "700" }}
            >
              Descrição
            </label>

            <Input
              placeholder={"Nome da loja"}
              value={data.descricao}
              id="descricao"
              type="text"
              name="nome"
              autoComplete="descricao"
              onChange={(event) => {
                handleChange("descricao", event.target.value);
              }}
              className={`${
                !!errors.descricao ? "Update_Pagamento_inputError" : ""
              }`}
              style={{ borderRadius: "8px" }}
            />
            {errors.descricao && (
              <div className="Update_Pagamento_itemFieldError">
                {errors.descricao}
              </div>
            )}
          </Col>
        </Row>
        <Row style={{ width: "100%", gap: "20px", marginTop: "20px" }}>
          <Col style={{ width: "50%" }}>
            {" "}
            <label
              className="AddCliente_itemFieldLabel"
              htmlFor="nome"
              style={{ fontWeight: "700" }}
            >
              Estoque
            </label>
            <Input
              placeholder={"1.50"}
              value={data.estoque}
              id="estoque"
              type="number"
              name="estoque"
              autoComplete="estoque"
              onChange={(event) => {
                handleChange("estoque", event.target.value);
              }}
              className={`${
                !!errors.estoque ? "Update_Pagamento_inputError" : ""
              }`}
              style={{ borderRadius: "8px" }}
            />
            {errors.estoque && (
              <div className="Update_Pagamento_itemFieldError">
                {errors.estoque}
              </div>
            )}
          </Col>
          <Col style={{ flex: 1 }}>
            <label
              className="AddCliente_itemFieldLabel"
              htmlFor="mercadoPagoToken"
              style={{ fontWeight: "700" }}
            >
              Valor do pulso
            </label>

            <Input
              placeholder={"1.50"}
              value={data.valorDoPulso}
              id="valorDoPulso"
              type="number"
              name="valorDoPulso"
              autoComplete="valorDoPulso"
              onChange={(event) => {
                handleChange("valorDoPulso", event.target.value);
              }}
              className={`${
                !!errors.valorDoPulso ? "Update_Pagamento_inputError" : ""
              }`}
              style={{ borderRadius: "8px" }}
            />
            {errors.valorDoPulso && (
              <div className="Update_Pagamento_itemFieldError">
                {errors.valorDoPulso}
              </div>
            )}
          </Col>
        </Row>
      </Col>
    </div>
  );
};

export default EditPagamento;
