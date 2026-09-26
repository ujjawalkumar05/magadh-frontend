import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BACKEND_URL from "../config/api";
import "./Payment.css";

const API_BASE = BACKEND_URL;

/*
 * Product image comes dynamically from backend.
 * No product/SKU is hardcoded here.
 */
const getProductImage = (p) => {
  if (!p || typeof p !== "object") return "";

  const first = (v) => (Array.isArray(v) ? v[0] : v);

  let raw =
    p.imageUrl ||
    p.image ||
    p.imageURL ||
    p.image_url ||
    p.imagePath ||
    p.image_path ||
    p.img ||
    p.thumbnail ||
    p.photo ||
    p.picture ||
    p.productImage ||
    first(p.images) ||
    first(p.imageUrls) ||
    first(p.productImages) ||
    "";

  // images: [{ url: "..." }] type structure
  if (raw && typeof raw === "object") {
    raw =
      raw.url ||
      raw.imageUrl ||
      raw.image ||
      raw.path ||
      raw.src ||
      "";
  }

  if (!raw || typeof raw !== "string") return "";

  // Already a full URL / base64 / blob URL
  if (/^(https?:|data:|blob:)/.test(raw)) {
    return raw;
  }

  // Relative path -> attach backend URL
  return `${API_BASE}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();

  const checkoutData = location.state || {};

  const address = checkoutData.address || {};
  const items = checkoutData.items || [];
  const products = checkoutData.products || [];
  const subtotal = Number(checkoutData.subtotal || 0);

  // Order created during checkout
  const orderId =
    checkoutData.orderId ||
    checkoutData.order?.id ||
    checkoutData.order?.orderId;

  const token = localStorage.getItem("token");

  const [selectedMethod, setSelectedMethod] = useState("");

  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  const [upiApp, setUpiApp] = useState("");
  const [bank, setBank] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // -----------------------------
  // CARD NUMBER
  // -----------------------------
  const handleCardNumber = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 16) {
      value = value.slice(0, 16);
    }

    value = value.replace(/(.{4})/g, "$1 ").trim();

    setCardDetails({
      ...cardDetails,
      number: value,
    });
  };

  // -----------------------------
  // EXPIRY
  // -----------------------------
  const handleExpiry = (e) => {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    if (value.length >= 3) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }

    setCardDetails({
      ...cardDetails,
      expiry: value,
    });
  };

  // -----------------------------
  // PAY / PLACE ORDER
  // -----------------------------
  const handlePayNow = async () => {
    if (!selectedMethod) {
      alert("Please select a payment method.");
      return;
    }

    // =========================================
    // CASH ON DELIVERY
    // =========================================
    if (selectedMethod === "cod") {
      try {
        if (!orderId) {
          alert("Order ID not found. Please go back to checkout.");
          return;
        }

        if (!token) {
          alert("Please login again.");
          navigate("/login");
          return;
        }

        setPlacingOrder(true);

        const response = await fetch(
          `${API_BASE}/api/orders/${orderId}/cod`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          let errorMessage = "Failed to place COD order.";

          try {
            const errorData = await response.json();

            errorMessage =
              errorData.message ||
              errorData.error ||
              errorMessage;
          } catch {
            const errorText = await response.text();

            if (errorText) {
              errorMessage = errorText;
            }
          }

          throw new Error(errorMessage);
        }

        // Backend successfully changed:
        // PENDING -> CONFIRMED

        setOrderPlaced(true);
      } catch (error) {
        console.error("COD order error:", error);

        alert(
          error.message ||
            "Unable to place COD order. Please try again."
        );
      } finally {
        setPlacingOrder(false);
      }

      return;
    }

    // =========================================
    // CARD
    // =========================================
    if (selectedMethod === "card") {
      if (
        !cardDetails.name.trim() ||
        cardDetails.number.replace(/\s/g, "").length !== 16 ||
        cardDetails.expiry.length !== 5 ||
        cardDetails.cvv.length !== 3
      ) {
        alert("Please enter valid card details.");
        return;
      }

      alert("Card payment will be connected with Razorpay.");
      return;
    }

    // =========================================
    // UPI
    // =========================================
    if (selectedMethod === "upi") {
      if (!upiApp) {
        alert("Please select a UPI app.");
        return;
      }

      alert("UPI payment will be connected with Razorpay.");
      return;
    }

    // =========================================
    // NET BANKING
    // =========================================
    if (selectedMethod === "netbanking") {
      if (!bank) {
        alert("Please select your bank.");
        return;
      }

      alert("Net Banking payment will be connected with Razorpay.");
      return;
    }
  };

  // =========================================
  // ORDER SUCCESS SCREEN
  // =========================================
  if (orderPlaced) {
    return (
      <main className="order-success-page">
        <div className="success-card">
          <div className="success-icon">✓</div>

          <span className="success-label">
            ORDER CONFIRMED
          </span>

          <h1>
            𝑾𝒆𝒍𝒄𝒐𝒎𝒆 𝒕𝒐 𝒕𝒉𝒆 𝑴𝑨𝑮𝑨𝑫𝑯 𝑯𝒆𝒂𝒍𝒕𝒉𝒚 𝑭𝒂𝒎𝒊𝒍𝒚! 🌿
          </h1>

          <p className="success-message">
            𝑻𝒉𝒂𝒏𝒌 𝒚𝒐𝒖 𝒇𝒐𝒓 𝒄𝒉𝒐𝒐𝒔𝒊𝒏𝒈
            <br />
            𝟏𝟎𝟎% 𝑷𝒖𝒓𝒆 𝑴𝒖𝒔𝒕𝒂𝒓𝒅 𝑶𝒊𝒍
            <br />
            𝒇𝒐𝒓 𝒚𝒐𝒖𝒓 𝒇𝒂𝒎𝒊𝒍𝒚. ❤️
          </p>

          <div className="success-order-info">
            <div>
              <span>Payment Method</span>
              <strong>Cash on Delivery</strong>
            </div>

            <div>
              <span>Order Amount</span>
              <strong>₹{subtotal.toFixed(2)}</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/orders")}
          >
            VIEW MY ORDERS →
          </button>

          <button
            type="button"
            className="continue-home"
            onClick={() => navigate("/")}
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="payment-page">

      {/* =========================================
          NAVBAR
      ========================================= */}
      <nav className="payment-navbar">
        <div
          className="payment-logo"
          onClick={() => navigate("/")}
        >
          <span>MAGADH</span>
          <small>Org</small>
        </div>

        <div className="payment-secure">
          🔒 Secure Checkout
        </div>
      </nav>

      {/* =========================================
          PAGE HEADER
      ========================================= */}
      <section className="payment-header">
        <span className="payment-eyebrow">
          MAGADH ORG
        </span>

        <h1>Complete Your Payment</h1>

        <p>
          Choose your preferred payment method
          and complete your order securely.
        </p>
      </section>

      {/* =========================================
          MAIN PAYMENT CONTAINER
      ========================================= */}
      <div className="payment-container">

        {/* =========================================
            LEFT SIDE
        ========================================= */}
        <section className="payment-main-card">

          <div className="payment-card-header">
            <div>
              <span className="section-label">
                PAYMENT METHOD
              </span>

              <h2>Choose how you want to pay</h2>
            </div>

            <span className="secure-badge">
              🔒 Secure
            </span>
          </div>

          {/* =========================================
              CARD
          ========================================= */}
          <div
            className={`payment-option ${
              selectedMethod === "card"
                ? "selected"
                : ""
            }`}
            onClick={() => setSelectedMethod("card")}
          >
            <div className="payment-option-left">

              <div className="payment-icon card-icon">
                💳
              </div>

              <div>
                <h3>Credit / Debit Card</h3>

                <p>
                  Visa, Mastercard, RuPay & more
                </p>
              </div>
            </div>

            <div className="payment-radio">
              {selectedMethod === "card" && (
                <span />
              )}
            </div>
          </div>

          {/* CARD DETAILS */}
          {selectedMethod === "card" && (
            <div className="payment-details card-details">

              <div className="card-form">

                <div className="form-group">
                  <label>Cardholder Name</label>

                  <input
                    type="text"
                    placeholder="Enter cardholder name"
                    value={cardDetails.name}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Card Number</label>

                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={handleCardNumber}
                    maxLength={19}
                  />
                </div>

                <div className="card-form-row">

                  <div className="form-group">
                    <label>Expiry</label>

                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={handleExpiry}
                      maxLength={5}
                    />
                  </div>

                  <div className="form-group">
                    <label>CVV</label>

                    <input
                      type="password"
                      placeholder="•••"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          cvv: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 3),
                        })
                      }
                      maxLength={3}
                    />
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* =========================================
              UPI
          ========================================= */}
          <div
            className={`payment-option ${
              selectedMethod === "upi"
                ? "selected"
                : ""
            }`}
            onClick={() => setSelectedMethod("upi")}
          >
            <div className="payment-option-left">

              <div className="payment-icon upi-icon">
                <span className="upi-text">UPI</span>
              </div>

              <div>
                <h3>UPI</h3>

                <p>
                  Google Pay, PhonePe, Paytm, BHIM
                </p>
              </div>

            </div>

            <div className="payment-radio">
              {selectedMethod === "upi" && (
                <span />
              )}
            </div>
          </div>

          {/* UPI DETAILS */}
          {selectedMethod === "upi" && (
            <div className="payment-details">

              <div className="upi-select-wrapper">

                <label>Select UPI App</label>

                <select
                  value={upiApp}
                  onChange={(e) =>
                    setUpiApp(e.target.value)
                  }
                >
                  <option value="">
                    Select your UPI app
                  </option>

                  <option value="googlepay">
                    Google Pay
                  </option>

                  <option value="phonepe">
                    PhonePe
                  </option>

                  <option value="paytm">
                    Paytm
                  </option>

                  <option value="bhim">
                    BHIM UPI
                  </option>

                  <option value="other">
                    Other UPI App
                  </option>
                </select>

              </div>

              {upiApp && (
                <div className="selected-upi">
                  ✓{" "}
                  {upiApp === "googlepay"
                    ? "Google Pay"
                    : upiApp === "phonepe"
                    ? "PhonePe"
                    : upiApp === "paytm"
                    ? "Paytm"
                    : upiApp === "bhim"
                    ? "BHIM UPI"
                    : "Other UPI App"}{" "}
                  selected
                </div>
              )}

            </div>
          )}

          {/* =========================================
              NET BANKING
          ========================================= */}
          <div
            className={`payment-option ${
              selectedMethod === "netbanking"
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setSelectedMethod("netbanking")
            }
          >
            <div className="payment-option-left">

              <div className="payment-icon bank-icon">
                🏦
              </div>

              <div>
                <h3>Net Banking</h3>

                <p>
                  Pay directly from your bank account
                </p>
              </div>

            </div>

            <div className="payment-radio">
              {selectedMethod === "netbanking" && (
                <span />
              )}
            </div>
          </div>

          {/* BANK DETAILS */}
          {selectedMethod === "netbanking" && (
            <div className="payment-details">

              <div className="upi-select-wrapper">

                <label>Select Your Bank</label>

                <select
                  value={bank}
                  onChange={(e) =>
                    setBank(e.target.value)
                  }
                >
                  <option value="">
                    Select your bank
                  </option>

                  <option value="sbi">
                    State Bank of India
                  </option>

                  <option value="hdfc">
                    HDFC Bank
                  </option>

                  <option value="icici">
                    ICICI Bank
                  </option>

                  <option value="axis">
                    Axis Bank
                  </option>

                  <option value="kotak">
                    Kotak Mahindra Bank
                  </option>

                  <option value="pnb">
                    Punjab National Bank
                  </option>

                  <option value="bob">
                    Bank of Baroda
                  </option>

                  <option value="other">
                    Other Bank
                  </option>
                </select>

              </div>

            </div>
          )}

          {/* =========================================
              COD
          ========================================= */}
          <div
            className={`payment-option ${
              selectedMethod === "cod"
                ? "selected"
                : ""
            }`}
            onClick={() => setSelectedMethod("cod")}
          >
            <div className="payment-option-left">

              <div className="payment-icon cod-icon">
                💵
              </div>

              <div>
                <h3>Cash on Delivery</h3>

                <p>
                  Pay when your order arrives
                </p>
              </div>

            </div>

            <div className="payment-radio">
              {selectedMethod === "cod" && (
                <span />
              )}
            </div>
          </div>

          {/* COD DETAILS */}
          {selectedMethod === "cod" && (
            <div className="payment-details">

              <div className="cod-confirmation">

                <div className="cod-check">
                  ✓
                </div>

                <div>
                  <strong>
                    Cash on Delivery selected
                  </strong>

                  <p>
                    Pay securely in cash when your
                    MAGADH Org order is delivered
                    to your doorstep.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* =========================================
              DELIVERY ADDRESS
          ========================================= */}
          <div className="payment-address-card">

            <div className="payment-address-header">
              <span className="section-label">
                DELIVERY ADDRESS
              </span>

              <button
                type="button"
                onClick={() => navigate("/checkout")}
              >
                CHANGE
              </button>
            </div>

            <div className="payment-address-content">

              <strong>
                {address.fullName ||
                  address.name ||
                  "Delivery Address"}
              </strong>

              <p>
                {address.addressLine1 ||
                  address.address ||
                  ""}
              </p>

              {address.addressLine2 && (
                <p>{address.addressLine2}</p>
              )}

              <p>
                {address.city || ""}
                {address.city && address.state
                  ? ", "
                  : ""}
                {address.state || ""}
                {address.pincode
                  ? ` - ${address.pincode}`
                  : ""}
              </p>

              {address.phone && (
                <p>
                  Phone: {address.phone}
                </p>
              )}

            </div>

          </div>

        </section>

        {/* =========================================
            RIGHT SIDE - ORDER SUMMARY
        ========================================= */}
        <aside className="payment-summary">

          <div className="summary-header">

            <span className="section-label">
              YOUR ORDER
            </span>

            <h2>Order Summary</h2>

          </div>

          {/* =========================================
              ONLY USER CART ITEMS (with product image)
          ========================================= */}
          <div className="summary-products">

            {items.length > 0 ? (
              items.map((item, index) => {

                const productId =
                  item.productId ??
                  item.product?.id ??
                  item.product?.productId ??
                  item.id;

                const matchedProduct = products.find(
                  (p) =>
                    String(p.id ?? p.productId) ===
                    String(productId)
                );

                const product =
                  matchedProduct ||
                  item.product ||
                  item;

                console.log(
                  "CART ITEM:",
                  item,
                  "PRODUCT:",
                  product
                );

                const productName =
                  product.name ||
                  item.name ||
                  item.productName ||
                  "MAGADH Mustard Oil";

                const productImage =
                  getProductImage(product) ||
                  getProductImage(item) ||
                  getProductImage(item.product);

                const quantity = Number(
                  item.quantity || 1
                );

                const price = Number(
                  item.price ?? product.price ?? 0
                );

                return (
                  <div
                    className="summary-product"
                    key={
                      item.id ||
                      item.productId ||
                      product.id ||
                      index
                    }
                  >

                    <div className="summary-product-image">

                      {productImage ? (
                        <img
                          src={productImage}
                          alt={productName}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <span>MAGADH</span>
                      )}

                    </div>

                    <div className="summary-product-info">

                      <h3>{productName}</h3>

                      <p>Qty: {quantity}</p>

                    </div>

                    <strong>
                      ₹{(price * quantity).toFixed(2)}
                    </strong>

                  </div>
                );
              })
            ) : (
              <div className="summary-product">

                <div className="summary-product-image">
                  <span>MAGADH</span>
                </div>

                <div className="summary-product-info">

                  <h3>MAGADH Mustard Oil</h3>

                  <p>Qty: 1</p>

                </div>

                <strong>
                  ₹{subtotal.toFixed(2)}
                </strong>

              </div>
            )}

          </div>

          <div className="summary-divider" />

          <div className="summary-row">
            <span>Subtotal</span>

            <strong>
              ₹{subtotal.toFixed(2)}
            </strong>
          </div>

          <div className="summary-row">
            <span>Delivery</span>

            <strong className="free-text">
              FREE
            </strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-total">

            <span>Total Amount</span>

            <strong>
              ₹{subtotal.toFixed(2)}
            </strong>

          </div>

          <button
            type="button"
            className="pay-now-button"
            onClick={handlePayNow}
            disabled={placingOrder}
          >
            {placingOrder
              ? "PLACING ORDER..."
              : selectedMethod === "cod"
              ? "PLACE ORDER"
              : "PAY NOW"}
          </button>

          <div className="payment-security">

            <span>🔒</span>

            <p>
              Your payment information is
              protected with secure encryption.
            </p>

          </div>

        </aside>

      </div>

    </main>
  );
}

export default Payment;