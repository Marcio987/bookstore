import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../axiosConfig";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/useAuth";

function Book() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Pobierz pojedynczą książkę na podstawie ID z URL
  useEffect(() => {
    axios
      .get(`/books/${id}`)
      .then((res) => setBook(res.data))
      .catch((err) => console.error("Błąd pobierania książki:", err));
  }, [id]);

  // Pobierz wszystkie książki do działania wyszukiwarki
  useEffect(() => {
    axios
      .get("/books")
      .then((res) => {
        setBooks(res.data);
      })
      .catch((err) => console.error("Błąd pobierania książek:", err));
  }, []);

  // Filtrowanie książek na podstawie wpisanego zapytania
  useEffect(() => {
    const filtered = books.filter((book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredBooks(filtered);
  }, [searchQuery, books]);

  // Licznik koszyka
  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`/carts/count?user_id=${user.id}`);
        setCartItemsCount(res.data.count || 0);
      } catch (err) {
        console.error("Błąd pobierania danych koszyka:", err);
      }
    };
    fetchCartCount();
  }, [user]);

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm("Czy na pewno chcesz się wylogować?")) {
      localStorage.removeItem("token");
      logout();
    }
  };

  const addToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      let cartResponse = await axios.get(`/carts?user_id=${user.id}`);
      let cartId;

      if (!cartResponse.data || cartResponse.data.length === 0) {
        const newCart = await axios.post("/carts", {
          user_id: user.id,
        });
        cartId = newCart.data.id;
      } else {
        cartId = cartResponse.data[0].id;
      }

      await axios.post("/cart_items", {
        cart_id: cartId,
        book_id: id,
        quantity: 1,
      });

      const countResponse = await axios.get(`/carts/count?user_id=${user.id}`);
      setCartItemsCount(countResponse.data.count || 0);

      alert("Produkt dodany do koszyka!");
    } catch (err) {
      console.error("Błąd:", err);
      alert("Nie udało się dodać do koszyka.");
    }
  };

  if (!book) {
    return <div>Ładowanie danych książki...</div>;
  }

  return (
    <div className="main-container min-h-screen sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-screen-xl">
      <Header
        user={user}
        allBooks={books}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredBooks={filteredBooks}
        cartItemsCount={cartItemsCount}
        handleLogout={handleLogout}
      />

      <main className="book-container">
        <div className="book-box max-w-4xl">
          <div className="flex flex-col md:flex-row gap-4">
            <img
              src={book.cover_url || "/no-image.png"}
              alt={book.title}
              className="w-full md:w-1/3 rounded"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
              <p className="text-gray-700 mb-1">Autor: {book.author}</p>
              <p className="text-black font-semibold mb-2">
                Cena:{" "}
                {book.promotion_price == null ? (
                  <span>{book.price} zł</span>
                ) : (
                  <>
                    <span className="line-through text-gray-500">
                      {book.price} zł
                    </span>
                    <span className="text-red-800 font-bold px-2">
                      {book.promotion_price} zł
                    </span>
                  </>
                )}
              </p>
              <button
                onClick={addToCart}
                className="bg-blue-600 text-white rounded mb-2 px-4 py-2 hover:bg-blue-800"
              >
                Dodaj do koszyka
              </button>
              <p className="text-black font-semibold mb-1">Opis książki:</p>
              <p className="text-gray-600 mb-4">{book.description}</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Book;
