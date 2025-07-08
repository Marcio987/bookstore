import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function Register() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    // Pobieranie książek
    axios
      .get("http://localhost:5000/books")
      .then((response) => setBooks(response.data))
      .catch((error) => console.error("Błąd pobierania danych:", error));

    // Pobieranie ilości w koszyku jeśli użytkownik jest zalogowany
    const fetchCartCount = async () => {
      if (!user) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/carts/count?user_id=${user.id}`
        );
        setCartItemsCount(response.data.count);
      } catch (error) {
        console.error("Błąd pobierania koszyka:", error);
      }
    };

    fetchCartCount();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks([]);
      return;
    }
    const results = books.filter((book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBooks(results);
  }, [searchQuery, books]);

  // Rejestracja
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Rejestracja udana! Możesz się teraz zalogować.");
        navigate("/login");
      } else {
        if (data.errors) {
          setMessage(data.errors.join(" | "));
        } else if (data.message) {
          setMessage(data.message);
        } else {
          setMessage("Błąd serwera");
        }
      }
    } catch (error) {
      console.error("Błąd rejestracji:", error);
      setMessage("Błąd serwera");
    }
  };

  return (
    <div className="main-container sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-screen-xl">
      {/* Nagłówek */}
      <Header
        user={user}
        allBooks={books}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredBooks={filteredBooks}
        cartItemsCount={cartItemsCount}
      />

      {/* Sekcja główna - rejestracja */}
      <main className="register-container">
        <div className="register-box">
          <h1 className="text-3xl font-bold text-center mb-4">
            📝 Rejestracja
          </h1>
          {message && <p className="text-red-500">{message}</p>}
          <form onSubmit={handleRegister} className="flex flex-col">
            <p>Nazwa użytkownika:</p>
            <input
              type="text"
              placeholder="Wprowadź nazwę użytkownika"
              className="mb-4 p-2 border rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <p>Adres e-mail:</p>
            <input
              type="email"
              placeholder="Wprowadź adres email"
              className="mb-4 p-2 border rounded"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p>Hasło:</p>
            <input
              type="password"
              placeholder="Wprowadź hasło"
              className="mb-4 p-2 border rounded"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white p-2 rounded"
            >
              Zarejestruj się
            </button>
            <div className="pt-5">
              Masz już konto?{" "}
              <Link
                to="/login"
                className="text-green-600 hover:text-green-800 ml-1 font-medium"
              >
                Zaloguj się!
              </Link>
            </div>
          </form>
        </div>
      </main>

      {/* Stopka */}
      <Footer />
    </div>
  );
}

export default Register;
