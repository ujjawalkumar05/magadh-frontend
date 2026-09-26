import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config/api";
import "./TrackOrder.css";

function TrackOrder() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

        // Get current user
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

        if (!userResponse.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        const user = await userResponse.json();

        // Get all orders
        const orderResponse = await fetch(
          `${BACKEND_URL}/api/orders/user/${user.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!orderResponse.ok) {
          throw new Error("Unable to load orders");
        }

        const data = await orderResponse.json();

        const allOrders = Array.isArray(data)
          ? data
          : Array.isArray(data.content)
          ? data.content
          : [];

        // Only orders which are not delivered/cancelled
        const activeOrders = allOrders.filter((item) => {
          const status = String(
            item.status || "PLACED"
          ).toUpperCase();

          return (
            status !== "DELIVERED" &&
            status !== "CANCELLED" &&
            status !== "CANCELED"
          );
        });

        setOrders(activeOrders);

        if (activeOrders.length > 0) {
          setSelectedOrder(activeOrders[0]);
        }
      } catch (err) {
        console.error("Track Order Error:", err);
        setError("Unable to load your orders.");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

  // Loading
  if (loading) {
    return (
      <div className="track-order-page">
        <div className="track-empty">
          <div className="track-empty-icon">📦</div>

          <h2>Loading Orders...</h2>

          <p>
            Please wait while we load your tracking information.
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="track-order-page">
        <div className="track-empty">
          <div className="track-empty-icon">⚠️</div>

          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => navigate("/orders")}
          >
            ← Back to Orders
          </button>
        </div>
      </div>
    );
  }

  // No active orders
  if (orders.length === 0) {
    return (
      <div className="track-order-page">
        <header className="track-navbar">
          <button
            type="button"
            className="track-brand"
            onClick={() => navigate("/")}
          >
            <span className="track-brand-symbol">
              M
            </span>

            <span>
              <strong>MAGADH Org</strong>

              <small>
                PURE BY NATURE • DESI BY HEART
              </small>
            </span>
          </button>

          <div className="track-nav-actions">
            <button
              type="button"
              onClick={() => navigate("/orders")}
            >
              My Orders
            </button>

            <button
              type="button"
              onClick={() => navigate("/cart")}
            >
              🛒 Cart
            </button>
          </div>
        </header>

        <main className="track-container">
          <button
            type="button"
            className="track-back"
            onClick={() => navigate("/orders")}
          >
            ← Back to Orders
          </button>

          <div className="track-empty">
            <div className="track-empty-icon">
              ✓
            </div>

            <h2>No Active Orders</h2>

            <p>
              You don't have any orders currently
              in transit.
            </p>

            <button
              type="button"
              onClick={() => navigate("/orders")}
            >
              View Order History
            </button>
          </div>
        </main>
      </div>
    );
  }

  const order = selectedOrder || orders[0];

  const status = String(
    order.status || "PLACED"
  ).toUpperCase();

  const steps = [
    {
      key: "PLACED",
      title: "Order Placed",
      description:
        "Your order has been successfully placed.",
    },
    {
      key: "CONFIRMED",
      title: "Order Confirmed",
      description:
        "Your order has been confirmed by MAGADH Org.",
    },
    {
      key: "PROCESSING",
      title: "Preparing Order",
      description:
        "Your products are being prepared.",
    },
    {
      key: "SHIPPED",
      title: "Shipped",
      description:
        "Your order has been handed over for delivery.",
    },
    {
      key: "DELIVERED",
      title: "Delivered",
      description:
        "Your order has been delivered successfully.",
    },
  ];

  const statusOrder = [
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ];

  let activeIndex = statusOrder.indexOf(status);

  if (activeIndex < 0) {
    activeIndex = 0;
  }

  const totalAmount = Number(
    order.totalAmount || order.total || 0
  );

  return (
    <div className="track-order-page">

      {/* NAVBAR */}
      <header className="track-navbar">

        <button
          type="button"
          className="track-brand"
          onClick={() => navigate("/")}
        >
          <span className="track-brand-symbol">
            M
          </span>

          <span>
            <strong>MAGADH Org</strong>

            <small>
              PURE BY NATURE • DESI BY HEART
            </small>
          </span>
        </button>

        <div className="track-nav-actions">

          <button
            type="button"
            onClick={() => navigate("/orders")}
          >
            My Orders
          </button>

          <button
            type="button"
            onClick={() => navigate("/cart")}
          >
            🛒 Cart
          </button>

        </div>

      </header>


      {/* MAIN */}
      <main className="track-container">

        <button
          type="button"
          className="track-back"
          onClick={() => navigate("/orders")}
        >
          ← Back to Orders
        </button>


        <div className="track-heading">

          <span>MAGADH ORG</span>

          <h1>
            Track Your Order
          </h1>

          <p>
            Follow your MAGADH Org orders from
            placement to delivery.
          </p>

        </div>


        {/* ORDER SELECTOR */}
        <div className="track-order-card">

          <div className="track-order-header">

            <div>
              <span className="track-kicker">
                ACTIVE ORDERS
              </span>

              <h2>
                Your Orders
              </h2>
            </div>

            <div className="track-order-total">
              {orders.length}
            </div>

          </div>


          {/* ALL ACTIVE ORDERS */}
          <div className="track-orders-list">

            {orders.map((item) => {

              const itemStatus = String(
                item.status || "PLACED"
              ).toUpperCase();

              const isSelected =
                selectedOrder &&
                selectedOrder.id === item.id;

              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() =>
                    setSelectedOrder(item)
                  }
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    marginBottom: "10px",
                    borderRadius: "12px",
                    border: isSelected
                      ? "2px solid #c79a35"
                      : "1px solid #ddd",
                    background: isSelected
                      ? "#fffaf0"
                      : "#ffffff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >

                  <div>
                    <strong
                      style={{
                        display: "block",
                        color: "#17140e",
                        fontSize: "16px",
                      }}
                    >
                      Order #{item.id}
                    </strong>

                    <span
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color: "#777",
                        fontSize: "13px",
                      }}
                    >
                      Status: {itemStatus}
                    </span>
                  </div>

                  <span
                    style={{
                      color: "#b8860b",
                      fontSize: "22px",
                    }}
                  >
                    →
                  </span>

                </button>
              );
            })}

          </div>

        </div>


        {/* SELECTED ORDER TRACKING */}
        <section className="track-order-card">

          <div className="track-order-header">

            <div>

              <span className="track-kicker">
                ORDER DETAILS
              </span>

              <h2>
                Order #{order.id}
              </h2>

            </div>

            <div className="track-order-total">
              ₹{totalAmount.toFixed(2)}
            </div>

          </div>


          {/* TIMELINE */}
          <div className="tracking-timeline">

            {steps.map((step, index) => {

              const completed =
                index <= activeIndex;

              const isCurrent =
                index === activeIndex;

              return (
                <div
                  className={`tracking-step ${
                    completed
                      ? "completed"
                      : ""
                  } ${
                    isCurrent
                      ? "current"
                      : ""
                  }`}
                  key={step.key}
                >

                  <div className="tracking-line-wrap">

                    <div className="tracking-dot">
                      {completed
                        ? "✓"
                        : index + 1}
                    </div>

                    {index <
                      steps.length - 1 && (
                      <div
                        className={`tracking-line ${
                          index <
                          activeIndex
                            ? "filled"
                            : ""
                        }`}
                      />
                    )}

                  </div>


                  <div className="tracking-info">

                    <h3>
                      {step.title}
                    </h3>

                    <p>
                      {step.description}
                    </p>

                    {isCurrent && (
                      <span className="tracking-current">
                        Current Status
                      </span>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

        </section>

      </main>

    </div>
  );
}

export default TrackOrder;