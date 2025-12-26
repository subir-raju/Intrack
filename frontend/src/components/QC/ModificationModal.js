import React, { useState } from "react";
import { Modal, Button, Checkbox, Form, Icon, Header } from "semantic-ui-react";
import { useProduction } from "../../contexts/ProductionContext";

function ModificationModal({ open, onClose, onConfirm }) {
  const { modificationOptions } = useProduction();
  const [selectedModifications, setSelectedModifications] = useState([]);

  const handleToggleModification = (mod) => {
    if (selectedModifications.includes(mod)) {
      setSelectedModifications(selectedModifications.filter((m) => m !== mod));
    } else {
      setSelectedModifications([...selectedModifications, mod]);
    }
  };

  const handleConfirm = () => {
    if (selectedModifications.length > 0) {
      onConfirm(selectedModifications);
      setSelectedModifications([]);
    }
  };

  const handleClose = () => {
    setSelectedModifications([]);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} size="small">
      <Modal.Header>
        <Icon name="redo" />
        Select Modifications
      </Modal.Header>
      <Modal.Content>
        <Header as="h5">What was modified in this product?</Header>
        <Form>
          {modificationOptions.map((mod) => (
            <Form.Field key={mod}>
              <Checkbox
                label={mod}
                checked={selectedModifications.includes(mod)}
                onChange={() => handleToggleModification(mod)}
              />
            </Form.Field>
          ))}
        </Form>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          positive
          onClick={handleConfirm}
          disabled={selectedModifications.length === 0}
        >
          Confirm Modifications ({selectedModifications.length})
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

export default ModificationModal;
