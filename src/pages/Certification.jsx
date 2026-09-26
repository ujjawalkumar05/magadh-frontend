import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Certification.css";
import BACKEND_URL from "../config/api";

const CERTIFICATE_CACHE_KEY = "magadh_certificates";

function getCachedCertificates() {
  try {
    const cached = localStorage.getItem(
      CERTIFICATE_CACHE_KEY
    );

    if (!cached) {
      return [];
    }

    const parsed = JSON.parse(cached);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function Certification() {
  const navigate = useNavigate();

  const [certificates, setCertificates] = useState(
    getCachedCertificates
  );

  const [loading, setLoading] = useState(
    getCachedCertificates().length === 0
  );

  const [selectedCertificate, setSelectedCertificate] =
    useState(null);

  const [currentUser, setCurrentUser] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] =
    useState(false);

  /* =========================================================
     CURRENT USER
  ========================================================= */

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("user");

      if (savedUser) {
        setCurrentUser(
          JSON.parse(savedUser)
        );
      }
    } catch {
      setCurrentUser(null);
    }
  }, []);

  /* =========================================================
     ADMIN CHECK
  ========================================================= */

  const userRoles = Array.isArray(
    currentUser?.roles
  )
    ? currentUser.roles
    : currentUser?.role
      ? [currentUser.role]
      : [];

  const isAdmin = userRoles.some(
    (role) =>
      String(role)
        .toUpperCase()
        .replace("ROLE_", "") === "ADMIN"
  );

  /* =========================================================
     LOAD CERTIFICATES
  ========================================================= */

  const loadCertificates = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/certifications`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load certificates"
        );
      }

      const data =
        await response.json();

      const certificateList =
        Array.isArray(data)
          ? data
          : [];

      setCertificates(
        certificateList
      );

      localStorage.setItem(
        CERTIFICATE_CACHE_KEY,
        JSON.stringify(
          certificateList
        )
      );

    } catch (error) {
      console.error(error);

      /*
       * Keep cached certificates if backend
       * is temporarily unavailable.
       */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  /* =========================================================
     PDF FIRST PAGE PREVIEW

     Cloudinary:
     certificate.pdf
             ↓
     certificate.jpg

     Used only for certificate cards.
     Modal uses the actual PDF from backend.
  ========================================================= */

  const getPdfPreviewUrl = (
    fileUrl
  ) => {
    if (!fileUrl) {
      return "";
    }

    if (
      !fileUrl.includes(
        "/image/upload/"
      )
    ) {
      return fileUrl;
    }

    return fileUrl
      .replace(
        "/image/upload/",
        "/image/upload/pg_1,f_jpg,q_auto/"
      )
      .replace(
        /\.pdf(\?.*)?$/i,
        ".jpg$1"
      );
  };

  /* =========================================================
     UPLOAD CERTIFICATE
  ========================================================= */

  const handleUpload = async (
    event
  ) => {
    event.preventDefault();

    if (!pdfFile) {
      alert(
        "Please select a PDF certificate."
      );
      return;
    }

    if (
      pdfFile.type !==
      "application/pdf"
    ) {
      alert(
        "Only PDF files are allowed."
      );
      return;
    }

    if (
      pdfFile.size >
      10 * 1024 * 1024
    ) {
      alert(
        "PDF size must be less than 10MB."
      );
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      alert(
        "Please login again."
      );
      return;
    }

    try {
      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "title",
        title
      );

      formData.append(
        "description",
        description
      );

      formData.append(
        "certificate",
        pdfFile
      );

      const response =
        await fetch(
          `${BACKEND_URL}/api/admin/certifications`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            body: formData,
          }
        );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Certificate upload failed"
        );
      }

      setTitle("");
      setDescription("");
      setPdfFile(null);

      const fileInput =
        document.getElementById(
          "certificate-pdf-input"
        );

      if (fileInput) {
        fileInput.value = "";
      }

      await loadCertificates();

      alert(
        "Certificate uploaded successfully."
      );

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Certificate upload failed."
      );

    } finally {
      setUploading(false);
    }
  };

  /* =========================================================
     DELETE CERTIFICATE
  ========================================================= */

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this certificate?"
      );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      alert(
        "Please login again."
      );
      return;
    }

    try {
      const response =
        await fetch(
          `${BACKEND_URL}/api/admin/certifications/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          message ||
            "Failed to delete certificate"
        );
      }

      if (
        selectedCertificate &&
        selectedCertificate.id === id
      ) {
        setSelectedCertificate(
          null
        );
      }

      await loadCertificates();

      alert(
        "Certificate deleted successfully."
      );

    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Failed to delete certificate."
      );
    }
  };

  /* =========================================================
     VIEW CERTIFICATE
  ========================================================= */

  const openCertificate = (
    certificate
  ) => {
    if (!certificate?.fileUrl) {
      alert(
        "Certificate file is not available."
      );
      return;
    }

    setSelectedCertificate(
      certificate
    );
  };

  /* =========================================================
     CLOSE CERTIFICATE
  ========================================================= */

  const closeCertificate = () => {
    setSelectedCertificate(
      null
    );
  };

  /* =========================================================
     OPEN ORIGINAL PDF
  ========================================================= */

  const openOriginalPdf = (
    certificate
  ) => {
    if (!certificate?.fileUrl) {
      alert(
        "Certificate file is not available."
      );
      return;
    }

    window.open(
      certificate.fileUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =========================================================
     DOWNLOAD CERTIFICATE
  ========================================================= */

  const downloadCertificate = (
    certificate
  ) => {
    if (!certificate?.fileUrl) {
      alert(
        "Certificate file is not available."
      );
      return;
    }

    const downloadUrl =
      certificate.fileUrl.replace(
        "/image/upload/",
        "/image/upload/fl_attachment/"
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      downloadUrl;

    link.download = `${
      certificate.title ||
      "MAGADH-Certificate"
    }.pdf`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );
  };

  return (
    <main className="certification-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="certification-navbar">

        <button
          type="button"
          className="certification-brand"
          onClick={() => navigate("/")}
        >
          <span className="certification-brand-mark">
            M
          </span>

          <span className="certification-brand-info">
            <strong>
              MAGADH Org
            </strong>

            <small>
              PURE BY NATURE. DESI BY HEART.
            </small>
          </span>
        </button>

        <nav className="certification-nav">

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            Home
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            Products
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/why-us")
            }
          >
            Why Us
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/contact")
            }
          >
            Contact
          </button>

          <button
            type="button"
            className="active"
          >
            Certification
          </button>

        </nav>

        <button
          type="button"
          className="certification-back"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="certification-hero">

        <div className="certification-hero-decoration left">
          <span>✦</span>
          <span>❧</span>
          <span>✦</span>
        </div>

        <div className="certification-hero-content">

          <span className="certification-kicker">
            TRUSTED QUALITY
          </span>

          <h1>
            OUR{" "}
            <span>
              CERTIFICATIONS.
            </span>
          </h1>

          <p>
            Real documents. Real transparency.
            Because your family deserves to know
            what goes into their food.
          </p>

          <div className="certification-pillars">

            <div className="certification-pillar">

              <div className="pillar-icon">
                ✓
              </div>

              <div>
                <strong>
                  TESTED
                </strong>

                <span>
                  FOR PURITY
                </span>
              </div>

            </div>

            <div className="certification-pillar">

              <div className="pillar-icon">
                ▤
              </div>

              <div>
                <strong>
                  DOCUMENTED
                </strong>

                <span>
                  RESULTS
                </span>
              </div>

            </div>

            <div className="certification-pillar">

              <div className="pillar-icon">
                ◇
              </div>

              <div>
                <strong>
                  TRANSPARENT
                </strong>

                <span>
                  SOURCING
                </span>
              </div>

            </div>

          </div>

        </div>

        <div className="certification-hero-decoration right">

          <div className="trust-seal">
            <span>
              QUALITY
            </span>

            <strong>
              ✦
            </strong>

            <span>
              YOU CAN TRUST
            </span>
          </div>

        </div>

      </section>

      {/* =====================================================
          CERTIFICATES
      ===================================================== */}

      <section className="certification-records">

        <div className="certification-records-header">

          <div>

            <span className="certification-section-label">
              DOCUMENTED &amp; VERIFIED
            </span>

            <h2>
              QUALITY
              <span>
                {" "}RECORDS
              </span>
            </h2>

          </div>

          <p>
            Tap any certificate to view the
            original document.
          </p>

        </div>

        {loading ? (

          <div className="certification-loading">
            Loading certificates...
          </div>

        ) : certificates.length === 0 ? (

          <div className="certification-empty">

            <div className="certification-empty-icon">
              ✓
            </div>

            <h3>
              Certificates Coming Soon
            </h3>

            <p>
              Our verified quality documents
              will appear here.
            </p>

          </div>

        ) : (

          <div className="certification-grid">

            {certificates.map(
              (certificate) => {

                const previewUrl =
                  getPdfPreviewUrl(
                    certificate.fileUrl
                  );

                return (

                  <article
                    className="certificate-card"
                    key={certificate.id}
                  >

                    {/* =================================================
                        PDF PREVIEW
                    ================================================= */}

                    <div className="certificate-preview">

                      {previewUrl ? (

                        <img
                          src={previewUrl}
                          alt={`${certificate.title} preview`}
                          className="certificate-real-preview"
                          loading="lazy"
                          decoding="async"
                          onError={(event) => {

                            event.currentTarget.style.display =
                              "none";

                            const fallback =
                              event.currentTarget
                                .parentElement
                                ?.querySelector(
                                  ".certificate-preview-empty"
                                );

                            if (fallback) {
                              fallback.style.display =
                                "flex";
                            }

                          }}
                        />

                      ) : null}

                      <div
                        className="certificate-preview-empty"
                        style={{
                          display:
                            previewUrl
                              ? "none"
                              : "flex",
                        }}
                      >
                        PDF DOCUMENT
                      </div>

                      <div className="pdf-badge">

                        <span className="pdf-file-icon">
                          ▱
                        </span>

                        <strong>
                          PDF
                        </strong>

                      </div>

                      <div className="preview-overlay">

                        <span>
                          PDF DOCUMENT
                        </span>

                      </div>

                    </div>

                    {/* =================================================
                        CARD CONTENT
                    ================================================= */}

                    <div className="certificate-card-content">

                      <div className="certificate-status">

                        <span className="status-shield">
                          ✓
                        </span>

                        <span>
                          VERIFIED DOCUMENT
                        </span>

                      </div>

                      <h3>
                        {certificate.title}
                      </h3>

                      <p>
                        {certificate.description ||
                          "MAGADH Org quality certificate and laboratory documentation."}
                      </p>

                    </div>

                    {/* =================================================
                        META
                    ================================================= */}

                    <div className="certificate-meta">

                      <span>
                        <b>▣</b>
                        Official Document
                      </span>

                      <span>
                        <b>▤</b>
                        PDF
                      </span>

                    </div>

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

                    <div className="certificate-card-footer">

                      <button
                        type="button"
                        className="view-certificate-button"
                        onClick={() =>
                          openCertificate(
                            certificate
                          )
                        }
                      >

                        <span className="eye-icon">
                          ◉
                        </span>

                        VIEW CERTIFICATE

                        <span className="arrow">
                          →
                        </span>

                      </button>

                    </div>

                    {/* =================================================
                        ADMIN DELETE
                    ================================================= */}

                    {isAdmin && (

                      <button
                        type="button"
                        className="certificate-delete"
                        onClick={() =>
                          handleDelete(
                            certificate.id
                          )
                        }
                      >
                        DELETE CERTIFICATE
                      </button>

                    )}

                  </article>

                );
              }
            )}

          </div>

        )}

      </section>

      {/* =====================================================
          ADMIN UPLOAD
      ===================================================== */}

      {isAdmin && (

        <section className="certification-admin">

          <div className="certification-admin-inner">

            <span className="certification-section-label">
              ADMIN CONTROL
            </span>

            <h2>
              ADD A
              <span>
                {" "}CERTIFICATE.
              </span>
            </h2>

            <p>
              Only administrators can upload or
              remove certification documents.
            </p>

            <form
              className="certificate-upload-form"
              onSubmit={handleUpload}
            >

              <div className="certificate-form-field">

                <label>
                  Certificate Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Certificate of Analysis — Batch 001"
                  required
                />

              </div>

              <div className="certificate-form-field">

                <label>
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Short description of this certificate..."
                  rows="4"
                />

              </div>

              <div className="certificate-form-field">

                <label>
                  Certificate PDF
                </label>

                <input
                  id="certificate-pdf-input"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) =>
                    setPdfFile(
                      event.target.files?.[0] ||
                        null
                    )
                  }
                  required
                />

                {pdfFile && (

                  <small className="selected-pdf">
                    Selected:{" "}
                    {pdfFile.name}
                  </small>

                )}

              </div>

              <button
                type="submit"
                className="certificate-upload-button"
                disabled={uploading}
              >
                {uploading
                  ? "UPLOADING..."
                  : "UPLOAD CERTIFICATE →"}
              </button>

            </form>

          </div>

        </section>

      )}

      {/* =====================================================
          TRUST SECTION
      ===================================================== */}

      <section className="certification-trust">

        <div className="trust-leaf">
          ❧
        </div>

        <div className="trust-copy">

          <h2>
            Pure Should Be
            <strong>
              {" "}Provable.
            </strong>
          </h2>

          <p>
            From seed selection to laboratory
            testing, we believe transparency
            is part of purity.
          </p>

        </div>

        <div className="trust-final">

          <span>
            EVERY BATCH
          </span>

          <span>
            TESTED · DOCUMENTED · TRANSPARENT
          </span>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="certification-footer">

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

      {/* =====================================================
          CERTIFICATE VIEW MODAL

          IMPORTANT:
          The actual PDF iframe is rendered ONLY after
          the user clicks VIEW CERTIFICATE.
      ===================================================== */}

      {selectedCertificate && (

        <div
          className="certificate-modal"
          onClick={closeCertificate}
        >

          <div
            className="certificate-modal-inner"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="certificate-modal-header">

              <div>

                <span>
                  MAGADH ORG
                </span>

                <strong>
                  {selectedCertificate.title}
                </strong>

              </div>

              <button
                type="button"
                onClick={closeCertificate}
                aria-label="Close certificate"
              >
                ×
              </button>

            </div>

            <div className="certificate-modal-document">

              <iframe
                src={`${BACKEND_URL}/api/certifications/${selectedCertificate.id}/view`}
                title={
                  selectedCertificate.title
                }
                className="certificate-pdf-viewer"
                loading="lazy"
              />

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

export default Certification;