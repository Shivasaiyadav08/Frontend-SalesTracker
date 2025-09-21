import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

// Auth
export const registerUser = (name, email, password) =>
  API.post("/auth/register", { name, email, password });

export const loginUser = (email, password) =>
  API.post("/auth/signin", { email, password });

export const forgotPassword=(email )=>
 API.post('/auth/forgot-password',{email});


export const resetPassword = (token, password) =>
  API.put(`/auth/resetpassword/${token}`, { password });

// Sales
export const getSales = (date) => API.get(`/sales/${date}`);
export const undoSale = () => API.delete(`/sales/undo`);
export const addSale = (date, name, price, method) =>
  API.post(`/sales/addsale`, { date, name, price, method });

export default API;
