import React, { useState } from 'react';
import './Signup.scss';
import { signupApi } from '../../services/ApiService'; // Giả sử bạn đã có API service để đăng ký người dùng
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { toast } from 'react-toastify';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');

  const navigate = useNavigate(); // Khai báo navigate

  const handleSignup = async (event) => {
    event.preventDefault();

    // Kiểm tra các trường nhập
    if (!fullName || !email || !phoneNumber || !address || !password || !retypePassword) {
      toast.error("All fields are required!");
      return;
    }

    if (password !== retypePassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      // Gọi API đăng ký
      let res = await signupApi({ full_name: fullName, email, phone_number: phoneNumber, address: address, password, retype_password: retypePassword, role_id: 2 });
      console.log(res);
      if (res && res.status===200) {
        toast.success("Signup successful!");
        // Điều hướng đến trang đăng nhập sau khi đăng ký thành công
        navigate('/login'); // Điều hướng đến trang login
      } else {
        toast.error("Signup failed. Please try again later.");
      }
    } catch (error) {
      // Kiểm tra lỗi từ backend (HTTP 400 hoặc 500)
      if (error.response) {
        // Xử lý nếu backend trả về lỗi, lấy thông báo lỗi từ backend
        if (error.response.status === 400) {
          toast.error(error.response.data);
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      } else {
        toast.error("Network error. Please try again later.");
      }
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>

        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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

        <div className="form-group">
          <label htmlFor="retypePassword">Retype Password</label>
          <input
            type="password"
            id="retypePassword"
            value={retypePassword}
            onChange={(e) => setRetypePassword(e.target.value)}
            required
          />
        </div>

        <button
          className={fullName && email && phoneNumber && password && retypePassword ? "active" : ""}
          type="submit"
        >
          Signup
        </button>

        <div className="register-link">
          <p>
            Already have an account?{" "}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Signup;
