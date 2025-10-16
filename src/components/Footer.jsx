import React from "react";
import { FaGithub, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h2 className="brand-name">ZPhones</h2>
          <p>Tu tienda tech favorita ⚡</p>
        </div>

        <nav className="footer-links">
          <a href="#">Inicio</a>
          <a href="#">Catálogo</a>
          <a href="#">Sobre nosotros</a>
          <a href="#">Contacto</a>
        </nav>

        <div className="footer-social">
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <FaGithub />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer">
            <FaLinkedin />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <FaInstagram />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <FaTwitter />
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ZPhones. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
