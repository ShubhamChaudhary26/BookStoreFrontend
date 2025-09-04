import { useEffect, useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function DashboardLibrarian() {
  const { user } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [borrowed, setBorrowed] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const booksRes = await API.get("/books");
        setBooks(booksRes.data || []);

        const borrowedRes = await API.get("/borrow/all");
        setBorrowed(borrowedRes.data || []);

        const overdueRes = await API.get("/borrow/overdue");
        setOverdue(overdueRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleImageChange = (file) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("category", category);
      if (image) formData.append("coverImage", image);

      const res = await API.post("/books", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setBooks((prev) => [...prev, res.data]);
      resetForm();
      alert(" Book added successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding book");
    }
    setLoading(false);
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    if (!editingBook) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("category", category);
      if (image) formData.append("coverImage", image);

      const res = await API.put(`/books/${editingBook._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setBooks((prev) =>
        prev.map((b) => (b._id === editingBook._id ? res.data : b))
      );
      alert(" Book updated successfully!");
      resetForm();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating book");
    }
    setLoading(false);
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    setLoading(true);
    try {
      await API.delete(`/books/${bookId}`);
      setBooks((prev) => prev.filter((b) => b._id !== bookId));
      alert(" Book deleted!");
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting book");
    }
    setLoading(false);
  };

 const startEditing = (book) => {
  setEditingBook(book);
  setTitle(book.title);
  setAuthor(book.author);
  setCategory(book.category);
  setPreview(
    book.coverImage
      ? `https://bookstorebackend-8ke2.onrender.com/${book.coverImage}`
      : null
  );
};


  const resetForm = () => {
    setEditingBook(null);
    setTitle("");
    setAuthor("");
    setCategory("");
    setImage(null);
    setPreview(null);
  };

  const filteredBooks = books.filter((b) =>
    `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-green-700">
        Welcome Librarian, {user?.name || "User"} 
      </h1>

      {/* Add/Edit Book */}
      <h2 className="text-2xl font-semibold mb-4 text-green-600">
        {editingBook ? " Edit Book" : " Add New Book"}
      </h2>
      <form
        onSubmit={editingBook ? handleEditBook : handleAddBook}
        className="mb-8 grid grid-cols-1 md:grid-cols-5 gap-4"
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-400"
        />
        <input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-400"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-400"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageChange(e.target.files[0])}
          className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-400"
        />
        <button
          type="submit"
          disabled={loading}
          className={`py-2 rounded-xl text-white font-medium transition 
            ${loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}`}
        >
          {loading ? "Saving..." : editingBook ? "Save Changes" : "Add Book"}
        </button>
      </form>

      {/* Preview */}
      {preview && (
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
          <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder=" Search by title, author, or category..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-400"
      />

      {/* All Books */}
      <h2 className="text-2xl font-semibold mb-4 text-green-600">📖 All Books</h2>
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {filteredBooks.map((book) => (
            <div
              key={book._id}
              className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow hover:shadow-xl transition-transform transform hover:-translate-y-1 h-full"
            >
              <div className="h-48 w-full overflow-hidden rounded-t-2xl flex-shrink-0">
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
                <p className="text-sm mb-2">Category: {book.category}</p>
                <p
                  className={`text-sm font-medium ${
                    book.available ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {book.available ? "Available" : "Borrowed"}
                </p>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => startEditing(book)}
                    className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book._id)}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No books found.</p>
      )}

      {/* Overdue Books */}
      <h2 className="text-2xl font-semibold mb-4 text-red-600">⚠️ Overdue Books</h2>
      {overdue.length > 0 ? (
        <div className="overflow-x-auto mb-10">
          <table className="min-w-full bg-white border rounded-xl shadow">
            <thead>
              <tr className="bg-red-100">
                <th className="px-4 py-2 border">Book</th>
                <th className="px-4 py-2 border">Student</th>
                <th className="px-4 py-2 border">Borrow Date</th>
                <th className="px-4 py-2 border">Days Overdue</th>
              </tr>
            </thead>
            <tbody>
              {overdue.map((o) => {
                const daysOverdue =
                  Math.floor((new Date() - new Date(o.borrowDate)) / (1000 * 60 * 60 * 24)) - 3;
                return (
                  <tr key={o._id} className="text-center">
                    <td className="px-4 py-2 border">{o.book.title}</td>
                    <td className="px-4 py-2 border">{o.student.name}</td>
                    <td className="px-4 py-2 border">
                      {new Date(o.borrowDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border text-red-600 font-bold">
                      {daysOverdue > 0 ? `${daysOverdue} days` : "0"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 mb-10">Right Now No overdue books!</p>
      )}

      {/* Borrowed Books */}
      <h2 className="text-2xl font-semibold mb-4 text-green-600"> Borrowed Books</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {borrowed.map(
          (b) =>
            b?.book && (
              <div
                key={b._id}
                className="flex flex-col bg-white border border-gray-200 rounded-2xl shadow hover:shadow-xl transition-transform transform hover:-translate-y-1 h-full"
              >
                <div className="h-48 w-full overflow-hidden rounded-t-2xl flex-shrink-0">
                  {b.book.coverImage ? (
                    <img
                     src={`https://bookstorebackend-8ke2.onrender.com/${b.book.coverImage}`}
                      alt={b.book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-grow p-4">
                  <h3 className="font-bold text-lg line-clamp-1">{b.book.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-1">By {b.book.author}</p>
                  <p className="text-sm">Borrowed by: {b.student.name}</p>
                  <p className="text-sm">
                    Due: {b.dueDate ? new Date(b.dueDate).toLocaleDateString() : "N/A"}
                  </p>
                  <p
                    className={`text-sm font-medium mt-auto ${
                      b.returnDate ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {b.returnDate ? "Returned" : "Not Returned"}
                  </p>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}
