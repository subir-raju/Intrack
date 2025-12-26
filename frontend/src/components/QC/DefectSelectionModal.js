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

const DefectSelectionModal = ({ open, onClose }) => {
  const { defectTypes, addDefectType, recordProduction, loading } =
    useProduction();

  const [selectedDefects, setSelectedDefects] = useState([]);
  const [newDefectType, setNewDefectType] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleDefectToggle = (defect) => {
    setSelectedDefects((prev) =>
      prev.includes(defect)
        ? prev.filter((d) => d !== defect)
        : [...prev, defect]
    );
  };

  const handleAddDefectType = () => {
    if (newDefectType.trim()) {
      addDefectType(newDefectType.trim());
      setNewDefectType("");
      setShowAddForm(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedDefects.length === 0) {
      return;
    }

    await recordProduction("need_improvement", {
      defects: selectedDefects,
      defect_count: selectedDefects.length,
    });

    // Reset and close
    setSelectedDefects([]);
    onClose();
  };

  const handleClose = () => {
    setSelectedDefects([]);
    setNewDefectType("");
    setShowAddForm(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="large">
      <Modal.Header>
        <Icon name="warning sign" color="yellow" />
        Select Defect Types - Need Improvement
      </Modal.Header>

      <Modal.Content>
        <Header as="h4">
          Common Defects in Garment Manufacturing
          <Header.Subheader>
            Select all defects found in this product. You can select multiple
            defects.
          </Header.Subheader>
        </Header>

        {selectedDefects.length > 0 && (
          <Message info>
            <Message.Header>
              Selected Defects ({selectedDefects.length})
            </Message.Header>
            <Message.List>
              {selectedDefects.map((defect, index) => (
                <Message.Item key={index}>{defect}</Message.Item>
              ))}
            </Message.List>
          </Message>
        )}

        <Grid className="defects-grid">
          {defectTypes.map((defect, index) => (
            <Grid.Column key={index}>
              <Button
                className={`defect-option ${
                  selectedDefects.includes(defect) ? "selected" : ""
                }`}
                onClick={() => handleDefectToggle(defect)}
                fluid
              >
                {selectedDefects.includes(defect) && <Icon name="check" />}
                {defect}
              </Button>
            </Grid.Column>
          ))}
        </Grid>

        {/* Add New Defect Type */}
        <div className="margin-top">
          {!showAddForm ? (
            <Button
              onClick={() => setShowAddForm(true)}
              basic
              color="blue"
              icon="plus"
              content="Add New Defect Type"
            />
          ) : (
            <Form>
              <Form.Field>
                <label>New Defect Type</label>
                <Input
                  placeholder="Enter new defect type..."
                  value={newDefectType}
                  onChange={(e) => setNewDefectType(e.target.value)}
                  action={
                    <Button
                      color="green"
                      onClick={handleAddDefectType}
                      disabled={!newDefectType.trim()}
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
                  setNewDefectType("");
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
          color="yellow"
          onClick={handleSubmit}
          loading={loading}
          disabled={selectedDefects.length === 0 || loading}
        >
          <Icon name="warning sign" />
          Record Defects ({selectedDefects.length})
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default DefectSelectionModal;
