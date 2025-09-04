import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null; // Hide navbar if not logged in

  return (
    <nav className="bg-green-700 text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <h1 className="text-xl font-bold tracking-wide">Student Library</h1>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            {user.role === "student" && (
              <>
                <Link to="/student-dashboard" className="hover:underline">
                  Dashboard
                </Link>
                <Link to="/books" className="hover:underline">
                  Books
                </Link>
                <Link to="/borrowed" className="hover:underline">
                  My Borrowed
                </Link>
              </>
            )}

            {user.role === "librarian" && (
              <>
                <Link to="/librarian-dashboard" className="hover:underline">
                  Dashboard
                </Link>
                <Link to="/books" className="hover:underline">
                  Books
                </Link>
                <Link to="/borrowed" className="hover:underline">
                  Borrowed List
                </Link>
              </>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none"
            >
              {isOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden bg-green-600 px-4 py-3 space-y-3">
          {user.role === "student" && (
            <>
              <Link
                to="/student-dashboard"
                onClick={() => setIsOpen(false)}
                className="block hover:underline"
              >
                Dashboard
              </Link>
              <Link
                to="/books"
                onClick={() => setIsOpen(false)}
                className="block hover:underline"
              >
                Books
              </Link>
              <Link
                to="/borrowed"
                onClick={() => setIsOpen(false)}
                className="block hover:underline"
              >
                My Borrowed
              </Link>
            </>
          )}

          {user.role === "librarian" && (
            <>
              <Link
                to="/librarian-dashboard"
                onClick={() => setIsOpen(false)}
                className="block hover:underline"
              >
                Dashboard
              </Link>
              <Link
                to="/books"
                onClick={() => setIsOpen(false)}
                className="block hover:underline"
              >
                Books
              </Link>
              <Link
                to="/borrowed"
                onClick={() => setIsOpen(false)}
                className="block hover:underline"
              >
                Borrowed List
              </Link>
            </>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-center"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
