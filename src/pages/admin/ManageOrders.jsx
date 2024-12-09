import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  fetchAllProducts,
  searchReservationByCode,
  orderFood,
} from "../../services/ApiService";
import "./ManageOrder.scss"; // Đảm bảo có style tương ứng
import {
  Container,
  Row,
  Col,
  ListGroup,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";

const ManageOrder = () => {
  const [foods, setFoods] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [order, setOrder] = useState({
    table_reservation_id: null,
    order_item: [],
  });
  const [orderItems, setOrderItems] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState(false);

  // Lấy JWT từ Redux store
  const { jwt } = useSelector((state) => state.auth);

  // Fetch danh sách món ăn
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetchAllProducts();
        setFoods(response.data);
      } catch (err) {
        toast.error("Không thể tải danh sách món ăn!");
      }
    };
    fetchFoods();
  }, []);

  // Tìm kiếm bàn đặt theo mã
  const handleSearchReservation = async () => {
    if (!searchCode.trim()) {
      toast.warning("Vui lòng nhập mã đặt bàn!");
      return;
    }

    
    try {
      const response = await searchReservationByCode(jwt, searchCode.trim());
      setReservations(response.data);
    } catch (err) {
      toast.error("Không tìm thấy mã đặt bàn!");
    }
  };

  const addToOrder = (product) => {
    if (!order.table_reservation_id) {
      toast.warning("Vui lòng chọn mã đặt bàn trước khi thêm món!");
      return;
    }
  
    // Kiểm tra sản phẩm đã tồn tại trong orderItems chưa
    const exists = orderItems.find((item) => item.productId === product.id);
  
    if (exists) {
      // Nếu đã tồn tại, tăng số lượng
      const updatedItems = orderItems.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setOrderItems(updatedItems);
      calculateTotal(updatedItems);
    } else {
      // Nếu chưa tồn tại, thêm mới
      const newOrderItems = [
        ...orderItems,
        { productId: product.id, name: product.name, quantity: 1 },
      ];
      setOrderItems(newOrderItems);
      calculateTotal(newOrderItems);
    }
  };
  

  const updateQuantity = (productId, quantity) => {
    const updatedItems = orderItems.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(quantity, 1) }
        : item
    );
    setOrderItems(updatedItems);
    calculateTotal(updatedItems);
  };

  const removeFromOrder = (productId) => {
    const updatedItems = orderItems.filter(
      (item) => item.productId !== productId
    );
    setOrderItems(updatedItems);
    calculateTotal(updatedItems);
  };
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      const food = foods.find((food) => food.id === item.productId);
      return sum + (food ? food.price * item.quantity : 0);
    }, 0);
    setTotalAmount(total);
  };

  // Đặt món
  const handleSubmitOrder = async () => {
    if (!order.table_reservation_id) {
      toast.error("Vui lòng chọn bàn trước khi thanh toán!");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Vui lòng thêm món vào order trước khi thanh toán!");
      return;
    }

    const orderData = {
      table_reservation_id: order.table_reservation_id,
      payment_status: paymentStatus,
      order_item: orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };
    console.log(orderData);
    try {
      
      await orderFood(orderData, jwt);
      toast.success("Đặt món thành công!");
      setOrder({ table_reservation_id: null, order_item: [] });
      setOrderItems([]);
      setSearchCode("");
      setReservations([]);
    } catch (err) {
      toast.error("Đặt món thất bại!");
    } finally {
      ;
    }
  };
  console.log("Payment Status:", paymentStatus);
  return (
    <Container fluid className="manage-order-container mt-4">
      
      <Row>
        {/* Bảng món ăn */}
        <Col md={8} className="border-end">
        <Link to="/ManageAllOrder">
        <Button variant="primary">Go back</Button>
      </Link>
          <h3>Danh sách món ăn</h3>
          <div className="food-list">
            {foods.map((food) => (
              <div key={food.id} className="food-item">
                <img
                  src={`http://binhan.serveftp.com:8080/api/images/uploads/${food.thumbnail}`}
                  alt={food.name}
                  className="food-image"
                />
                <h5>{food.name}</h5>
                <p>Giá: {food.price.toLocaleString()} VND</p>
                <Button variant="primary" onClick={() => addToOrder(food)}>
                  Thêm vào order
                </Button>
              </div>
            ))}
          </div>
        </Col>

        {/* Bảng đặt bàn và giỏ hàng */}
        <Col md={4}>
          {/* Tìm kiếm mã đặt bàn */}
          <div className="reservation-section">
            <h3>Tìm kiếm mã code đặt bàn</h3>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Nhập mã đặt bàn"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
              <Button variant="secondary" onClick={handleSearchReservation}>
                Tìm kiếm
              </Button>
            </InputGroup>
            <div className="reservation-list">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className={`reservation-item ${
                    order.table_reservation_id === reservation.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => {
                    // Toggle selection of the reservation
                    if (order.table_reservation_id === reservation.id) {
                      // Deselect if the same reservation is clicked again
                      setOrder({ ...order, table_reservation_id: null });
                    } else {
                      // Select a new reservation
                      setOrder({
                        ...order,
                        table_reservation_id: reservation.id,
                      });
                    }
                  }}
                >
                  <div className="text-container">
                    <div className="text-item">
                      <strong>Mã đặt bàn:</strong> {reservation.reservationCode}
                    </div>
                    <div className="text-item">
                      <strong>Khách:</strong> {reservation.guestCount}
                    </div>
                    <div className="text-item">
                      <strong>Ngày đặt:</strong> {reservation.reservationTime}
                    </div>
                    <div className="text-item">
                      <strong>Trạng thái:</strong> {reservation.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Giỏ hàng */}
          <div className="cart-section">
            <h3>Order</h3>
            {orderItems.length === 0 ? (
              <p>Order trống</p>
            ) : (
              <ListGroup>
                {orderItems.map((item) => (
                  <ListGroup.Item key={item.productId}>
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{item.name}</span>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(
                              item.productId,
                              parseInt(e.target.value)
                            )
                          }
                          className="me-2"
                          style={{ width: "70px" }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => removeFromOrder(item.productId)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}

            <div className="total-price">
              <h4>Tổng tiền: {totalAmount.toLocaleString()} VND</h4>
            </div>
            <Form.Group controlId="paymentStatusCheckbox" className="mt-3">
  <Form.Check
    type="checkbox"
    label="Thanh toán"
    checked={paymentStatus}
    onChange={(e) => {
      setPaymentStatus(e.target.checked);
      console.log("Payment Status:", e.target.checked);
    }}
  />
</Form.Group>

            <Button
              className="mt-3"
              variant="success"
              onClick={handleSubmitOrder}
              disabled={orderItems.length === 0}
            >
              Thanh toán
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ManageOrder;
