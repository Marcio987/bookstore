import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/useAuth";
import { useNavigate, useParams, Link } from "react-router-dom";

function Category() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { category } = useParams();

  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // wyszukiwarka widoczna, ale nie działa tutaj

  const categories = [
    "promotions",
    "fiction",
    "science",
    "crime",
    "fantasy",
    "biography",
    "history",
    "children",
    "tutorial",
  ];

  const categoryLabels = {
    promotions: "Promocje",
    fiction: "Literatura piękna",
    science: "Nauka",
    crime: "Kryminały i thrillery",
    fantasy: "Fantastyka",
    biography: "Biografie",
    history: "Historia",
    children: "Dla dzieci",
    tutorial: "Poradniki",
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/books")
      .then((res) => setBooks(res.data))
      .catch((err) => console.error("Błąd pobierania książek:", err));
  }, []);

  useEffect(() => {
    let baseFilteredBooks = [];

    const categoryToUse = selectedCategory || category || "";

    if (categoryToUse === "promotions") {
      baseFilteredBooks = books.filter((book) => book.promotion_price != null);
    } else if (categoryToUse) {
      baseFilteredBooks = books.filter(
        (book) => book.category === categoryToUse
      );
    } else {
      baseFilteredBooks = books;
    }

    // 👇 NIE filtrujemy po searchQuery
    setFilteredBooks(baseFilteredBooks);
  }, [selectedCategory, category, books]);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/carts/count?user_id=${user.id}`
        );
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

  const addToCart = async (bookId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      let cartResponse = await axios.get(
        `http://localhost:5000/carts?user_id=${user.id}`
      );
      let cartId;

      if (!cartResponse.data || cartResponse.data.length === 0) {
        const newCart = await axios.post("http://localhost:5000/carts", {
          user_id: user.id,
        });
        cartId = newCart.data.id;
      } else {
        cartId = cartResponse.data[0].id;
      }

      await axios.post("http://localhost:5000/cart_items", {
        cart_id: cartId,
        book_id: bookId,
        quantity: 1,
      });

      const countResponse = await axios.get(
        `http://localhost:5000/carts/count?user_id=${user.id}`
      );
      setCartItemsCount(countResponse.data.count || 0);

      alert("Produkt dodany do koszyka!");
    } catch (err) {
      console.error("Błąd:", err);
      alert("Nie udało się dodać do koszyka.");
    }
  };

  return (
    <div className="main-container sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-screen-xl">
      <Header
        user={user}
        allBooks={books}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredBooks={[]} // nie filtrujemy tu
        cartItemsCount={cartItemsCount}
        handleLogout={handleLogout}
      />

      <main className="category-container">
        <div className="category-box max-w-4xl">
          <h1 className="text-3xl font-bold mb-4 text-center">
            {category ? categoryLabels[category] || "Książki" : "Książki"}
          </h1>

          <div className="mb-6 text-center">
            <label className="mr-2 font-semibold">Wybierz kategorię:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">-- wszystkie --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabels[cat]}
                </option>
              ))}
            </select>
          </div>

          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-center">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="border rounded p-4 shadow hover:shadow-md hover:border-black transition bg-white flex flex-col justify-between"
                >
                  <Link to={`/book/${book.id}`} className="block">
                    <img
                      src={book.cover_url || "/no-image.png"}
                      alt={book.title}
                      className="w-full h-96 object-cover rounded mb-2"
                    />
                    <h2 className="font-bold text-lg">{book.title}</h2>
                    <p className="text-gray-600">Autor: {book.author}</p>
                    <p className="text-black font-semibold flex items-center gap-2">
                      Cena:{" "}
                      {book.promotion_price == null ? (
                        <span>{book.price} zł</span>
                      ) : (
                        <>
                          <span className="line-through text-gray-500">
                            {book.price} zł
                          </span>
                          <span className="text-red-800 font-bold">
                            {book.promotion_price} zł
                          </span>
                        </>
                      )}
                    </p>
                  </Link>
                  <button
                    onClick={() => addToCart(book.id)}
                    className="bg-blue-600 text-white rounded px-2 py-1 mt-2 hover:bg-blue-800"
                  >
                    Dodaj do koszyka
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">
              Brak książek w tej kategorii.
            </p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Category;
