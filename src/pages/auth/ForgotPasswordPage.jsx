import React, { useState } from 'react';
import { fogotPassword, verifyPassword, resetPassword } from '../../services/ApiService';
import { Toast } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPasswordPage.scss'; // Import SCSS file

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();
  
  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      const response = await fogotPassword(email, phoneNumber);
      setMessage(response.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data || 'Something went wrong');
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      const response = await verifyPassword(email, otp);
      setMessage(response.data);
      setStep(3);
    } catch (err) {
      setError('Invalid OTP');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      const response = await resetPassword(phoneNumber, password);
      setMessage(response.data);
      setShowToast(true);
      setTimeout(() => navigate('/Login'), 3000);
    } catch (err) {
      setError(err.response?.data || 'Something went wrong');
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <p>
        <Link to="/Login">Login</Link>
      </p>

      {/* Hiển thị Toast thông báo thành công */}
      <div className="toast-container">
        <Toast show={showToast} onClose={() => setShowToast(false)}>
          <Toast.Body>Password has been reset successfully. Redirecting to login...</Toast.Body>
        </Toast>
      </div>

      {/* Hiển thị lỗi */}
      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
      
      {/* Bước 1: Nhập Email và Số Điện Thoại */}
      {step === 1 && (
        <form onSubmit={handleForgotPasswordSubmit}>
          <div className='input-box'>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='input-box'>
            <label>Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <button type="submit">Send OTP</button>
        </form>
      )}
      
      {/* Bước 2: Nhập OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtpSubmit}>
          <div className='input-box'>
            <label>OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <button type="submit">Verify OTP</button>
        </form>
      )}
      
      {/* Bước 3: Đặt lại mật khẩu */}
      {step === 3 && (
        <form onSubmit={handleResetPasswordSubmit}>
          <div className='input-box'>
            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
