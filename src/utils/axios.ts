import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production" ? "http://15.206.242.82:5000" : "",
});

export default axiosInstance;
