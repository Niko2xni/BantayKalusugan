import styles from './login.module.css';
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, MapPin, Phone, Facebook, Twitter, Instagram, Menu, X } from "lucide-react";

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
      <nav className={`${styles.navbar} ${scrolled ? styles["navbar--scrolled"] : ""}`}>
          <div className={styles['navbar__logo']}>
            <img src={logo} alt="logo" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
            <span className={styles['navbar__logo-text']}>BantayKalusugan</span>
          </div>
        <ul className={`${styles['navbar__links']} ${styles['navbar__links--desktop']}`}>
          {NAV_LINKS.map((link) => {
            const idMap = { Home: "home", Services: "services", "About Us": "about" };
            return (
              <li key={link}>
                <a href="#" className={styles['navbar__link']}
                  onClick={(e) => { e.preventDefault(); goToSection(idMap[link]); }}>
                  {link}
                </a>
              </li>
            );
          })}
        </ul>
        <button className={styles['navbar__hamburger']} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {menuOpen && (
        <div className={styles['mobile-menu']}>
          <ul className={styles['mobile-menu__links']}>
            {NAV_LINKS.map((link) => {
              const idMap = { Home: "home", Services: "services", "About Us": "about" };
              return (
                <li key={link}>
                  <a href="#" className={styles['mobile-menu__link']}
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

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // Clear previous errors
    setError("");

    // Client-side validation
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    // Validate email format before sending to backend
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Only navigate if we got a valid user back
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));

        // Route based on user role from the database
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Login failed. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      setError("Unable to connect to the server. Please try again later.");
      setLoading(false);
    }
  };

  return (
    <div className={styles['login-page']}>
      <Navbar scrolled={scrolled} />

      <div className={styles['login-bg-wrapper']} style={{ marginTop: "64px" }}>
        <div className={styles['login-bg']}>
          <img
            src={bgImage}
            alt="Manila skyline"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className={styles['login-bg-overlay']} />
        </div>

        <div className={styles['login-card']}>
          <div className={styles['login-logo-block']}>
            <p className={styles['login-card-title']}>BantayKalusugan</p>
            <p className={styles['login-card-subtitle']}>Barangay Community Health Monitoring Platform</p>
          </div>

          {error && <div className={styles['login-error']}>{error}</div>}

          <div className={styles['login-form']}>
            <div>
              <label className={styles['form-field-label']}>Email Address</label>
              <div className={styles['form-input-row']}>
                <Mail size={16} className={styles['form-input-icon']} />
                <input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className={styles['form-field-label']}>Password</label>
              <div className={styles['form-input-row']}>
                <Lock size={16} className={styles['form-input-icon']} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles['form-toggle-btn']}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <a href="#" className={styles['forgot-password-link']}>Forgot password?</a>

            <button className={styles['login-submit-btn']} onClick={handleLogin} disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>

          <div className={styles['login-register-link']}>
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
    <footer className={styles['footer']}>
      <div className={styles['footer-container']}>
        <div className={styles['footer-grid']}>

          <div className={styles['footer-brand']}>
            <div className={styles['footer-brand-logo']}>
                <img src={logo} alt="logo" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
              <div className={styles['footer-brand-name']}>
                <span className={styles['brand-primary']}>Bantay</span>
                <span className={styles['brand-accent']}>Kalusugan</span>
              </div>
            </div>
            <p className={styles['footer-brand-desc']}>
              A web-based patient monitoring platform for barangay-level health
              data management and community wellness tracking.
            </p>
            <div className={styles['footer-socials']}>
              <a href="#" className={styles['footer-social-link']}><Facebook size={15} /></a>
              <a href="#" className={styles['footer-social-link']}><Twitter size={15} /></a>
              <a href="#" className={styles['footer-social-link']}><Instagram size={15} /></a>
            </div>
          </div>

          <div>
            <p className={styles['footer-col-title']}>Our Services</p>
            <ul className={styles['footer-link-list']}>
              {["Patient Registration", "Blood Pressure Monitoring", "Health Record Management", "Health Trend Analysis"].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className={styles['footer-col-title']}>Quick Links</p>
            <ul className={styles['footer-link-list']}>
              {["Home", "Services", "About Us", "Contact"].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className={styles['footer-col-title']}>Contact Us</p>
            <ul className={styles['footer-contact-list']}>
              <li className={styles['footer-contact-item']}>
                <MapPin size={15} className={styles['footer-contact-icon']} />
                <span className={styles['footer-contact-text']}>
                  Barangay Health Center,<br />Sample Barangay, City, Philippines
                </span>
              </li>
              <li className={styles['footer-contact-item']}>
                <Phone size={15} className={styles['footer-contact-icon']} />
                <span className={styles['footer-contact-text']}>+63 912 345 6789</span>
              </li>
              <li className={styles['footer-contact-item']}>
                <Mail size={15} className={styles['footer-contact-icon']} />
                <span className={styles['footer-contact-text']}>info@bantaykalusugan.ph</span>
              </li>
            </ul>
          </div>

        </div>

        <div className={styles['footer-divider']}>
          <p className={styles['footer-copyright']}>
            © {new Date().getFullYear()} BantayKalusugan. All rights reserved.
          </p>
          <div className={styles['footer-bottom-links']}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}