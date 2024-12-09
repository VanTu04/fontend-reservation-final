import React, { useState } from "react";
import { Button, Form, Container, Row, Col, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getOrderReport,
  exportOrderReportToExcel,
} from "../../services/ApiService";

const Report = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderReport, setOrderReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [check, setCheck] = useState(false);
  // Lấy JWT từ Redux store
  const { jwt } = useSelector((state) => state.auth);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      toast.warning("Please enter both start and end date");
      return;
    }

    setLoading(true);
    try {
      const reportData = await getOrderReport(startDate, endDate, jwt);
      setOrderReport(reportData.data || []);
      setCheck(true);
    } catch (error) {
      toast.error("Failed to fetch order report");
    }
    setLoading(false);
  };

  const handleExport = async () => {
    if (!startDate || !endDate) {
      toast.warning("Please enter both start and end date to export");
      return;
    }
    try {
      const response = await exportOrderReportToExcel(startDate, endDate, jwt);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "order_report.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Failed to export Excel file");
    }
  };
console.log(orderReport.listOrders);
  return (
    <Container className="mt-4">
      <Row>
        <Col md={12}>
          <h3>Order Report</h3>

          {/* Date Range Search */}
          <Form className="mb-4">
            <Form.Group as={Row} controlId="startDate">
              <Form.Label column sm={2}>Start Date</Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Col>
              <Col sm={6}>
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Search'}
                </Button>
              </Col>
            </Form.Group>
            <Form.Group as={Row} controlId="endDate">
              <Form.Label column sm={2}>End Date</Form.Label>
              <Col sm={4}>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Col>
              <Col sm={6}>
              {/* Export Button */}
           {check && (<Button
            variant="success"
            onClick={handleExport}
            disabled={orderReport.orders && orderReport.orders.length === 0}
          >
            Export to Excel
          </Button>)}
              </Col>
            </Form.Group>

          </Form>

          {/* Report Summary */}
          {orderReport && (
            <div className="mb-4">
              <h4>Report Summary</h4>
              <p><strong>Total Orders:</strong> {orderReport.totalOrders}</p>
              <p><strong>Successful Table Reservations:</strong> {orderReport.successTableReservation}</p>
              <p><strong>Cancelled Table Reservations:</strong> {orderReport.cancelledTableReservation}</p>
              <p><strong>Total Revenue (VND):</strong> {orderReport.totalRevenue}</p>
            </div>
          )}

          {/* Data Table */}
          {orderReport.listOrders && orderReport.listOrders.length > 0 && (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Total Quantity</th>
                  <th>Total Price (VND)</th>
                  {/* <th>Order Items</th> */}
                </tr>
              </thead>
              <tbody>
                {orderReport.listOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.itemName}</td>
                    <td>{order.unitPrice}</td>
                    <td>{order.totalQuantity}</td>
                    <td>{order.totalPrice}</td>
                    {/* <td>
                      {order.orderItems.map((item, index) => (
                        <div key={index}>
                          {item.food.name} - {item.quantity} x {item.food.price} VND
                        </div>
                      ))}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          
        </Col>
      </Row>
    </Container>
  );
};

export default Report;
