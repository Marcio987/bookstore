import { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Carousel from "../components/Carousel";

function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const booksPerPage = 3;
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

  //Następny zestaw ksiązek w karuzeli
  const nextSlide = () => {
    if (currentIndex + booksPerPage < books.length) {
      setCurrentIndex(currentIndex + booksPerPage);
    }
  };

  //Poprzedni zestaw ksiązek w karuzeli
  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - booksPerPage);
    }
  };

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

  //Wylogowanie się
  const handleLogout = (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Czy na pewno chcesz się wylogować?");
    if (confirmed) {
      localStorage.removeItem("token");
      logout();
      navigate("/");
    }
  };

  //Dodawanie do koszyka
  const addToCart = async (bookId) => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      // 1. Sprawdź czy użytkownik ma już koszyk
      let cartResponse;
      try {
        cartResponse = await axios.get(`/carts?user_id=${user.id}`);
      } catch (error) {
        console.error("Błąd pobierania koszyka:", error);
        throw new Error("Nie można sprawdzić koszyka");
      }

      let cartId;

      if (!cartResponse.data || cartResponse.data.length === 0) {
        // 2. Jeśli nie ma koszyka - stwórz nowy
        try {
          const newCart = await axios.post("/carts", {
            user_id: user.id,
          });
          cartId = newCart.data.id;
        } catch (error) {
          console.error("Błąd tworzenia koszyka:", error);
          throw new Error("Nie można utworzyć koszyka");
        }
      } else {
        cartId = cartResponse.data[0].id;
      }

      // 3. Dodaj produkt do koszyka
      try {
        await axios.post(
          "/cart_items",
          {
            cart_id: cartId,
            book_id: bookId,
            quantity: 1,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error(
          "Błąd dodawania do koszyka:",
          error.response?.data || error.message
        );
        throw new Error("Nie można dodać produktu do koszyka");
      }

      // 4. Odśwież licznik w koszyku
      try {
        const countResponse = await axios.get(
          `/carts/count?user_id=${user.id}`
        );
        setCartItemsCount(countResponse.data.count || 0);
      } catch (error) {
        console.error("Błąd aktualizacji licznika:", error);
        // Nie przerywamy działania, tylko logujemy błąd
      }

      alert("Produkt dodany do koszyka!");
    } catch (error) {
      console.error("Całościowy błąd:", error);
      alert(`Wystąpił błąd: ${error.message}`);
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

      {/* Sekcja główna - różna dla gościa i zalogowanego */}
      <main className="homePage-container sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-5xl">
        <div className="homePageDescription">
          {user ? (
            <>
              <h2 className="text-3xl font-bold mb-4">
                👋 Witaj z powrotem, {user.username}!
              </h2>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold mb-4">
                👋 Witaj w Księgarni Online!
              </h2>
            </>
          )}

          {/* Część wspólna dla gościa i zalgowoanego */}
          <p className="text-lg text-gray-700">
            Poznaj nas bliżej! Oto <strong>Księgarnia Online</strong>, wyjątkowe
            miejsce stworzone dla wszystkich miłośników książek, którzy chcą
            odkrywać, eksplorować i budować swoją wirtualną kolekcję ulubionych
            tytułów. Nasza aplikacja daje możliwość przeglądania szerokiej
            oferty książek i tworzenia własnej listy ulubionych pozycji, które
            możesz zapisać w wirtualnym koszyku.
          </p>
          <p className="text-lg  mt-4">
            Od początku istnienia przyświeca nam idea budowania społeczności
            czytelników, którzy chcą dzielić się pasją do literatury. Wierzymy,
            że książki to nie tylko produkt, ale przede wszystkim źródło
            inspiracji, wiedzy i emocji. Dlatego stworzyliśmy platformę, która
            pozwala odkrywać i porządkować interesujące pozycje.
          </p>
          <p className="text-lg  mt-4">
            W <strong>Księgarni Online</strong> znajdziesz bogaty wybór
            kategorii:
          </p>
          <div className="flex items-center justify-center">
            <ul className="text-left">
              <li>
                <strong>Literatura piękna</strong> – dla miłośników klasycznych
                powieści i ponadczasowych historii
              </li>
              <li>
                <strong>Nauka</strong> – dla tych, którzy chcą poszerzać swoje
                horyzonty i rozwijać wiedzę
              </li>
              <li>
                <strong>Kryminały i thrillery</strong> – dla fanów mocnych
                wrażeń i pełnych napięcia fabuł
              </li>
              <li>
                <strong>Fantastyka</strong> – dla odkrywców nowych, niezwykłych
                światów
              </li>
              <li>
                <strong>Biografie</strong> – dla czytelników ceniących prawdziwe
                historie inspirujących ludzi
              </li>
              <li>
                <strong>Historia</strong> – dla pasjonatów dziejów i wydarzeń,
                które zmieniły świat
              </li>
              <li>
                <strong>Dla dzieci</strong> – aby od najmłodszych lat
                zaszczepiać miłość do książek
              </li>
              <li>
                <strong>Poradniki</strong> – dla osób szukających praktycznych
                wskazówek w różnych dziedzinach życia
              </li>
            </ul>
          </div>

          <p className="text-lg  mt-4">
            Dzięki intuicyjnemu interfejsowi użytkownicy mogą łatwo przeglądać
            książki, dodawać je do ulubionych oraz tworzyć swoje własne
            zestawienia tytułów, do których będą mogli powracać w dowolnym
            momencie. Naszym celem jest wspieranie czytelnictwa i umożliwienie
            każdemu znalezienia książek, które najlepiej odpowiadają jego
            zainteresowaniom.
          </p>
          <p className="text-lg  mt-4 font-semibold">
            Dołącz do naszej społeczności i razem z nami celebruj pasję do
            literatury w nowoczesnym wydaniu!
          </p>
        </div>

        {/* Karuzela z książkami */}
        <h2 className="section-title">
          {user ? "Polecane dla Ciebie" : "Popularne książki"}
        </h2>

        <Carousel
          books={books}
          currentIndex={currentIndex}
          booksPerPage={booksPerPage}
          prevSlide={prevSlide}
          nextSlide={nextSlide}
          addToCart={addToCart}
        />
      </main>

      {/* Stopka */}
      <Footer />
    </div>
  );
}

export default HomePage;
