import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

// Funkcja pomocnicza do normalizacji (usuwa polskie znaki)
function normalizeString(str) {
  if (!str) return ""; // chroni przed null
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,:;!?()[\]{}"'-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export default function SearchPanel({ allBooks, searchQuery, setSearchQuery }) {
  const [filteredBooks, setFilteredBooks] = useState([]);

  useEffect(() => {
    // jeśli brak książek, nic nie rób
    if (!allBooks || allBooks.length === 0) {
      setFilteredBooks([]);
      return;
    }

    // jeśli zapytanie puste, też nie filtruj
    if (searchQuery.trim() === "") {
      setFilteredBooks([]);
      return;
    }

    const normalizedQuery = normalizeString(searchQuery);

    const results = allBooks.filter((book) => {
      const normalizedTitle = normalizeString(book.title);
      const normalizedAuthor = normalizeString(book.author);

      return (
        normalizedTitle.includes(normalizedQuery) ||
        normalizedAuthor.includes(normalizedQuery)
      );
    });

    setFilteredBooks(results);
  }, [searchQuery, allBooks]);

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Szukaj książek lub autorów..."
        className="px-3 py-2 rounded-md text-black w-80 focus:outline-none"
      />
      {filteredBooks && filteredBooks.length > 0 && (
        <ul className="absolute bg-white text-black mt-1 rounded shadow z-10 w-full max-h-48 overflow-auto">
          {filteredBooks.slice(0, 8).map((book) => (
            <li key={book.id} className="px-2 py-1 hover:bg-gray-200">
              <Link to={`/book/${book.id}`}>
                {book.title} - {book.author}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
