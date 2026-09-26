import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

import productImage from "../assets/prodimage.png";
import heroBackground from "../assets/backimage.png";
import familyImage from "../assets/familyimage.png";
import BACKEND_URL from "../config/api";


/* =========================================================
   LETTER BY LETTER TYPEWRITER
========================================================= */

function TypewriterText({
  text,
  speed = 50,
  pause = 4000,
  delay = 500,
}) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let currentIndex = 0;
    let typingTimer = null;
    let pauseTimer = null;
    let startTimer = null;

    const startTyping = () => {
      currentIndex = 0;
      setDisplayText("");

      typingTimer = setInterval(() => {
        currentIndex += 1;

        setDisplayText(text.slice(0, currentIndex));

        if (currentIndex >= text.length) {
          clearInterval(typingTimer);

          pauseTimer = setTimeout(() => {
            startTyping();
          }, pause);
        }
      }, speed);
    };

    startTimer = setTimeout(() => {
      startTyping();
    }, delay);

    return () => {
      clearTimeout(startTimer);
      clearInterval(typingTimer);
      clearTimeout(pauseTimer);
    };
  }, [text, speed, pause, delay]);

  return (
    <span className="typewriter-text">
      {displayText}
      <span className="typing-cursor"></span>
    </span>
  );
}


/* =========================================================
   JOURNEY DATA
========================================================= */

const journeySteps = [
  {
    number: "01",
    title: "Mustard Seeds",
    subtitle: "Selected at the Source",
    description:
      "Carefully selected mustard seeds are sourced with quality and purity in mind.",
    points: [
      "Carefully selected mustard seeds",
      "Quality-focused sourcing",
      "Traditional mustard varieties",
      "Visual & quality inspection",
    ],
    ending: "From the field, our journey begins.",
  },

  {
    number: "02",
    title: "Cleaning & Sorting",
    subtitle: "Only the Right Seeds Move Forward",
    description:
      "The seeds go through cleaning and sorting to remove unwanted particles and impurities.",
    points: [
      "Cleaning",
      "Sorting",
      "Removal of foreign particles",
      "Quality inspection",
    ],
    ending: "Because purity starts before extraction.",
  },

  {
    number: "03",
    title: "Kachi Ghani Extraction",
    subtitle: "Nature’s Goodness, Traditionally Extracted",
    description:
      "Selected mustard seeds are processed through the Kachi Ghani method to extract the oil while maintaining its natural character.",
    points: [
      "Traditional extraction process",
      "Controlled processing",
      "Natural mustard aroma",
      "Quality monitoring",
    ],
    ending: "From seed to golden oil.",
  },

  {
    number: "04",
    title: "Quality & Purity Check",
    subtitle: "Every Batch. Carefully Checked.",
    description:
      "Before moving toward packaging, the oil undergoes quality checks to ensure it meets our defined standards.",
    points: [
      "Batch-level quality checks",
      "Purity assessment",
      "Packaging-readiness checks",
      "Batch identification",
    ],
    ending: "We don’t just make it. We check it.",
  },

  {
    number: "05",
    title: "Bottling & Packaging",
    subtitle: "Sealed With Care",
    description:
      "The finished oil is filled and sealed into every MAGADH Org bottle under controlled packaging processes.",
    points: [
      "Hygienic filling",
      "Sealed packaging",
      "Batch identification",
      "Final packaging inspection",
    ],
    ending: "And this is where transparency becomes visible.",
  },
];


/* =========================================================
   JOURNEY STEP
========================================================= */

function JourneyStep({ step, index }) {
  return (
    <article
      className={`magadh-journey-step ${
        index % 2 === 0
          ? "magadh-journey-step-left"
          : "magadh-journey-step-right"
      }`}
    >
      <div className="magadh-journey-marker">
        {step.number}
      </div>

      <div className="magadh-journey-content">
        <div className="magadh-journey-step-label">
          STEP {step.number}
        </div>

        <h3>{step.title}</h3>

        <h4>{step.subtitle}</h4>

        <p className="magadh-journey-description">
          {step.description}
        </p>

        <ul>
          {step.points.map((point) => (
            <li key={point}>
              <span>✦</span>
              {point}
            </li>
          ))}
        </ul>

        <p className="magadh-journey-ending">
          {step.ending}
        </p>
      </div>
    </article>
  );
}


