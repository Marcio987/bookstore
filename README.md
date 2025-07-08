# Bookstore

Aplikacja do zarządzania księgarnią z frontendem w React (Vite) oraz backendem w Node.js (Express) i bazą danych PostgreSQL.

---

## Spis treści

- [Opis projektu](#opis-projektu)
- [Technologie](#technologie)
- [Wymagania](#wymagania)
- [Wersje](#wersje)
- [Instalacja](#instalacja)
- [Konfiguracja](#konfiguracja)
- [Uruchomienie](#uruchomienie)
- [Funkcjonalności](#funkcjonalności)

---

## Opis projektu

Aplikacja umożliwia przeglądanie, wyszukiwanie i kupowanie książek online.  
Frontend stworzony jest w React z Vite, backend w Node.js z Express, a dane przechowywane są w PostgreSQL.

---

## Technologie

- **Frontend:** React 19, Vite, TailwindCSS
- **Backend:** Node.js, Express
- **Baza danych:** PostgreSQL
- **Inne:**
  - `axios` – komunikacja HTTP
  - `react-router-dom` – routing
  - `jwt-decode` – dekodowanie tokenów JWT

---

## Wymagania

- Node.js ( v22.14.0 )
- PostgreSQL ( v17.4 )
- npm

---

## Werjse

    # backend

    "bcryptjs": "^3.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "express-rate-limit": "^7.5.0",
    "jsonwebtoken": "^9.0.2",
    "jwt-decode": "^4.0.0",
    "pg": "^8.14.1"

    ---

    # frontend

    "axios": "^1.8.3",
    "jwt-decode": "^4.0.0",
    "lucide-react": "^0.525.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.3.0"

---

## Instalacja

1. Sklonuj repozytorium:

   ```bash
   git clone https://github.com/Marcio987/bookstore.git
   cd bookstore

   ```

2. Zainstaluj zależności dla backendu (automatycznie z package.jason):

   cd backend
   npm install

3. Zainstaluj zależności dla frontendu (automatycznie z package.jason):

   cd ../frontend
   npm install

---

## Konfiguracja

1. Skonfiguruj bazę danych PostgreSQL

   - Zainstaluj PostgreSQL (np. przez https://www.postgresql.org/download/).
   - Utworz nową baze danych bookstore,
     CREATE DATABASE bookstore;

   - Po utworzeniu nowej bazy danych (bookstore), możesz zaimportować strukturę z pliku backend/bookstore_schema.sql:

2. Utwórz pliki .env w katalogu backend

   - backend/.env

   DB_USER=your_db_user
   DB_HOST=localhost
   DB_NAME=your_db_name
   DB_PASS=your_db_password
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret

3. Uruchom backend, aby automatycznie połączyć się z bazą danych:
   cd backend
   node server.js

---

## Uruchamianie

1. Uruchom backend:

   cd backend
   node server.js

2. Uruchom frontend:

   cd ../frontend
   npm run dev

3. Otwórz przeglądarkę pod adresem http://localhost:5173

---

## Funkcjonalności

- Przeglądanie listy książek według kategorii
- Szczegóły książki ze zdjęciem, opisem i ceną
- Wyszukiwarka książek
- Dodawanie książek do koszyka
- Obsługa koszyka i licznik produktów
- Autoryzacja użytkowników (logowanie/wylogowanie)
