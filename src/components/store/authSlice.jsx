import { createSlice } from '@reduxjs/toolkit';

// Khôi phục trạng thái từ localStorage nếu có
const storedAuth = JSON.parse(localStorage.getItem('auth')) || {
  id: null,
  fullName: null,
  jwt: null,
  roles: [],
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: storedAuth, // Khởi tạo từ localStorage
  reducers: {
    login: (state, action) => {
      const { id, fullName, jwt, roles } = action.payload;
      state.id = id;
      state.fullName = fullName;
      state.jwt = jwt;
      state.roles = roles;
      state.isAuthenticated = true;

      // Lưu vào localStorage
      localStorage.setItem(
        'auth',
        JSON.stringify({
          id,
          fullName,
          jwt,
          roles,
          isAuthenticated: true,
        })
      );
    },
    logout: (state) => {
      state.id = null;
      state.fullName = null;
      state.jwt = null;
      state.roles = [];
      state.isAuthenticated = false;

      // Xóa khỏi localStorage
      localStorage.removeItem('auth');
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
