import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Spinner,
  Pagination,
  Modal,
  Form,
} from "react-bootstrap";
import {
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../../services/ApiService";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Big from "big.js";

const ManageAllOrder = () => {
  const [orders, setOrders] = useState([]); // Dữ liệu orders
  const [currentPage, setCurrentPage] = useState(0); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(0); // Tổng số trang
  const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu
  const [showModal, setShowModal] = useState(false); // Trạng thái modal
  const [modalType, setModalType] = useState(""); // Loại modal: "update" hoặc "delete"
  const [selectedOrder, setSelectedOrder] = useState(null); // Order được chọn
  const [paymentStatus, setPaymentStatus] = useState(""); // Trạng thái thanh toán mới

  // Lấy JWT từ Redux store
  const { jwt } = useSelector((state) => state.auth);

  // Gọi API lấy danh sách Orders
  const fetchOrders = async (page) => {
    setLoading(true);
    try {
      const response = await fetchAllOrders(page, jwt);
      setOrders(response.data.content); // Gán dữ liệu orders
      setTotalPages(response.data.totalPages); // Gán tổng số trang
      setCurrentPage(response.data.number); // Gán số trang hiện tại
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý mở Modal
  const handleOpenModal = (type, order) => {
    setModalType(type); // Gán loại modal
    setSelectedOrder(order); // Gán order được chọn
    setShowModal(true); // Hiển thị modal
    if (type === "update") setPaymentStatus(order.paymentStatus); // Gán trạng thái ban đầu
  };

  // Đóng Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setPaymentStatus("");
  };

  // Xử lý Update Payment Status
  const handleUpdatePaymentStatus = async () => {
    if (!selectedOrder) return;
    try {
      await updateOrderStatus(selectedOrder.id, paymentStatus, jwt); // Gọi API
      toast.success("Payment status updated successfully!");
      handleCloseModal(); // Đóng modal
      fetchOrders(currentPage); // Làm mới danh sách
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status.");
    }
  };

  // Xử lý Delete Order
  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    try {
      await deleteOrder(selectedOrder.id, jwt); // Gọi API
      toast.success("Order deleted successfully!");
      handleCloseModal(); // Đóng modal
      fetchOrders(currentPage); // Làm mới danh sách
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order.");
    }
  };

  // Gọi API khi component mount hoặc currentPage thay đổi
  useEffect(() => {
    fetchOrders(currentPage);
  }, []);

  // Hàm chuyển trang
  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };
  const exportOrderToExcel = (order) => {
    const workbook = XLSX.utils.book_new();

    // Header thông tin chi tiết đơn hàng
    const sheetData = [
        ["Chi Tiết Đơn Hàng"], // Tiêu đề
        [], // Dòng trống
        ["Thời Gian Đặt:", new Date(order.orderTime[0], order.orderTime[1] - 1, order.orderTime[2], order.orderTime[3], order.orderTime[4]).toLocaleString()],
        ["Trạng Thái Thanh Toán:", order.paymentStatus],
        [], // Dòng trống
        ["Tên Món", "Số Lượng", "Giá"], // Header bảng
    ];

    // Cấu hình màu sắc và định dạng cho các cột
    const headerStyle = {
        fill: {
            fgColor: { rgb: "FFFF00" }, // Màu vàng cho header
        },
        font: { bold: true }, // Chữ đậm cho header
        alignment: { horizontal: "center" },
    };

    // Dữ liệu món ăn
    order.orderItems.forEach((item) => {
        const priceFormatted = item.foodPrice ? new Big(item.foodPrice).toLocaleString() : "0"; // Kiểm tra và định dạng giá

        sheetData.push([item.foodName, item.foodQuantity, `${priceFormatted} VND`]);
    });

    // Tổng giá
    sheetData.push([]); // Dòng trống
    let totalPriceFormatted = order.totalPrice;
    if (
        isNaN(totalPriceFormatted) ||
        totalPriceFormatted === null ||
        totalPriceFormatted === undefined
    ) {
        totalPriceFormatted = "0"; // Nếu không hợp lệ, gán giá trị mặc định
    } else {
        totalPriceFormatted = new Big(totalPriceFormatted).toLocaleString(); // Đảm bảo xử lý kiểu BigDecimal
    }

    sheetData.push(["Tổng Giá:", "", `${totalPriceFormatted} VND`]);

    // Tạo worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    // Thêm style cho header (căn giữa và màu sắc)
    const range = XLSX.utils.decode_range(worksheet["!ref"]); // Lấy phạm vi dữ liệu
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = { r: 0, c: col }; // Chỉnh sửa header
        if (!worksheet[XLSX.utils.encode_cell(cellAddress)]) continue;
        worksheet[XLSX.utils.encode_cell(cellAddress)].s = headerStyle;
    }

    // Tự động căn chỉnh cột
    const colWidths = [];
    for (let col = 0; col <= range.e.c; col++) {
        let maxWidth = 0;
        for (let row = range.s.r; row <= range.e.r; row++) {
            const cellAddress = { r: row, c: col };
            const cell = worksheet[XLSX.utils.encode_cell(cellAddress)];
            if (cell && cell.v) {
                maxWidth = Math.max(maxWidth, cell.v.toString().length);
            }
        }
        colWidths.push({ wch: maxWidth + 2 }); // Thêm chút khoảng trống cho dễ nhìn
    }
    worksheet["!cols"] = colWidths; // Áp dụng chiều rộng cột tự động

    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, `Order_${order.id}`);

    // Xuất file Excel
    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `Order_${order.id}.xlsx`);
};


console.log(orders);
  return (
    <div className="container mt-4">
      <Link to="/ManageOrders">
        <Button variant="primary">New Order</Button>
      </Link>
      <h1 className="text-center mb-4">Manage All Orders</h1>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Reservation Code</th>
                <th>Customer Name</th>
                <th>Order Time</th>
                <th>Payment Status</th>
                <th>Total Price</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.reservationCode}</td>
                    <td>{order.customerName}</td>
                    <td>{order.orderTime}</td>
                    <td>{order.paymentStatus}</td>
                    <td>${order.totalPrice.toFixed(2)}</td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => exportOrderToExcel(order)}
                      >
                        In Hóa Đơn
                      </Button>

                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleOpenModal("update", order)}
                      >
                        Update Payment Status
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleOpenModal("delete", order)}
                      >
                        Delete Order
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Phân trang */}
          <Pagination className="justify-content-center mt-4">
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Previous
            </Pagination.Prev>
            {[...Array(totalPages).keys()].map((page) => (
              <Pagination.Item
                key={page}
                active={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </Pagination.Next>
          </Pagination>
        </>
      )}

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "update" ? "Update Payment Status" : "Delete Order"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === "update" ? (
            <>
              <Form.Group>
                <Form.Label>Payment Status</Form.Label>
                <Form.Control
                  as="select"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                >
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">Unpaid</option>
                </Form.Control>
              </Form.Group>
            </>
          ) : (
            <p>Are you sure you want to delete this order?</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          {modalType === "update" ? (
            <Button variant="warning" onClick={handleUpdatePaymentStatus}>
              Update
            </Button>
          ) : (
            <Button variant="danger" onClick={handleDeleteOrder}>
              Delete
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageAllOrder;
