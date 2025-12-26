import React, { useState } from "react";
import {
  Container,
  Grid,
  Card,
  Button,
  Header,
  Icon,
  Message,
} from "semantic-ui-react";
import { useProduction } from "../../contexts/ProductionContext";
import { useAuth } from "../../contexts/AuthContext";
import DefectSelectionModal from "./DefectSelectionModal";
import RejectionModal from "./RejectionModal";
import ModificationModal from "./ModificationModal";
import ProductionHistory from "./ProductionHistory";
import "../../styles/QC.css";

function QCManagerPanel() {
  const { currentProductionLine, productionLines } = useProduction();
  const { user } = useAuth();
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showModificationModal, setShowModificationModal] = useState(false);
  const [lastRecordedType, setLastRecordedType] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const currentLine = productionLines.find(
    (line) => line.id === currentProductionLine
  );

  const handleFirstTimeThrough = () => {
    setLastRecordedType("firsttimethrough");
    setSuccessMessage("Product recorded as First Time Through ✓");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleDefectSelection = (defects) => {
    setShowDefectModal(false);
    setLastRecordedType("needimprovement");
    setSuccessMessage(`Defects recorded: ${defects.join(", ")} ✓`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleRejection = (reasons) => {
    setShowRejectionModal(false);
    setLastRecordedType("rejected");
    setSuccessMessage(`Rejection recorded: ${reasons.join(", ")} ✓`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleModification = (modifications) => {
    setShowModificationModal(false);
    setLastRecordedType("modified");
    setSuccessMessage(`Modifications recorded: ${modifications.join(", ")} ✓`);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <Container fluid className="qc-panel-container">
      <Header as="h2" className="qc-header">
        <Icon name="clipboard check" />
        QC Manager Panel
        <Header.Subheader>
          {currentLine?.name} • {user?.name}
        </Header.Subheader>
      </Header>

      {successMessage && (
        <Message positive onDismiss={() => setSuccessMessage("")}>
          <Message.Header>Success</Message.Header>
          <p>{successMessage}</p>
        </Message>
      )}

      <Grid columns={1} stackable className="qc-grid">
        <Grid.Column>
          <Header as="h3">Quality Check Options</Header>
          <Grid columns={2} stackable className="options-grid">
            <Grid.Column>
              <Card className="qc-option-card ftt-card" fluid>
                <Card.Content textAlign="center">
                  <Icon name="check circle" size="big" color="green" />
                  <Card.Header>First Time Through</Card.Header>
                  <Card.Description>
                    Product passed QC on first check
                  </Card.Description>
                </Card.Content>
                <Card.Content extra textAlign="center">
                  <Button
                    positive
                    size="large"
                    fluid
                    onClick={handleFirstTimeThrough}
                  >
                    <Icon name="check" />
                    Record FTT
                  </Button>
                </Card.Content>
              </Card>
            </Grid.Column>

            <Grid.Column>
              <Card className="qc-option-card improvement-card" fluid>
                <Card.Content textAlign="center">
                  <Icon name="wrench" size="big" color="orange" />
                  <Card.Header>Need Improvement</Card.Header>
                  <Card.Description>
                    Product needs rework or modification
                  </Card.Description>
                </Card.Content>
                <Card.Content extra textAlign="center">
                  <Button
                    color="orange"
                    size="large"
                    fluid
                    onClick={() => setShowDefectModal(true)}
                  >
                    <Icon name="plus" />
                    Record Defect
                  </Button>
                </Card.Content>
              </Card>
            </Grid.Column>

            <Grid.Column>
              <Card className="qc-option-card modified-card" fluid>
                <Card.Content textAlign="center">
                  <Icon name="redo" size="big" color="blue" />
                  <Card.Header>Modified</Card.Header>
                  <Card.Description>
                    Product was reworked and now passes QC
                  </Card.Description>
                </Card.Content>
                <Card.Content extra textAlign="center">
                  <Button
                    color="blue"
                    size="large"
                    fluid
                    onClick={() => setShowModificationModal(true)}
                  >
                    <Icon name="check" />
                    Record Modified
                  </Button>
                </Card.Content>
              </Card>
            </Grid.Column>

            <Grid.Column>
              <Card className="qc-option-card reject-card" fluid>
                <Card.Content textAlign="center">
                  <Icon name="times circle" size="big" color="red" />
                  <Card.Header>Reject</Card.Header>
                  <Card.Description>
                    Product cannot be fixed and is rejected
                  </Card.Description>
                </Card.Content>
                <Card.Content extra textAlign="center">
                  <Button
                    negative
                    size="large"
                    fluid
                    onClick={() => setShowRejectionModal(true)}
                  >
                    <Icon name="ban" />
                    Record Rejection
                  </Button>
                </Card.Content>
              </Card>
            </Grid.Column>
          </Grid>
        </Grid.Column>

        <Grid.Column>
          <Button
            secondary
            onClick={() => setShowHistory(!showHistory)}
            fluid
            size="large"
          >
            <Icon name="history" />
            {showHistory ? "Hide" : "View"} Production History
          </Button>
        </Grid.Column>

        {showHistory && (
          <Grid.Column>
            <ProductionHistory productionLineId={currentProductionLine} />
          </Grid.Column>
        )}
      </Grid>

      <DefectSelectionModal
        open={showDefectModal}
        onClose={() => setShowDefectModal(false)}
        onConfirm={handleDefectSelection}
      />

      <ModificationModal
        open={showModificationModal}
        onClose={() => setShowModificationModal(false)}
        onConfirm={handleModification}
      />

      <RejectionModal
        open={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        onConfirm={handleRejection}
      />
    </Container>
  );
}

export default QCManagerPanel;
