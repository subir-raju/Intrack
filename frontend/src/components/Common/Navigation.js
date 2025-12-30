import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Container,
  Button,
  Dropdown,
  Icon,
  Header,
} from "semantic-ui-react";
import { useAuth } from "../../contexts/AuthContext";
import { useProduction } from "../../contexts/ProductionContext";
import "../../styles/Navigation.css";

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
    <Menu secondary className="navigation-bar">
      <Container>
        <Menu.Item as="a" onClick={() => navigate("/")}>
          <Icon name="industry" />
          InTrack
        </Menu.Item>

        {/* Production Line Selector - Only show for QC Manager */}
        {role === "qc_manager" && (
          <Menu.Item>
            <Dropdown
              placeholder="Select Production Line"
              options={productionLineOptions}
              value={currentProductionLine}
              onChange={(e, data) => setCurrentProductionLine(data.value)}
              selection
            />
          </Menu.Item>
        )}

        <Menu.Menu position="right">
          <Menu.Item>
            <Header as="span" size="small">
              {user?.name} ({role === "admin" ? "Admin" : "QC Manager"})
            </Header>
          </Menu.Item>

          <Menu.Item>
            <Button primary onClick={handleLogout}>
              <Icon name="sign out" />
              Logout
            </Button>
          </Menu.Item>
        </Menu.Menu>
      </Container>
    </Menu>
  );
}

export default Navigation;
