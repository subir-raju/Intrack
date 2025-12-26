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
import "../../styles/QC.css";

function DefectSelectionModal({ open, onClose, onConfirm }) {
  const { defectCategories, addDefectCategory } = useProduction();
  const [selectedDefects, setSelectedDefects] = useState([]);
  const [newDefectName, setNewDefectName] = useState("");
  const [newDefectCategory, setNewDefectCategory] = useState("");
  const [showNewDefect, setShowNewDefect] = useState(false);

  const handleToggleDefect = (defectName) => {
    if (selectedDefects.includes(defectName)) {
      setSelectedDefects(selectedDefects.filter((d) => d !== defectName));
    } else {
      setSelectedDefects([...selectedDefects, defectName]);
    }
  };

  const handleAddNewDefect = () => {
    if (newDefectName.trim()) {
      addDefectCategory(newDefectName, newDefectCategory || "Other");
      setSelectedDefects([...selectedDefects, newDefectName]);
      setNewDefectName("");
      setNewDefectCategory("");
      setShowNewDefect(false);
    }
  };

  const handleConfirm = () => {
    if (selectedDefects.length > 0) {
      onConfirm(selectedDefects);
      setSelectedDefects([]);
    }
  };

  const handleClose = () => {
    setSelectedDefects([]);
    setNewDefectName("");
    onClose();
  };

  // Group defects by category
  const groupedDefects = {};
  defectCategories.forEach((defect) => {
    const category = defect.category || "Other";
    if (!groupedDefects[category]) {
      groupedDefects[category] = [];
    }
    groupedDefects[category].push(defect);
  });

  return (
    <Modal open={open} onClose={handleClose} size="small">
      <Modal.Header>
        <Icon name="wrench" />
        Select Defects
      </Modal.Header>
      <Modal.Content>
        <Form>
          {Object.entries(groupedDefects).map(([category, defects]) => (
            <div key={category}>
              <Header as="h5" dividing>
                {category}
              </Header>
              {defects.map((defect) => (
                <Form.Field key={defect.id}>
                  <Checkbox
                    label={defect.name}
                    checked={selectedDefects.includes(defect.name)}
                    onChange={() => handleToggleDefect(defect.name)}
                  />
                </Form.Field>
              ))}
            </div>
          ))}

          <Divider section />

          {!showNewDefect ? (
            <Button secondary fluid onClick={() => setShowNewDefect(true)}>
              <Icon name="plus" />
              Add New Defect Type
            </Button>
          ) : (
            <>
              <Form.Field>
                <label>Defect Name</label>
                <input
                  value={newDefectName}
                  onChange={(e) => setNewDefectName(e.target.value)}
                  placeholder="Enter defect name"
                />
              </Form.Field>
              <Form.Field>
                <label>Category (Optional)</label>
                <input
                  value={newDefectCategory}
                  onChange={(e) => setNewDefectCategory(e.target.value)}
                  placeholder="e.g., Sewing, Finishing"
                />
              </Form.Field>
              <Button.Group fluid>
                <Button onClick={() => setShowNewDefect(false)}>Cancel</Button>
                <Button positive onClick={handleAddNewDefect}>
                  Add Defect
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
          disabled={selectedDefects.length === 0}
        >
          Confirm Defects ({selectedDefects.length})
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default DefectSelectionModal;
