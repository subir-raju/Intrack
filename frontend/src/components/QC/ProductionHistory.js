import React, { useState, useEffect } from "react";
import {
  Table,
  Header,
  Card,
  Icon,
  Button,
  Modal,
  Pagination,
} from "semantic-ui-react";
import moment from "moment";
import "../../styles/QC.css";

function ProductionHistory({ productionLineId }) {
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Simulated history data
  useEffect(() => {
    const mockHistory = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      type: ["firsttimethrough", "needimprovement", "modified", "rejected"][
        Math.floor(Math.random() * 4)
      ],
      timestamp: moment().subtract(i, "hours").toDate(),
      defects: i % 3 === 0 ? ["Broken Stitch", "Loose Tension"] : [],
      modifications: i % 4 === 0 ? ["Stitching", "Hem Length"] : [],
      rejectionReasons: i % 5 === 0 ? ["Irreparable Damage"] : [],
    }));
    setHistory(mockHistory);
  }, []);

  const paginatedHistory = history.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getTypeColor = (type) => {
    switch (type) {
      case "firsttimethrough":
        return "green";
      case "needimprovement":
        return "orange";
      case "modified":
        return "blue";
      case "rejected":
        return "red";
      default:
        return "grey";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "firsttimethrough":
        return "FTT";
      case "needimprovement":
        return "Improvement";
      case "modified":
        return "Modified";
      case "rejected":
        return "Rejected";
      default:
        return type;
    }
  };

  return (
    <Card fluid className="history-card">
      <Card.Content>
        <Card.Header>
          <Icon name="history" />
          Recent Production Records
        </Card.Header>
      </Card.Content>
      <Card.Content>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Time</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Details</Table.HeaderCell>
              <Table.HeaderCell>Action</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {paginatedHistory.map((record) => (
              <Table.Row key={record.id}>
                <Table.Cell>
                  {moment(record.timestamp).format("HH:mm:ss")}
                </Table.Cell>
                <Table.Cell>
                  <span className={`type-badge ${getTypeColor(record.type)}`}>
                    {getTypeLabel(record.type)}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  {record.defects.length > 0 && (
                    <span>{record.defects.length} defects</span>
                  )}
                  {record.modifications.length > 0 && (
                    <span>{record.modifications.length} mods</span>
                  )}
                  {record.rejectionReasons.length > 0 && (
                    <span>{record.rejectionReasons.length} reasons</span>
                  )}
                  {record.type === "firsttimethrough" && <span>Passed</span>}
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedRecord(record);
                      setShowDetails(true);
                    }}
                  >
                    View
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {Math.ceil(history.length / pageSize) > 1 && (
          <div style={{ marginTop: "1em", textAlign: "center" }}>
            <Pagination
              defaultActivePage={currentPage}
              totalPages={Math.ceil(history.length / pageSize)}
              onPageChange={(e, { activePage }) => setCurrentPage(activePage)}
            />
          </div>
        )}
      </Card.Content>

      <Modal open={showDetails} onClose={() => setShowDetails(false)}>
        <Modal.Header>Record Details</Modal.Header>
        <Modal.Content>
          {selectedRecord && (
            <>
              <p>
                <strong>Type:</strong> {getTypeLabel(selectedRecord.type)}
              </p>
              <p>
                <strong>Time:</strong>{" "}
                {moment(selectedRecord.timestamp).format("YYYY-MM-DD HH:mm:ss")}
              </p>
              {selectedRecord.defects.length > 0 && (
                <p>
                  <strong>Defects:</strong> {selectedRecord.defects.join(", ")}
                </p>
              )}
              {selectedRecord.modifications.length > 0 && (
                <p>
                  <strong>Modifications:</strong>{" "}
                  {selectedRecord.modifications.join(", ")}
                </p>
              )}
              {selectedRecord.rejectionReasons.length > 0 && (
                <p>
                  <strong>Rejection Reasons:</strong>{" "}
                  {selectedRecord.rejectionReasons.join(", ")}
                </p>
              )}
            </>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
        </Modal.Actions>
      </Modal>
    </Card>
  );
}

export default ProductionHistory;
