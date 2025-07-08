import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function Profile() {
  const { user, logout } = useAuth();
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

  // wyszukiwarka
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

  // wylogowanie
  const handleLogout = (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Czy na pewno chcesz się wylogować?");
    if (confirmed) {
      localStorage.removeItem("token");
      logout();
      navigate("/");
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
        handleLogout={handleLogout}
      />

      {/* Sekcja główna - wyświetlanie danych użytkownika */}
      <main className="profile-container">
        <div className="profile-box">
          <h1 className="text-3xl font-bold mb-4 text-center mx-auto">
            Profil użytkownika
          </h1>
          {user ? (
            <div>
              <p>Twoja nazwa użytkownika: </p>
              <p className="font-bold">{user.username}</p>
              <p className="pt-5">Twoj email: </p>
              <p className="font-bold">{user.email}</p>
            </div>
          ) : (
            <p>Ładowanie danych...</p>
          )}
        </div>
      </main>

      {/* Stopka */}
      <Footer />
    </div>
  );
}

export default Profile;
