import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";
import toast from "react-hot-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/register", { name, email, password, role });
      if (res?.data) {
        login(res.data);
        toast.success("Registration successful!");
        navigate(res.data.role === "student" ? "/student-dashboard" : "/librarian-dashboard");
      } else {
        toast.error(" Unexpected server response");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || " Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-300 via-green-100 to-green-50 p-4">
      <div className="backdrop-blur-lg bg-white/80 shadow-xl rounded-3xl p-8 w-full max-w-md border border-white/40">
        <h2 className="text-4xl font-extrabold text-center mb-4 text-green-700">Create Account</h2>
        <p className="text-center text-gray-600 mb-8">Sign up to get started</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          >
            <option value="student">Student</option>
            <option value="librarian">Librarian</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition 
              ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl"}`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