/* =========================================================
   HOME
========================================================= */

function Home() {
  const [journeyLight, setJourneyLight] = useState(0);
  const [accountOpen, setAccountOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();


  /* =======================================================
     CURRENT USER
  ======================================================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setCurrentUser(null);
      return;
    }

    const loadCurrentUser = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/users/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const savedUser = localStorage.getItem("user");

          if (savedUser) {
            try {
              setCurrentUser(JSON.parse(savedUser));
            } catch {
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
          }

          return;
        }

        const user = await response.json();

        setCurrentUser(user);

        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      } catch {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
          try {
            setCurrentUser(JSON.parse(savedUser));
          } catch {
            setCurrentUser(null);
          }
        }
      }
    };

    loadCurrentUser();
  }, []);


  /* =======================================================
     ADMIN ROLE
  ======================================================= */

  const isAdmin =
    String(
      currentUser?.role ||
      currentUser?.roles?.[0] ||
      ""
    )
      .toUpperCase()
      .replace("ROLE_", "") === "ADMIN";


  /* =======================================================
     JOURNEY LIGHT
     Optimized with requestAnimationFrame
  ======================================================= */

  useEffect(() => {
    let animationFrame = null;

    const updateJourneyLight = () => {
      if (animationFrame) return;

      animationFrame = requestAnimationFrame(() => {
        animationFrame = null;

        const section = document.querySelector(
          ".magadh-journey"
        );

        if (!section) return;

        const rect = section.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        const sectionStart = viewportHeight * 0.82;
        const sectionEnd = -rect.height * 0.35;

        const denominator =
          sectionStart - sectionEnd;

        if (denominator <= 0) return;

        const progress =
          (sectionStart - rect.top) /
          denominator;

        const clampedProgress = Math.min(
          1,
          Math.max(0, progress)
        );

        setJourneyLight(clampedProgress);
      });
    };

    updateJourneyLight();

    window.addEventListener(
      "scroll",
      updateJourneyLight,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      updateJourneyLight
    );

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      window.removeEventListener(
        "scroll",
        updateJourneyLight
      );

      window.removeEventListener(
        "resize",
        updateJourneyLight
      );
    };
  }, []);


  /* =======================================================
     STORY SCROLL
  ======================================================= */

  const scrollToStory = () => {
    document
      .querySelector(".magadh-journey")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    setAccountOpen(false);
  };


  return (
    <main className="magadh-home">


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="navbar">

        <div className="brand">

          <div className="brand-symbol">
            <svg
              className="brand-leaf-logo"
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M31 31C23 28 19 20 21 12C29 14 34 20 31 31Z"
                fill="currentColor"
              />

              <path
                d="M33 34C33 23 40 15 50 13C50 24 44 32 33 34Z"
                fill="currentColor"
              />

              <path
                d="M31 53C31 43 31 36 34 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
              />

              <path
                d="M25 53H40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="brand-info">
            <div className="brand-name">
              MAGADH Org
            </div>

            <div className="brand-tagline">
              PURE BY NATURE. DESI BY HEART.
            </div>
          </div>

        </div>


        {/* ===================================================
            DESKTOP NAV
            UNCHANGED
        =================================================== */}

        <nav className="nav-links">

          <a
            className="active"
            onClick={() => navigate("/")}
          >
            Home
          </a>

          <a
            onClick={() => navigate("/products")}
          >
            Products
          </a>

          <a onClick={scrollToStory}>
            Our Story
          </a>

          <a
            onClick={() => navigate("/why-us")}
          >
            Why Us
          </a>

          <a
            onClick={() => navigate("/contact")}
          >
            Contact
          </a>

          <a
            onClick={() =>
              navigate("/certification")
            }
          >
            Certification
          </a>

        </nav>


        {/* ===================================================
            MOBILE / TABLET NAV
        =================================================== */}

        <nav className="mobile-nav-links">

          <button
            type="button"
            className="mobile-nav-item active"
            onClick={() => navigate("/")}
          >
            Home
          </button>

          <button
            type="button"
            className="mobile-nav-item"
            onClick={() => navigate("/products")}
          >
            Products
          </button>

          <button
            type="button"
            className="mobile-nav-item"
            onClick={scrollToStory}
          >
            Story
          </button>

          <button
            type="button"
            className="mobile-nav-item"
            onClick={() => navigate("/why-us")}
          >
            Why Us
          </button>

          <button
            type="button"
            className="mobile-nav-item"
            onClick={() => navigate("/contact")}
          >
            Contact
          </button>

          <button
            type="button"
            className="mobile-nav-item"
            onClick={() =>
              navigate("/certification")
            }
          >
            Cert.
          </button>

        </nav>


        {/* ===================================================
            NAV ACTIONS
        =================================================== */}

        <div className="nav-actions">

          {/* =================================================
              PREMIUM ACCOUNT MENU
          ================================================= */}

          <div className="account-menu">

            <div
              className="account-trigger"
              role="button"
              tabIndex={0}
              aria-expanded={accountOpen}
              onClick={() =>
                setAccountOpen(
                  (previous) => !previous
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  event.preventDefault();

                  setAccountOpen(
                    (previous) => !previous
                  );
                }
              }}
            >

              <button
                className="user-icon"
                type="button"
                aria-label="Account"
                tabIndex={-1}
              >

                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="3.3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M5.5 20c.7-3.5 3-5.3 6.5-5.3s5.8 1.8 6.5 5.3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    opacity="0.45"
                  />
                </svg>

              </button>

              {currentUser?.name && (
                <span className="account-user-name">
                  {currentUser.name}
                </span>
              )}

            </div>


            {accountOpen && (
              <div className="account-dropdown">

                {currentUser ? (
                  <>
                    <div className="account-dropdown-header">

                      <span className="account-dropdown-kicker">
                        MAGADH Org
                      </span>

                      <strong>
                        {currentUser.name ||
                          "My Account"}
                      </strong>

                      <small>
                        {currentUser.email || ""}
                      </small>

                    </div>


                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/profile");
                      }}
                    >
                      <span>My Profile</span>
                      <span className="account-arrow">
                        →
                      </span>
                    </button>


                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/orders");
                      }}
                    >
                      <span>Orders</span>
                      <span className="account-arrow">
                        →
                      </span>
                    </button>


                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/saved-address");
                      }}
                    >
                      <span>Saved Address</span>
                      <span className="account-arrow">
                        →
                      </span>
                    </button>


                    <button
                      type="button"
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/coupons");
                      }}
                    >
                      <span>Coupons</span>
                      <span className="account-arrow">
                        →
                      </span>
                    </button>


                    <button
                      type="button"
                      className="account-dropdown-logout"
                      onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");

                        setCurrentUser(null);
                        setAccountOpen(false);

                        navigate("/");
                      }}
                    >
                      <span>Logout</span>

                      <span className="account-arrow">
                        ↗
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="account-dropdown-header">

                      <span className="account-dropdown-kicker">
                        MAGADH Org
                      </span>

                      <strong>
                        My Account
                      </strong>

                    </div>


                    <button
                      type="button"
                      className="account-dropdown-login"
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/login");
                      }}
                    >
                      <span>Login</span>

                      <span className="account-arrow">
                        →
                      </span>
                    </button>


                    <button
                      type="button"
                      className="account-dropdown-register"
                      onClick={() => {
                        setAccountOpen(false);
                        navigate("/register");
                      }}
                    >
                      <span>Create Account</span>

                      <span className="account-arrow">
                        →
                      </span>
                    </button>
                  </>
                )}

              </div>
            )}

          </div>


          {/* =================================================
              CART
          ================================================= */}

          {!isAdmin && (
            <button
              className="cart"
              type="button"
              onClick={() =>
                navigate("/cart")
              }
            >
              🛒

              <span>
                0
              </span>
            </button>
          )}


          {/* =================================================
              ADMIN PANEL
          ================================================= */}

          {isAdmin && (
            <button
              type="button"
              className="admin-panel-button"
              onClick={() =>
                navigate("/admin")
              }
            >

              <span className="admin-panel-icon">

                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >

                  <rect
                    x="4"
                    y="4"
                    width="16"
                    height="16"
                    rx="4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />

                  <path
                    d="M8 9h3M13 9h3M8 13h3M13 13h3M8 17h3M13 17h3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />

                </svg>

              </span>

              <span className="admin-panel-text">

                <strong>
                  Admin Panel
                </strong>

                <small>
                  Control Center
                </small>

              </span>

              <span className="admin-panel-arrow">
                →
              </span>

            </button>
          )}

        </div>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        className="hero"
        style={{
          backgroundImage:
            `url(${heroBackground})`,
        }}
      >

        <div className="hero-overlay"></div>


        <div className="hero-content">

          <div className="eyebrow typing-eyebrow">

            <TypewriterText
              text="FROM THE SOIL OF MAGADH"
              speed={75}
              pause={2200}
              delay={500}
            />

            <i></i>

          </div>


          <h1 className="typing-heading">

            <TypewriterText
              text="Pure by Nature."
              speed={100}
              pause={2500}
              delay={900}
            />

            <br />

            <strong>

              <TypewriterText
                text="Desi by Heart."
                speed={100}
                pause={2500}
                delay={1200}
              />

            </strong>

          </h1>


          <p className="hero-description">

            Premium Kachi Ghani mustard oil crafted

            <br className="desktop-break" />

            with the richness of Bihar's soil, for healthier

            <br className="desktop-break" />

            and happier homes.

          </p>


          <div className="buttons">

            <button
              className="primary"
              type="button"
              onClick={() =>
                navigate("/products")
              }
            >
              Shop Now
              <span>→</span>
            </button>


            <button
              className="secondary"
              type="button"
              onClick={scrollToStory}
            >
              Explore MAGADH Org
            </button>

          </div>


          <div className="hero-features">

            <div className="hero-feature">

              <div className="feature-icon">

                <svg
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >

                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#eee5d2"
                    strokeWidth="2"
                    opacity="0.9"
                  />

                  <path
                    d="M50 18 C50 18 30 43 30 58 C30 70 39 78 50 78 C61 78 70 70 70 58 C70 43 50 18 50 18Z"
                    fill="none"
                    stroke="#eee5d2"
                    strokeWidth="3"
                  />

                  <path
                    d="M30 72 C20 65 15 57 17 49 C27 51 35 58 37 68"
                    fill="none"
                    stroke="#eee5d2"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  <path
                    d="M70 72 C80 65 85 57 83 49 C73 51 65 58 63 68"
                    fill="none"
                    stroke="#eee5d2"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  <path
                    d="M50 31 C45 40 42 46 42 52"
                    fill="none"
                    stroke="#fff8e8"
                    strokeWidth="2"
                    opacity="0.8"
                    strokeLinecap="round"
                  />

                </svg>

              </div>

              <div>
                <b>
                  100% PURE MUSTARD OIL
                </b>

                <small>
                  Pure &amp; Authentic
                </small>
              </div>

            </div>


            <div className="hero-feature">

              <div className="feature-icon">

                <svg
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >

                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#eee5d2"
                    strokeWidth="2"
                    opacity="0.9"
                  />

                  <ellipse
                    cx="50"
                    cy="69"
                    rx="24"
                    ry="8"
                    fill="none"
                    stroke="#eee5d2"
                    strokeWidth="3"
                  />

                  <path
                    d="M26 68 L30 48 Q50 42 70 48 L74 68"
                    fill="none"
                    stroke="#eee5d2"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M31 48 Q50 55 69 48"
                    fill="none"
                    stroke="#eee5d2"
                    strokeWidth="2"
                  />

                  <path
                    d="M28 31 L73 31"
                    stroke="#eee5d2"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  <path
                    d="M73 31 L73 57"
                    stroke="#eee5d2"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  <path
                    d="M28 31 L38 40"
                    stroke="#eee5d2"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  <path
                    d="M50 57 C50 57 46 63 46 66 C46 69 48 71 50 71 C52 71 54 69 54 66 C54 63 50 57 50 57Z"
                    fill="none"
                    stroke="#f4c84a"
                    strokeWidth="2.5"
                  />

                  <circle
                    cx="39"
                    cy="78"
                    r="2.5"
                    fill="#eee5d2"
                  />

                  <circle
                    cx="45"
                    cy="82"
                    r="2"
                    fill="#eee5d2"
                  />

                  <circle
                    cx="61"
                    cy="80"
                    r="2.5"
                    fill="#eee5d2"
                  />

                </svg>

              </div>

              <div>

                <b>
                  COLD PRESSED
                </b>

                <small>
                  Traditional Goodness
                </small>

              </div>

            </div>


            <div className="hero-feature">

              <div className="feature-icon">

                <svg
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >

                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#eee5d2"
                    strokeWidth="2"
                    opacity="0.9"
                  />

                  <path
                    d="M40 22 L60 22 M44 22 L44 39 L30 65 Q27 73 34 77 Q50 84 66 77 Q73 73 70 65 L56 39 L56 22"
                    fill="none"
                    stroke="#eee5d2"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M34 62 Q50 57 66 62"
                    fill="none"
                    stroke="#eee5d2"
                    strokeWidth="2"
                  />

                  <path
                    d="M28 29 L72 72"
                    stroke="#f4c84a"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  <path
                    d="M65 68 C73 58 82 57 87 59 C84 68 77 74 66 73"
                    fill="none"
                    stroke="#eee5d2"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M68 71 L82 61"
                    stroke="#eee5d2"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                </svg>

              </div>

              <div>

                <b>
                  NO CHEMICALS
                </b>

                <small>
                  NO PRESERVATIVES
                </small>

              </div>

            </div>

          </div>

        </div>


        {/* ===================================================
            FAMILY IMAGE
        =================================================== */}

        <div className="family-image-area">

          <img
            className="family-image"
            src={familyImage}
            alt="MAGADH Org family"
          />

        </div>


        {/* ===================================================
            PRODUCT
            Hidden through CSS on tablet/mobile
        =================================================== */}

        <div className="product-area">

          <div className="product-glow"></div>

          <img
            className="product"
            src={productImage}
            alt="MAGADH Org Kachi Ghani Mustard Oil"
          />

        </div>

      </section>


      {/* =====================================================
          JOURNEY OF PURITY
      ===================================================== */}

      <section className="magadh-journey">

        <div className="magadh-journey-header">

          <div className="magadh-journey-eyebrow">
            🌿 MAGADH Org — From Seed to Your Kitchen
          </div>

          <h2>
            THE JOURNEY OF <span>PURITY</span>
          </h2>

          <p className="magadh-journey-intro">
            From carefully selected mustard seeds to every bottle
            of MAGADH Org.
          </p>

          <p className="magadh-journey-question">
            “Aap jo khaate hain, uski journey aapse chhupi kyun rahe?”
          </p>

        </div>


        <div className="magadh-journey-timeline">

          <div className="magadh-journey-path">

            <div className="magadh-journey-path-base"></div>

            <div className="magadh-journey-path-glow"></div>

            <div
              className="magadh-journey-path-light"
              style={{
                transform:
                  `translateX(-50%) translateY(${
                    journeyLight * 100
                  }%)`,
              }}
            ></div>

          </div>


          {journeySteps.map(
            (step, index) => (
              <JourneyStep
                key={step.number}
                step={step}
                index={index}
              />
            )
          )}


          <article className="magadh-journey-step magadh-journey-step-right magadh-journey-final">

            <div className="magadh-journey-marker">
              06
            </div>

            <div className="magadh-journey-content">

              <div className="magadh-journey-step-label">
                STEP 06
              </div>

              <h3>
                Scan. Watch. Know.
              </h3>

              <h4>
                Your Bottle Has a Story.
              </h4>

              <p className="magadh-journey-description">
                Every MAGADH Org bottle carries a unique QR code.
              </p>

              <p className="magadh-journey-description">
                Scan the QR code on your bottle and watch the MAGADH
                Org production journey — from mustard seeds to the
                bottle in your hands.
              </p>


              <div className="magadh-journey-qr">

                <div className="magadh-journey-qr-icon">
                  QR
                </div>

                <div>

                  <strong>
                    🎥 See the Journey Behind Your Bottle
                  </strong>

                  <span>
                    Scan. Watch. Know.
                  </span>

                </div>

              </div>


              <p className="magadh-journey-quote">
                “We believe you shouldn’t have to simply trust us.
                You should be able to see it for yourself.”
              </p>


              <div className="magadh-journey-transparency">

                <span>
                  100% Transparency
                </span>

                <p>
                  Know where it begins.
                </p>

                <p>
                  Know how it’s made.
                </p>

                <p>
                  Know what reaches your kitchen.
                </p>

              </div>

            </div>

          </article>

        </div>

      </section>


      {/* =====================================================
          FINAL BRAND MESSAGE
      ===================================================== */}

      <section className="benefits">

        <div className="benefit benefit-message">

          <p className="benefit-main">
            𝑨𝒑𝒏𝒐 𝒔𝒆 𝒑𝒚𝒂𝒂𝒓 𝒉𝒂𝒊…<br />
            𝒕𝒐𝒉 𝒖𝒏𝒌𝒆 𝒍𝒊𝒚𝒆 𝒔𝒊𝒓𝒇 𝒌𝒉𝒂𝒂𝒏𝒂 𝒏𝒂𝒉𝒊,<br />
            𝒌𝒖𝒄𝒉𝒉 𝒃𝒆𝒉𝒕𝒂𝒓 𝒄𝒉𝒖𝒏𝒊𝒚𝒆.
          </p>

          <h2 className="benefit-brand">
            <br />
            MAGADH Ｏrｇ
          </h2>

          <h3 className="benefit-product">
            𝑲𝒂𝒄𝒉𝒊 𝑮𝒉𝒂𝒏𝒊 𝑴𝒖𝒔𝒕𝒂𝒓𝒅 𝑶𝒊𝒍
          </h3>

          <div className="benefit-line">
            ＲＯＯＴＥＤ ＩＮ ＢＩＨＡＲ．
          </div>

          <div className="benefit-family">
            <br />
            𝑴𝒂𝒅𝒆 𝒇𝒐𝒓 𝒀𝒐𝒖𝒓 𝑭𝒂𝒎𝒊𝒍𝒚．
          </div>

          <p className="benefit-ending">
            𝑯𝒂𝒓 𝒃𝒐𝒐𝒏𝒅 𝒎𝒆𝒊𝒏 𝒔𝒉𝒖𝒅𝒅𝒉𝒕𝒂,<br />
            𝒉𝒂𝒓 𝒏𝒊𝒘𝒂𝒍𝒆 𝒎𝒆𝒊𝒏 𝒂𝒑𝒏𝒐 𝒌𝒂 𝒌𝒉𝒂𝒚𝒂𝒂𝒍.
          </p>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "22px 20px",
          boxSizing: "border-box",
          gap: "6px",
          fontSize: "13px",
          letterSpacing: "0.3px",
          color: "#756d61",
          background: "#f8f4eb",
        }}
      >

        <span>
          © 2026 MAGADH Org · Developed by
        </span>

        <a
          href="https://www.linkedin.com/in/ujjawal-kumar-66141b251/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#756d61",
            textDecoration: "none",
            fontWeight: "600",
            transition: "opacity 0.2s ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.opacity = "0.7";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.opacity = "1";
          }}
        >

          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="LinkedIn"
            role="img"
          >

            <rect
              x="1"
              y="1"
              width="22"
              height="22"
              rx="4"
              fill="#0A66C2"
            />

            <path
              d="M7 9.5V17"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <circle
              cx="7"
              cy="6.8"
              r="1.1"
              fill="white"
            />

            <path
              d="M11 17V9.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />

            <path
              d="M11 13.2C11 11.1 12.2 9.5 14.3 9.5C16.5 9.5 17.5 11 17.5 13.5V17"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />

          </svg>

          <span>
            Ujjawal Kumar
          </span>

        </a>

      </footer>

    </main>
  );
}

export default Home;