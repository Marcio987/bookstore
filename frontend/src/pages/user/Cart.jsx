import { useEffect, useState } from "react";
import axios from "../../axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function Cart() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  useEffect(() => {
    axios
      .get("/books")
      .then((res) => setBooks(res.data))
      .catch((err) => console.error("Błąd pobierania książek:", err));

    const fetchCartData = async () => {
      if (!user) return;

      try {
        const cartRes = await axios.get(`/carts?user_id=${user.id}`);
        if (cartRes.data.length === 0) {
          setCartItems([]);
          setCartItemsCount(0);
          return;
        }
        const cartId = cartRes.data[0].id;

        const itemsRes = await axios.get(`/cart_items?cart_id=${cartId}`);
        setCartItems(itemsRes.data);

        const countRes = await axios.get(`/carts/count?user_id=${user.id}`);
        setCartItemsCount(countRes.data.count || 0);
      } catch (err) {
        console.error("Błąd pobierania danych koszyka:", err);
      }
    };

    fetchCartData();
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

  const handleRemove = async (itemId) => {
    try {
      await axios.delete(`/cart_items/${itemId}`);
      const cartRes = await axios.get(`/carts?user_id=${user.id}`);
      if (cartRes.data.length > 0) {
        const cartId = cartRes.data[0].id;
        const itemsRes = await axios.get(`/cart_items?cart_id=${cartId}`);
        setCartItems(itemsRes.data);

        const countRes = await axios.get(`/carts/count?user_id=${user.id}`);
        setCartItemsCount(countRes.data.count || 0);
      }
    } catch (err) {
      console.error("Błąd usuwania przedmiotu:", err);
      alert("Nie udało się usunąć produktu.");
    }
  };

  const handlePromoApply = () => {
    if (promoCode.trim().toUpperCase() === "LATO20") {
      setDiscount(0.2); // 20% zniżki
      setPromoMessage("Kod promocyjny LATO20 został zastosowany - 20% rabatu!");
    } else {
      setDiscount(0);
      setPromoMessage("Niepoprawny kod promocyjny.");
    }
  };

  const handleLogout = (e) => {
    e.preventDefault();
    const confirmed = window.confirm("Czy na pewno chcesz się wylogować?");
    if (confirmed) {
      localStorage.removeItem("token");
      logout();
      navigate("/");
    }
  };

  // suma przed i po rabacie
  const totalPrice = cartItems.reduce(
    (acc, item) =>
      acc +
      (item.promotion_price != null ? item.promotion_price : item.price) *
        item.quantity,
    0
  );

  const discountedTotal = (totalPrice * (1 - discount)).toFixed(2);

  return (
    <div className="main-container sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-screen-xl">
      <Header
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredBooks={filteredBooks}
        cartItemsCount={cartItemsCount}
        handleLogout={handleLogout}
      />

      <main className="cart-container">
        <div className="cart-box">
          <h1 className="text-3xl font-bold mb-4 text-center w-full">
            Twój Koszyk
          </h1>
          {user ? (
            cartItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="border p-4 rounded shadow bg-white flex flex-col justify-between"
                    >
                      <div>
                        <p className="font-bold text-lg">{item.title}</p>
                        <p>Autor: {item.author}</p>
                        <p>
                          Cena:{" "}
                          {item.promotion_price == null ? (
                            <span>{item.price} zł</span>
                          ) : (
                            <>
                              <span className="line-through text-gray-500">
                                {item.price} zł
                              </span>
                              <span className="text-red-800 font-bold ml-2">
                                {item.promotion_price} zł
                              </span>
                            </>
                          )}
                        </p>
                        <p>Ilość: {item.quantity}</p>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded mt-2"
                      >
                        Usuń z koszyka
                      </button>
                    </div>
                  ))}
                </div>
                {/* kod promocyjny */}
                <div className="mt-6 flex flex-col items-end gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Wpisz kod promocyjny"
                    className="border rounded px-2 py-1"
                  />
                  <button
                    onClick={handlePromoApply}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Zastosuj kod rabatowy
                  </button>
                  {promoMessage && (
                    <p className="text-sm text-gray-700">{promoMessage}</p>
                  )}
                </div>
                {/* suma całkowita */}
                <div className="mt-6 text-right font-bold text-xl">
                  Suma całkowita:{" "}
                  {discount > 0 ? (
                    <>
                      <span className="line-through text-gray-500 mr-2">
                        {totalPrice.toFixed(2)} zł
                      </span>
                      <span className="text-green-700">
                        {discountedTotal} zł
                      </span>
                    </>
                  ) : (
                    <span>{totalPrice.toFixed(2)} zł</span>
                  )}
                </div>
              </>
            ) : (
              <p>Twój koszyk jest pusty.</p>
            )
          ) : (
            <p>Proszę się zalogować, aby zobaczyć zawartość koszyka.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Cart;
