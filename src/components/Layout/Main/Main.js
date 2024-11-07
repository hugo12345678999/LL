import React, { useContext, useState } from "react";
import { Button, Dropdown, Menu, Row, Switch } from "antd";
import { AuthContext } from "../../../contexts/AuthContext";
import "./Main.css";
import * as links from "../../../utils/links";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faServer,
  faXmark,
  faBars,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import {
  AppstoreOutlined,
  DatabaseOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import logoPower from "../../../assets/images/logoPower.png";

const Main = (props) => {
  const { children } = props;
  const { setDataUser, loading, authInfo } = useContext(AuthContext);

  const location = useLocation();
  let navigate = useNavigate();

  const { dataUser } = authInfo;

  const homeRoute =
    dataUser?.key === "CLIENT" ? "/dashboard-maquinas" : "/dashboard-clientes";

  const [isOpen, setIsOpen] = useState(false);

  const menu = (
    <Menu
      items={[
        {
          key: "1",
          label: (
            <div
              onClick={() => {
                setDataUser(null);
              }}
            >
              Sair
            </div>
          ),
        },
      ]}
    />
  );
  return (
    <>
      <div className="Main_container">
        <div
          className={`Main_sidebar ${isOpen ? "open" : ""}`}
          style={{ position: "relative", padding: "15px" }}
        >
          <button
            type="button"
            className="sidebar-burger"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "50%",
              border: "1px solid #D1D1DB",
              padding: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "absolute",
              right: "-15px",
              top: "80px",
            }}
          >
            {isOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          </button>
          <div
            className={`Main_menuProfile ${isOpen ? "open" : ""}`}
            style={{
              borderBottom: "1px solid #D1D1DB",
              width: "90%",
              paddingBottom: "25px",
            }}
          >
            <img src={logoPower} alt="logo" />
          </div>
          <Link
            to={
              dataUser?.key === "CLIENT"
                ? links.DASHBOARD_FORNECEDOR
                : links.DASHBOARD_CLIENTES
            }
            className={`Main_menuitemLink ${isOpen ? "open" : ""}`}
            style={{ width: "100%" }}
          >
            <div
              className="Main_menuitem"
              style={{
                padding: "10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor:
                  window.location.pathname === homeRoute && "#00ACFF1A",
                width: "100%",
                borderRadius: "8px",
              }}
            >
              <HomeOutlined
                style={{
                  color:
                    window.location.pathname === homeRoute
                      ? "#0090D6"
                      : "#6C6C89",
                }}
              />
              <div
                className={`SidebarMaquina ${isOpen ? "open" : ""}`}
                style={{
                  color: window.location.pathname === homeRoute && "#0090D6",
                }}
              >
                Início
              </div>
            </div>
          </Link>
          <Link
            to={
              dataUser?.key === "CLIENT"
                ? "/maquinas"
                : links.DASHBOARD_CLIENTES
            }
            className={`Main_menuitemLink ${isOpen ? "open" : ""}`}
            style={{ width: "100%", marginTop: "0px" }}
          >
            <div
              className="Main_menuitem"
              style={{
                padding: "10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor:
                  window.location.pathname === "/maquinas" && "#00ACFF1A",
                width: "100%",
                borderRadius: "8px",
              }}
            >
              <AppstoreOutlined
                style={{
                  color:
                    window.location.pathname === "/maquinas"
                      ? "#0090D6"
                      : "#6C6C89",
                }}
              />
              <div
                className={`SidebarMaquina ${isOpen ? "open" : ""}`}
                style={{
                  color: window.location.pathname === "/maquinas" && "#0090D6",
                }}
              >
                Máquinas
              </div>
            </div>
          </Link>
          <div
            className={`Main_header ${isOpen ? "open" : ""}`}
            style={{ flexDirection: "column" }}
          >
            {/* <div className="Main_headerBetween"></div> */}
            <Row
              style={{
                marginBottom: "20px",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Switch size="small" />
              <span>Tema escuro</span>
            </Row>
            <div
              className="Main_headerRight"
              onClick={() => {
                navigate(
                  dataUser?.key === "CLIENT" ? links.SIGNIN : links.ADMIN_SIGNIN
                );
                setDataUser(null);
              }}
            >
              {/* <Dropdown overlay={menu} placement="bottomRight" arrow> */}
              <div className="Main_headerSearch">
                <span style={{ fontSize: "12px" }}>{dataUser.name}</span>
                <FontAwesomeIcon
                  className="icon"
                  style={{ marginLeft: "5px" }}
                  icon={faRightFromBracket}
                ></FontAwesomeIcon>
              </div>
              {/* </Dropdown> */}
            </div>
          </div>
        </div>
        <div
          style={{
            width: "100%",
            paddingLeft: "20px",
            paddingTop: "20px",
            paddingBottom: "20px",
          }}
        >
          <div>{children}</div>
        </div>
      </div>
    </>
  );
};

export default Main;
