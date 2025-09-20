import React, { useState } from "react";
import {
  Modal,
  Header,
  Button,
  Grid,
  Message,
  Input,
  Icon,
  Form,
} from "semantic-ui-react";
import { useProduction } from "../../contexts/ProductionContext";

const RejectionModal = ({ open, onClose }) => {
  const { rejectionReasons, addRejectionReason, recordProduction, loading } =
    useProduction();

  const [selectedReasons, setSelectedReasons] = useState([]);
  const [newRejectionReason, setNewRejectionReason] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleReasonToggle = (reason) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleAddRejectionReason = () => {
    if (newRejectionReason.trim()) {
      addRejectionReason(newRejectionReason.trim());
      setNewRejectionReason("");
      setShowAddForm(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedReasons.length === 0) {
      return;
    }

    await recordProduction("rejected", {
      rejection_reasons: selectedReasons,
      reason_count: selectedReasons.length,
    });

    // Reset and close
    setSelectedReasons([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedReasons([]);
    setNewRejectionReason("");
    setShowAddForm(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="large">
      <Modal.Header>
        <Icon name="ban" color="red" />
        Select Rejection Reasons - Product Rejected
      </Modal.Header>

      <Modal.Content>
        <Header as="h4">
          Product Rejection Reasons
          <Header.Subheader>
            Select the reasons why this product cannot be repaired and must be
            rejected.
          </Header.Subheader>
        </Header>

        <Message negative>
          <Message.Header>Permanent Rejection</Message.Header>
          <p>
            This action will permanently mark the product as rejected. Please
            ensure there is no possibility of repair before proceeding.
          </p>
        </Message>

        {selectedReasons.length > 0 && (
          <Message warning>
            <Message.Header>
              Selected Rejection Reasons ({selectedReasons.length})
            </Message.Header>
            <Message.List>
              {selectedReasons.map((reason, index) => (
                <Message.Item key={index}>{reason}</Message.Item>
              ))}
            </Message.List>
          </Message>
        )}

        <Grid className="defects-grid">
          {rejectionReasons.map((reason, index) => (
            <Grid.Column key={index}>
              <Button
                className={`defect-option ${
                  selectedReasons.includes(reason) ? "selected" : ""
                }`}
                onClick={() => handleReasonToggle(reason)}
                fluid
              >
                {selectedReasons.includes(reason) && <Icon name="check" />}
                {reason}
              </Button>
            </Grid.Column>
          ))}
        </Grid>

        {/* Add New Rejection Reason */}
        <div className="margin-top">
          {!showAddForm ? (
            <Button
              onClick={() => setShowAddForm(true)}
              basic
              color="blue"
              icon="plus"
              content="Add New Rejection Reason"
            />
          ) : (
            <Form>
              <Form.Field>
                <label>New Rejection Reason</label>
                <Input
                  placeholder="Enter new rejection reason..."
                  value={newRejectionReason}
                  onChange={(e) => setNewRejectionReason(e.target.value)}
                  action={
                    <Button
                      color="green"
                      onClick={handleAddRejectionReason}
                      disabled={!newRejectionReason.trim()}
                    >
                      Add
                    </Button>
                  }
                />
              </Form.Field>
              <Button
                basic
                onClick={() => {
                  setShowAddForm(false);
                  setNewRejectionReason("");
                }}
              >
                Cancel
              </Button>
            </Form>
          )}
        </div>
      </Modal.Content>

      <Modal.Actions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          color="red"
          onClick={handleSubmit}
          loading={loading}
          disabled={selectedReasons.length === 0 || loading}
        >
          <Icon name="ban" />
          Confirm Rejection ({selectedReasons.length} reasons)
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default RejectionModal;
