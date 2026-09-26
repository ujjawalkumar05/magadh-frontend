import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config/api";
import "./Orders.css";

import product1L from "../assets/prodimage.png";
import product1LPouch from "../assets/1l-pouch.png";
import product500ML from "../assets/500ml-bottle.png";
import product500MLPouch from "../assets/500ml-pouch.png";
import product200ML from "../assets/200ml-bottle.png";
import product5L from "../assets/5l-jar.png";
import product15L from "../assets/15l-tin.png";

function Orders() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("orders");

  const productImages = {
    "MAGADH-OIL-1L": product1L,
    "MAGADH-OIL-1L-POUCH": product1LPouch,
    "MAGADH-OIL-500ML-BOTTLE": product500ML,
    "MAGADH-OIL-500ML-POUCH": product500MLPouch,
    "MAGADH-OIL-200ML-BOTTLE": product200ML,
    "MAGADH-OIL-5L-JAR": product5L,
    "MAGADH-OIL-15L-TIN": product15L,
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError("");

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
          throw new Error("Unable to load user.");
        }

        const currentUser = await userResponse.json();

        setUser(currentUser);

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );

        /* =========================
           LOAD USER ORDERS
        ========================= */

        const orderResponse = await fetch(
          `${BACKEND_URL}/api/orders/user/${currentUser.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (
          orderResponse.status === 401 ||
          orderResponse.status === 403
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        if (!orderResponse.ok) {
          throw new Error("Unable to load orders.");
        }

        const orderData = await orderResponse.json();

        /*
          Backend direct array:
          [ ... ]

          OR Page response:
          { content: [ ... ] }

          Dono handle honge.
        */

        const orderList = Array.isArray(orderData)
          ? orderData
          : Array.isArray(orderData?.content)
          ? orderData.content
          : [];

        setOrders(orderList);
      } catch (err) {
        console.error(
          "Orders loading error:",
          err
        );

        setError(
          "Unable to load your orders right now."
        );
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
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
     SIDEBAR NAVIGATION
  ========================================================= */

  const goToSection = (
    section,
    path = null
  ) => {
    setActiveSection(section);

    if (path) {
      navigate(path);
    }
  };

  /* =========================================================
     ORDER DATE
  ========================================================= */

  const formatDate = (order) => {
    const dateValue =
      order?.createdAt ||
      order?.orderDate ||
      order?.createdDate ||
      order?.date;

    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     ORDER TIME
  ========================================================= */

  const formatTime = (order) => {
    const dateValue =
      order?.createdAt ||
      order?.orderDate ||
      order?.createdDate ||
      order?.date;

    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  /* =========================================================
     STATUS
  ========================================================= */

  const getStatusText = (status) => {
    if (!status) {
      return "Order placed";
    }

    const value =
      String(status).toUpperCase();

    switch (value) {
      case "DELIVERED":
        return "Delivered";

      case "SHIPPED":
        return "Shipped";

      case "CONFIRMED":
        return "Order confirmed";

      case "PROCESSING":
        return "Processing";

      case "CANCELLED":
      case "CANCELED":
        return "Cancelled";

      case "PLACED":
        return "Order placed";

      default:
        return (
          String(status)
            .charAt(0)
            .toUpperCase() +
          String(status)
            .slice(1)
            .toLowerCase()
        );
    }
  };

  /* =========================================================
     STATUS CLASS
  ========================================================= */

  const getStatusClass = (status) => {
    const value =
      String(status || "").toUpperCase();

    if (value === "DELIVERED") {
      return "delivered";
    }

    if (
      value === "CANCELLED" ||
      value === "CANCELED"
    ) {
      return "cancelled";
    }

    if (value === "SHIPPED") {
      return "shipped";
    }

    return "active";
  };

  /* =========================================================
     PRODUCT IMAGE
  ========================================================= */

  const getProductImage = (item) => {
    const product =
      item?.product || {};

    const sku =
      product?.sku ||
      item?.sku ||
      "";

    if (productImages[sku]) {
      return productImages[sku];
    }

    const name =
      String(
        product?.name ||
        item?.productName ||
        ""
      ).toLowerCase();

    if (
      name.includes("15l") ||
      name.includes("15 l")
    ) {
      return product15L;
    }

    if (
      name.includes("5l") ||
      name.includes("5 l")
    ) {
      return product5L;
    }

    if (
      name.includes("1l") ||
      name.includes("1 l")
    ) {
      if (
        name.includes("pouch")
      ) {
        return product1LPouch;
      }

      return product1L;
    }

    if (
      name.includes("500ml") ||
      name.includes("500 ml")
    ) {
      if (
        name.includes("pouch")
      ) {
        return product500MLPouch;
      }

      return product500ML;
    }

    if (
      name.includes("200ml") ||
      name.includes("200 ml")
    ) {
      return product200ML;
    }

    return product1L;
  };

  /* =========================================================
     TOTAL
  ========================================================= */

  const getOrderTotal = (order) => {
    if (
      order?.totalAmount !== undefined &&
      order?.totalAmount !== null
    ) {
      return Number(
        order.totalAmount
      ).toFixed(2);
    }

    if (
      order?.total !== undefined &&
      order?.total !== null
    ) {
      return Number(
        order.total
      ).toFixed(2);
    }

    const items =
      order?.items || [];

    const calculatedTotal =
      items.reduce(
        (sum, item) => {
          const price = Number(
            item?.price ||
            item?.product?.price ||
            0
          );

          const quantity = Number(
            item?.quantity || 1
          );

          return (
            sum +
            price * quantity
          );
        },
        0
      );

    return calculatedTotal.toFixed(2);
  };

  /* =========================================================
     ITEM COUNT
  ========================================================= */

  const getItemCount = (order) => {
    return (
      order?.items || []
    ).reduce(
      (total, item) =>
        total +
        Number(
          item?.quantity || 1
        ),
      0
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="orders-loader"></div>

        <p>
          Loading your orders...
        </p>
      </div>
    );
  }

  const userName =
    user?.name ||
    "MAGADH Customer";

  return (
    <div className="orders-page">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="orders-navbar">

        <button
          type="button"
          className="orders-brand"
          onClick={() =>
            navigate("/")
          }
        >
          <span className="orders-brand-symbol">
            M
          </span>

          <span className="orders-brand-content">

            <strong>
              MAGADH Org
            </strong>

            <small>
              PURE BY NATURE • DESI BY HEART
            </small>

          </span>

        </button>

        <div className="orders-navbar-actions">

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
            className="orders-nav-cart"
            onClick={() =>
              navigate("/cart")
            }
          >
            🛒

            <span>
              Cart
            </span>

          </button>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="orders-layout">

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="orders-sidebar">

          <div className="orders-user-card">

            <div className="orders-avatar">

              {userName
                .charAt(0)
                .toUpperCase()}

            </div>

            <div className="orders-user-info">

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


          {/* =================================================
              MY ORDERS
          ================================================= */}

          <button
            type="button"
            className={`orders-side-main ${
              activeSection === "orders"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goToSection("orders")
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


          {/* =================================================
              TRACK ORDER
          ================================================= */}

          <button
            type="button"
            className={`orders-side-main ${
              activeSection === "track-order"
                ? "active"
                : ""
            }`}
            onClick={() =>
              goToSection(
                "track-order",
                "/track-order"
              )
            }
          >

            <span>
              🚚
            </span>

            <span>
              Track Order
            </span>

            <span>
              →
            </span>

          </button>


          {/* ACCOUNT SETTINGS */}

          <div className="orders-side-group">

            <div className="orders-side-heading">

              <span>
                👤
              </span>

              ACCOUNT SETTINGS

            </div>

            <button
              type="button"
              className="orders-side-link"
              onClick={() =>
                goToSection(
                  "profile",
                  "/profile"
                )
              }
            >
              Profile Information
            </button>

            <button
              type="button"
              className="orders-side-link"
              onClick={() =>
                goToSection(
                  "address",
                  "/saved-address"
                )
              }
            >
              Manage Addresses
            </button>

          </div>


          {/* PAYMENTS */}

          <div className="orders-side-group">

            <div className="orders-side-heading">

              <span>
                💳
              </span>

              PAYMENTS

            </div>

            <button
              type="button"
              className="orders-side-link"
            >
              Gift Cards

              <span>
                ₹0
              </span>

            </button>

            <button
              type="button"
              className="orders-side-link"
            >
              Saved UPI
            </button>

            <button
              type="button"
              className="orders-side-link"
            >
              Saved Cards
            </button>

          </div>


          {/* MY STUFF */}

          <div className="orders-side-group">

            <div className="orders-side-heading">

              <span>
                ⭐
              </span>

              MY STUFF

            </div>

            <button
              type="button"
              className="orders-side-link"
              onClick={() =>
                navigate("/coupons")
              }
            >
              My Coupons
            </button>

            <button
              type="button"
              className="orders-side-link"
            >
              My Reviews & Ratings
            </button>

            <button
              type="button"
              className="orders-side-link"
            >
              All Notifications
            </button>

            <button
              type="button"
              className="orders-side-link"
            >
              My Wishlist
            </button>

          </div>


          {/* LOGOUT */}

          <button
            type="button"
            className="orders-logout"
            onClick={handleLogout}
          >
            <span>
              ↪
            </span>

            Logout
          </button>

        </aside>


        {/* ===================================================
            ORDER CONTENT
        =================================================== */}

        <section className="orders-content">

          <div className="orders-heading">

            <div>

              <span>
                MAGADH ORG
              </span>

              <h1>
                My Orders
              </h1>

              <p>
                View your complete order history.
              </p>

            </div>

            <div className="orders-count">

              {orders.length}

              <small>
                Orders
              </small>

            </div>

          </div>


          {/* ERROR */}

          {error && (
            <div className="orders-error">
              {error}
            </div>
          )}


          {/* EMPTY */}

          {!error &&
            orders.length === 0 && (
              <div className="orders-empty">

                <div className="orders-empty-icon">
                  📦
                </div>

                <h2>
                  No orders yet
                </h2>

                <p>
                  You haven't placed any
                  orders with MAGADH Org yet.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/products"
                    )
                  }
                >
                  Start Shopping

                  <span>
                    →
                  </span>

                </button>

              </div>
            )}


          {/* =================================================
              ORDER HISTORY
          ================================================= */}

          {orders.length > 0 && (
            <div className="orders-list">

              {orders.map(
                (order, orderIndex) => {

                  const items =
                    order?.items ||
                    [];

                  const statusClass =
                    getStatusClass(
                      order?.status
                    );

                  const orderDate =
                    formatDate(
                      order
                    );

                  const orderTime =
                    formatTime(
                      order
                    );

                  return (
                    <article
                      className="order-card"
                      key={
                        order?.id ??
                        orderIndex
                      }
                    >

                      {/* ORDER HEADER */}

                      <div className="order-card-header">

                        <div className="order-status">

                          <span
                            className={`order-status-icon ${statusClass}`}
                          >
                            {statusClass ===
                            "delivered"
                              ? "✓"
                              : statusClass ===
                                "cancelled"
                              ? "×"
                              : "✓"}
                          </span>

                          <div>

                            <strong>
                              {getStatusText(
                                order?.status
                              )}
                            </strong>

                            <small>

                              {order?.id
                                ? `Order #${order.id}`
                                : "MAGADH Org Order"}

                              {orderDate &&
                                ` • ${orderDate}`}

                              {orderTime &&
                                `, ${orderTime}`}

                            </small>

                          </div>

                        </div>


                        <div className="order-total">

                          <strong>
                            ₹
                            {getOrderTotal(
                              order
                            )}
                          </strong>

                          <small>

                            {getItemCount(
                              order
                            )}{" "}

                            {getItemCount(
                              order
                            ) === 1
                              ? "item"
                              : "items"}

                          </small>

                        </div>

                      </div>


                      {/* PRODUCTS */}

                      <div className="order-products">

                        {items.length === 0 ? (

                          <div className="order-no-items">
                            Order details available
                          </div>

                        ) : (

                          items.map(
                            (
                              item,
                              itemIndex
                            ) => {

                              const product =
                                item?.product ||
                                {};

                              const image =
                                getProductImage(
                                  item
                                );

                              const productName =
                                product?.name ||
                                item?.productName ||
                                "MAGADH Org Mustard Oil";

                              const quantity =
                                Number(
                                  item?.quantity ||
                                  1
                                );

                              const price =
                                Number(
                                  item?.price ||
                                  product?.price ||
                                  0
                                );

                              return (
                                <div
                                  className="order-product"
                                  key={
                                    item?.id ??
                                    itemIndex
                                  }
                                >

                                  <div className="order-product-image">

                                    <img
                                      src={
                                        image
                                      }
                                      alt={
                                        productName
                                      }
                                    />

                                  </div>

                                  <div className="order-product-info">

                                    <strong>
                                      {productName}
                                    </strong>

                                    <span>
                                      Qty:{" "}
                                      {quantity}
                                    </span>

                                    <small>
                                      ₹
                                      {price.toFixed(
                                        2
                                      )}
                                    </small>

                                  </div>

                                </div>
                              );
                            }
                          )

                        )}

                      </div>


                      {/* ORDER FOOTER */}

                      <div className="order-card-footer">

                        <span>
                          {order?.address
                            ? "Delivery address saved"
                            : "MAGADH Org order"}
                        </span>

                        <span className="order-history-label">
                          Order History
                        </span>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default Orders;