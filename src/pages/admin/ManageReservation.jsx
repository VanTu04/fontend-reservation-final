import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { fetchAllReservation, updateReservationStatus } from "../../services/ApiService";
import { Modal, Button, Table } from "react-bootstrap";
import { useSelector } from "react-redux";

const ManageReservation = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [status, setStatus] = useState('');
  const { jwt } = useSelector((state) => state.auth);

  // Fetch reservations on load
  useEffect(() => {
    const fetchReservationsData = async () => {
      try {
        setLoading(true);
        const response = await fetchAllReservation(jwt); // Lấy tất cả các đặt bàn
        setReservations(response.data);
      } catch (err) {
        toast.error("Error fetching reservations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReservationsData();
  }, []);

  // Handle update status
  const handleUpdateStatus = async (reservationId, newStatus) => {
    setLoading(true);
    try {
      await updateReservationStatus(reservationId, newStatus, jwt); // Gọi API cập nhật trạng thái
      toast.success(`Reservation status updated to ${newStatus}`);
      setReservations(reservations.map(reservation =>
        reservation.id === reservationId ? { ...reservation, status: newStatus } : reservation
      ));
    } catch (err) {
      toast.error("Error updating reservation status.");
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close and open
  const handleShowModal = (reservation) => {
    setSelectedReservation(reservation);
    setStatus(reservation.status);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReservation(null);
  };
console.log(reservations);
  return (
    <div className="container mt-4">
      <h2>Manage Reservations</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Reservation Code</th>
              <th>Customer Name</th>
              <th>Customer Phone</th>
              <th>Guest Count</th>
              <th>Reservation Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td>{reservation.reservationCode}</td>
                <td>{reservation.customerName}</td>
                <td>{reservation.numberPhone}</td>
                <td>{reservation.guestCount}</td>
                <td>{new Date(reservation.reservationTime[0], reservation.reservationTime[1] - 1, reservation.reservationTime[2], reservation.reservationTime[3], reservation.reservationTime[4]).toLocaleString()}</td>
                <td>{reservation.status}</td>
                <td>
                  <Button
                    variant="warning"
                    onClick={() => handleShowModal(reservation)}
                  >
                    Update Status
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal for updating status */}
      {selectedReservation && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Update Reservation Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <h5>Reservation Code: {selectedReservation.reservationCode}</h5>
              <h5>Customer Name: {selectedReservation.customerName}</h5>
              <h5>Current Status: {selectedReservation.status}</h5>
              <div>
                <label htmlFor="status">New Status:</label>
                <select
                  id="status"
                  className="form-control"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="UNCONFIRMED">UNCONFIRMED</option>
                </select>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                handleUpdateStatus(selectedReservation.id, status);
                handleCloseModal();
              }}
            >
              Update Status
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default ManageReservation;
