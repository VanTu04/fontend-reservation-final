// src/pages/auth/Login.js
import React, { useEffect, useState } from "react";
import "./Login.scss";
import { loginApi } from "../../services/ApiService";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../components/store/authSlice";

const Login = () => {
  const [phonenumber, setPhonenumber] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // Điều hướng về trang chính khi đã đăng nhập
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!phonenumber || !password) {
      toast.error("Phone number or Password is required!");
      return;
    }
    try {
      // Gọi API đăng nhập
      let res = await loginApi(phonenumber, password);
      if (res && res.data && res.data.jwt) {
        dispatch(
          login({
            id: res.data.id,
            fullName: res.data.fullName,
            jwt: res.data.jwt,
            roles: res.data.roles,
          })
        );
        navigate("/");
        toast.success("Success");
      } else {
        toast.error("Invalid login response!");
      }
    } catch (error) {
      if (error.response) {
        // Xử lý các mã lỗi khác từ backend
        switch (error.response.status) {
          case 401:
            toast.error(
              "Incorrect phone number or password. Please try again."
            );
            break;
          case 400:
            toast.error(error.response.data);
            break;
          default:
            toast.error("An error occurred. Please try again later.");
        }
      } else {
        // Lỗi không phản hồi từ server
        toast.error(
          "Unable to connect to the server. Please check your internet connection."
        );
      }
    }
  };

  return (
    <>
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="phonenumber">Phone Number</label>
            <input
              type="text"
              id="phonenumber"
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className={phonenumber && password ? "active" : ""}
            type="submit"
          >
            Login
          </button>
          <div className="register-link">
            <p>
              <Link to="/ForgotPasswordPage">You forgot password?</Link>
            </p>
            <p>
              Don't have an account? <Link to="/signup">Sign up here</Link>
            </p>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
