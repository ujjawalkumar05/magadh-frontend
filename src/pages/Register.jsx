import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handlePhoneChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setFormData((previous) => ({
      ...previous,
      phone: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const gender = formData.gender;
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!name) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!phone) {
      setError("Please enter your mobile number.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!gender) {
      setError("Please select your gender.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${BACKEND_URL}/api/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            phone,
            gender,
            password,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.message ||
          data?.error ||
          "Registration failed. Please try again.";

        setError(message);
        return;
      }

      /*
        Keep the registered user information locally
        so Profile can immediately display it.
      */
      const registeredUser = {
        ...(data?.user || data || {}),
        name,
        email,
        phone,
        gender,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(registeredUser)
      );

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">

      <div className="register-background"></div>

      <header className="register-navbar">

        <button
          type="button"
          className="register-brand"
          onClick={() => navigate("/")}
        >

          <span className="register-brand-symbol">
            M
          </span>

          <span className="register-brand-text">

            <strong>
              MAGADH Org
            </strong>

            <small>
              PURE BY NATURE • DESI BY HEART
            </small>

          </span>

        </button>

        <button
          type="button"
          className="register-home-button"
          onClick={() => navigate("/")}
        >
          Home
        </button>

      </header>


      <section className="register-wrapper">

        <div className="register-card">

          <div className="register-card-header">

            <span className="register-kicker">
              WELCOME TO MAGADH
            </span>

            <h1>
              Create Your Account
            </h1>

            <p>
              Create your MAGADH Org account and keep
              your personal information ready for a
              smoother shopping experience.
            </p>

          </div>


          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            {/* FULL NAME */}

            <div className="register-field register-full">

              <label htmlFor="name">
                Full Name
                <span>*</span>
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />

            </div>


            {/* EMAIL */}

            <div className="register-field">

              <label htmlFor="email">
                Email Address
                <span>*</span>
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                autoComplete="email"
              />

            </div>


            {/* MOBILE */}

            <div className="register-field">

              <label htmlFor="phone">
                Mobile Number
                <span>*</span>
              </label>

              <div className="register-phone-input">

                <span>
                  +91
                </span>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  autoComplete="tel"
                />

              </div>

            </div>


            {/* GENDER */}

            <div className="register-field register-full">

              <label>
                Gender
                <span>*</span>
              </label>

              <div className="register-gender-options">

                <label
                  className={`register-gender-option ${
                    formData.gender === "MALE"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="gender"
                    value="MALE"
                    checked={
                      formData.gender === "MALE"
                    }
                    onChange={handleChange}
                  />

                  <span className="register-radio"></span>

                  <span>
                    Male
                  </span>

                </label>


                <label
                  className={`register-gender-option ${
                    formData.gender === "FEMALE"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="gender"
                    value="FEMALE"
                    checked={
                      formData.gender === "FEMALE"
                    }
                    onChange={handleChange}
                  />

                  <span className="register-radio"></span>

                  <span>
                    Female
                  </span>

                </label>


                <label
                  className={`register-gender-option ${
                    formData.gender === "OTHER"
                      ? "selected"
                      : ""
                  }`}
                >

                  <input
                    type="radio"
                    name="gender"
                    value="OTHER"
                    checked={
                      formData.gender === "OTHER"
                    }
                    onChange={handleChange}
                  />

                  <span className="register-radio"></span>

                  <span>
                    Other
                  </span>

                </label>

              </div>

            </div>


            {/* PASSWORD */}

            <div className="register-field">

              <label htmlFor="password">
                Password
                <span>*</span>
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                autoComplete="new-password"
              />

            </div>


            {/* CONFIRM PASSWORD */}

            <div className="register-field">

              <label htmlFor="confirmPassword">
                Confirm Password
                <span>*</span>
              </label>

              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />

            </div>


            {error && (

              <div className="register-message register-error">
                {error}
              </div>

            )}


            {success && (

              <div className="register-message register-success">
                {success}
              </div>

            )}


            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="register-spinner"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  CREATE ACCOUNT
                  <span>→</span>
                </>
              )}

            </button>


            <div className="register-security">

              <span>
                ✓
              </span>

              <p>
                Your account information is kept secure.
              </p>

            </div>

          </form>


          <div className="register-login">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}

export default Register;