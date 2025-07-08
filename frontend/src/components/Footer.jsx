import { Link } from "react-router-dom";

{
  /* Komponent stopki */
}

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; 2025 Księgarnia Online. Wszelkie prawa zastrzeżone.</p>
      <p className="mt-2">
        Właścicielem księgarni <strong>KsiegarniaOnline.pl</strong> jest firma{" "}
        <strong>BookStore Sp. z o.o.</strong> z siedzibą w Białymstoku (15-200,
        ul. Literacka 10).
      </p>
      <p className="mt-2">
        <strong>NIP:</strong> 542-999-88-77, <strong>REGON:</strong> 200654321,{" "}
        <strong>KRS:</strong> 0000789123.
      </p>
      <p className="mt-2">
        📞 +48 123 456 789 | 📧 kontakt@ksiegarnia.pl{" "}
        <a href="#" className="privacy-link">
          Polityka prywatności
        </a>
      </p>
    </footer>
  );
}

export default Footer;
