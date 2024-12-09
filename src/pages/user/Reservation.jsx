import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "./Reservation.scss";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchReservation,
  createReservation,
  cancelReservation,
  getOrderByReservationId,
} from "../../services/ApiService"; // Thêm hàm cancelReservation

const Reservation = () => {
  const [reservations, setReservations] = useState([]);
  const [formData, setFormData] = useState({
    customer_name: "",
    guest_count: "",
    reservation_time: "",
    number_phone: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReservationId, setCancelReservationId] = useState(null);
  const confirmCancelReservation = (reservationId) => {
    setCancelReservationId(reservationId);
    setCancelModalVisible(true);
  };

  const handleClose = () => {
    setShow(false);
    setDataOrder(null);
  };
  const handleShow = () => setShow(true);

  const [dataOrder, setDataOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy customerId từ Redux store
  const { id, jwt } = useSelector((state) => state.auth);

  const fetchReservationsData = async () => {
    setLoading(true);
    try {
      const response = await fetchReservation(id, jwt); // API call
      setReservations(response.data);
      console.log(response.data);
    } catch (err) {
      toast.error("Error fetching reservations.");
    } finally {
      setLoading(false);
    }
  };
  // Fetch reservations when component loads or when id or jwt changes
  useEffect(() => {
    fetchReservationsData();
  }, [id, jwt]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.guest_count < 2) {
      toast.error("Guest count must be at least 2.");
      return;
    }
    setLoading(true);

    const payload = { ...formData, customerId: id };

    try {
      const response = await createReservation(payload, jwt); // Gửi API tạo đặt bàn
      toast.success(response.data);

      fetchReservationsData();

      setFormData({
        customer_name: "",
        guest_count: "",
        reservation_time: "",
      });

      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to create reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel reservation
  const handleCancelReservation = async () => {
    if (!cancelReservationId) return;

    setLoading(true);
    try {
      const res = await cancelReservation(cancelReservationId, jwt); // Gọi API hủy đặt bàn
      toast.success(res.data);
      fetchReservationsData(); // Refresh danh sách đặt bàn
      setCancelModalVisible(false); // Đóng modal xác nhận
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data);
      } else {
        toast.error(
          "Unable to connect to the server. Please check your internet connection."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (reservationId) => {
    try {
      // Gọi API lấy thông tin đơn hàng theo reservationId
      const res = await getOrderByReservationId(reservationId, jwt);
      console.log(res);
      if (res) {
        setDataOrder(res.data[0]);
        handleShow(); // Mở modal hiển thị thông tin
      } else {
        toast.error("Không tìm thấy đơn hàng.");
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi lấy dữ liệu hóa đơn.");
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0
    const date = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${date}T${hours}:${minutes}`;
  };

  return (
    <div className="reservation-container">
      {/* Button to open modal */}
      <button
        className="btn-add-reservation"
        onClick={() => setIsModalOpen(true)}
      >
        Đặt Bàn
      </button>

      {/* Display Reservations */}
      <div className="reservation-list">
        <h2>Current Reservations</h2>
        {reservations.length > 0 ? (
          <table className="reservation-table">
            <thead>
              <tr>
                <th>Reservation Code</th>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Guest Count</th>
                <th>Reservation Time</th>
                <th>Status</th>
                <th>Actions</th> {/* Thêm cột Actions */}
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res.id}>
                  <td>{res.reservationCode}</td>
                  <td>{res.customerName}</td>
                  <td>{res.numberPhone}</td>
                  <td>{res.guestCount}</td>
                  <td>
                    {new Date(
                      res.reservationTime[0],
                      res.reservationTime[1] - 1,
                      res.reservationTime[2],
                      res.reservationTime[3],
                      res.reservationTime[4]
                    ).toLocaleString()}
                  </td>
                  <td>{res.status}</td>
                  <td>
                    {/* Cột chứa 2 nút */}
                    <button
                      className="btn-cancel"
                      onClick={() => confirmCancelReservation(res.id)}
                    >
                      Hủy Đặt Hàng
                    </button>

                    <button
                      className="btn-view-invoice"
                      onClick={() => handleViewInvoice(res.id)}
                    >
                      Xem Hóa Đơn
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No reservations found.</p>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Create New Reservation</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer Name:</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  placeholder="Nhập tên người đặt bàn"
                />
              </div>
              <div className="form-group">
                <label>Số Điện Thoại:</label>
                <input
                  type="tel"
                  name="number_phone"
                  value={formData.number_phone}
                  onChange={handleChange}
                  required
                  pattern="^[0-9]{10,11}$" // Đảm bảo số điện thoại có từ 10-11 chữ số
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="form-group">
                <label>Guest Count:</label>
                <input
                  type="number"
                  name="guest_count"
                  value={formData.guest_count}
                  onChange={handleChange}
                  required
                  min={1} // Số khách tối thiểu là 2
                />
              </div>
              <div className="form-group">
                <label>Reservation Time:</label>
                <input
                  type="datetime-local"
                  name="reservation_time"
                  value={formData.reservation_time}
                  onChange={handleChange}
                  min={getMinDateTime()} // Ngăn không cho chọn thời gian trước hiện tại
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" disabled={loading} className="btn-submit">
                  {loading ? "Submitting..." : "Create Reservation"}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal hiển thị thông tin đơn hàng */}
      <Modal show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Chi Tiết Đơn Hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Kiểm tra xem có dữ liệu đơn hàng không */}
          {dataOrder &&
          dataOrder.orderItems &&
          dataOrder.orderItems.length > 0 ? (
            <div>
              <h5>
                Thời Gian Đặt: {new Date(dataOrder.orderTime).toLocaleString()}
              </h5>
              <h6>Trạng Thái Thanh Toán: {dataOrder.paymentStatus}</h6>
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Tên Món</th>
                    <th>Số Lượng</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Lặp qua các món trong đơn hàng và hiển thị */}
                  {dataOrder.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.food.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.food.price.toLocaleString()} VND</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="total-price">
                <span className="total-label">Tổng Giá:</span>
                <span className="total-value">
                  {dataOrder.totalPrice.toLocaleString()} VND
                </span>
              </div>
            </div>
          ) : (
            <p>Không có món trong đơn hàng.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal cofirm hủy */}
      <Modal
        show={cancelModalVisible}
        onHide={() => setCancelModalVisible(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Xác Nhận Hủy Đặt Bàn</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc chắn muốn hủy đặt bàn này không?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setCancelModalVisible(false)}
          >
            Hủy
          </Button>
          <Button
            variant="danger"
            onClick={handleCancelReservation}
            disabled={loading}
          >
            {loading ? "Đang hủy..." : "Hủy Đặt Bàn"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Reservation;
