import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function Books() {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState(""); 
  const [sortField, setSortField] = useState("title"); 
  const [sortOrder, setSortOrder] = useState("asc"); 
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 6;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await API.get("/books");
        setBooks(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBooks();
  }, []);

  const handleBorrow = async (bookId) => {
    try {
      await API.post(`/borrow/${bookId}`);
      alert("Book borrowed!");
      setBooks((prev) =>
        prev.map((b) => (b._id === bookId ? { ...b, available: false } : b))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Error borrowing book");
    }
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      await API.delete(`/books/${bookId}`);
      alert("Book deleted!");
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting book");
    }
  };

  // 🔍 Filter
  const filteredBooks = books.filter((book) =>
    `${book.title} ${book.author} ${book.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // 🔽 Sort
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    let aValue = a[sortField]?.toString().toLowerCase() || "";
    let bValue = b[sortField]?.toString().toLowerCase() || "";
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // 📄 Pagination
  const indexOfLast = currentPage * booksPerPage;
  const indexOfFirst = indexOfLast - booksPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedBooks.length / booksPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">
        📚 Book Catalog
      </h2>

      {/* 🔍 Search & Sort */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder=" Search by title, author, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-400"
        />
        <div className="flex gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="px-4 py-2 border rounded-xl"
          >
            <option value="title">Title</option>
            <option value="author">Author</option>
            <option value="category">Category</option>
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
      </div>

      {/* 📚 Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentBooks.map((book) => (
          <div
            key={book._id}
            className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-transform transform hover:-translate-y-1 h-full"
          >
            {/* 📘 Book Cover */}
            <div className="h-56 w-full overflow-hidden rounded-t-2xl flex-shrink-0">
              {book.coverImage ? (
                <img
                  src={`http://localhost:5000/${book.coverImage}`}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                  No Image
                </div>
              )}
            </div>

            {/* 📖 Book Info */}
            <div className="flex flex-col flex-grow p-4">
              <h3 className="font-bold text-lg line-clamp-1">{book.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-1">By {book.author}</p>
              <p className="text-sm text-gray-500 mb-2">
                Category: {book.category}
              </p>

              <span
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${
                  book.available
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {book.available ? "Available" : "Borrowed"}
              </span>

              {/* Push buttons to bottom */}
              <div className="mt-auto flex gap-2">
                {user.role === "student" && book.available && (
                  <button
                    onClick={() => handleBorrow(book._id)}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Borrow
                  </button>
                )}
                {user.role === "librarian" && (
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
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
    </div>
  );
}
