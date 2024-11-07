import React from "react";
import "./Auth.css";
import { Button, Checkbox, Col, Input, Row, Typography } from "antd";
import {
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  FacebookOutlined,
  LockFilled,
  LockOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { FiLogIn } from "react-icons/fi";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";
import logoPower from "../../../assets/images/logoPower.png";
import loginImage from "../../../assets/images/imageLogin.png";
import instagramImage from "../../../assets/images/Instagram.png";
import whatsappImage from "../../../assets/images/whatsapp.png";

const { Title } = Typography;

const Auth = (props) => {
  const {
    authTitle,
    authDescription,
    authFields,
    authSubmit,
    authImage,
    onsubmit,
    successMessage,
    errorMessage,
    textImage,
  } = props;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        position: "relative",
        background: `
          linear-gradient(0deg, #FAFAFA, #FAFAFA), 
          radial-gradient(100% 100% at 50% 0%, rgba(0, 172, 255, 0) 50%, rgba(0, 172, 255, 0.05) 80%, rgba(0, 172, 255, 0) 80%, rgba(0, 172, 255, 0.1) 95%)
        `,
      }}
    >
      <Row
        style={{ justifyContent: "center", gap: "80px", alignItems: "center" }}
      >
        <img src={loginImage} alt="imagem login" className="login-image" />
        <img
          src={logoPower}
          alt="imagem login"
          className="login-image-responsive"
        />
        <form
          className="Admin_Auth_AuthForm"
          style={{
            padding: "40px",
            border: "1px solid #EBEBEF",
            borderRadius: "8px",
          }}
          onSubmit={onsubmit}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: "26px", fontWeight: "700" }}>
              Seja bem-vindo(a)
            </span>
            <img
              src={logoPower}
              alt="logo"
              style={{ width: "64px", height: "64px" }}
              className="login-image-logo"
            />
          </div>

          {authFields.map((itemField, indexField) => {
            switch (itemField.type) {
              case "text":
                return (
                  <div className="Admin_Auth_itemField" key={indexField}>
                    <label
                      htmlFor="username"
                      className="Admin_Auth_itemFieldLabel"
                      style={{ color: "#121217" }}
                    >
                      {itemField.label}
                    </label>
                    <Input
                      placeholder={itemField.placeholder ?? ""}
                      value={itemField.value}
                      id="username"
                      type="text"
                      name="username"
                      autoComplete="username"
                      onChange={(event) => {
                        if (typeof itemField.setField === "function") {
                          itemField.setField(event.target.value);
                        }
                      }}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          onsubmit();
                        }
                      }}
                      style={{
                        border: "1px solid #D1D1DB",
                        boxShadow: "0px 1px 2px 0px #1212170D",
                      }}
                      prefix={<MailOutlined style={{ color: "#8A8AA3" }} />}
                    />
                    {itemField.error && (
                      <div className="Admin_Auth_itemFieldError">
                        {itemField.error}
                      </div>
                    )}
                  </div>
                );
              case "password":
                return (
                  <div className="Admin_Auth_itemField" key={indexField}>
                    <label
                      htmlFor="password"
                      className="Admin_Auth_itemFieldLabel"
                      style={{ color: "#121217" }}
                    >
                      {itemField.label}
                    </label>
                    <Input.Password
                      placeholder={itemField.placeholder ?? ""}
                      id="password"
                      value={itemField.value}
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      iconRender={(visible) =>
                        visible ? (
                          <FontAwesomeIcon
                            icon={faEyeSlash}
                            style={{ color: "#8A8AA3" }}
                          ></FontAwesomeIcon>
                        ) : (
                          <FontAwesomeIcon
                            icon={faEye}
                            style={{ color: "#8A8AA3" }}
                          ></FontAwesomeIcon>
                        )
                      }
                      prefix={<LockOutlined style={{ color: "#8A8AA3" }} />}
                      style={{
                        border: "1px solid #D1D1DB",
                        boxShadow: "0px 1px 2px 0px #1212170D",
                      }}
                      onChange={(event) => {
                        if (typeof itemField.setField === "function") {
                          itemField.setField(event.target.value);
                        }
                      }}
                      onKeyPress={(event) => {
                        if (event.key === "Enter") {
                          onsubmit();
                        }
                      }}
                    />
                    <span
                      style={{
                        color: "#121217",
                        textDecoration: "underline",
                        marginTop: "10px",
                      }}
                    >
                      Esqueci minha senha
                    </span>
                    {itemField.error && (
                      <div className="Admin_Auth_itemFieldError">
                        {itemField.error}
                      </div>
                    )}
                  </div>
                );
              default:
                return null;
            }
          })}
          <Row style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button
              className="Admin_Auth_authSubmit"
              onClick={() => {
                if (typeof onsubmit === "function") {
                  onsubmit();
                }
              }}
              style={{
                maxWidth: "101px",
                height: "40px",
                backgroundColor: "#00ACFF",
              }}
            >
              {authSubmit}
              <ArrowRightOutlined />
            </Button>
          </Row>
        </form>
      </Row>
      {successMessage && (
        <div className="Admin_Auth_successMessage">{successMessage}</div>
      )}
      {errorMessage && (
        <div className="Admin_Auth_errorMessage">
          <div dangerouslySetInnerHTML={{ __html: errorMessage }}></div>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          display: "flex",
          alignItems: "center",
          right: "80px",
          bottom: "40px",
          backgroundColor: "#FAFAFA80",
          backdropFilter: "blur(8px)",
          padding: "5px",
          borderRadius: "8px 0px 0px 8px",
        }}
      >
        Precisa de ajuda?
        <div
          style={{
            backgroundColor: "white",
            padding: "10px 20px",
            borderRadius: "8px",
          }}
        >
          <img src={whatsappImage} alt="whatsapp" />
          <img src={instagramImage} alt="instagram" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
