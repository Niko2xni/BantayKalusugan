import styles from './landing_page.module.css';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, Users, BarChart2, ClipboardList, CheckCircle,
  ArrowRight, Heart, Database, Monitor, Thermometer, Scale,
  Home, BookOpen, PhoneCall, AlertCircle, Baby, Pill, Stethoscope,
  Menu, X, Facebook, Twitter, Instagram, MapPin, Phone, Mail,
} from "lucide-react";
import logo from "./assets/logo.svg";

// ── Images ──────────────────────────────────────────────────────────────────
const heroImage =
  "https://cdn.britannica.com/81/196781-050-CA29F2C8/Manila.jpg";
const healthWorkersImage =
  "https://images.unsplash.com/photo-1609126385558-bc3fc5082b0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80";
const bhwImage =
  "https://images.unsplash.com/photo-1609126385558-bc3fc5082b0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80";
const vitalSignsImage =
  "https://images.unsplash.com/photo-1695048441307-d081dbd2b5a8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80";
const maternalImage =
  "https://images.unsplash.com/photo-1646457414481-60c356d88021?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80";
const digitalHealthImage =
  "https://images.unsplash.com/photo-1691934310598-27528df21f9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080&q=80";

// ── Static Data ──────────────────────────────────────────────────────────────
const NAV_LINKS = ["Home", "Services", "About Us"];

const STATS = [
  { value: "500+",   label: "Patients Registered" },
  { value: "4,800+", label: "Vital Records Logged" },
  { value: "15+",    label: "Barangays Served" },
  { value: "62",     label: "Active BHWs" },
];

const SERVICES = [
  { icon: <Stethoscope size={26} />, title: "Vital Signs Monitoring",  description: "BHWs record blood pressure, heart rate, temperature, SpO2, respiratory rate, and BMI during every community check-up.", color: "blue" },
  { icon: <Home        size={26} />, title: "Home Visit Tracking",      description: "Log and schedule home visits for assigned community members, ensuring no household is missed.",                            color: "red"  },
  { icon: <Baby        size={26} />, title: "Maternal & Child Health",  description: "Monitor immunization schedules, birth planning, prenatal check-ups, and child growth milestones.",                       color: "gold" },
  { icon: <Pill        size={26} />, title: "TB Treatment Compliance",  description: "Track tuberculosis patient treatment compliance, DOTS monitoring, and follow-up schedules.",                              color: "blue" },
  { icon: <PhoneCall   size={26} />, title: "Referral Management",      description: "Manage patient referrals to local health centers, hospitals, and specialist services efficiently.",                      color: "red"  },
  { icon: <Database    size={26} />, title: "Digital Record Keeping",   description: "Replace paper-based logbooks with a centralized platform accessible to BHWs, admins, and patients.",                    color: "gold" },
];

const BHW_DUTIES = [
  { icon: <Activity      size={20} />, title: "Primary Health Care & Monitoring",  desc: "Conducting height/weight monitoring, vital signs assessment, identifying diseases early, and monitoring tuberculosis treatment compliance in the community.", color: "blue" },
  { icon: <BookOpen      size={20} />, title: "Community Health Education",         desc: "Educating residents on health practices, proper sanitation, disease prevention, and promoting healthy lifestyle habits at the household level.",              color: "red"  },
  { icon: <ClipboardList size={20} />, title: "Referral System & Documentation",    desc: "Supporting doctors and midwives, maintaining accurate health records, and managing patient referrals to appropriate health facilities.",                      color: "gold" },
  { icon: <AlertCircle   size={20} />, title: "Frontline Response",                 desc: "Providing first aid, conducting community disease surveillance, reporting illnesses to local health centers, and assisting in disaster response operations.",  color: "blue" },
  { icon: <Baby          size={20} />, title: "Maternal & Child Health",            desc: "Monitoring maternal health, immunization schedules, birth planning assistance, and tracking child growth and development milestones.",                        color: "red"  },
  { icon: <Users         size={20} />, title: "Community Linkage",                  desc: "Acting as the primary bridge between community members and the formal health system, focusing on preventive care and continuous health monitoring.",            color: "gold" },
];

