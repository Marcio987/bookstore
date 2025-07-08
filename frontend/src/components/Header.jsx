import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import ZoomButton from "./ZoomButton";
import SearchPanel from "./SearchPanel";

export default function Header({
  user,
  searchQuery,
  setSearchQuery,
  allBooks,
  cartItemsCount,
  handleLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-2">
        {/* tytuł */}
        <Link to={"/"}>
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ fontFamily: "Apple Chancery, cursive" }}
          >
            Księgarnia Online📖
          </h1>
        </Link>

        {/* DESKTOP - wyszukiwarka i koszyk */}
        <div className="hidden md:flex items-center gap-4">
          {/* wyszukiwarka */}
          <SearchPanel
            allBooks={allBooks}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          {/* koszyk */}
          <Link
            to="/cart"
            className="relative hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <img
              src="/src/images/shopping_cart_icon.png"
              alt="Koszyk"
              className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16"
            />
            <span className="absolute -top-0 -right-0 bg-red-600 rounded-full text-sm px-2">
              {cartItemsCount}
            </span>
          </Link>
          <ZoomButton />
        </div>

        {/* BURGER menu na małych ekranach */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Nawigacja */}
      <nav
        className={`flex flex-col md:flex-row md:items-center md:justify-center bg-blue-900 transition-all duration-300 ${
          mobileMenuOpen ? "block" : "hidden md:flex"
        }`}
      >
        {/* wyszukiwarka na małych ekranach */}
        <div className="flex justify-center md:hidden px-4 py-2">
          <SearchPanel
            allBooks={allBooks}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* koszyk na małych ekranach */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-blue-800">
          <Link to="/cart" className="flex items-center gap-2">
            <img
              src="/src/images/shopping_cart_icon.png"
              alt="Koszyk"
              className="w-8 h-8"
            />
            <span className="bg-red-600 rounded-full text-xs px-2">
              {cartItemsCount}
            </span>
            <span className="font-bold">Koszyk</span>
          </Link>
        </div>

        {/* linki menu */}
        <div className="flex flex-col md:flex-row md:items-center text-xl font-bold">
          <Link to="/" className="px-4 py-2 hover:bg-blue-700 hover:underline">
            Strona główna
          </Link>
          <div className="relative group px-4 py-2 hover:bg-blue-700 hover:underline">
            <Link to="/category">Kategorie</Link>
            <ul className="category-list">
              <li>
                <Link to="/category">Wszystkie</Link>
              </li>
              <li className="text-red-700">
                <Link to="/category/promotions">Promocje</Link>
              </li>
              <li>
                <Link to="/category/fiction">Literatura piękna</Link>
              </li>
              <li>
                <Link to="/category/science">Nauka</Link>
              </li>
              <li>
                <Link to="/category/crime">Kryminały i thrillery</Link>
              </li>
              <li>
                <Link to="/category/fantasy">Fantastyka</Link>
              </li>
              <li>
                <Link to="/category/biography">Biografie</Link>
              </li>
              <li>
                <Link to="/category/history">Historia</Link>
              </li>
              <li>
                <Link to="/category/children">Dla dzieci</Link>
              </li>
              <li>
                <Link to="/category/tutorial">Poradniki</Link>
              </li>
            </ul>
          </div>
          <Link
            to="/contact"
            className="px-4 py-2 hover:bg-blue-700 hover:underline"
          >
            Kontakt
          </Link>
          {user ? (
            <>
              <Link
                to="/profile"
                className="px-4 py-2 hover:bg-blue-700 hover:underline"
              >
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 hover:bg-red-700 hover:underline"
              >
                Wyloguj
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 hover:bg-blue-700 hover:underline"
            >
              Zaloguj
            </Link>
          )}
        </div>
      </nav>
      <div className="bg-red-600 flex items-center justify-center px-0.5 py-0.5 font-bold">
        <p>Skorzystaj z letniej promocji z kodem ,,LATO20'' 20% zniżki!</p>
      </div>
    </header>
  );
}
