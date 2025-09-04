import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import { Loader2, Mail, Lock } from "lucide-react"; // Install lucide-react for icons

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      navigate(
        res.data.role === "student" ? "/student-dashboard" : "/librarian-dashboard"
      );
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-300 via-green-100 to-green-50 animate-gradient">
      <div className="backdrop-blur-lg bg-white/80 shadow-2xl rounded-3xl p-8 w-full max-w-md border border-white/40 animate-fadeIn">
        <h2 className="text-4xl font-extrabold text-center mb-4 text-green-700">Welcome Back</h2>
        <p className="text-center text-gray-600 mb-8">Login to your account</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition flex justify-center items-center gap-2
              ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl"}`}
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="text-green-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
