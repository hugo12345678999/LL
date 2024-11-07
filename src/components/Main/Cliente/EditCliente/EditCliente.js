import React, { useContext, useState } from "react";
import LoadingAction from "../../../../themes/LoadingAction/LoadingAction";
import "./EditCliente.css";
import { Button, Input, DatePicker, Tooltip, Col, Row, Typography } from "antd";
import { AuthContext } from "../../../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import * as links from "../../../../utils/links";
import axios from "axios";
import question_icon from "../../../../assets/images/question.png";
import moment from "moment";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";

const EditCliente = (props) => {
  const location = useLocation();
  let navigate = useNavigate();

  const cliente = location.state;

  const { authInfo, setNotiMessage } = useContext(AuthContext);

  const dateFormat = "DD/MM/YYYY";
  let currentDate = moment();

  const [data, setData] = useState({
    nome: cliente?.nome ?? "",
    mercadoPagoToken: cliente?.mercadoPagoToken ?? "",
    dataVencimento: cliente?.dataVencimento
      ? moment(cliente.dataVencimento, "DD/MM/YYYY")
      : null,
    pagbankToken: cliente?.pagbankToken,
    pagbankEmail: cliente?.pagbankEmail,
  });
  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const handleGeneratePassword = () => {
    handleChange("senha", String(Math.floor(100000 + Math.random() * 9000)));
  };

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

    if (Object.keys(errorsTemp).length > 0) {
      setErrors(errorsTemp);
      return;
    }

    let body = {
      nome: data.nome,
      dataVencimento: data.dataVencimento
        ? moment(data.dataVencimento, "DD/MM/YYYY")
        : null,
    };

    if (
      data.mercadoPagoToken !== undefined &&
      (cliente.mercadoPagoToken === undefined ||
        data.mercadoPagoToken.toString() !==
          cliente.mercadoPagoToken?.toString())
    ) {
      body.mercadoPagoToken = data.mercadoPagoToken;
    }

    if (
      data.pagbankToken &&
      data.pagbankToken.toString() !== cliente.pagbankToken.toString()
    )
      body.pagbankToken = data.pagbankToken;

    if (
      data.pagbankEmail &&
      data.pagbankEmail.toString() !== cliente.pagbankEmail.toString()
    )
      body.pagbankEmail = data.pagbankEmail;

    setIsLoading(true);
    axios
      .put(
        `${process.env.REACT_APP_SERVIDOR}/alterar-cliente-adm-new/${id}`,
        body,
        {
          headers: {
            "x-access-token": token,
            "content-type": "application/json",
          },
        }
      )
      .then((res) => {
        setIsLoading(false);
        navigate(`${links.DASHBOARD_CLIENTES}`, {
          state: location.state,
        });
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

  const onNewPassword = () => {
    axios
      .put(
        `${process.env.REACT_APP_SERVIDOR}/cliente-trocar-senha`,
        { email: cliente?.email },
        {
          headers: {
            "x-access-token": token,
            "content-type": "application/json",
          },
        }
      )
      .then((res) => {
        setNewPassword(res?.data?.newPassword);
      })
      .catch((err) => {
        setIsLoading(false);
        setNotiMessage({
          type: "error",
          message: err.response?.data?.error,
        });
      });
  };

  return (
    <div className="Edit_Cliente_container">
      {isLoading && <LoadingAction />}
      <Row style={{ width: "100%", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ArrowLeftOutlined
            style={{ cursor: "pointer" }}
            onClick={() => navigate(-1)}
          />
          <Typography style={{ fontSize: "24px", fontWeight: "700" }}>
            Editar cliente
          </Typography>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Typography
            onClick={() => {
              navigate(`${links.DELETE_CLIENTE}/${id}`, {
                state: location.state,
              });
            }}
            disabled={isLoading}
            style={{ color: "red", cursor: "pointer" }}
          >
            Excluir cliente
          </Typography>
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
          <Col flex={1}>
            {" "}
            <label
              className="AddCliente_itemFieldLabel"
              htmlFor="nome"
              style={{ fontWeight: "700" }}
            >
              Nome do cliente
            </label>
            <Input
              placeholder={"Jukinha da Silva"}
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
              <div className="AddCliente_itemFieldError">{errors.nome}</div>
            )}
          </Col>
          <Col flex={1}>
            <label
              className="AddCliente_itemFieldLabel"
              htmlFor="mercadoPagoToken"
              style={{ fontWeight: "700" }}
            >
              Data de Vencimento
            </label>
            <Tooltip title="A data de vencimento do cliente é uma data que após 10 dias é feito a trava das máquinas do cliente para receber pagamentos. Ideal para quem cobra mensalidade, se não definida por padrão colocamos 1 (um) ano. se não quiser usar coloque uma data maior">
              <img
                src={question_icon}
                alt="question icon"
                className="AddCliente_Icon"
              />
            </Tooltip>
            <DatePicker
              defaultValue={data.dataVencimento}
              format={dateFormat}
              id="dataVencimento"
              name="dataVencimento"
              autoComplete="dataVencimento"
              onChange={(vl, dateString) => {
                handleChange("dataVencimento", dateString);
              }}
              className={`${
                !!errors.dataVencimento ? "AddCliente_inputError" : ""
              }`}
              style={{ marginTop: "-2px", borderRadius: "8px" }}
            />
            {errors.dataVencimento && (
              <div className="AddCliente_itemFieldError">
                {errors.dataVencimento}
              </div>
            )}
          </Col>
        </Row>
        <Row style={{ width: "100%", gap: "20px", marginTop: "20px" }}>
          <Col flex={1}>
            <label
              className="AddCliente_itemFieldLabel"
              htmlFor="email"
              style={{ fontWeight: "700" }}
            >
              Email
            </label>
            <Input
              placeholder={"Jukinha@gmail.com"}
              value={data.email}
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              onChange={(event) => {
                handleChange("email", event.target.value);
              }}
              className={`${!!errors.email ? "AddCliente_inputError" : ""}`}
              style={{ borderRadius: "8px", flex: 1 }}
            />
            {errors.email && (
              <div className="AddCliente_itemFieldError">{errors.email}</div>
            )}
          </Col>
          <Col flex={1}>
            <label
              className="AddCliente_itemFieldLabel"
              htmlFor="mercadoPagoToken"
              style={{ fontWeight: "700" }}
            >
              Senha
            </label>
            {/* */}
            <Input
              placeholder={"********"}
              value={data.senha}
              id="senha"
              type="text"
              name="senha"
              autoComplete="senha"
              onChange={(event) => {
                handleChange("senha", event.target.value);
              }}
              className={`${!!errors.senha ? "AddCliente_inputError" : ""}`}
              style={{ borderRadius: "8px", width: "100%" }}
              suffix={
                <Typography
                  style={{
                    fontSize: "12px",
                    position: "absolute",
                    right: "10px",
                    borderLeft: "1px solid #EBEBEF",
                    paddingLeft: "10px",
                    cursor: "pointer",
                  }}
                  onClick={handleGeneratePassword}
                >
                  Gerar
                </Typography>
              }
            />

            {errors.senha && (
              <div className="AddCliente_itemFieldError">{errors.senha}</div>
            )}
          </Col>
        </Row>
        <Col flex={1} style={{ marginTop: "20px" }}>
          {" "}
          <label
            className="AddCliente_itemFieldLabel"
            htmlFor="mercadoPagoToken"
            style={{ fontWeight: "700" }}
          >
            Token Mercado Pago
          </label>
          <Input
            placeholder={"APPMP123123-12312-123123"}
            value={data.mercadoPagoToken}
            id="mercadoPagoToken"
            type="text"
            name="mercadoPagoToken"
            autoComplete="mercadoPagoToken"
            onChange={(event) => {
              handleChange("mercadoPagoToken", event.target.value);
            }}
            className={`${
              !!errors.mercadoPagoToken ? "AddCliente_inputError" : ""
            }`}
            style={{ borderRadius: "8px" }}
          />
          {errors.mercadoPagoToken && (
            <div className="AddCliente_itemFieldError">
              {errors.mercadoPagoToken}
            </div>
          )}
        </Col>
        <Row style={{ width: "100%", gap: "20px", marginTop: "20px" }}>
          <Col flex={1}>
            <label
              className="AddCliente_itemFieldLabel"
              htmlFor="pagbankToken"
              style={{ fontWeight: "700" }}
            >
              Token Pagbank
            </label>
            <Input
              placeholder={"Token do PagBank"}
              value={data.pagbankToken}
              id="pagbankToken"
              type="text"
              name="pagbankToken"
              autoComplete="pagbankToken"
              onChange={(event) => {
                handleChange("pagbankToken", event.target.value);
              }}
              className={`${
                !!errors.pagbankToken ? "AddCliente_inputError" : ""
              }`}
              style={{ borderRadius: "8px" }}
            />
            {errors.pagbankToken && (
              <div className="AddCliente_itemFieldError">
                {errors.pagbankToken}
              </div>
            )}
          </Col>
          <Col flex={1}>
            <label
              className="AddCliente_itemFieldLabel"
              htmlFor="pagbankEmail"
              style={{ fontWeight: "700" }}
            >
              Email Pagbank
            </label>
            <Input
              placeholder={"email@pagbank.com"}
              value={data.pagbankEmail}
              id="pagbankEmail"
              type="email"
              name="pagbankEmail"
              autoComplete="pagbankEmail"
              onChange={(event) => {
                handleChange("pagbankEmail", event.target.value);
              }}
              className={`${
                !!errors.pagbankEmail ? "AddCliente_inputError" : ""
              }`}
              style={{ borderRadius: "8px" }}
            />
            {errors.pagbankEmail && (
              <div className="AddCliente_itemFieldError">
                {errors.pagbankEmail}
              </div>
            )}
          </Col>
        </Row>
      </Col>
    </div>
  );
};

export default EditCliente;
