import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BACKEND_URL from "../config/api";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || user?.role !== "ADMIN") {
      navigate("/");
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [dashboardResponse, salesResponse] =
          await Promise.all([
            fetch(
              `${BACKEND_URL}/api/admin/analytics/dashboard`,
              { headers }
            ),
            fetch(
              `${BACKEND_URL}/api/admin/analytics/most-ordered-products`,
              { headers }
            ),
          ]);

        if (!dashboardResponse.ok) {
          throw new Error("Failed to load dashboard data");
        }

        if (!salesResponse.ok) {
          throw new Error("Failed to load sales analysis");
        }

        setDashboard(await dashboardResponse.json());
        setSales(await salesResponse.json());
      } catch (err) {
        setError(
          err.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const goTo = (path) => {
    closeSidebar();
    navigate(path);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-loading">
          <div className="admin-loader"></div>
          <p>Loading MAGADH Admin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="admin-error">
          <span>!</span>

          <h2>Unable to load dashboard</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const stats = [
    {
      label: "Total Revenue",
      value: `₹${Number(
        dashboard?.totalRevenue || 0
      ).toLocaleString("en-IN")}`,
      icon: "₹",
      className: "revenue",
    },
    {
      label: "Total Orders",
      value: dashboard?.totalOrders ?? 0,
      icon: "⌁",
      className: "orders",
    },
    {
      label: "Total Users",
      value: dashboard?.totalUsers ?? 0,
      icon: "♙",
      className: "users",
    },
    {
      label: "Products",
      value: dashboard?.totalProducts ?? 0,
      icon: "◇",
      className: "products",
    },
    {
      label: "Pending Orders",
      value: dashboard?.pendingOrders ?? 0,
      icon: "◷",
      className: "pending",
    },
    {
      label: "Low Stock",
      value: dashboard?.lowStockProducts ?? 0,
      icon: "!",
      className: "stock",
    },
  ];

  const orderStatuses = [
    ["Pending", dashboard?.pendingOrders || 0],
    ["Confirmed", dashboard?.confirmedOrders || 0],
    ["Processing", dashboard?.processingOrders || 0],
    ["Shipped", dashboard?.shippedOrders || 0],
    ["Delivered", dashboard?.deliveredOrders || 0],
    ["Cancelled", dashboard?.cancelledOrders || 0],
  ];

  const maxSales = Math.max(
    ...sales.map((item) =>
      Number(item.totalQuantity || 0)
    ),
    1
  );

  return (
    <div className="admin-dashboard">

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`admin-sidebar ${
          sidebarOpen ? "open" : ""
        }`}
      >
        <div className="admin-brand">
          <div className="admin-brand-mark">
            M
          </div>

          <div>
            <strong>MAGADH</strong>
            <span>ORG ADMIN</span>
          </div>
        </div>

        <button
          type="button"
          className="admin-sidebar-close"
          onClick={closeSidebar}
        >
          ×
        </button>

        <nav className="admin-nav">

          <button
            className="admin-nav-item active"
            onClick={() => goTo("/admin")}
          >
            <span>▦</span>
            Dashboard
          </button>

          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/products")}
          >
            <span>◇</span>
            Products
          </button>

          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/categories")}
          >
            <span>◈</span>
            Categories
          </button>

          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/inventory")}
          >
            <span>▤</span>
            Inventory
          </button>

          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/orders")}
          >
            <span>⌁</span>
            Orders
          </button>

          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/customers")}
          >
            <span>♙</span>
            Customers
          </button>

          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/coupons")}
          >
            <span>◇</span>
            Coupons
          </button>

          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/payments")}
          >
            <span>₹</span>
            Payments
          </button>

          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/reviews")}
          >
            <span>★</span>
            Reviews
          </button>

          <button
            className="admin-nav-item"
            onClick={() => goTo("/admin/roles")}
          >
            <span>⚿</span>
            Roles
          </button>

        </nav>

        <div className="admin-sidebar-bottom">

          <button
            className="admin-store-button"
            onClick={() => goTo("/")}
          >
            ← View Store
          </button>

          <button
            className="admin-logout"
            onClick={logout}
          >
            Logout
          </button>

        </div>
      </aside>

      <main className="admin-main">

        <button
          className="admin-mobile-menu"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>

        <header className="admin-header">

          <div>
            <span className="admin-eyebrow">
              MAGADH ORG · CONTROL CENTER
            </span>

            <h1>Dashboard</h1>

            <p>
              Welcome back,{" "}
              {currentUser.name || "Admin"}.
              Here's what's happening with
              your store.
            </p>
          </div>

          <div className="admin-header-user">

            <div className="admin-avatar">
              AU
            </div>

            <div>
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>

          </div>

        </header>

        <section className="admin-stats-grid">

          {stats.map((stat) => (
            <article
              className={`admin-stat-card ${stat.className}`}
              key={stat.label}
            >
              <div className="admin-stat-top">
                <span>{stat.label}</span>

                <div className="admin-stat-icon">
                  {stat.icon}
                </div>
              </div>

              <strong>{stat.value}</strong>
            </article>
          ))}

        </section>

        <section className="admin-content-grid">

          <div className="admin-panel sales-panel">

            <div className="admin-panel-heading">

              <div>
                <span className="admin-section-label">
                  PERFORMANCE
                </span>

                <h2>Sales Analysis</h2>

                <p>
                  Products ranked by total
                  units sold.
                </p>
              </div>

              <div className="admin-analysis-badge">
                {dashboard?.totalUnitsSold || 0}
                {" "}units sold
              </div>

            </div>

            {sales.length === 0 ? (
              <div className="admin-empty">
                No sales data available yet.
              </div>
            ) : (
              <div className="admin-sales-list">

                {sales.map((item, index) => {

                  const quantity =
                    Number(
                      item.totalQuantity || 0
                    );

                  const width =
                    Math.max(
                      8,
                      (quantity / maxSales) * 100
                    );

                  return (
                    <div
                      className="admin-sales-row"
                      key={item.productId}
                    >

                      <div className="admin-rank">
                        #{index + 1}
                      </div>

                      <div className="admin-product-info">

                        <strong>
                          {item.productName}
                        </strong>

                        <span>
                          {item.sku}
                        </span>

                      </div>

                      <div className="admin-sales-bar-wrapper">

                        <div className="admin-sales-bar">

                          <div
                            className="admin-sales-bar-fill"
                            style={{
                              width: `${width}%`,
                            }}
                          />

                        </div>

                      </div>

                      <div className="admin-sales-quantity">

                        <strong>
                          {quantity}
                        </strong>

                        <span>units</span>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

          <div className="admin-panel status-panel">

            <div className="admin-panel-heading">

              <div>
                <span className="admin-section-label">
                  ORDERS
                </span>

                <h2>Order Status</h2>

                <p>
                  Current order distribution.
                </p>
              </div>

            </div>

            <div className="admin-status-list">

              {orderStatuses.map(
                ([label, value]) => (
                  <div
                    className="admin-status-row"
                    key={label}
                  >
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                )
              )}

            </div>

          </div>

        </section>

        <section className="admin-bottom-grid">

          <div className="admin-highlight-card">

            <span className="admin-section-label">
              BUSINESS OVERVIEW
            </span>

            <h2>Store at a glance</h2>

            <div className="admin-overview-items">

              <div>
                <span>Units Sold</span>

                <strong>
                  {dashboard?.totalUnitsSold || 0}
                </strong>
              </div>

              <div>
                <span>Delivered</span>

                <strong>
                  {dashboard?.deliveredOrders || 0}
                </strong>
              </div>

              <div>
                <span>Cancelled</span>

                <strong>
                  {dashboard?.cancelledOrders || 0}
                </strong>
              </div>

            </div>

          </div>

          <div className="admin-quick-card">

            <span className="admin-section-label">
              QUICK ACCESS
            </span>

            <h2>Manage your store</h2>

            <div className="admin-quick-actions">

              <button
                onClick={() =>
                  navigate("/admin/products")
                }
              >
                ＋ Add Product
              </button>

              <button
                onClick={() =>
                  navigate("/admin/orders")
                }
              >
                ▤ View Orders
              </button>

              <button
                onClick={() =>
                  navigate("/admin/customers")
                }
              >
                ♙ Customers
              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;