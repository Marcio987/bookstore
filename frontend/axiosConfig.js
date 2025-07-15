// src/axiosConfig.js
import axios from "axios";

const instance = axios.create({
  baseURL: "https://bookstore-7r11.onrender.com",
  withCredentials: true, // ← dzięki temu ciasteczka logowania są wysyłane
});

export default instance;
