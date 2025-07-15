import React from "react";

const Carousel = ({
  books,
  currentIndex,
  booksPerPage,
  prevSlide,
  nextSlide,
  addToCart,
}) => {
  return (
    <>
      <div className="carousel-container">
        <button
          className="arrow-button"
          onClick={prevSlide}
          disabled={currentIndex === 0}
        >
          ◀
        </button>
        <div className="carousel-box">
          <div className="book-grid">
            {books
              .slice(currentIndex, currentIndex + booksPerPage)
              .map((book) => (
                <div
                  key={book.id}
                  className="border rounded p-4 shadow hover:shadow-md hover:border-black transition bg-white flex flex-col justify-between"
                >
                  <img
                    src={book.cover_url || "/no-image.png"}
                    alt={book.title}
                    className="w-full h-96 object-cover rounded mb-2"
                  />
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">{book.author}</p>
                  <p className="book-price">
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
                    className="add-to-cart-button"
                    onClick={() => addToCart(book.id)}
                  >
                    Dodaj do koszyka
                  </button>
                </div>
              ))}
          </div>
        </div>
        <button
          className="arrow-button"
          onClick={nextSlide}
          disabled={currentIndex + booksPerPage >= books.length}
        >
          ▶
        </button>
      </div>
    </>
  );
};

export default Carousel;
