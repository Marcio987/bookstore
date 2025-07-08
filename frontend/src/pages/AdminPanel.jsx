import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminPanel = () => {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    cover_url: "",
    promotion_price: "",
  });
  const [editId, setEditId] = useState(null);

  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchBooks = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/books?sort=${sortBy}&order=${sortOrder}`
      );
      setBooks(res.data);
    } catch (err) {
      console.error("Błąd podczas pobierania książek:", err);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // utwórz nowy obiekt
    const formData = {
      ...form,
      promotion_price:
        form.promotion_price === "" || isNaN(form.promotion_price)
          ? null
          : parseFloat(form.promotion_price),
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    };

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/books/${editId}`, formData);
      } else {
        await axios.post(`http://localhost:5000/books`, formData);
      }

      fetchBooks();
      setForm({
        title: "",
        author: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        cover_url: "",
        promotion_price: "",
      });
      setEditId(null);
    } catch (err) {
      console.error("Błąd podczas zapisu książki:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/books/${id}`);
      fetchBooks();
    } catch (err) {
      console.error("Błąd podczas usuwania książki:", err);
    }
  };

  const handleEdit = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      price: book.price,
      stock: book.stock,
      cover_url: book.cover_url,
      promotion_price: book.promotion_price ?? "",
    });
    setEditId(book.id);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        Panel administracyjny - CRUD - książki
      </h2>

      {/* sortowanie ksiązek na liście */}
      <div className="flex gap-4 mb-4 items-center">
        <div>
          <label className="mr-2">Sortuj według:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="id">ID</option>
            <option value="title">Tytuł</option>
            <option value="price">Cena</option>
            <option value="stock">Stan magazynowy</option>
          </select>
        </div>
        <div>
          <label className="mr-2">Kolejność:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="asc">Rosnąco</option>
            <option value="desc">Malejąco</option>
          </select>
        </div>
        {/* <div className="bg-red-500 hover:bg-red-800 px-2 py-2 rounded-lg font-bold">
          <Link to={"/AdminPanel2"}>Panel użytkowników</Link>
        </div> */}
      </div>

      {/* formularz dodawania/edytowania książek */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        <input
          type="text"
          name="title"
          placeholder="Tytuł"
          value={form.title}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="author"
          placeholder="Autor"
          value={form.author}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <textarea
          name="description"
          placeholder="Opis"
          value={form.description}
          onChange={handleChange}
          className="border p-2 rounded md:col-span-2"
        />
        <input
          type="text"
          name="category"
          placeholder="Kategoria"
          value={form.category}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="price"
          placeholder="Cena"
          value={form.price}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="stock"
          placeholder="Stan magazynowy"
          value={form.stock}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="promotion_price"
          placeholder="Cena promocyjna (opcjonalnie)"
          value={form.promotion_price}
          onChange={handleChange}
          className="border p-2 rounded"
        />

        <input
          type="text"
          name="cover_url"
          placeholder="Link do okładki"
          value={form.cover_url}
          onChange={handleChange}
          className="border p-2 rounded md:col-span-2"
        />

        <button
          type="submit"
          className="bg-green-600 text-white p-2 rounded md:col-span-2 hover:bg-green-800 font-bold"
        >
          {editId ? "Aktualizuj książkę" : "Dodaj książkę"}
        </button>
      </form>

      {/* lista książek */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Tytuł</th>
              <th className="border p-2">Autor</th>
              <th className="border p-2">Cena</th>
              <th className="border p-2">Cena promocyjna</th>
              <th className="border p-2">Stan</th>
              <th className="border p-2">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td className="border p-2">{book.id}</td>
                <td className="border p-2">{book.title}</td>
                <td className="border p-2">{book.author}</td>
                <td className="border p-2">{book.price} zł</td>
                <td className="border p-2">
                  {book.promotion_price ? `${book.promotion_price} zł` : "-"}
                </td>
                <td className="border p-2">{book.stock}</td>
                <td className="border p-2 flex gap-2">
                  <button
                    className="bg-yellow-500 text-white px-2 rounded"
                    onClick={() => handleEdit(book)}
                  >
                    Edytuj
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 rounded"
                    onClick={() => handleDelete(book.id)}
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
