import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardStudent from "./pages/DashboardStudent";
import DashboardLibrarian from "./pages/DashboardLibrarian";
import Books from "./pages/Books";
import BorrowedBooks from "./pages/BorrowedBooks";
import NotAuthorized from "./pages/NotAuthorized";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Shared protected */}
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <Books />
              </ProtectedRoute>
            }
          />
          <Route
            path="/borrowed"
            element={
              <ProtectedRoute>
                <BorrowedBooks />
              </ProtectedRoute>
            }
          />

          {/* Role-based */}
          <Route
            path="/student-dashboard"
            element={
              <RoleProtectedRoute allowedRoles={["student"]}>
                <DashboardStudent />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/librarian-dashboard"
            element={
              <RoleProtectedRoute allowedRoles={["librarian"]}>
                <DashboardLibrarian />
              </RoleProtectedRoute>
            }
          />

          {/* Not authorized */}
          <Route path="/not-authorized" element={<NotAuthorized />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;   // 👈 don’t forget this
