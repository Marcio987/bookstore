import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 5000;
const router = express.Router();

app.set("trust proxy", 1);

const allowedOrigins = [
  "https://bookstore-three-beta.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log(
        "CORS request, origin header:",
        origin ?? "undefined (no origin header)"
      );

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Konfiguracja połączenia z PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Middleware
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Dodaj obsługę pre-flight requestów
app.options("*", cors());
app.use(express.json());

// Rate limiting dla API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minut
  max: 100, // limit każdego IP do 100 requestów na okno
});
app.use(limiter);

// Funkcja pomocnicza do obsługi błędów
const handleServerError = (res, error) => {
  console.error(error);
  res.status(500).json({ message: "Błąd serwera" });
};

// API testowe
app.get("/", (req, res) => {
  res.json({
    status: "Backend działa",
    version: "1.0.0",
    docs: "/api-docs",
  });
});

// Weryfikacja tokena
app.get("/api/verify-token", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ valid: false });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Sprawdź w bazie czy użytkownik nadal istnieje
    const { rows } = await pool.query(
      "SELECT id, email, username, role FROM users WHERE id = $1",
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({ valid: false });
    }

    res.json({
      valid: true,
      user: rows[0],
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ valid: false });
  }
});

// Logowanie użytkownika
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Wymagane są email i hasło" });
    }

    const { rows } = await pool.query(
      "SELECT id, email, username, password FROM users WHERE email = $1",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Nieprawidłowe dane logowania" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role || "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role || "user",
    };

    res.json({
      token,
      user: userData,
      expiresIn: 3600,
    });
  } catch (error) {
    handleServerError(res, error);
  }
});

// walidator danych użytkownika przy rejestracji
function validateUserData({ username, email, password }) {
  const errors = [];

  // sprawdzanie pustych pól
  if (!username || !email || !password) {
    errors.push("Wszystkie pola są wymagane");
  }

  // walidacja email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push("Nieprawidłowy format adresu e-mail");
  }

  // walidacja hasła
  // min. 8 znaków, 1 znak specjalny
  const passwordRegex = /^(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
  if (password && !passwordRegex.test(password)) {
    errors.push(
      "Hasło musi mieć co najmniej 8 znaków i zawierać przynajmniej jeden znak specjalny"
    );
  }

  return errors;
}

// Endpoint rejestracji użytkownika
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  const validationErrors = validateUserData(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    // sprawdzenie czy email / username nie są zajęte
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (rows.length > 0) {
      const errors = [];
      if (rows.some((u) => u.email === email))
        errors.push("Email jest już zajęty");
      if (rows.some((u) => u.username === username))
        errors.push("Nazwa użytkownika jest już zajęta");
      return res.status(400).json({ errors });
    }

    // haszowanie hasła
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // dodanie użytkownika do bazy (bez created_at)
    const {
      rows: [newUser],
    } = await pool.query(
      `INSERT INTO users (username, email, password, role) 
       VALUES ($1, $2, $3, 'user') 
       RETURNING id, username, email, role`,
      [username, email, hashedPassword]
    );

    // token JWT
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Rejestracja zakończona sukcesem",
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Wystąpił błąd serwera" });
  }
});

// Middleware do weryfikacji tokena JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Chroniony endpoint - przykładowy profil użytkownika
app.get("/api/user/profile", authenticateJWT, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, username, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    res.json(rows[0]);
  } catch (error) {
    handleServerError(res, error);
  }
});

// Chroniony endpoint - aktualizacja profilu
app.put("/api/user/profile", authenticateJWT, async (req, res) => {
  const { username, email } = req.body;

  try {
    // Sprawdź unikalność nowego emaila/username
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE (email = $1 OR username = $2) AND id != $3",
      [email, username, req.user.id]
    );

    if (rows.length > 0) {
      const errors = [];
      if (rows.some((u) => u.email === email))
        errors.push("Email jest już zajęty");
      if (rows.some((u) => u.username === username))
        errors.push("Nazwa użytkownika jest już zajęta");
      return res.status(400).json({ errors });
    }

    const {
      rows: [updatedUser],
    } = await pool.query(
      `UPDATE users 
       SET username = $1, email = $2 
       WHERE id = $3 
       RETURNING id, username, email, created_at, role`,
      [username, email, req.user.id]
    );

    // Generuj nowy token z zaktualizowanymi danymi
    const token = jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Profil zaktualizowany",
      token,
      user: updatedUser,
    });
  } catch (error) {
    handleServerError(res, error);
  }
});

//Endpoint - pobierania szczegółów książki

