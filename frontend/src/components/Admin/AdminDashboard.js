import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  Table,
  Header,
  Icon,
  Statistic,
  Message,
  Loader,
  Button,
  Dropdown,
  Input,
} from "semantic-ui-react";
import moment from "moment";
import "../../styles/Admin.css";

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    dailyProductionData: [],
    reworkRates: [],
    productionLines: [
      { id: 1, name: "Production Line 1" },
      { id: 2, name: "Production Line 2" },
      { id: 3, name: "Production Line 3" },
      { id: 4, name: "Production Line 4" },
      { id: 5, name: "Production Line 5" },
    ],
  });

  const [selectedDateRange, setSelectedDateRange] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockData = {
        dailyProductionData: Array.from(
          { length: selectedDateRange },
          (_, i) => ({
            date: moment()
              .subtract(selectedDateRange - i - 1, "days")
              .format("YYYY-MM-DD"),
            lines: dashboardData.productionLines.map((line) => ({
              lineId: line.id,
              totalProduced: Math.floor(Math.random() * 100) + 50,
              defectRate: (Math.random() * 15).toFixed(2),
              firstTimeThrough: Math.floor(Math.random() * 80) + 20,
              needImprovement: Math.floor(Math.random() * 15),
              modified: Math.floor(Math.random() * 10),
              rejected: Math.floor(Math.random() * 5),
            })),
          })
        ),
        reworkRates: dashboardData.productionLines.map((line) => ({
          lineId: line.id,
          name: line.name,
          reworkRate: (Math.random() * 25).toFixed(2),
        })),
        productionLines: dashboardData.productionLines,
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const dateRangeOptions = [
    { key: 7, text: "Last 7 days", value: 7 },
    { key: 30, text: "Last 30 days", value: 30 },
    { key: 90, text: "Last 3 months", value: 90 },
  ];

  const totalProduced = dashboardData.dailyProductionData.reduce(
    (sum, day) =>
      sum +
      day.lines.reduce((lineSum, line) => lineSum + line.totalProduced, 0),
    0
  );

  const avgDefectRate =
    dashboardData.dailyProductionData.length > 0
      ? (
          dashboardData.dailyProductionData.reduce(
            (sum, day) =>
              sum +
              day.lines.reduce(
                (lineSum, line) => lineSum + parseFloat(line.defectRate),
                0
              ),
            0
          ) /
          (dashboardData.dailyProductionData.length *
            dashboardData.productionLines.length)
        ).toFixed(2)
      : 0;

  if (loading) {
    return <Loader active inline="centered" size="huge" />;
  }

  return (
    <Container fluid className="admin-dashboard">
      <Header as="h2" className="admin-header">
        <Icon name="dashboard" />
        Production Dashboard
        <Header.Subheader>
          Real-time production analytics and quality control metrics
        </Header.Subheader>
      </Header>

      <Grid columns={1} stackable className="dashboard-controls">
        <Grid.Column>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Dropdown
              selection
              value={selectedDateRange}
              options={dateRangeOptions}
              onChange={(e, { value }) => setSelectedDateRange(value)}
            />
            <Button icon="refresh" onClick={fetchDashboardData} />
          </div>
        </Grid.Column>
      </Grid>

      <Grid columns={3} stackable className="dashboard-cards">
        <Grid.Column>
          <div className="stat-box">
            <div className="label">Total Products Produced</div>
            <div className="value">{totalProduced}</div>
          </div>
        </Grid.Column>
        <Grid.Column>
          <div className="stat-box">
            <div className="label">Average Defect Rate</div>
            <div className="value">{avgDefectRate}%</div>
          </div>
        </Grid.Column>
        <Grid.Column>
          <div className="stat-box">
            <div className="label">Active Production Lines</div>
            <div className="value">{dashboardData.productionLines.length}</div>
          </div>
        </Grid.Column>
      </Grid>

      <Grid columns={1} stackable className="dashboard-cards">
        <Grid.Column>
          <Card fluid className="dashboard-card">
            <Card.Content>
              <div className="card-header">
                <Header as="h3">Rework Rate by Production Line</Header>
              </div>
            </Card.Content>
            <Card.Content>
              <Table celled striped>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Production Line</Table.HeaderCell>
                    <Table.HeaderCell>Rework Rate</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {dashboardData.reworkRates.map((item) => (
                    <Table.Row key={item.lineId}>
                      <Table.Cell>{item.name}</Table.Cell>
                      <Table.Cell className="metric-warning">
                        {item.reworkRate}%
                      </Table.Cell>
                      <Table.Cell>
                        {parseFloat(item.reworkRate) > 20 ? (
                          <span className="metric-negative">
                            <Icon name="warning" />
                            High
                          </span>
                        ) : parseFloat(item.reworkRate) > 10 ? (
                          <span className="metric-warning">
                            <Icon name="info" />
                            Medium
                          </span>
                        ) : (
                          <span className="metric-positive">
                            <Icon name="check" />
                            Low
                          </span>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Card.Content>
          </Card>
        </Grid.Column>
      </Grid>

      <Grid columns={1} stackable className="production-table">
        <Grid.Column>
          <Card fluid className="dashboard-card">
            <Card.Content>
              <div className="card-header">
                <Header as="h3">Daily Production Summary</Header>
              </div>
            </Card.Content>
            <Card.Content>
              <Table celled striped responsive>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Date</Table.HeaderCell>
                    <Table.HeaderCell>Production Line</Table.HeaderCell>
                    <Table.HeaderCell>FTT</Table.HeaderCell>
                    <Table.HeaderCell>Improvement</Table.HeaderCell>
                    <Table.HeaderCell>Modified</Table.HeaderCell>
                    <Table.HeaderCell>Rejected</Table.HeaderCell>
                    <Table.HeaderCell>Defect Rate</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {dashboardData.dailyProductionData.flatMap((day) =>
                    day.lines.map((line, idx) => (
                      <Table.Row key={`${day.date}-${line.lineId}`}>
                        <Table.Cell>{idx === 0 && day.date}</Table.Cell>
                        <Table.Cell>Line {line.lineId}</Table.Cell>
                        <Table.Cell className="metric-positive">
                          {line.firstTimeThrough}
                        </Table.Cell>
                        <Table.Cell>{line.needImprovement}</Table.Cell>
                        <Table.Cell>{line.modified}</Table.Cell>
                        <Table.Cell className="metric-negative">
                          {line.rejected}
                        </Table.Cell>
                        <Table.Cell
                          className={
                            parseFloat(line.defectRate) > 15
                              ? "metric-negative"
                              : "metric-warning"
                          }
                        >
                          {line.defectRate}%
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>
            </Card.Content>
          </Card>
        </Grid.Column>
      </Grid>
    </Container>
  );
}

export default AdminDashboard;
