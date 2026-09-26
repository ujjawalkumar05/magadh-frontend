import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WhyUs.css";

import whyUsAd from "../assets/why-us-ad.png";
import whyStoryCooking from "../assets/why-story-cooking.png";
import whyFarmerSeeds from "../assets/why-farmer-seeds.png";
import whySeedProcess from "../assets/why-seed-process.png";
import whyLabTesting from "../assets/why-lab-testing.png";
import whyHygiene from "../assets/why-hygiene.png";
import whyPackaging from "../assets/why-packaging.png";
import whyMustardDecoration from "../assets/why-mustard-decoration.png";

/* NEW PROCESS IMAGES */
import cleaningImage from "../assets/cleaning.png";
import pressedMachineImage from "../assets/pressed-machine.png";
import filterImage from "../assets/filter.png";
import storageImage from "../assets/storage.png";

function WhyUs() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const processSteps = [
    {
      icon: "🌱",
      label: "DIRECT FROM FARMERS",
      title: "We Start With the Right Seeds.",
      text:
        "We source mustard seeds directly from farmers. Every lot is checked for quality before we buy it.",
      image: whyFarmerSeeds,
    },
    {
      icon: "◌",
      label: "CLEANING",
      title: "Clean Seeds. Clean Start.",
      text:
        "The mustard seeds are cleaned using machines to remove unwanted particles before processing.",
      image: cleaningImage,
    },
    {
      icon: "◉",
      label: "ONE-TIME PRESSING",
      title: "Pressed Once. At Room Temperature.",
      text:
        "Clean mustard seeds are mechanically crushed once at room temperature. We use the oil obtained from this first pressing.",
      image: pressedMachineImage,
    },
    {
      icon: "◍",
      label: "24-LAYER FILTRATION",
      title: "Carefully Filtered.",
      text:
        "The oil passes through a 24-layer plate filtration system before it moves to storage.",
      image: filterImage,
    },
    {
      icon: "◇",
      label: "STAINLESS-STEEL STORAGE",
      title: "Stored With Care.",
      text:
        "After filtration, the oil is stored in stainless-steel tanks before bottling.",
      image: storageImage,
    },
    {
      icon: "✓",
      label: "BATCH TESTING",
      title: "Every Batch Is Checked.",
      text:
        "Every batch goes through laboratory testing before it is packed.",
      image: whyLabTesting,
    },
    {
      icon: "◇",
      label: "FINAL PACKAGING",
      title: "Sealed For Your Safety.",
      text:
        "The oil is filled into premium food-grade bottles and sealed with tamper-proof Shrink Bands.",
      image: whyPackaging,
    },
  ];

  const qualityTests = [
    {
      title: "FSSAI LICENSE",
      text: "Licensed food business compliance.",
    },
    {
      title: "REFRACTIVE INDEX & IODINE VALUE TEST",
      text: "Batch-level laboratory analysis.",
    },
    {
      title: "ARGEMONE OIL TEST",
      text: "Laboratory testing for every batch.",
    },
    {
      title: "ALLYL ISOTHIOCYANATE CONTENT TEST",
      text: "Part of our laboratory batch analysis.",
    },
    {
      title: "NABL LAB ANALYSIS",
      text: "Independent laboratory analysis.",
    },
    {
      title: "BATCH TESTING",
      text: "Every batch is checked before packing.",
    },
  ];

  return (
    <main className="why-magadh-page">

      {/* NAVBAR */}

      <header className="why-magadh-navbar">

        <button
          type="button"
          className="why-magadh-brand"
          onClick={() => navigate("/")}
        >
          <span className="why-magadh-brand-mark">
            M
          </span>

          <span className="why-magadh-brand-info">
            <strong>MAGADH Org</strong>
            <small>PURE BY NATURE. DESI BY HEART.</small>
          </span>
        </button>

        <nav className="why-magadh-nav">

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
            className="active"
          >
            Why Us
          </button>

          <button
            type="button"
            onClick={() => navigate("/contact")}
          >
            Contact
          </button>

        </nav>

        <button
          type="button"
          className="why-magadh-back"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

      </header>


      {/* TOP ADVERTISEMENT */}

      <section className="why-magadh-ad">

        <img
          src={whyUsAd}
          alt="MAGADH Org Mustard Oil"
          className="why-magadh-ad-image"
          fetchPriority="high"
          decoding="async"
        />

      </section>


      {/* INTRO */}

      <section className="why-magadh-intro">

        <div className="why-magadh-container">

          <div className="why-magadh-intro-grid">

            <div>

              <span className="why-magadh-mini-kicker">
                ROOTED IN BIHAR
              </span>

              <h1>
                Why MAGADH Org?
              </h1>

              <div className="why-magadh-gold-line"></div>

            </div>

            <div className="why-magadh-intro-copy">

              <p className="lead">
                Pure oil. Honest process. No compromise on purity.
              </p>

              <p>
                From the seed to your kitchen, we believe you
                deserve to know what goes into the oil you bring home.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* OUR STORY */}

      <section className="why-magadh-story">

        <div className="why-magadh-container">

          <div className="why-magadh-story-grid">

            <div className="why-magadh-story-heading">

              <img
                src={whyStoryCooking}
                alt="Students cooking together"
                className="why-magadh-story-image"
                loading="lazy"
                decoding="async"
              />

              <div className="why-magadh-story-overlay"></div>

              <div className="why-magadh-story-title">

                <span>
                  WHERE IT BEGAN
                </span>

                <h2>
                  It started with
                  <strong> a simple problem.</strong>
                </h2>

              </div>

            </div>

            <div className="why-magadh-story-copy">

              <span className="why-magadh-content-kicker">
                FROM A COLLEGE KITCHEN
              </span>

              <p className="large">
                We were engineering students living together
                in a flat during college.
              </p>

              <p>
                Like many students, we cooked our own food.
                But finding genuinely pure mustard oil at a
                reasonable price was difficult.
              </p>

              <p>
                That made us ask a simple question:
              </p>

              <blockquote>
                “Why should people have to choose between
                purity and price?”
              </blockquote>

              <p>
                That question became the beginning of MAGADH Org.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* CORE PROMISE */}

      <section className="why-magadh-promise">

        <div className="why-magadh-container">

          <div className="why-magadh-standard-header">

            <div>

              <span className="why-magadh-content-kicker">
                SIMPLE. HONEST. PURE.
              </span>

              <h2>
                Purity should never be compromised.
              </h2>

            </div>

            <p>
              We created MAGADH with one simple belief:
              <strong> purity should never be compromised.</strong>
            </p>

          </div>

          <div className="why-magadh-promise-cards">

            {/* NO PRESERVATIVES */}

            <article>

              <div className="why-magadh-promise-icon">
                <svg
                  viewBox="0 0 64 64"
                  aria-hidden="true"
                >
                  <path
                    d="M25 9h14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <path
                    d="M28 9v10l-11 20a10 10 0 0 0 9 14h12a10 10 0 0 0 9-14L36 19V9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M21 37h22"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <path
                    d="M14 14l36 36"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h3>
                NO PRESERVATIVES
              </h3>

              <p>
                No preservatives are added to our mustard oil.
              </p>

            </article>


            {/* NO ADDED OIL */}

            <article>

              <div className="why-magadh-promise-icon">
                <svg
                  viewBox="0 0 64 64"
                  aria-hidden="true"
                >
                  <path
                    d="M32 7C32 7 17 25 17 37a15 15 0 0 0 30 0C47 25 32 7 32 7Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M15 15l34 34"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h3>
                NO ADDED OIL
              </h3>

              <p>
                We do not mix other edible oils into our mustard oil.
              </p>

            </article>


            {/* NO COMPROMISE */}

            <article>

              <div className="why-magadh-promise-icon">
                <svg
                  viewBox="0 0 64 64"
                  aria-hidden="true"
                >
                  <path
                    d="M32 6l21 8v16c0 14-9 23-21 28C20 53 11 44 11 30V14l21-8Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M21 32l7 7 15-16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h3>
                NO COMPROMISE
              </h3>

              <p>
                Our commitment to purity does not change for any reason.
              </p>

            </article>

          </div>

        </div>

      </section>


      {/* SEED TO BOTTLE */}

      <section className="why-magadh-process">

        <div className="why-magadh-container">

          <div className="why-magadh-standard-header">

            <div>

              <span className="why-magadh-content-kicker">
                OUR PROCESS
              </span>

              <h2>
                See how your oil is made.
              </h2>

            </div>

            <p>
              We believe you deserve to know what goes into
              the product you bring home.
            </p>

          </div>


          <div className="why-magadh-process-feature">

            <div className="why-magadh-process-feature-image">

              <img
                src={whySeedProcess}
                alt="Mustard seed processing"
                loading="lazy"
                decoding="async"
              />

            </div>

            <div className="why-magadh-process-feature-copy">

              <span>
                FROM SEED TO OIL
              </span>

              <h3>
                Carefully handled at every stage.
              </h3>

              <p>
                From sourcing the right mustard seeds to
                pressing, filtration, storage and final packing,
                every stage is part of our process.
              </p>

            </div>

          </div>


          <div className="why-magadh-process-list">

            {processSteps.map((step) => (

              <article
                className="why-magadh-process-step"
                key={step.label}
              >

                <div className="why-magadh-process-icon">
                  {step.icon}
                </div>

                <div className="why-magadh-process-content">

                  <span>
                    {step.label}
                  </span>

                  <h3>
                    {step.title}
                  </h3>

                  <p>
                    {step.text}
                  </p>

                </div>

                {step.image && (
                  <div className="why-magadh-process-thumb">

                    <img
                      src={step.image}
                      alt={step.title}
                      loading="lazy"
                      decoding="async"
                    />

                  </div>
                )}

              </article>

            ))}

          </div>

        </div>

      </section>


      {/* TRANSPARENCY */}

      <section className="why-magadh-transparency">

        <div className="why-magadh-container">

          <div className="why-magadh-transparency-grid">

            <div className="why-magadh-standard-header">

              <div>

                <span className="why-magadh-content-kicker">
                  SEE THE JOURNEY
                </span>

                <h2>
                  Why hide the process?
                </h2>

              </div>

              <div>

                <p className="lead">
                  You are buying the oil.
                  <br />
                  You deserve to see how it is made.
                </p>

                <p>
                  Scan the QR code on the back of your MAGADH Org bottle
                  and watch the production journey — from seed extraction
                  to tamper-proof packing.
                </p>

              </div>

            </div>

            <div className="why-magadh-qr-visual">

              <div className="why-magadh-qr-frame">

                <div className="why-magadh-qr-corner top-left"></div>
                <div className="why-magadh-qr-corner top-right"></div>
                <div className="why-magadh-qr-corner bottom-left"></div>
                <div className="why-magadh-qr-corner bottom-right"></div>

                <div className="why-magadh-qr-placeholder">
                  QR
                </div>

                <span>
                  SCAN TO SEE
                  <br />
                  THE JOURNEY
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* QUALITY */}

      <section className="why-magadh-quality">

        <div className="why-magadh-container">

          <div className="why-magadh-quality-intro">

            <div className="why-magadh-standard-header">

              <div>

                <span className="why-magadh-content-kicker">
                  LABORATORY TESTING
                </span>

                <h2>
                  We don't ask you to just trust us.
                </h2>

              </div>

              <p>
                Every batch goes through laboratory testing
                before it reaches you.
              </p>

            </div>

            <div className="why-magadh-quality-image">

              <img
                src={whyLabTesting}
                alt="MAGADH Org laboratory testing"
                loading="lazy"
                decoding="async"
              />

            </div>

          </div>


          <div className="why-magadh-certificates">

            {qualityTests.map((test) => (

              <article key={test.title}>

                <h3>
                  {test.title}
                </h3>

                <p>
                  {test.text}
                </p>

              </article>

            ))}

          </div>


          <button
            type="button"
            className="why-magadh-certification-button"
            onClick={() => navigate("/certification")}
          >
            VIEW OUR CERTIFICATES
            <span>→</span>
          </button>

        </div>

      </section>


      {/* HYGIENE */}

      <section className="why-magadh-hygiene">

        <div className="why-magadh-container">

          <div className="why-magadh-hygiene-feature">

            <div className="why-magadh-hygiene-image">

              <img
                src={whyHygiene}
                alt="MAGADH Org hygiene practices"
                loading="lazy"
                decoding="async"
              />

            </div>

            <div className="why-magadh-hygiene-copy">

              <span className="why-magadh-content-kicker">
                CARE IN EVERY STEP
              </span>

              <h2>
                Care from seed to bottle.
              </h2>

              <p>
                Purity is not only about the oil.
                It is also about how the oil is handled.
              </p>

            </div>

          </div>


          <div className="why-magadh-hygiene-grid">

            <article>

              <h3>
                HYGIENE FIRST
              </h3>

              <p>
                Workers use gloves and hairnets during production.
              </p>

            </article>

            <article>

              <h3>
                CLEAN PRODUCTION AREA
              </h3>

              <p>
                Our production area is regularly maintained
                and sanitized.
              </p>

            </article>

            <article>

              <h3>
                REGULAR MACHINE CLEANING
              </h3>

              <p>
                Production machines are cleaned regularly.
              </p>

            </article>

            <article>

              <h3>
                CONTROLLED ENTRY
              </h3>

              <p>
                Visitors must also follow hygiene requirements
                before entering the production area.
              </p>

            </article>

          </div>

        </div>

      </section>


      {/* TAMPER PROOF / PACKAGING */}

      <section className="why-magadh-tamper">

        <div className="why-magadh-container">

          <div className="why-magadh-tamper-grid">

            <div className="why-magadh-tamper-copy">

              <span className="why-magadh-content-kicker">
                SEALED FOR YOUR SAFETY
              </span>

              <h2>
                Check before you open.
              </h2>

              <p>
                Every bottle is sealed with a tamper-proof
                Shrink Band.
              </p>

              <strong>
                BROKEN SEAL?
                <br />
                DON'T ACCEPT THE PRODUCT.
              </strong>

              <p className="small">
                If the Shrink Band is broken or damaged,
                you can refuse to accept the product.
              </p>

            </div>

            <div className="why-magadh-packaging-visual">

              <img
                src={whyPackaging}
                alt="MAGADH Org mustard oil bottle"
                loading="lazy"
                decoding="async"
              />

              <div className="why-magadh-packaging-badge">

                <span>✓</span>

                TAMPER
                <br />
                PROOF

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* DIFFERENCE */}

      <section className="why-magadh-difference">

        <div className="why-magadh-container">

          <div className="why-magadh-standard-header">

            <div>

              <span className="why-magadh-content-kicker">
                WHY MAGADH
              </span>

              <h2>
                What makes MAGADH Org different?
              </h2>

            </div>

          </div>


          <div className="why-magadh-difference-grid">

            <article>

              <div>PURE</div>

              <h3>
                PURE AT HEART
              </h3>

              <p>
                We believe purity should never be compromised.
              </p>

            </article>

            <article>

              <div>CARE</div>

              <h3>
                CAREFULLY HANDLED
              </h3>

              <p>
                Hygiene is maintained from seed to final packing.
              </p>

            </article>

            <article>

              <div>OPEN</div>

              <h3>
                FULLY TRANSPARENT
              </h3>

              <p>
                Scan the QR code and see how your oil is made.
              </p>

            </article>

            <article>

              <div>FAIR</div>

              <h3>
                GENUINE PRICING
              </h3>

              <p>
                We want pure mustard oil to be accessible,
                not a luxury.
              </p>

            </article>

          </div>

        </div>

      </section>


      {/* CORE BELIEF */}

      <section className="why-magadh-belief">

        <div className="why-magadh-container">

          <div className="why-magadh-belief-inner">

            <span>
              THE MAGADH ORG BELIEF
            </span>

            <h2>
              Purity should not be a <em>luxury.</em>
            </h2>

            <p>
              We believe people should not have to pay a premium
              just to get something pure.
            </p>

            <div className="why-magadh-belief-line"></div>

          </div>

        </div>

      </section>


      {/* VISION */}

      <section className="why-magadh-vision">

        <div className="why-magadh-container">

          <div className="why-magadh-vision-grid">

            <div className="why-magadh-vision-copy">

              <span className="why-magadh-content-kicker">
                LOOKING AHEAD
              </span>

              <h2>
                A pure revolution.
              </h2>

              <p>
                Our vision is simple:
                <br />
                to bring pure oil to every Indian kitchen
                and build a culture where choosing pure becomes a habit.
              </p>

            </div>

            <div className="why-magadh-vision-decoration">

              <img
                src={whyMustardDecoration}
                alt=""
                loading="lazy"
                decoding="async"
              />

            </div>

          </div>

          <div className="why-magadh-vision-main">
            FROM ONE KITCHEN
            <span> TO EVERY KITCHEN.</span>
          </div>

          <strong>
            PURE KI KRANTI.
          </strong>

        </div>

      </section>


      {/* FINAL CTA */}

      <section className="why-magadh-final">

        <div className="why-magadh-container">

          <span>
            KNOW WHAT YOU EAT.
          </span>

          <h2>
            Know what you buy.
          </h2>

          <p>
            Choose purity.
            <br />
            Choose transparency.
            <br />
            Choose MAGADH Org.
          </p>

          <button
            type="button"
            onClick={() => navigate("/products")}
          >
            EXPLORE OUR OILS
            <span>→</span>
          </button>

        </div>

      </section>


      {/* FOOTER */}

      <footer className="why-magadh-footer">

        <div>

          <strong>
            MAGADH Org
          </strong>

          <span>
            PURE BY NATURE. DESI BY HEART.
          </span>

        </div>

        <p>
          Rooted in Bihar. Made for every Indian kitchen.
        </p>

      </footer>

    </main>
  );
}

export default WhyUs;