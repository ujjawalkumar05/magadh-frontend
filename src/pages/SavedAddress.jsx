import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config/api";
import "./SavedAddress.css";

function SavedAddress() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    addressLine: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    type: "HOME",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        /* =========================
           LOAD CURRENT USER
        ========================= */

        const userResponse = await fetch(
          `${BACKEND_URL}/api/users/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (
          userResponse.status === 401 ||
          userResponse.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!userResponse.ok) {
          throw new Error("Failed to load user");
        }

        const userData = await userResponse.json();

        setUser(userData);

        /* =========================
           LOAD SAVED ADDRESSES
        ========================= */

        const addressResponse = await fetch(
          `${BACKEND_URL}/api/addresses/user/${userData.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (
          addressResponse.status === 401 ||
          addressResponse.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!addressResponse.ok) {
          throw new Error("Failed to load addresses");
        }

        const addressData = await addressResponse.json();

        /*
          Backend can return either:
          [
            ...
          ]

          or:
          {
            content: [...]
          }
        */

        const addressList = Array.isArray(addressData)
          ? addressData
          : addressData.content || [];

        setAddresses(addressList);

      } catch (error) {
        console.error(
          "Saved address loading error:",
          error
        );

        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);


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
  };


  /* =========================================================
     ADD ADDRESS
  ========================================================= */

  const handleAddAddress = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token || !user?.id) {
      navigate("/login");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.addressLine.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !/^\d{6}$/.test(formData.pincode)
    ) {
      alert(
        "Please fill all required address details correctly."
      );
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/addresses/user/${user.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to save address");
      }

      const savedAddress = await response.json();

      setAddresses((previous) => [
        ...previous,
        savedAddress,
      ]);

      setFormData({
        name: "",
        phone: "",
        addressLine: "",
        area: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        type: "HOME",
      });

      setShowForm(false);

    } catch (error) {
      console.error(
        "Save address error:",
        error
      );

      alert(
        "Unable to save address right now."
      );
    }
  };


  /* =========================================================
     DELETE ADDRESS
  ========================================================= */

  const handleDeleteAddress = async (addressId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this address?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/addresses/user/${user.id}/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete address");
      }

      setAddresses((previous) =>
        previous.filter(
          (address) =>
            address.id !== addressId
        )
      );

    } catch (error) {
      console.error(
        "Delete address error:",
        error
      );

      alert(
        "Unable to delete address right now."
      );
    }
  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="saved-address-loading">

        <div className="saved-address-loader"></div>

        <p>
          Loading your saved addresses...
        </p>

      </main>
    );
  }


  /* =========================================================
     ADDRESS FORMAT
  ========================================================= */

  const formatAddress = (address) => {
    return [
      address.addressLine,
      address.area,
      address.landmark,
      address.city,
      address.state,
      address.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  };


  return (
    <main className="saved-address-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="saved-address-navbar">

        <button
          type="button"
          className="saved-address-brand"
          onClick={() => navigate("/")}
        >

          <span className="saved-address-brand-symbol">
            M
          </span>

          <span className="saved-address-brand-content">

            <strong>
              MAGADH Org
            </strong>

            <small>
              PURE BY NATURE • DESI BY HEART
            </small>

          </span>

        </button>


        <nav className="saved-address-nav">

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
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
            className="saved-address-cart"
            onClick={() =>
              navigate("/cart")
            }
          >
            🛒
            <span>
              Cart
            </span>
          </button>

        </nav>

      </header>


      {/* =====================================================
          MAIN LAYOUT
      ===================================================== */}

      <section className="saved-address-layout">


        {/* ===================================================
            LEFT ACCOUNT MENU
        =================================================== */}

        <aside className="saved-address-sidebar">

          <div className="saved-address-user">

            <div className="saved-address-avatar">
              {(user?.name || "M")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>

              <span>
                Hello,
              </span>

              <strong>
                {user?.name || "MAGADH Customer"}
              </strong>

              <small>
                MAGADH Customer
              </small>

            </div>

          </div>


          <button
            type="button"
            className="saved-menu-item"
            onClick={() =>
              navigate("/profile")
            }
          >
            <span>
              📦
            </span>

            <span>
              My Orders
            </span>

            <span>
              →
            </span>
          </button>


          <div className="saved-menu-group">

            <div className="saved-menu-title">
              <span>👤</span>
              Account Settings
            </div>

            <button
              type="button"
              className="saved-menu-link"
              onClick={() =>
                navigate("/profile")
              }
            >
              Profile Information
            </button>

            <button
              type="button"
              className="saved-menu-link active"
            >
              Manage Addresses
            </button>

          </div>


          <div className="saved-menu-group">

            <div className="saved-menu-title">
              <span>💳</span>
              Payments
            </div>

            <button
              type="button"
              className="saved-menu-link"
            >
              Gift Cards

              <span>
                ₹0
              </span>
            </button>

            <button
              type="button"
              className="saved-menu-link"
            >
              Saved UPI
            </button>

            <button
              type="button"
              className="saved-menu-link"
            >
              Saved Cards
            </button>

          </div>


          <div className="saved-menu-group">

            <div className="saved-menu-title">
              <span>⭐</span>
              My Stuff
            </div>

            <button
              type="button"
              className="saved-menu-link"
              onClick={() =>
                navigate("/coupons")
              }
            >
              My Coupons
            </button>

            <button
              type="button"
              className="saved-menu-link"
            >
              My Reviews & Ratings
            </button>

            <button
              type="button"
              className="saved-menu-link"
            >
              All Notifications
            </button>

            <button
              type="button"
              className="saved-menu-link"
            >
              My Wishlist
            </button>

          </div>


          <button
            type="button"
            className="saved-address-logout"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/");
            }}
          >
            <span>↪</span>
            Logout
          </button>

        </aside>


        {/* ===================================================
            RIGHT CONTENT
        =================================================== */}

        <section className="saved-address-content">


          <div className="saved-address-heading">

            <div>

              <span>
                DELIVERY DETAILS
              </span>

              <h1>
                Saved Addresses
              </h1>

              <p>
                Manage your delivery addresses
                for a faster checkout experience.
              </p>

            </div>


            <button
              type="button"
              className="add-address-button"
              onClick={() =>
                setShowForm(
                  (previous) =>
                    !previous
                )
              }
            >
              <span>
                +
              </span>

              Add New Address
            </button>

          </div>


          {/* =================================================
              ADD ADDRESS FORM
          ================================================= */}

          {showForm && (

            <form
              className="address-form-card"
              onSubmit={handleAddAddress}
            >

              <div className="address-form-header">

                <div>

                  <span>
                    NEW DELIVERY ADDRESS
                  </span>

                  <h2>
                    Add Address
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  ×
                </button>

              </div>


              <div className="address-form-grid">

                <div className="address-form-field">

                  <label>
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter full name"
                  />

                </div>


                <div className="address-form-field">

                  <label>
                    Mobile Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={(event) => {

                      const value =
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            10
                          );

                      setFormData(
                        (previous) => ({
                          ...previous,
                          phone:
                            value,
                        })
                      );

                    }}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                  />

                </div>


                <div className="address-form-field address-form-full">

                  <label>
                    House / Flat / Building / Street *
                  </label>

                  <input
                    type="text"
                    name="addressLine"
                    value={
                      formData.addressLine
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="House no., flat no., street"
                  />

                </div>


                <div className="address-form-field">

                  <label>
                    Area
                  </label>

                  <input
                    type="text"
                    name="area"
                    value={
                      formData.area
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Area / locality"
                  />

                </div>


                <div className="address-form-field">

                  <label>
                    Landmark
                  </label>

                  <input
                    type="text"
                    name="landmark"
                    value={
                      formData.landmark
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Nearby landmark"
                  />

                </div>


                <div className="address-form-field">

                  <label>
                    City *
                  </label>

                  <input
                    type="text"
                    name="city"
                    value={
                      formData.city
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="City"
                  />

                </div>


                <div className="address-form-field">

                  <label>
                    State *
                  </label>

                  <input
                    type="text"
                    name="state"
                    value={
                      formData.state
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="State"
                  />

                </div>


                <div className="address-form-field">

                  <label>
                    Pincode *
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={
                      formData.pincode
                    }
                    onChange={(event) => {

                      const value =
                        event.target.value
                          .replace(
                            /\D/g,
                            ""
                          )
                          .slice(
                            0,
                            6
                          );

                      setFormData(
                        (previous) => ({
                          ...previous,
                          pincode:
                            value,
                        })
                      );

                    }}
                    placeholder="6-digit pincode"
                    maxLength="6"
                  />

                </div>

              </div>


              <div className="address-type-row">

                <span>
                  Address Type
                </span>

                <label>
                  <input
                    type="radio"
                    name="type"
                    value="HOME"
                    checked={
                      formData.type ===
                      "HOME"
                    }
                    onChange={
                      handleChange
                    }
                  />

                  Home
                </label>

                <label>
                  <input
                    type="radio"
                    name="type"
                    value="WORK"
                    checked={
                      formData.type ===
                      "WORK"
                    }
                    onChange={
                      handleChange
                    }
                  />

                  Work
                </label>

                <label>
                  <input
                    type="radio"
                    name="type"
                    value="OTHER"
                    checked={
                      formData.type ===
                      "OTHER"
                    }
                    onChange={
                      handleChange
                    }
                  />

                  Other
                </label>

              </div>


              <div className="address-form-actions">

                <button
                  type="button"
                  className="address-cancel"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="address-save"
                >
                  Save Address
                </button>

              </div>

            </form>

          )}


          {/* =================================================
              SAVED ADDRESS LIST
          ================================================= */}

          {!showForm && addresses.length === 0 && (

            <div className="empty-address-card">

              <div className="empty-address-icon">
                <span>⌂</span>
              </div>

              <h2>
                No saved addresses yet
              </h2>

              <p>
                Add your delivery address and
                make your next MAGADH Org order
                faster.
              </p>

              <button
                type="button"
                onClick={() =>
                  setShowForm(true)
                }
              >
                + Add New Address
              </button>

            </div>

          )}


          {addresses.length > 0 && (

            <div className="saved-address-list">

              {addresses.map(
                (address, index) => (

                  <article
                    className="saved-address-card"
                    key={
                      address.id ||
                      index
                    }
                  >

                    <div className="saved-address-card-icon">
                      {address.type ===
                      "WORK"
                        ? "⌂"
                        : "⌂"}
                    </div>


                    <div className="saved-address-card-body">

                      <div className="saved-address-card-top">

                        <div>

                          <span className="address-label">
                            {address.type ||
                              "HOME"}
                          </span>

                          <h2>
                            {address.name ||
                              user?.name ||
                              "MAGADH Customer"}
                          </h2>

                        </div>


                        {address.isDefault && (

                          <span className="default-address">
                            DEFAULT
                          </span>

                        )}

                      </div>


                      <p className="saved-address-text">
                        {formatAddress(
                          address
                        )}
                      </p>


                      {(address.phone ||
                        user?.phone) && (

                        <p className="saved-address-phone">
                          +91{" "}
                          {address.phone ||
                            user?.phone}
                        </p>

                      )}

                    </div>


                    <button
                      type="button"
                      className="saved-address-delete"
                      aria-label="Delete address"
                      onClick={() =>
                        handleDeleteAddress(
                          address.id
                        )
                      }
                    >
                      ⋮
                    </button>

                  </article>

                )
              )}

            </div>

          )}

        </section>

      </section>

    </main>
  );
}

export default SavedAddress;