const VITAL_SIGNS = [
  { icon: <Activity    size={18} />, label: "Blood Pressure",   unit: "mmHg",        color: "red"  },
  { icon: <Heart       size={18} />, label: "Heart Rate",       unit: "bpm",         color: "blue" },
  { icon: <Thermometer size={18} />, label: "Temperature",      unit: "°C",          color: "gold" },
  { icon: <Activity    size={18} />, label: "SpO₂",             unit: "%",           color: "blue" },
  { icon: <Monitor     size={18} />, label: "Respiratory Rate", unit: "breaths/min", color: "red"  },
  { icon: <Scale       size={18} />, label: "Height & Weight",  unit: "BMI",         color: "gold" },
];

const STEPS = [
  { number: "01", title: "BHW Conducts Community Check-up",  description: "Accredited BHWs perform home visits, measure vital signs (BP, temperature, heart rate, SpO2, BMI), and gather comprehensive health data from residents.", icon: <Stethoscope size={22} />, color: "blue" },
  { number: "02", title: "Admin Reviews & Manages Records",   description: "Barangay staff review encoded data, manage patient profiles, generate community health reports, and oversee referrals to health facilities.",             icon: <Monitor     size={22} />, color: "red"  },
  { number: "03", title: "Patient Monitors Health Progress",  description: "Registered patients access their personal dashboard to view all vital sign records and monitor their health trends over time.",                          icon: <BarChart2   size={22} />, color: "gold" },
];

const DIGITAL_METRICS = [
  { label: "Faster Retrieval", value: "10x",      color: "blue" },
  { label: "Error Reduction",  value: "95%",      color: "red"  },
  { label: "BHW Time Saved",   value: "3hrs/day", color: "gold" },
  { label: "Records Secured",  value: "100%",     color: "blue" },
];

const ROLES = [
  {
    role: "Admin / Barangay Staff",
    short: "Admin",
    icon: <Monitor size={22} />,
    color: "#2E5895",
    bg: "#f0f4fb",
    border: "#d0ddf0",
    features: [
      "Manage patient profiles and health records",
      "Review and verify BHW-encoded vital signs",
      "Generate community health reports",
      "Oversee referrals to health facilities",
      "Monitor BHW home visit schedules",
    ],
  },
  {
    role: "Patient / Community Member",
    short: "Patient",
    icon: <Users size={22} />,
    color: "#b8820a",
    bg: "#fffbf0",
    border: "#f0e0a0",
    features: [
      "View personal vital signs history",
      "Track health trends over time",
      "Access immunization and check-up records",
      "Receive referral notifications",
      "Monitor TB treatment compliance status",
    ],
  },
];

// ── Reusable Image Component ─────────────────────────────────────────────────
function Img({ src, alt, className }) {
  const [err, setErr] = useState(false);
  return err
    ? <div className={`${styles["img-fallback"]} ${className}`} />
    : <img src={src} alt={alt} className={className} onError={() => setErr(true)} />;
}

// ── Navbar Component ─────────────────────────────────────────────────────────
function Navbar({ scrolled }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
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
                <a href="#" className={styles['navbar__link']} onClick={(e) => { e.preventDefault(); scrollTo(idMap[link]); }}>
                  {link}
                </a>
              </li>
            );
          })}
          <li>
            <button className={`${styles['btn']} ${styles['btn--outline-navy']} ${styles['btn--sm']}`} onClick={() => navigate("/login")}>
              Log In
            </button>
          </li>
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
                  <a href="#" className={styles['mobile-menu__link']} onClick={(e) => { e.preventDefault(); scrollTo(idMap[link]); }}>
                    {link}
                  </a>
                </li>
              );
            })}
          </ul>
          <button className={`${styles['btn']} ${styles['btn--outline-navy']} ${styles['btn--full']}`} onClick={() => navigate("/login")}>
            Log In
          </button>
        </div>
      )}
    </>
  );
}