// GET /books/:id - pobranie szczegółów książki po id
app.get("/books/:id", async (req, res) => {
  try {
    const bookId = req.params.id;

    const result = await pool.query("SELECT * FROM books WHERE id = $1", [
      bookId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Książka nie znaleziona" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Błąd GET /books/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpointy - Dodawanie do koszyka

// GET /carts?user_id=...
app.get("/carts", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: "Parametr user_id jest wymagany" });
    }

    const result = await pool.query("SELECT * FROM carts WHERE user_id = $1", [
      user_id,
    ]);

    res.json(result.rows);
  } catch (error) {
    console.error("Błąd GET /carts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /carts
app.post("/carts", async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: "user_id jest wymagany" });
    }

    const result = await pool.query(
      "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
      [user_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Błąd POST /carts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /cart_items
app.post("/cart_items", async (req, res) => {
  try {
    const { cart_id, book_id, quantity } = req.body;
    if (!cart_id || !book_id || !quantity) {
      return res
        .status(400)
        .json({ error: "cart_id, book_id i quantity są wymagane" });
    }

    // Sprawdź czy już istnieje ten produkt w koszyku
    const existing = await pool.query(
      "SELECT * FROM cart_items WHERE cart_id = $1 AND book_id = $2",
      [cart_id, book_id]
    );

    if (existing.rows.length > 0) {
      // jeśli istnieje, zaktualizuj ilość
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND book_id = $3",
        [quantity, cart_id, book_id]
      );
    } else {
      // jeśli nie istnieje, dodaj nowy wpis
      await pool.query(
        "INSERT INTO cart_items (cart_id, book_id, quantity) VALUES ($1, $2, $3)",
        [cart_id, book_id, quantity]
      );
    }

    res.status(201).json({ message: "Produkt dodany do koszyka" });
  } catch (error) {
    console.error("Błąd POST /cart_items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /carts/count?user_id=...
app.get("/carts/count", async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ error: "Parametr user_id jest wymagany" });
    }

    const cartResult = await pool.query(
      "SELECT id FROM carts WHERE user_id = $1",
      [user_id]
    );

    if (cartResult.rows.length === 0) {
      return res.json({ count: 0 });
    }

    const cartId = cartResult.rows[0].id;

    const countResult = await pool.query(
      "SELECT SUM(quantity) AS count FROM cart_items WHERE cart_id = $1",
      [cartId]
    );

    res.json({ count: parseInt(countResult.rows[0].count) || 0 });
  } catch (error) {
    console.error("Błąd GET /carts/count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /cart_items?cart_id=...
app.get("/cart_items", async (req, res) => {
  try {
    const { cart_id } = req.query;
    if (!cart_id) {
      return res.status(400).json({ error: "cart_id jest wymagany" });
    }

    const result = await pool.query(
      `SELECT ci.id, ci.quantity, b.title, b.author, b.price, b.promotion_price
       FROM cart_items ci
       JOIN books b ON ci.book_id = b.id
       WHERE ci.cart_id = $1`,
      [cart_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Błąd GET /cart_items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /cart_items/:id
app.delete("/cart_items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM cart_items WHERE id = $1", [id]);
    res.json({ message: "Usunięto produkt z koszyka" });
  } catch (error) {
    console.error("Błąd DELETE /cart_items/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

//Endpointy - Do panelu administracyjnego

// GET /books
app.get("/books", async (req, res) => {
  try {
    const { sort = "id", order = "asc" } = req.query;

    const validColumns = ["id", "title", "author", "price", "stock"];
    const validOrder = ["asc", "desc"];

    const sortColumn = validColumns.includes(sort) ? sort : "id";
    const sortOrder = validOrder.includes(order.toLowerCase())
      ? order.toLowerCase()
      : "asc";

    const result = await pool.query(
      `SELECT * FROM books ORDER BY ${sortColumn} ${sortOrder}`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Błąd GET /books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /books
app.post("/books", async (req, res) => {
  try {
    const { title, author, description, category, price, stock, cover_url } =
      req.body;

    const result = await pool.query(
      `INSERT INTO books (title, author, description, category, price, stock, cover_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, author, description, category, price, stock, cover_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Błąd POST /books:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /books/:id
app.put("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      author,
      description,
      category,
      price,
      stock,
      cover_url,
      promotion_price,
    } = req.body;

    const result = await pool.query(
      `UPDATE books SET
          title = $1,
          author = $2,
          description = $3,
          category = $4,
          price = $5,
          stock = $6,
          cover_url = $7,
          promotion_price = $8
         WHERE id = $9
         RETURNING *`,
      [
        title,
        author,
        description,
        category,
        price,
        stock,
        cover_url,
        promotion_price,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Nie znaleziono książki" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Błąd PUT /books/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /books/:id
app.delete("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM books WHERE id = $1", [id]);

    res.json({ message: "Książka usunięta" });
  } catch (error) {
    console.error("Błąd DELETE /books/:id:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /users - lista wszystkich użytkowników
app.get("/users", authenticateJWT, async (req, res) => {
  try {
    // tylko admin może
    if (req.user.role !== "admin") {
      return res.sendStatus(403);
    }

    const result = await pool.query(
      "SELECT id, username, email, role, created_at FROM users ORDER BY id"
    );

    res.json(result.rows);
  } catch (error) {
    handleServerError(res, error);
  }
});

// GET /users/:id - szczegóły jednego użytkownika
app.get("/users/:id", authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.sendStatus(403);
    }

    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT id, username, email, role, created_at FROM users WHERE id = $1",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    res.json(rows[0]);
  } catch (error) {
    handleServerError(res, error);
  }
});

// PUT /users/:id - edycja użytkownika
app.put("/users/:id", authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.sendStatus(403);
    }

    const { id } = req.params;
    const { username, email, role } = req.body;

    const { rows } = await pool.query(
      `UPDATE users
       SET username = $1, email = $2, role = $3
       WHERE id = $4
       RETURNING id, username, email, role, created_at`,
      [username, email, role, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    res.json({
      message: "Dane użytkownika zaktualizowane",
      user: rows[0],
    });
  } catch (error) {
    handleServerError(res, error);
  }
});

// DELETE /users/:id - usuwanie użytkownika
app.delete("/users/:id", authenticateJWT, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.sendStatus(403);
    }

    const { id } = req.params;
    const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [
      id,
    ]);

    if (rowCount === 0) {
      return res.status(404).json({ message: "Użytkownik nie znaleziony" });
    }

    res.json({ message: "Użytkownik usunięty" });
  } catch (error) {
    handleServerError(res, error);
  }
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Serwer działa na https://bookstore-three-beta.vercel.app`);
  console.log(
    `Połączenie z bazą danych: ${process.env.DB_HOST}/${process.env.DB_NAME}`
  );
});
