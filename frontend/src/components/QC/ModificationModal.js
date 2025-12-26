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

const ModificationModal = ({ open, onClose }) => {
  const { modificationTypes, addModificationType, recordProduction, loading } =
    useProduction();

  const [selectedModifications, setSelectedModifications] = useState([]);
  const [newModificationType, setNewModificationType] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleModificationToggle = (modification) => {
    setSelectedModifications((prev) =>
      prev.includes(modification)
        ? prev.filter((m) => m !== modification)
        : [...prev, modification]
    );
  };

  const handleAddModificationType = () => {
    if (newModificationType.trim()) {
      addModificationType(newModificationType.trim());
      setNewModificationType("");
      setShowAddForm(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedModifications.length === 0) {
      return;
    }

    await recordProduction("modified", {
      modifications: selectedModifications,
      modification_count: selectedModifications.length,
    });

    // Reset and close
    setSelectedModifications([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedModifications([]);
    setNewModificationType("");
    setShowAddForm(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="large">
      <Modal.Header>
        <Icon name="wrench" color="blue" />
        Select Modification Types - Modified Product
      </Modal.Header>

      <Modal.Content>
        <Header as="h4">
          Product Modifications Completed
          <Header.Subheader>
            Select the modifications that were performed on this product to make
            it pass QC.
          </Header.Subheader>
        </Header>

        <Message success>
          <Message.Header>
            Product Previously Sent for Improvement
          </Message.Header>
          <p>
            This product was previously identified with defects and sent for
            rework. Please select which modifications were completed to bring it
            up to quality standards.
          </p>
        </Message>

        {selectedModifications.length > 0 && (
          <Message info>
            <Message.Header>
              Selected Modifications ({selectedModifications.length})
            </Message.Header>
            <Message.List>
              {selectedModifications.map((modification, index) => (
                <Message.Item key={index}>{modification}</Message.Item>
              ))}
            </Message.List>
          </Message>
        )}

        <Grid className="defects-grid">
          {modificationTypes.map((modification, index) => (
            <Grid.Column key={index}>
              <Button
                className={`defect-option ${
                  selectedModifications.includes(modification) ? "selected" : ""
                }`}
                onClick={() => handleModificationToggle(modification)}
                fluid
              >
                {selectedModifications.includes(modification) && (
                  <Icon name="check" />
                )}
                {modification}
              </Button>
            </Grid.Column>
          ))}
        </Grid>

        {/* Add New Modification Type */}
        <div className="margin-top">
          {!showAddForm ? (
            <Button
              onClick={() => setShowAddForm(true)}
              basic
              color="blue"
              icon="plus"
              content="Add New Modification Type"
            />
          ) : (
            <Form>
              <Form.Field>
                <label>New Modification Type</label>
                <Input
                  placeholder="Enter new modification type..."
                  value={newModificationType}
                  onChange={(e) => setNewModificationType(e.target.value)}
                  action={
                    <Button
                      color="green"
                      onClick={handleAddModificationType}
                      disabled={!newModificationType.trim()}
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
                  setNewModificationType("");
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
          color="green"
          onClick={handleSubmit}
          loading={loading}
          disabled={selectedModifications.length === 0 || loading}
        >
          <Icon name="check" />
          Record Modifications ({selectedModifications.length})
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ModificationModal;
