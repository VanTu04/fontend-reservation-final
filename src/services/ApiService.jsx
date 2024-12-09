import axios from "axios";

export const BASE_URL = `http://binhan.serveftp.com:8080/api`;

// export const BASE_URL = `http://localhost:8080/api`;

export const loginApi = (phone_number, password) => {
  return axios.post(`${BASE_URL}/users/login`, { phone_number, password });
};

export const signupApi = (data) => {
  return axios.post(`${BASE_URL}/users/register`, data);
};

export const fetchAllCategories = () => {
  return axios.get(`${BASE_URL}/categories`);
};

export const fetchFoodsByCategory = (id) => {
  return axios.get(`${BASE_URL}/products/${id}`);
};

export const addCategory = (category, token) => {
  return axios.post(`${BASE_URL}/categories`, category, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateCategory = (categoryId, category, token) => {
  return axios.put(`${BASE_URL}/categories/${categoryId}`, category, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteCategory = (categoryId, token) => {
  return axios.delete(`${BASE_URL}/categories/${categoryId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchAllProducts = () => {
  return axios.get(`${BASE_URL}/products`);
};

export const addProduct = (products, token) => {
  return axios.post(`${BASE_URL}/products`, products, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addImage = (id, file, token) => {
  const formData = new FormData();
  formData.append("files", file);

  return axios.post(`${BASE_URL}/products/uploads/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateProduct = (id, product, token) => {
  return axios.put(`${BASE_URL}/products/${id}`, product, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteProduct = (id, token) => {
  return axios.delete(`${BASE_URL}/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchReservation = (id, token) => {
  return axios.get(`${BASE_URL}/booktable/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const fetchAllReservation = (token) => {
  return axios.get(`${BASE_URL}/booktable`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createReservation = (data, token) => {
  return axios.post(`${BASE_URL}/booktable`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const cancelReservation = (id, token) => {
  return axios.delete(`${BASE_URL}/booktable/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateReservationStatus = (id, newStatus, token) => {
  return axios.put(
    `${BASE_URL}/booktable/status/${id}`,
    { status: newStatus },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getOrderByReservationId = (id, token) => {
  return axios.get(`${BASE_URL}/orders/tablereservation/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const searchReservationByCode = (jwt, code) => {
  return axios.get(`${BASE_URL}/booktable/code/${code}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
};

export const fetchAllOrders = (page, jwt) => {
  return axios.get(`${BASE_URL}/orders?page=${page}&size=5`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
}

export const updateOrderStatus = (id,paymentStatus, token) => {
  return axios.put(`${BASE_URL}/orders/changestatus`, {id:id, status:paymentStatus}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteOrder = (id, token) => {
  return axios.delete(`${BASE_URL}/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const orderFood = (orderData, jwt) => {
  return axios.post(`${BASE_URL}/orders`, orderData, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
};

export const updateOrder = (orderId, orderData, jwt) => {
  return axios.put(`${BASE_URL}/orders/update/${orderId}`, orderData, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
};

export const getOrderReport = (startDate, endDate, jwt) => {
  return axios.get(
    `${BASE_URL}/report`,{
      params: {
        startDate,
        endDate,
      },
      headers: { Authorization: `Bearer ${jwt}` },
    });
};

export const exportOrderReportToExcel = (startDate, endDate, jwt) => {
  return axios.get(`${BASE_URL}/report/excel`, {
    params: {
      startDate,
      endDate,
    },
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    responseType: "blob",
  });
};

export const fogotPassword = (email, phoneNumber) => {
  return axios.post(`${BASE_URL}/users/forgot-password`, { email, phoneNumber });
}

export const verifyPassword = (email, otp) => {
  return axios.post(`${BASE_URL}/users/verify-password`, { email, otp });
}

export const resetPassword = (phoneNumber, password) => {
  return axios.post(`${BASE_URL}/users/reset-password`, { phoneNumber, password });
}