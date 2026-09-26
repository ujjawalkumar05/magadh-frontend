import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config/api";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");

  const [editing, setEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
  });


  /* =========================================================
     LOAD USER
  ========================================================= */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const loadUser = async () => {
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

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();

        const savedUser = localStorage.getItem("user");

        let localUser = {};

        if (savedUser) {
          try {
            localUser = JSON.parse(savedUser);
          } catch {
            localUser = {};
          }
        }

        const mergedUser = {
          ...localUser,
          ...data,

          phone:
            data.phone ||
            data.mobile ||
            localUser.phone ||
            localUser.mobile ||
            "",

          gender:
            data.gender ||
            localUser.gender ||
            "",
        };

        setUser(mergedUser);

        setFormData({
          name: mergedUser.name || "",
          email: mergedUser.email || "",
          phone:
            mergedUser.phone ||
            mergedUser.mobile ||
            "",
          gender:
            mergedUser.gender || "",
        });

        localStorage.setItem(
          "user",
          JSON.stringify(mergedUser)
        );

      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );

        const savedUser =
          localStorage.getItem("user");

        if (savedUser) {
          try {
            const parsedUser =
              JSON.parse(savedUser);

            setUser(parsedUser);

            setFormData({
              name: parsedUser.name || "",
              email: parsedUser.email || "",
              phone:
                parsedUser.phone ||
                parsedUser.mobile ||
                "",
              gender:
                parsedUser.gender ||
                "",
            });

          } catch {
            setUser(null);
          }
        }

      } finally {
        setLoading(false);
      }
    };

    loadUser();

  }, [navigate]);


  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };


  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSavedMessage("");
  };


  /* =========================================================
     EDIT
  ========================================================= */

  const handleEdit = () => {
    setEditing(true);
    setSavedMessage("");
  };


  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone:
        user?.phone ||
        user?.mobile ||
        "",
      gender:
        user?.gender ||
        "",
    });

    setEditing(false);
    setSavedMessage("");
  };


  /* =========================================================
     SAVE
  ========================================================= */

  const handleSave = () => {

    const name =
      formData.name.trim();

    const email =
      formData.email.trim();

    const phone =
      formData.phone.trim();

    if (!name) {
      setSavedMessage(
        "Please enter your name."
      );
      return;
    }

    if (!email) {
      setSavedMessage(
        "Please enter your email."
      );
      return;
    }

    if (
      phone &&
      !/^\d{10}$/.test(phone)
    ) {
      setSavedMessage(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    const updatedUser = {
      ...user,
      name,
      email,
      phone,
      gender: formData.gender,
    };

    setUser(updatedUser);

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    setEditing(false);

    setSavedMessage(
      "Profile information saved."
    );
  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="profile-loading-page">

        <div className="profile-loader"></div>

        <p>
          Loading your account...
        </p>

      </main>
    );
  }


  const userName =
    user?.name ||
    "MAGADH Customer";

  const userInitial =
    userName
      .charAt(0)
      .toUpperCase();


  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="profile-page">


      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="profile-navbar">

        <button
          type="button"
          className="profile-brand"
          onClick={() => navigate("/")}
        >

          <span className="profile-brand-symbol">
            M
          </span>

          <span className="profile-brand-content">

            <strong>
              MAGADH Org
            </strong>

            <small>
              PURE BY NATURE • DESI BY HEART
            </small>

          </span>

        </button>


        <div className="profile-navbar-actions">

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
            className="profile-nav-cart"
            onClick={() =>
              navigate("/cart")
            }
          >
            <span>🛒</span>
            Cart
          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <section className="profile-layout">


        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="profile-sidebar">


          {/* USER CARD */}

          <div className="profile-user-card">

            <div className="profile-avatar">
              {userInitial}
            </div>

            <div className="profile-user-info">

              <span>
                Hello,
              </span>

              <strong>
                {userName}
              </strong>

              <small>
                MAGADH Customer
              </small>

            </div>

          </div>


          {/* MY ORDERS */}

          <button
            type="button"
            className={`profile-side-main ${
              activeSection === "orders"
                ? "active"
                : ""
            }`}
            onClick={() => {
              setActiveSection("orders");
              navigate("/orders");
            }}
          >

            <span className="profile-side-icon">
              📦
            </span>

            <span>
              My Orders
            </span>

            <span className="profile-side-arrow">
              →
            </span>

          </button>


          {/* ACCOUNT SETTINGS */}

          <div className="profile-side-group">

            <div className="profile-side-heading">

              <span className="profile-side-icon">
                👤
              </span>

              <span>
                Account Settings
              </span>

            </div>


            <button
              type="button"
              className={`profile-side-link ${
                activeSection === "profile"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveSection("profile")
              }
            >
              Profile Information
            </button>


            <button
              type="button"
              className={`profile-side-link ${
                activeSection === "address"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setActiveSection("address");
                navigate("/saved-address");
              }}
            >
              Manage Addresses
            </button>

          </div>


          {/* PAYMENTS */}

          <div className="profile-side-group">

            <div className="profile-side-heading">

              <span className="profile-side-icon">
                💳
              </span>

              <span>
                Payments
              </span>

            </div>


            <button
              type="button"
              className="profile-side-link profile-payment-link"
            >
              <span>
                Gift Cards
              </span>

              <span>
                ₹0
              </span>
            </button>


            <button
              type="button"
              className="profile-side-link"
            >
              Saved UPI
            </button>


            <button
              type="button"
              className="profile-side-link"
            >
              Saved Cards
            </button>

          </div>


          {/* MY STUFF */}

          <div className="profile-side-group">

            <div className="profile-side-heading">

              <span className="profile-side-icon">
                ⭐
              </span>

              <span>
                My Stuff
              </span>

            </div>


            <button
              type="button"
              className="profile-side-link"
              onClick={() =>
                navigate("/coupons")
              }
            >
              My Coupons
            </button>


            <button
              type="button"
              className="profile-side-link"
            >
              My Reviews & Ratings
            </button>


            <button
              type="button"
              className="profile-side-link"
            >
              All Notifications
            </button>


            <button
              type="button"
              className="profile-side-link"
            >
              My Wishlist
            </button>

          </div>


          {/* LOGOUT */}

          <button
            type="button"
            className="profile-logout"
            onClick={handleLogout}
          >

            <span>
              ↪
            </span>

            Logout

          </button>

        </aside>


        {/* ===================================================
            CONTENT
        =================================================== */}

        <section className="profile-content">


          {/* PAGE HEADER */}

          <div className="profile-page-heading">

            <span>
              MY ACCOUNT
            </span>

            <h1>
              Profile
            </h1>

            <p>
              Manage your personal information
              and account preferences.
            </p>

          </div>


          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <section className="personal-info-card">


            {/* HEADER */}

            <div className="personal-info-header">

              <div>

                <span className="personal-info-kicker">
                  ACCOUNT DETAILS
                </span>

                <h2>
                  Personal Information
                </h2>

                <p>
                  Keep your details updated for
                  a smoother MAGADH Org experience.
                </p>

              </div>


              {!editing ? (

                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={handleEdit}
                >
                  Edit Information
                </button>

              ) : (

                <div className="profile-edit-actions">

                  <button
                    type="button"
                    className="profile-cancel-button"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="profile-save-button"
                    onClick={handleSave}
                  >
                    Save Changes
                  </button>

                </div>

              )}

            </div>


            <div className="personal-info-divider"></div>


            {/* FORM GRID */}

            <div className="personal-info-grid">


              {/* NAME */}

              <div className="personal-info-field">

                <label>
                  Full Name
                </label>

                {editing ? (

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                  />

                ) : (

                  <div className="personal-info-value">
                    {user?.name || "Not added"}
                  </div>

                )}

              </div>


              {/* EMAIL */}

              <div className="personal-info-field">

                <label>
                  Email Address
                </label>

                {editing ? (

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                  />

                ) : (

                  <div className="personal-info-value">
                    {user?.email || "Not added"}
                  </div>

                )}

              </div>


              {/* MOBILE */}

              <div className="personal-info-field">

                <label>
                  Mobile Number
                </label>

                {editing ? (

                  <div className="profile-phone-input">

                    <span>
                      +91
                    </span>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(event) => {

                        const value =
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);

                        setFormData(
                          (previous) => ({
                            ...previous,
                            phone: value,
                          })
                        );

                        setSavedMessage("");

                      }}
                      placeholder="10-digit mobile number"
                      maxLength="10"
                    />

                  </div>

                ) : (

                  <div className="personal-info-value">

                    {user?.phone ||
                    user?.mobile ? (
                      <>
                        +91{" "}
                        {user.phone ||
                          user.mobile}
                      </>
                    ) : (
                      "Not added"
                    )}

                  </div>

                )}

              </div>


              {/* GENDER */}

              <div className="personal-info-field">

                <label>
                  Gender
                </label>

                {editing ? (

                  <div className="profile-gender-options">


                    <label
                      className={
                        formData.gender === "MALE"
                          ? "selected"
                          : ""
                      }
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

                      <span className="gender-radio"></span>

                      Male

                    </label>


                    <label
                      className={
                        formData.gender === "FEMALE"
                          ? "selected"
                          : ""
                      }
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

                      <span className="gender-radio"></span>

                      Female

                    </label>


                    <label
                      className={
                        formData.gender === "OTHER"
                          ? "selected"
                          : ""
                      }
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

                      <span className="gender-radio"></span>

                      Other

                    </label>

                  </div>

                ) : (

                  <div className="personal-info-value">

                    {user?.gender || "Not added"}

                  </div>

                )}

              </div>

            </div>


            {/* MESSAGE */}

            {savedMessage && (

              <div
                className={`profile-save-message ${
                  savedMessage ===
                  "Profile information saved."
                    ? "success"
                    : "error"
                }`}
              >
                {savedMessage}
              </div>

            )}


            {!editing && (

              <div className="personal-info-footer">

                <span>
                  ✓
                </span>

                <p>
                  Your personal information is
                  used to make your MAGADH Org
                  shopping experience easier.
                </p>

              </div>

            )}

          </section>


          {/* ACCOUNT ACTIONS */}

          <div className="profile-danger-area">

            <button
              type="button"
              className="profile-deactivate"
            >
              Deactivate Account
            </button>

            <button
              type="button"
              className="profile-delete"
            >
              Delete Account
            </button>

          </div>

        </section>

      </section>

    </main>
  );
}

export default Profile;