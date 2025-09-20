import React, { useState, useEffect } from "react";
import {
  Grid,
  Header,
  Card,
  Table,
  Loader,
  Message,
  Dropdown,
  Button,
} from "semantic-ui-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    dailyProductionData: [],
    defectsOverTime: [],
    reworkRates: [],
    productionLines: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState("7");

  // API Base URL
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3001/api";

  useEffect(() => {
    fetchDashboardData();
  }, [selectedDateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
        params: {
          days: selectedDateRange,
        },
      });
      setDashboardData(response.data);
    } catch (error) {
      setError("Failed to fetch dashboard data");
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Chart configurations
  const productionLineChartData = {
    labels: dashboardData.dailyProductionData.map((item) =>
      moment(item.date).format("MMM DD")
    ),
    datasets: dashboardData.productionLines.map((line, index) => ({
      label: `Production Line ${line.line_id}`,
      data: dashboardData.dailyProductionData.map(
        (day) =>
          day.lines.find((l) => l.line_id === line.line_id)?.total_produced || 0
      ),
      backgroundColor: `rgba(${54 + index * 50}, ${162 + index * 30}, ${
        235 - index * 20
      }, 0.8)`,
      borderColor: `rgba(${54 + index * 50}, ${162 + index * 30}, ${
        235 - index * 20
      }, 1)`,
      borderWidth: 2,
    })),
  };

  const defectsOverTimeData = {
    labels: dashboardData.defectsOverTime.map((item) =>
      moment(item.date).format("MMM DD")
    ),
    datasets: dashboardData.productionLines.map((line, index) => ({
      label: `Line ${line.line_id} Defect Rate`,
      data: dashboardData.defectsOverTime.map(
        (day) =>
          day.lines.find((l) => l.line_id === line.line_id)?.defect_rate || 0
      ),
      borderColor: `rgba(${255 - index * 30}, ${99 + index * 50}, ${
        132 + index * 20
      }, 1)`,
      backgroundColor: `rgba(${255 - index * 30}, ${99 + index * 50}, ${
        132 + index * 20
      }, 0.2)`,
      tension: 0.1,
    })),
  };

  const reworkRateData = {
    labels: dashboardData.productionLines.map((line) => `Line ${line.line_id}`),
    datasets: [
      {
        label: "Rework Rate (%)",
        data: dashboardData.reworkRates.map((item) => item.rework_rate),
        backgroundColor: [
          "rgba(255, 99, 132, 0.8)",
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  const dateRangeOptions = [
    { key: "7", text: "Last 7 days", value: "7" },
    { key: "30", text: "Last 30 days", value: "30" },
    { key: "90", text: "Last 3 months", value: "90" },
  ];

  if (loading) {
    return <Loader active>Loading dashboard data...</Loader>;
  }

  return (
    <div className="admin-dashboard">
      <Header as="h2">
        Production Dashboard
        <Header.Subheader>
          Real-time production analytics and quality control metrics
        </Header.Subheader>
      </Header>

      {error && (
        <Message error>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      {/* Date Range Selector */}
      <div className="margin-bottom">
        <Dropdown
          selection
          value={selectedDateRange}
          options={dateRangeOptions}
          onChange={(e, { value }) => setSelectedDateRange(value)}
        />
        <Button
          icon="refresh"
          onClick={fetchDashboardData}
          style={{ marginLeft: "10px" }}
        />
      </div>

      {/* Dashboard Cards */}
      <Grid className="dashboard-cards">
        {/* Comparative Production Line Chart */}
        <Grid.Column width={8}>
          <Card fluid className="dashboard-card">
            <div className="card-header">
              <Header as="h3">Daily Production Comparison</Header>
            </div>
            <Card.Content>
              <div className="chart-container">
                <Bar
                  data={productionLineChartData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        display: true,
                        text: "Products Produced by Production Line",
                      },
                    },
                  }}
                />
              </div>
            </Card.Content>
          </Card>
        </Grid.Column>

        {/* Defects Over Time Chart */}
        <Grid.Column width={8}>
          <Card fluid className="dashboard-card">
            <div className="card-header">
              <Header as="h3">Defects Rate Over Time</Header>
            </div>
            <Card.Content>
              <div className="chart-container">
                <Line
                  data={defectsOverTimeData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        display: true,
                        text: "Defect Rate Trends by Production Line",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function (value) {
                            return value + "%";
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </Card.Content>
          </Card>
        </Grid.Column>

        {/* Rework Rate Chart */}
        <Grid.Column width={8}>
          <Card fluid className="dashboard-card">
            <div className="card-header">
              <Header as="h3">Rework Rate by Production Line</Header>
            </div>
            <Card.Content>
              <div className="chart-container">
                <Bar
                  data={reworkRateData}
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        display: true,
                        text: "Current Rework Rates",
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function (value) {
                            return value + "%";
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </Card.Content>
          </Card>
        </Grid.Column>

        {/* Summary Statistics */}
        <Grid.Column width={8}>
          <Card fluid className="dashboard-card">
            <div className="card-header">
              <Header as="h3">Summary Statistics</Header>
            </div>
            <Card.Content>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Metric</Table.HeaderCell>
                    <Table.HeaderCell>Value</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>Total Products Produced</Table.Cell>
                    <Table.Cell>
                      {dashboardData.dailyProductionData.reduce(
                        (total, day) =>
                          total +
                          day.lines.reduce(
                            (lineTotal, line) =>
                              lineTotal + line.total_produced,
                            0
                          ),
                        0
                      )}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Average Defect Rate</Table.Cell>
                    <Table.Cell>
                      {dashboardData.reworkRates.length > 0
                        ? (
                            dashboardData.reworkRates.reduce(
                              (sum, item) => sum + item.rework_rate,
                              0
                            ) / dashboardData.reworkRates.length
                          ).toFixed(2) + "%"
                        : "N/A"}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Active Production Lines</Table.Cell>
                    <Table.Cell>
                      {dashboardData.productionLines.length}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Card.Content>
          </Card>
        </Grid.Column>
      </Grid>

      {/* Daily Production Table */}
      <Card fluid className="production-table">
        <div className="table-header">
          <Header as="h3">Daily Production Data</Header>
        </div>
        <Card.Content>
          <Table celled striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Production Line</Table.HeaderCell>
                <Table.HeaderCell>First Time Through</Table.HeaderCell>
                <Table.HeaderCell>Defect Rate</Table.HeaderCell>
                <Table.HeaderCell>Rejection Rate</Table.HeaderCell>
                <Table.HeaderCell>Efficiency Rate</Table.HeaderCell>
                <Table.HeaderCell>Goal</Table.HeaderCell>
                <Table.HeaderCell>Planned</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {dashboardData.dailyProductionData.flatMap((day) =>
                day.lines.map((line, index) => (
                  <Table.Row key={`${day.date}-${line.line_id}`}>
                    <Table.Cell>
                      {moment(day.date).format("MMM DD, YYYY")}
                    </Table.Cell>
                    <Table.Cell>Line {line.line_id}</Table.Cell>
                    <Table.Cell>{line.first_time_through}</Table.Cell>
                    <Table.Cell>{line.defect_rate}%</Table.Cell>
                    <Table.Cell>{line.rejection_rate}%</Table.Cell>
                    <Table.Cell>{line.efficiency_rate}%</Table.Cell>
                    <Table.Cell>{line.goal || "N/A"}</Table.Cell>
                    <Table.Cell>{line.planned || "N/A"}</Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>
    </div>
  );
};

export default AdminDashboard;
