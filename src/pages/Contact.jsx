import { useNavigate } from "react-router-dom";
import "./Contact.css";

function Contact() {
  const navigate = useNavigate();

  const email = "magadhorganic@gmail.com";
  const phone = "+917061518428";
  const displayPhone = "+91 70615 18428";

  const openEmail = () => {
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${email}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const callPhone = () => {
    window.location.href = `tel:${phone}`;
  };

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${phone}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <main className="contact-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="contact-navbar">

        <button
          type="button"
          className="contact-brand"
          onClick={() => navigate("/")}
        >
          <span className="contact-brand-mark">
            M
          </span>

          <span className="contact-brand-copy">
            <strong>
              MAGADH <span>Org</span>
            </strong>

            <small>
              PURE BY NATURE. DESI BY HEART.
            </small>
          </span>
        </button>


        <nav className="contact-navigation">

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            Products
          </button>

          <button
            type="button"
            onClick={() => navigate("/why-us")}
          >
            Why Us
          </button>

          <button
            type="button"
            className="contact-nav-active"
          >
            Contact
          </button>

        </nav>


        <button
          type="button"
          className="contact-back-home"
          onClick={() => navigate("/")}
        >
          Back to Home
          <span>→</span>
        </button>

      </header>


      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="contact-hero">

        <div className="contact-hero-orb contact-orb-one"></div>
        <div className="contact-hero-orb contact-orb-two"></div>


        <div className="contact-hero-layout">

          {/* =================================================
              HERO LEFT
          ================================================= */}

          <div className="contact-hero-content">

            <div className="contact-kicker">
              <span></span>
              MAGADH ORG
              <span></span>
            </div>

            <p className="contact-hero-overline">
              LET'S CONNECT
            </p>

            <h1>
              We're here
              <br />
              <em>to listen.</em>
            </h1>

            <p className="contact-hero-description">
              Have a question about our mustard oil?
              Need help with an order?
              Or simply want to know more about MAGADH Org?
            </p>


            <div className="contact-hero-actions">

              <button
                type="button"
                className="contact-primary-button"
                onClick={openWhatsApp}
              >
                Start a Conversation
                <span>↗</span>
              </button>

              <button
                type="button"
                className="contact-secondary-button"
                onClick={openEmail}
              >
                Email Us
                <span>→</span>
              </button>

            </div>

          </div>


          {/* =================================================
              CORPORATE OFFICE
          ================================================= */}

          <div className="contact-corporate-card">

            <div className="contact-corporate-heading">

              <div className="contact-corporate-icon">
                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <path
                    d="M16 28C16 28 25 19.7 25 12.5C25 7.8 21 4 16 4C11 4 7 7.8 7 12.5C7 19.7 16 28 16 28Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />

                  <circle
                    cx="16"
                    cy="12.5"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
              </div>

              <div>
                <span>
                  CORPORATE OFFICE
                </span>

                <h2>
                  Headquarters
                </h2>
              </div>

            </div>


            {/* ADDRESS */}

            <div className="contact-corporate-detail">

              <div className="contact-corporate-detail-icon">

                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <path
                    d="M16 4V28"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />

                  <path
                    d="M8 10H24"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />

                  <path
                    d="M10 10V24"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />

                  <path
                    d="M22 10V24"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />

                  <path
                    d="M7 24H25"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>

              </div>

              <div>

                <small>
                  OFFICE
                </small>

                <strong>
                  Magadh Organic
                </strong>

                <p>
                  #SH90, Dighwa Dubauli,
                  <br />
                  Gopalganj, Bihar - 841409
                </p>

              </div>

            </div>


            {/* PHONE */}

            <button
              type="button"
              className="contact-corporate-detail contact-corporate-button"
              onClick={callPhone}
            >

              <div className="contact-corporate-detail-icon">

                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <path
                    d="M9 5.5L12 5L15 12L12 14C13.5 17.2 16.7 20.5 20 22L22 19L29 22L28.5 25C28.2 26.8 26.5 28 24.7 27.7C14.5 26.2 5.8 17.5 4.3 7.3C4 5.5 5.2 3.8 7 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </div>

              <div>

                <small>
                  REACH US
                </small>

                <strong>
                  {displayPhone}
                </strong>

              </div>

              <span className="contact-corporate-arrow">
                ↗
              </span>

            </button>


            {/* EMAIL */}

            <button
              type="button"
              className="contact-corporate-detail contact-corporate-button"
              onClick={openEmail}
            >

              <div className="contact-corporate-detail-icon">

                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <rect
                    x="4"
                    y="7"
                    width="24"
                    height="18"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />

                  <path
                    d="M5 9L16 17L27 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </div>

              <div>

                <small>
                  EMAIL
                </small>

                <strong>
                  {email}
                </strong>

              </div>

              <span className="contact-corporate-arrow">
                ↗
              </span>

            </button>

          </div>

        </div>


        <div className="contact-hero-bottom">

          <span>
            ROOTED IN BIHAR
          </span>

          <div className="contact-hero-line"></div>

          <span>
            MADE FOR EVERY INDIAN KITCHEN
          </span>

        </div>

      </section>


      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="contact-intro">

        <div className="contact-container">

          <div className="contact-intro-label">
            CONTACT MAGADH ORG
          </div>

          <div className="contact-intro-grid">

            <h2>
              Good conversations
              <br />
              <em>start with reaching out.</em>
            </h2>

            <p>
              We believe customers should always have a simple
              way to reach the people behind the brand. Whether
              you're exploring MAGADH Org for the first time or
              already have an order with us, we're happy to hear
              from you.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          CONTACT OPTIONS
      ===================================================== */}

      <section className="contact-options">

        <div className="contact-container">

          <div className="contact-section-heading">

            <div>
              <span>01</span>
              <p>FIND YOUR WAY</p>
            </div>

            <h2>
              Choose how you'd
              <br />
              like to connect.
            </h2>

          </div>


          <div className="contact-option-grid">


            {/* EMAIL */}

            <button
              type="button"
              className="contact-option"
              onClick={openEmail}
            >

              <div className="contact-option-top">

                <span className="contact-option-number">
                  01
                </span>

                <span className="contact-option-arrow">
                  ↗
                </span>

              </div>


              <div className="contact-option-icon">

                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <rect
                    x="4"
                    y="7"
                    width="24"
                    height="18"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />

                  <path
                    d="M5 9L16 17L27 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </div>


              <div className="contact-option-content">

                <span>EMAIL</span>

                <h3>
                  Write to us.
                </h3>

                <p>
                  Send us your question, feedback
                  or order-related message.
                </p>

                <strong>
                  {email}
                </strong>

              </div>

            </button>


            {/* PHONE */}

            <button
              type="button"
              className="contact-option"
              onClick={callPhone}
            >

              <div className="contact-option-top">

                <span className="contact-option-number">
                  02
                </span>

                <span className="contact-option-arrow">
                  ↗
                </span>

              </div>


              <div className="contact-option-icon">

                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <path
                    d="M9 5.5L12 5L15 12L12 14C13.5 17.2 16.7 20.5 20 22L22 19L29 22L28.5 25C28.2 26.8 26.5 28 24.7 27.7C14.5 26.2 5.8 17.5 4.3 7.3C4 5.5 5.2 3.8 7 3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </div>


              <div className="contact-option-content">

                <span>PHONE</span>

                <h3>
                  Talk to us.
                </h3>

                <p>
                  Prefer a direct conversation?
                  Give our team a call.
                </p>

                <strong>
                  {displayPhone}
                </strong>

              </div>

            </button>


            {/* WHATSAPP */}

            <button
              type="button"
              className="contact-option"
              onClick={openWhatsApp}
            >

              <div className="contact-option-top">

                <span className="contact-option-number">
                  03
                </span>

                <span className="contact-option-arrow">
                  ↗
                </span>

              </div>


              <div className="contact-option-icon">

                <svg
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <path
                    d="M26 15.5C26 21.3 21.3 26 15.5 26C13.7 26 12 25.5 10.5 24.7L6 26L7.4 21.8C6.5 20.2 6 18.4 6 16.5C6 10.7 10.7 6 16.5 6C22.3 6 26 9.7 26 15.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M11.5 12.5C12 15 14.4 17.8 17.2 18.8C18.1 19.1 18.8 18.8 19.4 18.2L20.4 17.2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>

              </div>


              <div className="contact-option-content">

                <span>WHATSAPP</span>

                <h3>
                  Let's chat.
                </h3>

                <p>
                  Start a direct conversation
                  with MAGADH Org.
                </p>

                <strong>
                  Message us directly
                </strong>

              </div>

            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          HELP
      ===================================================== */}

      <section className="contact-help">

        <div className="contact-container">

          <div className="contact-help-header">

            <div>
              <span className="contact-small-label">
                02 — HOW CAN WE HELP?
              </span>

              <h2>
                Whatever brings
                <br />
                <em>you here.</em>
              </h2>
            </div>

            <p>
              You don't need to know exactly who to contact.
              Just choose what you need and reach out.
            </p>

          </div>


          <div className="contact-help-list">


            <div className="contact-help-item">

              <span>01</span>

              <div>
                <h3>
                  Product questions
                </h3>

                <p>
                  Want to understand our mustard oil,
                  available variants or anything about
                  the product before purchasing?
                </p>
              </div>

              <button
                type="button"
                onClick={openWhatsApp}
              >
                Ask us
                <b>↗</b>
              </button>

            </div>


            <div className="contact-help-item">

              <span>02</span>

              <div>
                <h3>
                  Order assistance
                </h3>

                <p>
                  Need help with an order, delivery
                  or something related to your purchase?
                </p>
              </div>

              <button
                type="button"
                onClick={openWhatsApp}
              >
                Get help
                <b>↗</b>
              </button>

            </div>


            <div className="contact-help-item">

              <span>03</span>

              <div>
                <h3>
                  Feedback & ideas
                </h3>

                <p>
                  Have feedback, an idea or simply
                  want to connect with MAGADH Org?
                </p>
              </div>

              <button
                type="button"
                onClick={openEmail}
              >
                Write to us
                <b>↗</b>
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          DIRECT CONTACT
      ===================================================== */}

      <section className="contact-direct">

        <div className="contact-container">

          <div className="contact-direct-card">

            <div className="contact-direct-copy">

              <span>
                REACH MAGADH ORG
              </span>

              <h2>
                We're only
                <br />
                <em>a message away.</em>
              </h2>

              <p>
                For product questions, order assistance,
                feedback or anything else, connect with
                us directly.
              </p>

            </div>


            <div className="contact-direct-details">

              <button
                type="button"
                onClick={openEmail}
              >
                <small>EMAIL</small>
                <strong>{email}</strong>
                <span>↗</span>
              </button>


              <button
                type="button"
                onClick={callPhone}
              >
                <small>PHONE</small>
                <strong>{displayPhone}</strong>
                <span>↗</span>
              </button>


              <button
                type="button"
                onClick={openWhatsApp}
              >
                <small>WHATSAPP</small>
                <strong>Chat with us</strong>
                <span>↗</span>
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          TRUST
      ===================================================== */}

      <section className="contact-trust">

        <div className="contact-container">

          <div className="contact-trust-line"></div>

          <div className="contact-trust-content">

            <div className="contact-trust-mark">
              M
            </div>

            <span>
              OUR APPROACH
            </span>

            <h2>
              A brand is not just
              <br />
              <em>what it sells.</em>
            </h2>

            <p>
              It is also how it listens, how it communicates,
              and how it stands behind the experience it creates.
              That's why we keep our doors open for conversation.
            </p>

          </div>

          <div className="contact-trust-line"></div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="contact-final">

        <div className="contact-final-orb"></div>

        <div className="contact-final-inner">

          <span>
            MAGADH ORG
          </span>

          <h2>
            Have something
            <br />
            <em>to say?</em>
          </h2>

          <p>
            We'd be glad to hear from you.
          </p>


          <div className="contact-final-actions">

            <button
              type="button"
              className="contact-final-primary"
              onClick={openWhatsApp}
            >
              WhatsApp Us
              <span>↗</span>
            </button>

            <button
              type="button"
              className="contact-final-secondary"
              onClick={openEmail}
            >
              Send an Email
              <span>→</span>
            </button>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="contact-footer">

        <div className="contact-footer-brand">

          <strong>
            MAGADH <span>Org</span>
          </strong>

          <p>
            PURE BY NATURE. DESI BY HEART.
          </p>

        </div>


        <div className="contact-footer-links">

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            Products
          </button>

          <button
            type="button"
            onClick={() => navigate("/why-us")}
          >
            Why Us
          </button>

          <button
            type="button"
            onClick={() => navigate("/cart")}
          >
            Cart
          </button>

        </div>


        <p className="contact-footer-copy">
          © {new Date().getFullYear()} MAGADH Org ·{" "}

        </p>

      </footer>

    </main>
  );
}

export default Contact;