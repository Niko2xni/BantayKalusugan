import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, MapPin, Phone, Facebook, Twitter, Instagram, Menu, X } from "lucide-react";
import "./login.css";
import logo from "./assets/logo.svg";

const bgImage = "https://cdn.britannica.com/81/196781-050-CA29F2C8/Manila.jpg";
const NAV_LINKS = ["Home", "Services", "About Us"];

// ── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ scrolled }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const goToSection = (section) => {
    navigate(`/#${section}`);
    setMenuOpen(false);
  };

  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
          <div className="navbar__logo">
            <img src={logo} alt="logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
            <span className="navbar__logo-text">BantayKalusugan</span>
          </div>
        <ul className="navbar__links navbar__links--desktop">
          {NAV_LINKS.map((link) => {
            const idMap = { Home: "home", Services: "services", "About Us": "about" };
            return (
              <li key={link}>
                <a href="#" className="navbar__link"
                  onClick={(e) => { e.preventDefault(); goToSection(idMap[link]); }}>
                  {link}
                </a>
              </li>
            );
          })}
        </ul>
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu">
          <ul className="mobile-menu__links">
            {NAV_LINKS.map((link) => {
              const idMap = { Home: "home", Services: "services", "About Us": "about" };
              return (
                <li key={link}>
                  <a href="#" className="mobile-menu__link"
                    onClick={(e) => { e.preventDefault(); goToSection(idMap[link]); }}>
                    {link}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </>
  );
}

// ── Login Page ────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    alert("Login clicked!");
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <Navbar scrolled={scrolled} />

      <div className="login-bg-wrapper" style={{ marginTop: "64px" }}>
        <div className="login-bg">
          <img
            src={bgImage}
            alt="Manila skyline"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className="login-bg-overlay" />
        </div>

        <div className="login-card">
          <div className="login-logo-block">
            <p className="login-card-title">BantayKalusugan</p>
            <p className="login-card-subtitle">Barangay Community Health Monitoring Platform</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <div className="login-form">
            <div>
              <label className="form-field-label">Email Address</label>
              <div className="form-input-row">
                <Mail size={16} className="form-input-icon" />
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="form-field-label">Password</label>
              <div className="form-input-row">
                <Lock size={16} className="form-input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="form-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <a href="#" className="forgot-password-link">Forgot password?</a>

            <button className="login-submit-btn" onClick={handleLogin}>
              Log In
            </button>
          </div>

          <div className="login-register-link">
            Don't have an account? <Link to="/register" style={{ color: "#2E5895" }}>Register</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// ── Footer Component ─────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">

          <div className="footer-brand">
            <div className="footer-brand-logo">
                <img src={logo} alt="logo" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
              <div className="footer-brand-name">
                <span className="brand-primary">Bantay</span>
                <span className="brand-accent">Kalusugan</span>
              </div>
            </div>
            <p className="footer-brand-desc">
              A web-based patient monitoring platform for barangay-level health
              data management and community wellness tracking.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social-link"><Facebook size={15} /></a>
              <a href="#" className="footer-social-link"><Twitter size={15} /></a>
              <a href="#" className="footer-social-link"><Instagram size={15} /></a>
            </div>
          </div>

          <div>
            <p className="footer-col-title">Our Services</p>
            <ul className="footer-link-list">
              {["Patient Registration", "Blood Pressure Monitoring", "Health Record Management", "Health Trend Analysis"].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="footer-col-title">Quick Links</p>
            <ul className="footer-link-list">
              {["Home", "Services", "About Us", "Contact"].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="footer-col-title">Contact Us</p>
            <ul className="footer-contact-list">
              <li className="footer-contact-item">
                <MapPin size={15} className="footer-contact-icon" />
                <span className="footer-contact-text">
                  Barangay Health Center,<br />Sample Barangay, City, Philippines
                </span>
              </li>
              <li className="footer-contact-item">
                <Phone size={15} className="footer-contact-icon" />
                <span className="footer-contact-text">+63 912 345 6789</span>
              </li>
              <li className="footer-contact-item">
                <Mail size={15} className="footer-contact-icon" />
                <span className="footer-contact-text">info@bantaykalusugan.ph</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="footer-divider">
          <p className="footer-copyright">
            © {new Date().getFullYear()} BantayKalusugan. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}