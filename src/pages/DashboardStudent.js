import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function DashboardStudent() {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [borrowed, setBorrowed] = useState([]);
  const [history, setHistory] = useState([]); // ✅ Borrow history
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("title");

  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 6;

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const booksRes = await API.get("/books");
      setBooks(booksRes.data || []);

      const borrowedRes = await API.get("/borrow/my");
      const borrowedData = borrowedRes.data || [];
      setBorrowed(borrowedData.filter((b) => !b.returnDate)); // only active

      setHistory(borrowedData.filter((b) => b.returnDate)); // ✅ returned books
    } catch (err) {
      console.error(err);
    }
  };

  const handleBorrow = async (bookId) => {
    setLoading(true);
    try {
      const res = await API.post(`/borrow/${bookId}`);
      alert(" Book borrowed!");
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.message || "Error borrowing book");
    }
    setLoading(false);
  };

 const handleReturn = async (borrowId) => {
  setLoading(true);
  try {
    const res = await API.put(`/borrow/return/${borrowId}`);
    const { fine } = res.data; // ✅ fine from backend

    if (fine > 0) {
      alert(`Book returned with fine: ₹${fine}`);
    } else {
      alert(" Book returned on time!");
    }

    // refresh lists
    const borrowedRes = await API.get("/borrow/my");
    setBorrowed(borrowedRes.data);

    const booksRes = await API.get("/books");
    setBooks(booksRes.data || []);
  } catch (err) {
    alert(err.response?.data?.message || "Error returning book");
  }
  setLoading(false);
};


  // 🔍 Search + Sort
  const filteredBooks = books
    .filter((book) =>
      `${book.title} ${book.author} ${book.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "title") return a.title.localeCompare(b.title);
      if (sortOption === "author") return a.author.localeCompare(b.author);
      if (sortOption === "category") return a.category.localeCompare(b.category);
      return 0;
    });

  // 📄 Pagination
  const indexOfLast = currentPage * booksPerPage;
  const indexOfFirst = indexOfLast - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  // 🔔 Overdue warning check
  const overdueBooks = borrowed.filter(
    (b) => new Date(b.dueDate) < new Date()
  );

  // 📊 Dashboard stats
  const stats = {
    totalBooks: books.length,
    borrowedCount: borrowed.length,
    historyCount: history.length,
    overdueCount: overdueBooks.length,
    totalFines: history.reduce((sum, h) => sum + (h.fine || 0), 0),
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-green-700">
        Welcome, {user?.name || "Student"}
      </h1>

      {/* 📊 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-green-100 rounded-xl text-center">
          <p className="text-lg font-bold">{stats.totalBooks}</p>
          <p className="text-sm text-gray-600">Total Books</p>
        </div>
        <div className="p-4 bg-blue-100 rounded-xl text-center">
          <p className="text-lg font-bold">{stats.borrowedCount}</p>
          <p className="text-sm text-gray-600">Borrowed</p>
        </div>
        
        <div className="p-4 bg-red-100 rounded-xl text-center">
          <p className="text-lg font-bold">{stats.overdueCount}</p>
          <p className="text-sm text-gray-600">Overdue</p>
        </div>
        <div className="p-4 bg-yellow-100 rounded-xl text-center">
          <p className="text-lg font-bold">₹{stats.totalFines}</p>
          <p className="text-sm text-gray-600">Total Fines</p>
        </div>
      </div>

      {/* 🔔 Overdue Warning */}
      {overdueBooks.length > 0 && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl">
          ⚠️ You have {overdueBooks.length} overdue book
          {overdueBooks.length > 1 ? "s" : ""}. Please return them ASAP!
        </div>
      )}

      {/* 🔍 Search + Sort */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder=" Search by title, author, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-400"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-400"
        >
          <option value="title">Sort by Title</option>
          <option value="author">Sort by Author</option>
          <option value="category">Sort by Category</option>
        </select>
      </div>

      {/* 📚 Available Books */}
      <h2 className="text-2xl font-semibold mb-6 text-green-600">
        Available Books
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {currentBooks.length > 0 ? (
          currentBooks
            .filter((book) => book.available)
            .map((book) => (
              <div
                key={book._id}
                className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 h-full"
              >
                <div className="h-56 w-full overflow-hidden rounded-t-2xl flex-shrink-0">
                  {book.coverImage ? (
                    <img
                     src={`https://bookstorebackend-8ke2.onrender.com/${book.coverImage}`}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-grow p-4">
                  <h3 className="font-bold text-lg line-clamp-1">{book.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-1">By {book.author}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    Category: {book.category}
                  </p>
                  <button
                    disabled={loading}
                    onClick={() => handleBorrow(book._id)}
                    className={`mt-auto w-full py-2 rounded-lg text-white font-medium transition ${
                      loading
                        ? "bg-green-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    Borrow
                  </button>
                </div>
              </div>
            ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">No books found.</p>
        )}
      </div>

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mb-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* 📕 Borrowed Books */}
      <h2 className="text-2xl font-semibold mb-6 text-green-600">
        My Borrowed Books
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {borrowed.length > 0 ? (
          borrowed.map((b) => (
            <div
              key={b._id}
              className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 h-full"
            >
              <div className="h-56 w-full overflow-hidden rounded-t-2xl flex-shrink-0">
                {b.book?.coverImage ? (
                  <img
                    src={`http://localhost:5000/${b.book.coverImage}`}
                    alt={b.book?.title || "Book"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                    No Image
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-grow p-4">
                <h3 className="font-bold text-lg line-clamp-1">
                  {b.book?.title || "Untitled"}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-1">
                  By {b.book?.author || "Unknown"}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  Due: {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "N/A"}
                </p>
                <button
                  disabled={loading}
                  onClick={() => handleReturn(b._id)}
                  className={`mt-auto w-full py-2 rounded-lg text-white font-medium transition ${
                    loading
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Return
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-full text-center">
            You haven’t borrowed any books yet.
          </p>
        )}
      </div>

      {/* 📜 Borrow History */}
      <h2 className="text-2xl font-semibold mb-6 text-purple-600">
        Borrow History
      </h2>
      <div className="overflow-x-auto">
        {history.length > 0 ? (
          <table className="min-w-full bg-white border rounded-xl shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Book</th>
                <th className="px-4 py-2 border">Borrowed On</th>
                <th className="px-4 py-2 border">Returned On</th>
                <th className="px-4 py-2 border">Fine</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h._id} className="text-center">
                  <td className="px-4 py-2 border">{h.book?.title || "Untitled"}</td>
                  <td className="px-4 py-2 border">
                    {new Date(h.borrowDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">
                    {h.returnDate ? new Date(h.returnDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-2 border text-red-600 font-bold">
                    ₹{h.fine || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center">No history yet.</p>
        )}
      </div>
    </div>
  );
}
