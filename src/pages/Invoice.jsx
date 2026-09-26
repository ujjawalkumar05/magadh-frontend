import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Invoice.css";

import bottle1L from "../assets/prodimage.png";
import pouch1L from "../assets/1l-pouch.png";
import bottle500 from "../assets/500ml-bottle.png";
import pouch500 from "../assets/500ml-pouch.png";
import bottle200 from "../assets/200ml-bottle.png";
import jar5L from "../assets/5l-jar.png";
import tin15L from "../assets/15l-tin.png";
import BACKEND_URL from "../config/api";

const API = `${BACKEND_URL}/api`;

const productImages = {
  "MAGADH-OIL-1L": bottle1L,
  "MAGADH-OIL-1L-POUCH": pouch1L,
  "MAGADH-OIL-500ML-BOTTLE": bottle500,
  "MAGADH-OIL-500ML-POUCH": pouch500,
  "MAGADH-OIL-200ML-BOTTLE": bottle200,
  "MAGADH-OIL-5L-JAR": jar5L,
  "MAGADH-OIL-15L-TIN": tin15L,
};

const getVariantName = (sku = "", productName = "") => {
  const value = String(sku).toUpperCase();

  if (value.includes("15L-TIN")) return "15L";
  if (value.includes("5L-JAR")) return "5L";
  if (value.includes("500ML-POUCH")) return "500ML";
  if (value.includes("500ML-BOTTLE")) return "500ML";
  if (value.includes("200ML-BOTTLE")) return "200ML";
  if (value.includes("1L-POUCH")) return "1L";
  if (value.includes("1L")) return "1L";

  return productName || "MAGADH Mustard Oil";
};

const getPackageType = (sku = "") => {
  const value = String(sku).toUpperCase();

  if (value.includes("15L-TIN")) return "TIN";
  if (value.includes("5L-JAR")) return "JAR";
  if (value.includes("500ML-POUCH")) return "POUCH";
  if (value.includes("500ML-BOTTLE")) return "BOTTLE";
  if (value.includes("200ML-BOTTLE")) return "BOTTLE";
  if (value.includes("1L-POUCH")) return "POUCH";
  if (value.includes("1L")) return "BOTTLE";

  return "";
};

const getProductImage = (sku = "") => {
  return productImages[sku] || bottle1L;
};

