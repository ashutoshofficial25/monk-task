import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "http://stageapi.monkcommerce.app/task"
      : "",
});

export default axiosInstance;
