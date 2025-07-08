import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Contact() {
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

      {/* Sekcja główna - zawartość kontaktowa */}
      <main className="contact-container">
        <div className="contact-box">
          {user ? (
            <>
              <h1 className="text-3xl font-bold mb-4 text-center w-full">
                Kontakt
              </h1>
              <div className="text-lg text-gray-700 text-left self-start">
                Email:
                <p className="font-bold"> kontakt@ksiegarnia.pl</p>
                Telefon:
                <p className="font-bold"> +48 123 456 789</p>
                Adres:
                <p className="font-bold"> ul. Literacka 10</p>
                <p className="font-bold"> Białystok 15-200</p>
                <br />
                <p className="text-base">
                  Masz pytanie? Napisz do nas bezpośrednio w formularzu
                  kontaktowym!
                </p>
                <form className="grid grid-cols-1 gap-4">
                  <textarea
                    name="description"
                    placeholder="Tutaj napisz wiadomość..."
                    className="border p-2 rounded"
                  />

                  <button
                    type="submit"
                    className="mx-auto bg-green-600 text-white p-2 w-40 rounded-md hover:bg-green-800 "
                  >
                    Wyślij wiadomość
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-4 text-center w-full">
                Kontakt
              </h1>
              <div className="text-lg text-gray-700 text-left self-start">
                Email:
                <p className="font-bold"> kontakt@ksiegarnia.pl</p>
                Telefon:
                <p className="font-bold"> +48 123 456 789</p>
                Adres:
                <p className="font-bold"> ul. Literacka 10</p>
                <p className="font-bold"> Białystok 15-200</p>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Stopka */}
      <Footer />
    </div>
  );
}

export default Contact;