const formatMoney = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [address, setAddress] = useState(null);
  const [payment, setPayment] = useState(null);
  const [user, setUser] = useState(null);

  // Added only for resolving product SKU.
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const api = async (url) => {
    const response = await fetch(`${API}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let message = `Request failed (${response.status})`;

      try {
        const body = await response.json();
        message =
          body?.message ||
          body?.error ||
          message;
      } catch {
        // Keep default message.
      }

      throw new Error(message);
    }

    return response.json();
  };

  useEffect(() => {
    const loadInvoice = async () => {
      const currentUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (!token || currentUser?.role !== "ADMIN") {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const orderData = await api(`/orders/${id}`);

        setOrder(orderData);

        /*
         * Product catalog is loaded only to resolve
         * the actual SKU for each OrderItem.
         *
         * Existing invoice logic remains unchanged.
         */
        try {
          const productData = await api(
            "/products?page=0&size=100"
          );

          setProducts(
            productData?.content ||
            productData ||
            []
          );
        } catch {
          setProducts([]);
        }

        if (orderData.userId) {
          try {
            const userData = await api(
              `/users/${orderData.userId}`
            );

            setUser(userData);
          } catch {
            /*
             * User details are not mandatory because
             * address.fullName contains the customer name.
             */
          }
        }

        if (
          orderData.userId &&
          orderData.addressId
        ) {
          try {
            const addressData = await api(
              `/addresses/${orderData.addressId}/user/${orderData.userId}`
            );

            setAddress(addressData);
          } catch {
            setAddress(null);
          }
        }

        try {
          const paymentData = await api(
            `/payments/order/${orderData.id}`
          );

          setPayment(paymentData);
        } catch {
          /*
           * No payment record normally means COD.
           */
          setPayment(null);
        }
      } catch (err) {
        setError(
          err.message ||
            "Failed to load invoice"
        );
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id, navigate, token]);

  const isPrepaid =
    Boolean(payment?.razorpayPaymentId) ||
    ["SUCCESS", "COMPLETED", "PAID"].includes(
      String(payment?.status || "").toUpperCase()
    );

  const isCod = !isPrepaid;

  const getCustomerName = () => {
    return (
      address?.fullName ||
      user?.name ||
      "Customer"
    );
  };

  const getAddressLines = () => {
    if (!address) {
      return [];
    }

    const lines = [];

    if (address.buildingNo) {
      lines.push(address.buildingNo);
    }

    if (address.addressLine) {
      lines.push(address.addressLine);
    }

    if (address.area) {
      lines.push(address.area);
    }

    if (address.landmark) {
      lines.push(
        `Near ${address.landmark}`
      );
    }

    const cityState = [
      address.city,
      address.state,
    ]
      .filter(Boolean)
      .join(", ");

    if (cityState || address.pincode) {
      lines.push(
        `${cityState}${
          address.pincode
            ? ` - ${address.pincode}`
            : ""
        }`
      );
    }

    return lines;
  };

  const getItemPrice = (item) => {
    return Number(item.price || 0);
  };

  const getItemAmount = (item) => {
    return (
      getItemPrice(item) *
      Number(item.quantity || 0)
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="invoice-loading-screen">
        <div className="invoice-loading-card">
          Loading invoice...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="invoice-loading-screen">
        <div className="invoice-error-card">
          <h2>Invoice unavailable</h2>

          <p>
            {error ||
              "Order details could not be loaded."}
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items)
    ? order.items
    : [];

  const subtotal = items.reduce(
    (sum, item) =>
      sum + getItemAmount(item),
    0
  );

  const total = Number(
    order.totalAmount || subtotal
  );

  const deliveryCharge = Math.max(
    0,
    total - subtotal
  );

  return (
    <div className="invoice-page">

      {/* Screen-only controls */}
      <div className="invoice-screen-actions">

        <button
          type="button"
          className="invoice-back-button"
          onClick={() =>
            navigate("/admin/orders")
          }
        >
          ← Back to Orders
        </button>

        <button
          type="button"
          className="invoice-print-button"
          onClick={handlePrint}
        >
          🖨 Print Invoice
        </button>

      </div>

      {/* Printable invoice */}
      <main className="invoice-sheet">

        {/* HEADER */}
        <header className="invoice-header">

          <div className="invoice-brand-block">

            <div className="invoice-brand">
              <span className="invoice-brand-magadh">
                MAGADH
              </span>

              <span className="invoice-brand-org">
                Org
              </span>
            </div>

            <div className="invoice-tagline">
              PURE BY NATURE, DESI BY HEART
            </div>

          </div>

          <div className="invoice-bihar-note">
            FROM
            <br />
            BIHAR
            <br />
            TO A HEALTHIER
            <br />
            TOMORROW
          </div>

        </header>

        {/* ORDER */}
        <section className="invoice-order-section">

          <div>

            <h1>
              ORDER #{order.id}
            </h1>

            <div className="invoice-date">
              <span className="invoice-calendar">
                ▣
              </span>

              {formatDate(
                order.createdAt
              )}
            </div>

          </div>

          <div className="invoice-delivery-badge">
            <span className="invoice-truck">
              ▰
            </span>

            <span>
              DELIVERING
              <br />
              GOODNESS
              <br />
              TO YOUR HOME
            </span>
          </div>

        </section>

        {/* DELIVERY + MANUFACTURER */}
        <section className="invoice-info-section">

          <div className="invoice-deliver-block">

            <div className="invoice-section-heading">
              <span className="invoice-location-icon">
                ●
              </span>

              <strong>
                DELIVER TO
              </strong>
            </div>

            <div className="invoice-customer-name">
              {getCustomerName()}
            </div>

            <div className="invoice-address">

              {getAddressLines().map(
                (line, index) => (
                  <div key={index}>
                    {line}
                  </div>
                )
              )}

              {address?.phone && (
                <div className="invoice-mobile">
                  Mobile: {address.phone}
                </div>
              )}

            </div>

          </div>

          <div className="invoice-manufacturer-block">

            <div className="invoice-manufacturer-heading">
              <span className="invoice-factory-icon">
                ▦
              </span>

              <div>
                <strong>
                  MANUFACTURED BY
                </strong>

                <div className="invoice-manufacturer-brand">
                  MAGADH <span>Org</span>
                </div>
              </div>
            </div>

            <div className="invoice-manufacturer-details">
              <div>
                Magadh Org Manufacturing Company
              </div>

              <div>
                SH 90 Dighwa Dubauli,
              </div>

              <div>
                Gopalganj, Bihar - 841409
              </div>

              <div>
                India
              </div>

              <div>
                FSSAI Lic. No.: XXXXXXXX
              </div>
            </div>

          </div>

        </section>

        {/* ITEMS */}
        <section className="invoice-items-section">

          <h2>
            ITEMS
          </h2>

          <div className="invoice-items-table">

            <div className="invoice-table-header">

              <div>
                Product
              </div>

              <div>
                Qty
              </div>

              <div>
                Amount
              </div>

            </div>

            {items.map((item) => {

              /*
               * Resolve SKU from OrderItem first.
               * If OrderItem does not contain SKU,
               * find the product from the product catalog
               * using productId.
               */
              const product =
                products.find(
                  (product) =>
                    Number(product.id) ===
                    Number(
                      item.productId ||
                      item.product?.id
                    )
                );

              const sku =
                item.sku ||
                item.productSku ||
                item.product?.sku ||
                item.product?.productSku ||
                product?.sku ||
                "";

              const variant =
                getVariantName(
                  sku,
                  item.productName ||
                  item.product?.name
                );

              const packageType =
                getPackageType(sku);

              return (
                <div
                  className="invoice-item-row"
                  key={
                    item.id ||
                    `${item.productId}-${variant}`
                  }
                >

                  <div className="invoice-product-cell">

                    <div className="invoice-product-image-wrap">
                      <img
                        src={getProductImage(
                          sku
                        )}
                        alt={variant}
                        className="invoice-product-image"
                      />
                    </div>

                    <div className="invoice-product-info">

                      <strong>
                        {item.productName ||
                          item.product?.name ||
                          "MAGADH Mustard Oil"}
                      </strong>

                      {/* Variant: 500ML • BOTTLE */}
                      <span>
                        {variant}

                        {packageType && (
                          <>
                            {" • "}
                            <strong
                              style={{
                                fontWeight: 700,
                                fontSize: "inherit",
                              }}
                            >
                              {packageType}
                            </strong>
                          </>
                        )}
                      </span>

                      <span>
                        Pure Kachi Ghani Mustard Oil
                      </span>

                    </div>

                  </div>

                  <div className="invoice-qty-cell">
                    {item.quantity}
                  </div>

                  <div className="invoice-amount-cell">

                    <strong>
                      {formatMoney(
                        getItemAmount(
                          item
                        )
                      )}
                    </strong>

                    <span>
                      (
                      {formatMoney(
                        getItemPrice(
                          item
                        )
                      )}{" "}
                      ×{" "}
                      {item.quantity}
                      )
                    </span>

                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* TOTALS */}
        <section className="invoice-total-section">

          <div className="invoice-total-line">
            <span>
              Subtotal
            </span>

            <strong>
              {formatMoney(
                subtotal
              )}
            </strong>
          </div>

          <div className="invoice-total-line">
            <span>
              Delivery
            </span>

            <strong>
              {deliveryCharge === 0
                ? "FREE"
                : formatMoney(
                    deliveryCharge
                  )}
            </strong>
          </div>

          <div className="invoice-total-line invoice-grand-total">
            <span>
              TOTAL
            </span>

            <strong>
              {formatMoney(total)}
            </strong>
          </div>

        </section>

        {/* PAYMENT */}
        <section
          className={`invoice-payment-section ${
            isCod
              ? "cod"
              : "prepaid"
          }`}
        >

          <div className="invoice-payment-icon">
            ₹
          </div>

          <div className="invoice-payment-content">

            <strong>
              {isCod
                ? "CASH ON DELIVERY"
                : "PREPAID"}
            </strong>

            <span>
              {isCod
                ? `COLLECT ${formatMoney(
                    total
                  )}`
                : "PAYMENT RECEIVED"}
            </span>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="invoice-footer">

          <div className="invoice-barcode-area">

            <div className="invoice-barcode">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>

            <div className="invoice-barcode-number">
              ORD
              {String(order.id).padStart(
                4,
                "0"
              )}
            </div>

          </div>

          <div className="invoice-thank-you">

            <div className="invoice-thank-text">
              Thank you for your order!
            </div>

            <div className="invoice-footer-brand">
              MAGADH <span>Org</span>
            </div>

            <div className="invoice-footer-tagline">
              SARSON KI SHUDDHTA, MAGADH KI PEHCHAAN.
            </div>

          </div>

        </footer>

      </main>

    </div>
  );
}

export default Invoice;