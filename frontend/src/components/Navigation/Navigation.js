import React from "react";
import { Menu, Container, Button, Dropdown, Icon } from "semantic-ui-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useProduction } from "../../contexts/ProductionContext";
import logo from "../../assets/logo1.png";
import "./Navigation.css";

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { currentProductionLine, setProductionLine } = useProduction();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Don't show navigation on login page
  if (location.pathname === "/login") {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  const productionLines = [
    { key: 1, text: "Production Line 1", value: "1" },
    { key: 2, text: "Production Line 2", value: "2" },
    { key: 3, text: "Production Line 3", value: "3" },
    { key: 4, text: "Production Line 4", value: "4" },
    { key: 5, text: "Production Line 5", value: "5" },
  ];

  return (
    <Menu fixed="top" inverted className="navigation">
      <Container>
        <Menu.Item
          as="a"
          header
          className="nav-logo"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="InTrack Logo" className="nav-logo-img" />
        </Menu.Item>

        {/* Production Line Selector */}
        <Menu.Item>
          <Dropdown
            placeholder="Select Production Line"
            selection
            value={currentProductionLine}
            options={productionLines}
            onChange={(e, { value }) => setProductionLine(value)}
          />
        </Menu.Item>

        <Menu.Menu position="right">
          {/* Navigation Links */}
          <Menu.Item
            name="qc-manager"
            active={
              location.pathname === "/qc-manager" || location.pathname === "/"
            }
            onClick={() => navigate("/qc-manager")}
          >
            <Icon name="clipboard check" />
            QC Manager
          </Menu.Item>

          {isAdmin && (
            <Menu.Item
              name="admin"
              active={location.pathname === "/admin"}
              onClick={() => navigate("/admin")}
            >
              <Icon name="dashboard" />
              Dashboard
            </Menu.Item>
          )}

          {/* User Dropdown */}
          <Dropdown
            item
            trigger={
              <span className="nav-user">
                <Icon name="user" />
                {user?.name || user?.email}
              </span>
            }
          >
            <Dropdown.Menu>
              <Dropdown.Item>
                <Icon name="user" />
                Profile
              </Dropdown.Item>
              <Dropdown.Item>
                <Icon name="setting" />
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                <Icon name="sign out" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Menu>
      </Container>
    </Menu>
  );
};

export default Navigation;
