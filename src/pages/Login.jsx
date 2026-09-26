import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config/api";
import "./Login.css";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `${BACKEND_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid email or password"
        );
      }

      const token =
        data.token ||
        data.accessToken ||
        data.jwt;

      if (!token) {
        throw new Error(
          "Login successful but token not received"
        );
      }

      /*
       * =========================================
       * SAVE AUTHENTICATION TOKEN
       * =========================================
       */

      localStorage.setItem("token", token);

      /*
       * =========================================
       * SAVE USER INFORMATION
       * =========================================
       */

      if (data.user) {

        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );

      }

      /*
       * =========================================
       * ROLE BASED LOGIN REDIRECTION
       * =========================================
       *
       * ADMIN
       *   -> Admin Home
       *   -> Admin Panel
       *   -> Admin Dashboard
       *
       * USER
       *   -> Existing Normal MAGADH Store
       *
       * USER FLOW IS NOT CHANGED.
       */

      const userRole =
        data.user?.role ||
        data.user?.roles?.[0] ||
        data.role ||
        "";

      const normalizedRole =
        String(userRole)
          .toUpperCase()
          .replace("ROLE_", "");

      if (normalizedRole === "ADMIN") {

        /*
         * ADMIN DOES NOT GO DIRECTLY TO DASHBOARD.
         *
         * ADMIN FIRST GOES TO ADMIN HOME.
         *
         * From Admin Home:
         * ADMIN PANEL -> /admin
         */

        navigate("/admin-home");

      } else {

        /*
         * EXISTING USER FLOW
         *
         * DO NOT CHANGE.
         */

        navigate("/");

      }

    } catch (err) {

      setError(
        err.message || "Something went wrong"
      );

    } finally {

      setLoading(false);

    }
  };


  // Google login
  const handleGoogleLogin = () => {

    window.location.href =
      `${BACKEND_URL}/oauth2/authorization/google`;

  };


  return (

    <main className="magadh-login">

      <div className="login-background"></div>

      <div className="login-overlay"></div>


      <section className="login-card">


        {/* BRAND */}

        <div className="login-brand">

          <div className="login-logo">

            <svg
              width="30"
              height="30"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >

              <path
                d="M49 8C30 9 14 20 14 37C14 48 20 54 30 54C46 54 54 35 49 8Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M15 52C24 39 34 28 47 17"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />

              <path
                d="M25 38C21 37 18 35 15 32"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />

              <path
                d="M34 29C31 28 28 26 26 23"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />

            </svg>

          </div>


          <div>

            <h1>
              MAGADH <span>Org</span>
            </h1>

            <p>
              PURE BY NATURE. DESI BY HEART.
            </p>

          </div>

        </div>


        {/* HEADING */}

        <div className="login-heading">

          <span>
            WELCOME BACK
          </span>

          <h2>
            Login to your account
          </h2>

          <p>
            Be a part of our healthy family.
          </p>

        </div>


        {/* LOGIN FORM */}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >


          {/* EMAIL */}

          <div className="login-field">

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
            />

          </div>


          {/* PASSWORD */}

          <div className="login-field">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
            />

          </div>


          {/* ERROR */}

          {error && (

            <div className="login-error">
              {error}
            </div>

          )}


          {/* SIGN IN */}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >

            {loading ? (

              "Signing in..."

            ) : (

              <>
                Sign In
                <span>→</span>
              </>

            )}

          </button>

        </form>


        {/* DIVIDER */}

        <div className="login-divider">

          <span>
            OR
          </span>

        </div>


        {/* GOOGLE LOGIN */}

        <button
          type="button"
          className="google-login-button"
          onClick={handleGoogleLogin}
        >

          <span className="google-icon">
            G
          </span>

          <span>
            Continue with Google
          </span>

        </button>


        {/* FOOTER */}

        <div className="login-footer">

          <span>
            Crafted with purity
          </span>

          <span className="footer-dot">
            •
          </span>

          <span>
            Rooted in Bihar
          </span>

        </div>


      </section>

    </main>

  );
}

export default Login;