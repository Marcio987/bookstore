import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/useAuth";
import HomePage from "./pages/HomePage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/user/Profile";
import Contact from "./pages/Contact";
import Cart from "./pages/user/Cart";
import Category from "./pages/category/Category";
import Book from "./pages/Book";

import AdminPanel from "./pages/AdminPanel";
import AdminPanel2 from "./pages/AdminPanel2";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="/category" element={<Category />} />
          <Route path="/book" element={<Book />} />
          <Route path="/book/:id" element={<Book />} />
          <Route path="/adminpanel" element={<AdminPanel />} />
          <Route path="/adminpanel2" element={<AdminPanel2 />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
