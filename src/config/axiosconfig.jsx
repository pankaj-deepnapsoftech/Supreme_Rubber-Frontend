import axios from "axios";

const axiosHandler = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
});

export default axiosHandler;
