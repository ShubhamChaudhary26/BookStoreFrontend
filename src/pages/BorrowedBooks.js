import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast"; // ✅ Import toast

export default function BorrowedBooks() {
  const { user } = useContext(AuthContext);
  const [borrowed, setBorrowed] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchBorrowed = async () => {
    try {
      const url = user.role === "student" ? "/borrow/my" : "/borrow/all";
      const res = await API.get(url);

      const data =
        user.role === "student"
          ? res.data.filter((b) => !b.returnDate)
          : res.data;

      setBorrowed(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load borrowed books");
    }
  };

  useEffect(() => {
    fetchBorrowed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const handleReturn = async (borrowId) => {
    try {
      await API.put(`/borrow/return/${borrowId}`);
      toast.success("Book returned successfully");
      fetchBorrowed(); // ✅ Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Error returning book");
    }
  };

  // 🔍 Filter & Sort (SAFE)
  const filtered = borrowed.filter((b) =>
    `${b.book?.title || ""} ${b.book?.author || ""} ${b.student?.name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === "dueDate" || sortField === "borrowDate") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // 📄 Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">
        {user.role === "student" ? "My Borrowed Books" : "All Borrowed Books"}
      </h2>

      {/* Search & Sort */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by book, author, or student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-400"
        />
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="px-4 py-2 border rounded-xl"
        >
          <option value="dueDate">Due Date</option>
          <option value="borrowDate">Borrow Date</option>
          <option value="book.title">Book Title</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="px-4 py-2 border rounded-xl"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {borrowed.length === 0 ? (
        <p className="text-center text-gray-500">
          No borrowed books right now.
        </p>
      ) : (
        <>
          {/* Borrowed Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {paginated.map((b) => (
              <div
                key={b._id}
                className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 h-full"
              >
                {/* Book Cover */}
                <div className="h-48 w-full overflow-hidden rounded-t-2xl flex-shrink-0">
                  {b.book?.coverImage ? (
                    <img
                      src={`https://bookstorebackend-8ke2.onrender.com/${b.book.coverImage}`}
                      alt={b.book?.title || "Book"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                      No Image
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="flex flex-col flex-grow p-4">
                  <h3 className="font-bold text-lg line-clamp-1">
                    {b.book?.title || "Untitled"}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-1">
                    By {b.book?.author || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Due:{" "}
                    {b.dueDate
                      ? new Date(b.dueDate).toLocaleDateString()
                      : "N/A"}
                  </p>

                  {/* Overdue/Fine Status */}
                  {user.role === "student" && (
                    <>
                      {b.isOverdue ? (
                        <p className="text-sm font-semibold text-red-600">
                          Overdue! Fine so far: ₹{b.fine || 0}
                        </p>
                      ) : (
                        <p className="text-sm font-semibold text-green-600">
                          On Time
                        </p>
                      )}
                    </>
                  )}

                  {user.role === "librarian" && (
                    <p
                      className={`text-sm font-semibold ${
                        b.isOverdue ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {b.isOverdue
                        ? `Overdue (₹${b.fine || 0})`
                        : "On Time"}
                    </p>
                  )}

                  {/* Return Button */}
                  {user.role === "student" && !b.returnDate && (
                    <button
                      onClick={() => handleReturn(b._id)}
                      className="mt-auto w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Return
                    </button>
                  )}

                  {b.returnDate && (
                    <p className="text-green-600 mt-auto font-medium">
                      Returned
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center mt-6 gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
