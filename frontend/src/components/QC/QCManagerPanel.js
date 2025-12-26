import React, { useState } from "react";
import {
  Grid,
  Card,
  Button,
  Header,
  Statistic,
  Message,
  Loader,
  Divider,
} from "semantic-ui-react";
import { useProduction } from "../../contexts/ProductionContext";
import DefectSelectionModal from "./DefectSelectionModal";
import ModificationModal from "./ModificationModal";
import RejectionModal from "./RejectionModal";
//import "./QCManagerPanel.css";

const QCManagerPanel = () => {
  const {
    dailyStats,
    currentProductionLine,
    recordProduction,
    loading,
    error,
  } = useProduction();

  const [activeModal, setActiveModal] = useState(null);

  const handleFirstTimeThrough = async () => {
    await recordProduction("first_time_through");
  };

  const handleNeedImprovement = () => {
    setActiveModal("defects");
  };

  const handleModified = () => {
    setActiveModal("modifications");
  };

  const handleReject = () => {
    setActiveModal("rejection");
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  if (!currentProductionLine) {
    return (
      <Message warning>
        <Message.Header>No Production Line Selected</Message.Header>
        <p>
          Please select a production line from the navigation bar to continue.
        </p>
      </Message>
    );
  }

  return (
    <div className="qc-manager-panel">
      <Header as="h2" textAlign="center">
        Quality Control Panel - Line {currentProductionLine}
      </Header>

      {error && (
        <Message error>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      {/* Daily Production Statistics */}
      <Card fluid className="production-stats">
        <Card.Content>
          <Header as="h3">Today's Production Statistics</Header>
          <Grid columns={4} divided>
            <Grid.Row>
              <Grid.Column className="stat-item">
                <Statistic color="blue">
                  <Statistic.Value>{dailyStats.totalProduced}</Statistic.Value>
                  <Statistic.Label>Total Produced</Statistic.Label>
                </Statistic>
              </Grid.Column>
              <Grid.Column className="stat-item">
                <Statistic color="green">
                  <Statistic.Value>
                    {dailyStats.firstTimeThrough}
                  </Statistic.Value>
                  <Statistic.Label>First Time Through</Statistic.Label>
                </Statistic>
              </Grid.Column>
              <Grid.Column className="stat-item">
                <Statistic color="yellow">
                  <Statistic.Value>
                    {dailyStats.needImprovement}
                  </Statistic.Value>
                  <Statistic.Label>Need Improvement</Statistic.Label>
                </Statistic>
              </Grid.Column>
              <Grid.Column className="stat-item">
                <Statistic color="red">
                  <Statistic.Value>{dailyStats.rejected}</Statistic.Value>
                  <Statistic.Label>Rejected</Statistic.Label>
                </Statistic>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column className="stat-item">
                <Statistic size="small">
                  <Statistic.Value>
                    {dailyStats.efficiencyRate}%
                  </Statistic.Value>
                  <Statistic.Label>Efficiency Rate</Statistic.Label>
                </Statistic>
              </Grid.Column>
              <Grid.Column className="stat-item">
                <Statistic size="small">
                  <Statistic.Value>{dailyStats.defectRate}%</Statistic.Value>
                  <Statistic.Label>Defect Rate</Statistic.Label>
                </Statistic>
              </Grid.Column>
              <Grid.Column className="stat-item">
                <Statistic size="small">
                  <Statistic.Value>{dailyStats.rejectionRate}%</Statistic.Value>
                  <Statistic.Label>Rejection Rate</Statistic.Label>
                </Statistic>
              </Grid.Column>
              <Grid.Column className="stat-item">
                <Statistic size="small">
                  <Statistic.Value>{dailyStats.modified}</Statistic.Value>
                  <Statistic.Label>Modified</Statistic.Label>
                </Statistic>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Card.Content>
      </Card>

      <Divider />

      {/* Main Action Buttons */}
      <Header as="h3" textAlign="center">
        Quality Control Actions
      </Header>
      <Grid columns={2} className="action-buttons">
        <Grid.Column>
          <Button
            className="action-button success"
            onClick={handleFirstTimeThrough}
            loading={loading}
            disabled={loading}
            fluid
          >
            ✓ First Time Through
            <br />
            <small>Product passed QC on first inspection</small>
          </Button>
        </Grid.Column>
        <Grid.Column>
          <Button
            className="action-button warning"
            onClick={handleNeedImprovement}
            disabled={loading}
            fluid
          >
            ⚠ Need Improvement
            <br />
            <small>Product needs rework to pass QC</small>
          </Button>
        </Grid.Column>
        <Grid.Column>
          <Button
            className="action-button"
            onClick={handleModified}
            disabled={loading}
            fluid
          >
            🔧 Modified
            <br />
            <small>Previously reworked product now passes QC</small>
          </Button>
        </Grid.Column>
        <Grid.Column>
          <Button
            className="action-button error"
            onClick={handleReject}
            disabled={loading}
            fluid
          >
            ✗ Reject
            <br />
            <small>Product cannot be fixed and must be rejected</small>
          </Button>
        </Grid.Column>
      </Grid>

      {loading && <Loader active>Processing...</Loader>}

      {/* Modals for different actions */}
      <DefectSelectionModal
        open={activeModal === "defects"}
        onClose={closeModal}
      />

      <ModificationModal
        open={activeModal === "modifications"}
        onClose={closeModal}
      />

      <RejectionModal open={activeModal === "rejection"} onClose={closeModal} />
    </div>
  );
};

export default QCManagerPanel;
