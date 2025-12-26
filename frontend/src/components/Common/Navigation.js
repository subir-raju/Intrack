import React from "react";
import {
  Menu,
  Container,
  Button,
  Dropdown,
  Icon,
  Header,
} from "semantic-ui-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useProduction } from "../../contexts/ProductionContext";
//import "../../styles/Navigation.css";

function Navigation() {
  const navigate = useNavigate();
  const { user, logout, role } = useAuth();
  const { currentProductionLine, setCurrentProductionLine, productionLines } =
    useProduction();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const productionLineOptions = productionLines.map((line) => ({
    key: line.id,
    text: line.name,
    value: line.id,
  }));

  return (
    <Menu fixed="top" inverted className="navigation-menu">
      <Container>
        <Menu.Item as="a" header onClick={() => navigate("/")}>
          <Icon name="industry" />
          InTrack
        </Menu.Item>

        {role === "qcmanager" && (
          <Menu.Item>
            <span className="menu-label">Production Line:</span>
            <Dropdown
              selection
              value={currentProductionLine}
              options={productionLineOptions}
              onChange={(e, { value }) => setCurrentProductionLine(value)}
              className="production-line-dropdown"
            />
          </Menu.Item>
        )}

        <Menu.Menu position="right">
          {role === "qcmanager" && (
            <Menu.Item
              name="QC Panel"
              active={window.location.pathname === "/qc"}
              onClick={() => navigate("/qc")}
            >
              <Icon name="clipboard check" />
              QC Manager
            </Menu.Item>
          )}

          {role === "admin" && (
            <Menu.Item
              name="Dashboard"
              active={window.location.pathname === "/admin"}
              onClick={() => navigate("/admin")}
            >
              <Icon name="dashboard" />
              Dashboard
            </Menu.Item>
          )}

          <Menu.Item>
            <Dropdown
              trigger={
                <span>
                  <Icon name="user" />
                  {user?.name}
                </span>
              }
              pointing="top right"
            >
              <Dropdown.Menu>
                <Dropdown.Item disabled>
                  <strong>{user?.email}</strong>
                </Dropdown.Item>
                <Dropdown.Item>
                  Role: {role === "admin" ? "Administrator" : "QC Manager"}
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <Icon name="sign out" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>
        </Menu.Menu>
      </Container>
    </Menu>
  );
}

export default Navigation;
