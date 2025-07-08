import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function Login() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
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

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Jeśli używasz cookies
      });

      const data = await response.json();

      if (response.ok) {
        // Zapisz token w localStorage
        localStorage.setItem("token", data.token);

        // Zaktualizuj kontekst autentykacji
        login(data.user);

        setMessage("Zalogowano pomyślnie!");
        navigate("/");
      } else {
        setMessage(data.message || "Nieprawidłowe dane logowania");
      }
    } catch (error) {
      setMessage("Błąd połączenia z serwerem");
      console.error("Login error:", error);
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

      {/* Sekcja główna logowanie */}
      <main className="login-container">
        <div className="login-box">
          <h1 className="text-3xl font-bold text-center mb-4">📚 Logowanie</h1>
          {message && (
            <p
              className={`message ${
                message.includes("pomyślnie")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
          <form onSubmit={handleLogin} className="flex flex-col">
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
              className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
            >
              Zaloguj się
            </button>
            <div className="pt-5 text-center">
              Nie masz jeszcze konta?{" "}
              <Link
                to="/register"
                className="text-green-600 hover:text-green-800 ml-1 font-medium"
              >
                Zarejestruj się!
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

export default Login;
