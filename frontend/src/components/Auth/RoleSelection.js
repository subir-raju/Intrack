import React from "react";
import { Container, Grid, Card, Button, Header, Icon } from "semantic-ui-react";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/RoleSelection.css";

function RoleSelection() {
  const { simulateLogin, loading } = useAuth();

  const handleRoleSelect = (role) => {
    simulateLogin(role);
  };

  return (
    <div className="role-selection-container">
      <Container>
        <div className="role-selection-content">
          <Header as="h1" className="role-title">
            <Icon name="industry" />
            InTrack
          </Header>
          <Header.Subheader className="role-subtitle">
            Quality Control System for Garment Manufacturing
          </Header.Subheader>

          <Grid columns={2} stackable centered className="role-grid">
            <Grid.Column width={6}>
              <Card className="role-card admin-card" fluid>
                <Card.Content textAlign="center">
                  <Icon name="dashboard" size="huge" color="blue" />
                  <Card.Header className="role-card-title">
                    Admin Dashboard
                  </Card.Header>
                  <Card.Description className="role-card-description">
                    View comprehensive analytics and production metrics across
                    all lines
                  </Card.Description>
                </Card.Content>
                <Card.Content extra textAlign="center">
                  <Button
                    primary
                    size="large"
                    className="role-button"
                    onClick={() => handleRoleSelect("admin")}
                    loading={loading}
                    disabled={loading}
                    fluid
                  >
                    <Icon name="arrow right" />
                    Admin
                  </Button>
                </Card.Content>
              </Card>
            </Grid.Column>

            <Grid.Column width={6}>
              <Card className="role-card qc-card" fluid>
                <Card.Content textAlign="center">
                  <Icon name="clipboard check" size="huge" color="green" />
                  <Card.Header className="role-card-title">
                    QC Manager
                  </Card.Header>
                  <Card.Description className="role-card-description">
                    Record production data and manage quality control checks
                  </Card.Description>
                </Card.Content>
                <Card.Content extra textAlign="center">
                  <Button
                    secondary
                    size="large"
                    className="role-button"
                    onClick={() => handleRoleSelect("qcmanager")}
                    loading={loading}
                    disabled={loading}
                    fluid
                  >
                    <Icon name="arrow right" />
                    QC Manager
                  </Button>
                </Card.Content>
              </Card>
            </Grid.Column>
          </Grid>
        </div>
      </Container>
    </div>
  );
}

export default RoleSelection;