// ── Main Landing Page ─────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled,    setScrolled]    = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 120);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className={styles['page']}>

      {/* Section 1 – Navbar */}
      <Navbar scrolled={scrolled} />

      {/* Section 2 – Hero */}
      <section id="home" className={styles['hero']}>
        <div className={styles['hero__bg']}>
          <Img src={heroImage} alt="Philippine community aerial view" className={styles['hero__bg-img']} />
          <div className={styles['hero__overlay']} />
        </div>
        <div className={`${styles.hero__content} ${heroVisible ? styles["hero__content--visible"] : ""}`}>
          <div className={styles['hero__badge']}>
            <Activity size={13} />
            Barangay Community Health Monitoring Platform
          </div>
          <h1 className={styles['hero__title']}>
            Empowering BHWs &amp;
            <span className={styles['hero__title--gold']}> Communities</span>
            <br />Through Smart Health Monitoring
          </h1>
          <p className={styles['hero__desc']}>
            BantayKalusugan equips Barangay Health Workers with digital tools to record vital signs,
            manage home visits, monitor TB compliance, and bridge communities to better healthcare.
          </p>
          <div className={styles['hero__actions']}>
            <button className={`${styles['btn']} ${styles['btn--gold']}`} onClick={() => navigate("/login")}>Get Started</button>
            <button className={`${styles['btn']} ${styles['btn--outline-white']}`} onClick={() => scrollTo("about")}>Learn More</button>
          </div>
        </div>
        <div className={styles['hero__stats-bar']}>
          <div className={styles['container']}>
            <div className={styles['stats-grid']}>
              {STATS.map((s) => (
                <div key={s.label} className={styles['stat-item']}>
                  <span className={styles['stat-item__value']}>{s.value}</span>
                  <span className={styles['stat-item__label']}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 – About */}
      <section id="about" className={`${styles['section']} ${styles['section--white']}`}>
        <div className={styles['container']}>
          <div className={styles['two-col']}>
            <div className={styles['two-col__media']}>
              <div className={styles['media-card']}>
                <Img src={healthWorkersImage} alt="Community healthcare workers" className={styles['media-card__img']} />
              </div>
              <div className={styles['media-badge']}>
                <CheckCircle size={18} />
                <div>
                  <strong>62 Active BHWs</strong>
                  <span>Serving our communities</span>
                </div>
              </div>
            </div>
            <div className={styles['two-col__text']}>
              <span className={`${styles['badge']} ${styles['badge--blue']}`}>About BantayKalusugan</span>
              <h2 className={styles['section__title']}>
                Digitizing Barangay-Level
                <span className={styles['text--blue']}> Health Management</span>
              </h2>
              <p className={styles['body-text']}>
                The rapid advancement of digital technology has transformed how communities manage and
                deliver essential services, including healthcare. As local government units strive to
                improve efficiency, the integration of web-based systems into community health management
                has become increasingly relevant.
              </p>
              <p className={styles['body-text']}>
                Traditional paper-based methods of recording and monitoring patient health data are often
                prone to errors, difficult to retrieve, and inefficient. At the barangay level, BHWs
                regularly conduct health monitoring including blood pressure measurement, height/weight
                checks, and disease surveillance.
              </p>
              <p className={styles['body-text']}>
                BantayKalusugan is a web-based patient monitoring platform designed to bridge the gap
                between community health data collection and digital record management.
              </p>
              <div className={styles['tag-list']}>
                {["Vital Signs Monitoring", "Digital Records", "TB Compliance", "Maternal Health", "Referral System"].map((tag) => (
                  <span key={tag} className={styles['tag']}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 – BHW Duties */}
      <section id="bhw" className={`${styles['section']} ${styles['section--grey']}`}>
        <div className={styles['container']}>
          <div className={styles['two-col']}>
            <div className={styles['two-col__text']}>
              <span className={`${styles['badge']} ${styles['badge--red']}`}>Barangay Health Workers (BHWs)</span>
              <h2 className={styles['section__title']}>
                The Frontline of
                <span className={styles['text--red']}> Community Healthcare</span>
              </h2>
              <p className={styles['body-text']}>
                Barangay Health Workers (BHWs) in the Philippines are <strong>accredited volunteers</strong> who
                act as the primary bridge between community members and the formal health system. They focus on
                preventive care, health education, and continuous disease monitoring at the household level.
              </p>
              <p className={styles['body-text']}>
                BantayKalusugan provides BHWs with a dedicated digital platform to record vital signs, log home
                visits, monitor TB treatment compliance, manage maternal and child health data, and generate
                referrals — all from a single, easy-to-use interface.
              </p>
            </div>
            <div className={styles['two-col__media']}>
              <div className={styles['media-card']}>
                <Img src={bhwImage} alt="Barangay health worker" className={styles['media-card__img']} />
              </div>
            </div>
          </div>
          <div className={styles['subsection-header']}>
            <h3 className={styles['subsection-header__title']}>Key Duties &amp; Responsibilities</h3>
            <p className={styles['subsection-header__sub']}>
              BantayKalusugan is built to support every core function of a BHW's daily work
            </p>
          </div>
          <div className={`${styles['card-grid']} ${styles['card-grid--3']}`}>
            {BHW_DUTIES.map((d) => (
              <div key={d.title} className={styles['card']}>
                <div className={`${styles.card__icon} ${styles[`icon--${d.color}`]}`}>{d.icon}</div>
                <h4 className={styles['card__title']}>{d.title}</h4>
                <p className={styles['card__desc']}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 – Vital Signs */}
      <section className={`${styles['section']} ${styles['section--white']}`}>
        <div className={styles['container']}>
          <div className={styles['two-col']}>
            <div className={styles['two-col__text']}>
              <span className={`${styles['badge']} ${styles['badge--gold']}`}>Complete Vital Signs Monitoring</span>
              <h2 className={styles['section__title']}>
                Beyond Blood Pressure —
                <span className={styles['text--blue']}> Full Patient Assessment</span>
              </h2>
              <p className={styles['body-text']}>
                BHWs use BantayKalusugan to record a <strong>complete set of vital signs</strong> for every
                patient during community check-ups and home visits. This holistic approach enables early
                detection of health issues and better-informed referrals to local health centers.
              </p>
              <div className={styles['vital-grid']}>
                {VITAL_SIGNS.map((vs) => (
                  <div key={vs.label} className={styles['vital-item']}>
                    <div className={`${styles["vital-item__icon"]} ${styles[`icon--${vs.color}`]}`}>{vs.icon}</div>
                    <div>
                      <p className={styles['vital-item__label']}>{vs.label}</p>
                      <p className={styles['vital-item__unit']}>{vs.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles['two-col__media']}>
              <div className={styles['media-card']}>
                <Img src={vitalSignsImage} alt="Vital signs monitoring" className={styles['media-card__img']} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6 – Maternal & TB */}
      <section className={`${styles['section']} ${styles['section--grey']}`}>
        <div className={styles['container']}>
          <div className={`${styles['card-grid']} ${styles['card-grid--2']}`}>
            <div className={styles['feature-card']}>
              <div className={styles['feature-card__img-wrap']}>
                <Img src={maternalImage} alt="Maternal child health" className={styles['feature-card__img']} />
              </div>
              <div className={styles['feature-card__body']}>
                <div className={styles['feature-card__meta']}>
                  <div className={styles['icon--red']}><Baby size={18} /></div>
                  <span className={`${styles['badge']} ${styles['badge--red']}`}>Maternal &amp; Child Health</span>
                </div>
                <h3 className={styles['feature-card__title']}>Protecting Mothers &amp; Children</h3>
                <p className={styles['feature-card__desc']}>
                  BHWs monitor prenatal check-up schedules, immunization compliance, birth planning, and
                  child growth milestones. BantayKalusugan digitizes these records for easy tracking and
                  timely intervention.
                </p>
                <ul className={`${styles['check-list']} ${styles['check-list--red']}`}>
                  {["Immunization schedule tracking", "Prenatal visit monitoring", "Child growth (height/weight) records", "Birth planning documentation"].map((item) => (
                    <li key={item}><CheckCircle size={13} />{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className={styles['feature-card']}>
              <div className={`${styles['feature-card__img-wrap']} ${styles['feature-card__img-wrap--blue']}`}>
                <Pill size={44} color="white" />
                <p className={styles['feature-card__img-title']}>TB Treatment Compliance</p>
                <p className={styles['feature-card__img-sub']}>DOTS Monitoring Program</p>
              </div>
              <div className={styles['feature-card__body']}>
                <div className={styles['feature-card__meta']}>
                  <div className={styles['icon--blue']}><Pill size={18} /></div>
                  <span className={`${styles['badge']} ${styles['badge--blue']}`}>TB Monitoring</span>
                </div>
                <h3 className={styles['feature-card__title']}>TB Treatment Compliance Tracking</h3>
                <p className={styles['feature-card__desc']}>
                  BHWs are responsible for monitoring tuberculosis patients undergoing DOTS. BantayKalusugan
                  provides digital tools for tracking medication compliance and follow-up schedules.
                </p>
                <ul className={`${styles['check-list']} ${styles['check-list--blue']}`}>
                  {["Daily medication intake logs", "DOTS compliance monitoring", "Treatment phase tracking", "Follow-up schedule alerts"].map((item) => (
                    <li key={item}><CheckCircle size={13} />{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 – Services */}
      <section id="services" className={`${styles['section']} ${styles['section--white']}`}>
        <div className={styles['container']}>
          <div className={styles['section-header']}>
            <span className={`${styles['badge']} ${styles['badge--blue']}`}>Our Services</span>
            <h2 className={styles['section__title']}>
              Everything You Need for
              <span className={styles['text--blue']}> Barangay Health</span>
            </h2>
            <p className={styles['section-header__sub']}>
              Comprehensive tools for BHWs, administrators, and patients to manage community wellness effectively.
            </p>
          </div>
          <div className={`${styles['card-grid']} ${styles['card-grid--3']}`}>
            {SERVICES.map((s) => (
              <div key={s.title} className={`${styles['card']} ${styles['card--grey']}`}>
                <div className={`${styles.card__icon} ${styles[`icon--${s.color}`]}`}>{s.icon}</div>
                <h3 className={styles['card__title']}>{s.title}</h3>
                <p className={styles['card__desc']}>{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8 – How It Works */}
      <section className={`${styles['section']} ${styles['section--grey']}`}>
        <div className={styles['container']}>
          <div className={styles['section-header']}>
            <span className={`${styles['badge']} ${styles['badge--red']}`}>How It Works</span>
            <h2 className={styles['section__title']}>
              Simple Process,
              <span className={styles['text--blue']}> Powerful Results</span>
            </h2>
          </div>
          <div className={`${styles['card-grid']} ${styles['card-grid--3']}`}>
            {STEPS.map((step, idx) => (
              <div key={step.number} className={styles['step-card']}>
                <div className={`${styles["step-card__label"]} ${styles[`bg--${step.color}`]}`}>STEP {step.number}</div>
                <div className={`${styles["step-card__circle"]} ${styles[`bg--${step.color}`]}`}>{step.icon}</div>
                <h3 className={styles['step-card__title']}>{step.title}</h3>
                <p className={styles['step-card__desc']}>{step.description}</p>
                {idx < STEPS.length - 1 && (
                  <span className={styles['step-card__arrow']}><ArrowRight size={16} /></span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Section 9 – User Roles */}
        <section className={`${styles['section']} ${styles['section--white']}`}>
            <div className={styles['container']}>
                <div className={styles['section-header']}>
                    <span className={`${styles['badge']} ${styles['badge--blue']}`}>Platform Roles</span>
                    <h2 className={styles['section__title']}>
                        Designed for Every
                        <span className={styles['text--blue']}> Healthcare Role</span>
                    </h2>
                    <p className={styles['section-header__sub']}>
                        Two user types: Barangay staff manage the digital system, while patients access their personal health records.
                    </p>
                </div>

                <div className={`${styles['card-grid']} ${styles['card-grid--2']}`} style={{ maxWidth: "860px", margin: "0 auto" }}>
                    {ROLES.map((role) => (
                        <div
                                key={role.role}
                                className={styles['card']}
                                style={{ backgroundColor: role.bg, border: `1px solid ${role.border}` }}
                            >
                            <div
                                className={styles['card__icon']}
                                style={{ backgroundColor: `${role.color}20`, color: role.color }}
                            >
                                {role.icon}
                            </div>
                            <span
                                className={styles['badge']}
                                style={{ backgroundColor: `${role.color}20`, color: role.color }}
                            >
                                {role.short}
                            </span>
                            <h3 className={styles['card__title']} style={{ fontSize: "1rem" }}>{role.role}</h3>
                            <ul className={styles['check-list']} style={{ marginTop: "8px" }}>
                                {role.features.map((f) => (
                                <li key={f}>
                                    <CheckCircle size={13} style={{ color: role.color, marginTop: "2px", flexShrink: 0 }} />
                                    {f}
                                </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </section>

      {/* Section 10 – Digital Records */}
      <section className={`${styles['section']} ${styles['section--grey']}`}>
        <div className={styles['container']}>
          <div className={`${styles['two-col']} ${styles['two-col--reversed']}`}>
            <div className={styles['two-col__media']}>
              <div className={styles['media-card']}>
                <Img src={digitalHealthImage} alt="Digital health data management" className={styles['media-card__img']} />
              </div>
            </div>
            <div className={styles['two-col__text']}>
              <span className={`${styles['badge']} ${styles['badge--blue']}`}>Digital Records</span>
              <h2 className={styles['section__title']}>
                Say Goodbye to
                <span className={styles['text--red']}> Paper-Based Chaos</span>
              </h2>
              <p className={styles['body-text']}>
                Replace error-prone manual logbooks with a centralized digital platform. All patient
                vital signs, home visit records, and referral data are organized, searchable, and
                accessible to authorized BHWs, administrators, and patients — reducing administrative
                burden and improving community health outcomes.
              </p>
              <div className={styles['metric-grid']}>
                {DIGITAL_METRICS.map((m) => (
                  <div key={m.label} className={styles['metric-item']}>
                    <span className={`${styles["metric-item__value"]} ${styles[`text--${m.color}`]}`}>{m.value}</span>
                    <span className={styles['metric-item__label']}>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 11 – CTA */}
      <section className={styles['cta-section']}>
        <div className={`${styles['container']} ${styles['cta-section__inner']}`}>
          <h2 className={styles['cta-section__title']}>
            Ready to Transform Your Barangay's
            <span className={styles['text--gold']}> Health Management?</span>
          </h2>
          <p className={styles['cta-section__desc']}>
            Empower your BHWs with digital tools. Improve community health outcomes. Join barangays
            already using BantayKalusugan to digitize their community health monitoring.
          </p>
          <div className={styles['cta-section__actions']}>
            <button className={`${styles['btn']} ${styles['btn--gold']}`} onClick={() => navigate("/login")}>Log In Now</button>
            <button className={`${styles['btn']} ${styles['btn--outline-white']}`} onClick={() => scrollTo("bhw")}>
              Learn About BHWs
            </button>
          </div>
        </div>
      </section>

      {/* Section 12 – Footer */}
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

          {/* Brand Column */}
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
          </div>

          {/* Our Services Column */}
          <div>
            <p className={styles['footer-col-title']}>Our Services</p>
            <ul className={styles['footer-link-list']}>
              {["Blood Pressure Monitoring", "Health Record Management", "Health Trend Analysis"].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Quick Links Column */}
          <div>
            <p className={styles['footer-col-title']}>Quick Links</p>
            <ul className={styles['footer-link-list']}>
              {["Home", "Services", "About Us", "Contact"].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
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

        {/* Divider + Copyright */}
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