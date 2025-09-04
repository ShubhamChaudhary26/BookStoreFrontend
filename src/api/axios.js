import axios from "axios";

const API = axios.create({ baseURL: "https://bookstorebackend-8ke2.onrender.com/api" });


// Token middleware
API.interceptors.request.use((req) => {
  const user = localStorage.getItem("user");
  if (user) {
    req.headers.Authorization = `Bearer ${JSON.parse(user).token}`;
  }
  return req;
});

export default API;
