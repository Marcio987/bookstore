import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
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
      .get("/books")
      .then((response) => setBooks(response.data))
      .catch((error) => console.error("Błąd pobierania danych:", error));

    // Pobieranie ilości w koszyku jeśli użytkownik jest zalogowany
    const fetchCartCount = async () => {
      if (!user) return;

      try {
        const response = await axios.get(`/carts/count?user_id=${user.id}`);
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
      const response = await axios.post("/api/login", {
        email,
        password,
      });

      const data = response.data;

      // Zapisz token w localStorage (jeśli używasz)
      localStorage.setItem("token", data.token);

      // Zaktualizuj kontekst autentykacji
      login(data.user);

      setMessage("Zalogowano pomyślnie!");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Błąd połączenia z serwerem");
      }
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
