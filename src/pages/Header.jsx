import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../components/store/authSlice";
import { toast } from "react-toastify";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, fullName, roles } = useSelector(
    (state) => state.auth
  );

  const handleLogout = () => {
    // Gọi action logout từ Redux
    dispatch(logout());
    navigate("/");
    toast.success("Logout success");
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand>
          <NavLink to="/" className="navbar-brand">
            Restaurant
          </NavLink>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {roles.length === 0 || roles === "USER" ? <NavLink to="/Reservation" className="active nav-link">Reservation</NavLink>: ""}
            
            {roles && roles === "ADMIN" ? (
              <>
                <NavLink to="/ManageFood" className="active nav-link">
                  ManageFood
                </NavLink>
                <NavLink to="/ManageCategories" className="active nav-link">
                  ManageCategories
                </NavLink>
                <NavLink to="/ManageReservation" className="active nav-link">
                  ManageReservation
                </NavLink>
                <NavLink to="/ManageAllOrder" className="active nav-link">
                  ManageAllOrder
                </NavLink>
                <NavLink to="/Report" className="active nav-link">
                  Report
                </NavLink>
              </>
            ) : (
              ""
            )}
          </Nav>
          <Nav>
            <NavDropdown
              title={fullName ? fullName : "Setting"}
              id="basic-nav-dropdown"
            >
              {isAuthenticated && isAuthenticated ? (
                <NavDropdown.Item onClick={handleLogout}>
                  Logout
                </NavDropdown.Item>
              ) : (
                <NavDropdown.Item as={NavLink} to="/login">
                  Login
                </NavDropdown.Item>
              )}
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
