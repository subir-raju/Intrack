import React, { useState } from "react";
import {
  Modal,
  Button,
  Checkbox,
  Form,
  Icon,
  Divider,
  Header,
} from "semantic-ui-react";
import { useProduction } from "../../contexts/ProductionContext";

function RejectionModal({ open, onClose, onConfirm }) {
  const { rejectionReasons, addRejectionReason } = useProduction();
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [newReasonName, setNewReasonName] = useState("");
  const [newReasonCategory, setNewReasonCategory] = useState("");
  const [showNewReason, setShowNewReason] = useState(false);

  const handleToggleReason = (reasonName) => {
    if (selectedReasons.includes(reasonName)) {
      setSelectedReasons(selectedReasons.filter((r) => r !== reasonName));
    } else {
      setSelectedReasons([...selectedReasons, reasonName]);
    }
  };

  const handleAddNewReason = () => {
    if (newReasonName.trim()) {
      addRejectionReason(newReasonName, newReasonCategory || "Other");
      setSelectedReasons([...selectedReasons, newReasonName]);
      setNewReasonName("");
      setNewReasonCategory("");
      setShowNewReason(false);
    }
  };

  const handleConfirm = () => {
    if (selectedReasons.length > 0) {
      onConfirm(selectedReasons);
      setSelectedReasons([]);
    }
  };

  const handleClose = () => {
    setSelectedReasons([]);
    setNewReasonName("");
    onClose();
  };

  // Group reasons by category
  const groupedReasons = {};
  rejectionReasons.forEach((reason) => {
    const category = reason.category || "Other";
    if (!groupedReasons[category]) {
      groupedReasons[category] = [];
    }
    groupedReasons[category].push(reason);
  });

  return (
    <Modal open={open} onClose={handleClose} size="small">
      <Modal.Header>
        <Icon name="times circle" />
        Select Rejection Reasons
      </Modal.Header>
      <Modal.Content>
        <Form>
          {Object.entries(groupedReasons).map(([category, reasons]) => (
            <div key={category}>
              <Header as="h5" dividing>
                {category}
              </Header>
              {reasons.map((reason) => (
                <Form.Field key={reason.id}>
                  <Checkbox
                    label={reason.name}
                    checked={selectedReasons.includes(reason.name)}
                    onChange={() => handleToggleReason(reason.name)}
                  />
                </Form.Field>
              ))}
            </div>
          ))}

          <Divider section />

          {!showNewReason ? (
            <Button secondary fluid onClick={() => setShowNewReason(true)}>
              <Icon name="plus" />
              Add New Rejection Reason
            </Button>
          ) : (
            <>
              <Form.Field>
                <label>Reason Name</label>
                <input
                  value={newReasonName}
                  onChange={(e) => setNewReasonName(e.target.value)}
                  placeholder="Enter rejection reason"
                />
              </Form.Field>
              <Form.Field>
                <label>Category (Optional)</label>
                <input
                  value={newReasonCategory}
                  onChange={(e) => setNewReasonCategory(e.target.value)}
                  placeholder="e.g., Quality, Material"
                />
              </Form.Field>
              <Button.Group fluid>
                <Button onClick={() => setShowNewReason(false)}>Cancel</Button>
                <Button positive onClick={handleAddNewReason}>
                  Add Reason
                </Button>
              </Button.Group>
            </>
          )}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          primary
          onClick={handleConfirm}
          disabled={selectedReasons.length === 0}
        >
          Confirm Rejection ({selectedReasons.length})
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default RejectionModal;
