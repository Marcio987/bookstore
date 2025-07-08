import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AdminPanel2 = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    role: "",
  });
  const [editId, setEditId] = useState(null);

  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/users?sort=${sortBy}&order=${sortOrder}`
      );
      setUsers(res.data);
    } catch (err) {
      console.error("Błąd podczas pobierania użytkowników:", err);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/users/${editId}`, form);
      } else {
        await axios.post(`http://localhost:5000/users`, form);
      }
      fetchUsers();
      setForm({
        email: "",
        password: "",
        username: "",
        role: "",
      });
      setEditId(null);
    } catch (err) {
      console.error("Błąd podczas zapisu użytkownika:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Błąd podczas usuwania użytkownika:", err);
    }
  };

  const handleEdit = (user) => {
    setForm({
      email: user.email,
      password: user.password,
      username: user.username,
      role: user.role,
    });
    setEditId(user.id);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        Panel administracyjny - CRUD - użytkownicy
      </h2>

      {/* sortowanie użytkowników na liście */}
      <div className="flex gap-4 mb-4 items-center">
        <div>
          <label className="mr-2">Sortuj według:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="id">ID</option>
            <option value="email">Email</option>
            <option value="username">Username</option>
            <option value="role">Rola</option>
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
        <div className="bg-red-500 hover:bg-red-800 px-2 py-2 rounded-lg font-bold">
          <Link to={"/AdminPanel"}>Panel książek</Link>
        </div>
      </div>

      {/* formularz dodawania/edytowania użytkowników */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Hasło"
          value={form.password}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="role"
          placeholder="Rola (np. admin/user)"
          value={form.role}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-green-600 text-white p-2 rounded md:col-span-2 hover:bg-green-800 font-bold"
        >
          {editId ? "Aktualizuj użytkownika" : "Dodaj użytkownika"}
        </button>
      </form>

      {/* lista użytkowników */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Username</th>
              <th className="border p-2">Rola</th>
              <th className="border p-2">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">{user.id}</td>
                <td className="border p-2">{user.email}</td>
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.role}</td>
                <td className="border p-2 flex gap-2">
                  <button
                    className="bg-yellow-500 text-white px-2 rounded"
                    onClick={() => handleEdit(user)}
                  >
                    Edytuj
                  </button>
                  <button
                    className="bg-red-600 text-white px-2 rounded"
                    onClick={() => handleDelete(user.id)}
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

export default AdminPanel2;
