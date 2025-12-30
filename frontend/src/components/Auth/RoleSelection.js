import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Grid, Card, Button, Header, Icon } from "semantic-ui-react";
import "../../styles/RoleSelection.css";

function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    // Navigate to respective login page based on role selected
    if (role === "admin") {
      navigate("/login/admin");
    } else if (role === "qc") {
      navigate("/login/qc");
    }
  };

  return (
    <div className="role-selection-container">
      <Container textAlign="center" style={{ marginTop: "50px" }}>
        <Header as="h1" style={{ marginBottom: "50px" }}>
          <Icon name="industry" />
          InTrack - Quality Control Management System
        </Header>

        <Grid
          columns={2}
          stackable
          relaxed
          centered
          style={{ maxWidth: "800px", margin: "0 auto" }}
        >
          {/* Admin Card */}
          <Grid.Column>
            <Card className="role-card admin-card">
              <Card.Content textAlign="center">
                <Icon name="user shield" size="huge" color="blue" />
                <Card.Header style={{ marginTop: "20px" }}>Admin</Card.Header>
                <Card.Description
                  style={{ marginTop: "10px", marginBottom: "20px" }}
                >
                  View analytics, monitor production lines, and manage quality
                  metrics
                </Card.Description>
                <Button
                  primary
                  size="large"
                  onClick={() => handleRoleSelect("admin")}
                  style={{ width: "100%" }}
                >
                  Login as Admin
                </Button>
              </Card.Content>
            </Card>
          </Grid.Column>

          {/* QC Manager Card */}
          <Grid.Column>
            <Card className="role-card qc-card">
              <Card.Content textAlign="center">
                <Icon name="check circle" size="huge" color="green" />
                <Card.Header style={{ marginTop: "20px" }}>
                  QC Manager
                </Card.Header>
                <Card.Description
                  style={{ marginTop: "10px", marginBottom: "20px" }}
                >
                  Record production data, track defects, and manage quality
                  control
                </Card.Description>
                <Button
                  color="green"
                  size="large"
                  onClick={() => handleRoleSelect("qc")}
                  style={{ width: "100%" }}
                >
                  Login as QC Manager
                </Button>
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid>
      </Container>
    </div>
  );
}

export default RoleSelection;
