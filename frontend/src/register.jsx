import styles from './register.module.css';
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail, Lock, Eye, EyeOff, User, Phone,
  MapPin, Calendar, Users, AlertCircle, CheckCircle,
  Menu, X, Facebook, Twitter, Instagram
} from "lucide-react";


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

// ── Footer ───────────────────────────────────────────────────────────────────
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
              {["Patient Registration", "Blood Pressure Monitoring", "Health Record Management", "Health Trend Analysis", "Admin Dashboard"].map((l) => (
                <li key={l}>{l}</li>
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
                <span className={styles['footer-contact-text']}>Barangay Health Center,<br />Sample Barangay, City, Philippines</span>
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
          <p className={styles['footer-copyright']}>© {new Date().getFullYear()} BantayKalusugan. All rights reserved.</p>
          <div className={styles['footer-bottom-links']}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Register Page ─────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    dateOfBirth: "", address: "", barangay: "", sex: "",
    password: "", confirmPassword: "",
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const today = new Date();
    const birthDate = new Date(formData.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 1) {
      setError("Invalid date of birth");
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  // ── Success screen ──
  if (success) {
    return (
      <div className={styles['register-page']}>
        <Navbar scrolled={scrolled} />
        <div className={styles['register-bg-wrapper']} style={{ marginTop: "64px" }}>
          <div className={styles['register-bg']}>
            <img src={bgImage} alt="background" onError={(e) => { e.target.style.display = "none"; }} />
            <div className={styles['register-bg-overlay']} />
          </div>
          <div className={styles['register-success-card']}>
            <div className={styles['success-icon-circle']}>
              <CheckCircle size={32} style={{ color: "#22c55e" }} />
            </div>
            <p className={styles['success-title']}>Registration Successful!</p>
            <p className={styles['success-message']}>
              Your patient account has been created. Redirecting to login...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles['register-page']}>
      <Navbar scrolled={scrolled} />

      <div className={styles['register-bg-wrapper']} style={{ marginTop: "64px" }}>
        <div className={styles['register-bg']}>
          <img src={bgImage} alt="Manila skyline" onError={(e) => { e.target.style.display = "none"; }} />
          <div className={styles['register-bg-overlay']} />
        </div>

        <div className={styles['register-card']}>
          {/* Header */}
          <div className={styles['register-header']}>
            <p className={styles['register-card-title']}>Patient Registration</p>
            <p className={styles['register-card-subtitle']}>Register as a patient to access healthcare services</p>
          </div>

          {error && (
            <div className={styles['register-error']}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles['register-form']}>

            {/* Name Row */}
            <div className={styles['form-row-2']}>
              <div>
                <label className={styles['form-field-label']}>First Name <span className={styles['required-star']}>*</span></label>
                <div className={styles['form-input-row']}>
                  <User size={15} className={styles['form-input-icon']} />
                  <input type="text" name="firstName" placeholder="Juan"
                    value={formData.firstName} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label className={styles['form-field-label']}>Last Name <span className={styles['required-star']}>*</span></label>
                <div className={styles['form-input-row']}>
                  <User size={15} className={styles['form-input-icon']} />
                  <input type="text" name="lastName" placeholder="Dela Cruz"
                    value={formData.lastName} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* DOB + Sex */}
            <div className={styles['form-row-2']}>
              <div>
                <label className={styles['form-field-label']}>Date of Birth <span className={styles['required-star']}>*</span></label>
                <div className={styles['form-input-row']}>
                  <Calendar size={15} className={styles['form-input-icon']} />
                  <input type="date" name="dateOfBirth"
                    value={formData.dateOfBirth} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label className={styles['form-field-label']}>Sex <span className={styles['required-star']}>*</span></label>
                <div className={styles['form-input-row']}>
                  <Users size={15} className={styles['form-input-icon']} />
                  <select name="sex" value={formData.sex} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email + Phone */}
            <div className={styles['form-row-2']}>
              <div>
                <label className={styles['form-field-label']}>Email Address <span className={styles['required-star']}>*</span></label>
                <div className={styles['form-input-row']}>
                  <Mail size={15} className={styles['form-input-icon']} />
                  <input type="email" name="email" placeholder="juan@example.com"
                    value={formData.email} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label className={styles['form-field-label']}>Phone Number <span className={styles['required-star']}>*</span></label>
                <div className={styles['form-input-row']}>
                  <Phone size={15} className={styles['form-input-icon']} />
                  <input type="tel" name="phone" placeholder="09XX XXX XXXX"
                    value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className={styles['form-field-label']}>Address <span className={styles['required-star']}>*</span></label>
              <div className={styles['form-input-row']}>
                <MapPin size={15} className={styles['form-input-icon']} />
                <input type="text" name="address" placeholder="Street, Block, Lot"
                  value={formData.address} onChange={handleChange} required />
              </div>
            </div>

            {/* Barangay */}
            <div>
              <label className={styles['form-field-label']}>Barangay <span className={styles['required-star']}>*</span></label>
              <div className={styles['form-input-row']}>
                <MapPin size={15} className={styles['form-input-icon']} />
                <select name="barangay" value={formData.barangay} onChange={handleChange} required>
                  <option value="">Select Barangay</option>
                  {["Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password */}
            <div className={styles['form-row-2']}>
              <div>
                <label className={styles['form-field-label']}>Password <span className={styles['required-star']}>*</span></label>
                <div className={styles['form-input-row']}>
                  <Lock size={15} className={styles['form-input-icon']} />
                  <input type={showPassword ? "text" : "password"} name="password"
                    placeholder="Min. 8 characters" value={formData.password} onChange={handleChange} required />
                  <button type="button" className={styles['form-toggle-btn']} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={styles['form-field-label']}>Confirm Password <span className={styles['required-star']}>*</span></label>
                <div className={styles['form-input-row']}>
                  <Lock size={15} className={styles['form-input-icon']} />
                  <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword"
                    placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} required />
                  <button type="button" className={styles['form-toggle-btn']} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <button className={styles['register-submit-btn']} onClick={handleSubmit}>
              Register
            </button>
          </div>

          <div className={styles['register-login-link']}>
            Already have an account? <Link to="/login">Log in here</Link>
          </div>

          <div className={styles['register-info-note']}>
            <p><strong>Note:</strong> After registration, your account will be reviewed by barangay staff. You will be able to log in once approved.</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}