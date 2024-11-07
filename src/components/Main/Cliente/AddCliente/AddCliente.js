import React, { useContext, useState } from "react";
import { Button, Input, DatePicker, Tooltip, Row, Typography, Col } from "antd";
import "./AddCliente.css";
import axios from "axios";
import { AuthContext } from "../../../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import * as links from "../../../../utils/links";
import LoadingAction from "../../../../themes/LoadingAction/LoadingAction";
import question_icon from "../../../../assets/images/question.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import { ArrowLeftOutlined, SaveFilled, SaveOutlined } from "@ant-design/icons";

const AddCliente = (props) => {
  const { authInfo, setDataUser, setNotiMessage } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = authInfo?.dataUser?.token;

  const dateFormat = "YYYY-MM-DD";
  let currentDate = moment();

  const [data, setData] = useState({
    nome: "",
    email: "",
    senha: "",
    mercadoPagoToken: "",
    dataVencimento: currentDate.add(1, "years"),
    pagbankToken: "",
    pagbankEmail: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
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

  const validateEmail = (email) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const onSave = () => {
    // check require
    let errorsTemp = {};
    if (data.nome.trim() === "") {
      errorsTemp.nome = "Este campo é obrigatório";
    }

    if (!validateEmail(data.email)) {
      errorsTemp.email = "Este campo é obrigatório";
    }
    if (data.senha.trim().length < 6) {
      errorsTemp.senha = "A senha deve possuir no mínimo 6 dígitos.";
    }

    if (Object.keys(errorsTemp).length > 0) {
      setErrors(errorsTemp);
      return;
    }

    setIsLoading(true);
    axios
      .post(
        `${process.env.REACT_APP_SERVIDOR}/cliente`,
        {
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          mercadoPagoToken: data.mercadoPagoToken,
          dataVencimento: new Date(data.dataVencimento),
          pagbankToken: data.pagbankToken,
          pagbankEmail: data.pagbankEmail,
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
        navigate(links.DASHBOARD_CLIENTES);
      })
      .catch((err) => {
        setIsLoading(false);

        setNotiMessage({
          type: "error",
          message: err.response?.data?.error
            ? err.response?.data?.error
            : `A sua sessão expirou, para continuar faça login novamente.`,
        });
      });
  };

  const handleGeneratePassword = () => {
    handleChange("senha", String(Math.floor(100000 + Math.random() * 9000)));
  };

  return (
    <>
      {isLoading && <LoadingAction />}
      <div className="AddCliente_container" style={{ paddingRight: "15px" }}>
        <Row style={{ width: "100%", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ArrowLeftOutlined
              style={{ cursor: "pointer" }}
              onClick={() => navigate(-1)}
            />
            <Typography style={{ fontSize: "24px", fontWeight: "700" }}>
              Novo cliente
            </Typography>
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
    </>
  );
};

export default AddCliente;
