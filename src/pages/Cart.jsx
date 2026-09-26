import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

import product1L from "../assets/prodimage.png";
import product1LPouch from "../assets/1l-pouch.png";
import product500ML from "../assets/500ml-bottle.png";
import product500MLPouch from "../assets/500ml-pouch.png";
import product200ML from "../assets/200ml-bottle.png";
import product5L from "../assets/5l-jar.png";
import product15L from "../assets/15l-tin.png";
import BACKEND_URL from "../config/api";

const CART_CACHE_KEY = "magadh_cart";

function getCachedCart() {
  try {
    const cached =
      localStorage.getItem(CART_CACHE_KEY);

    if (!cached) {
      return null;
    }

    const parsed =
      JSON.parse(cached);

    return parsed && typeof parsed === "object"
      ? parsed
      : null;

  } catch (err) {

    return null;

  }
}

function getCachedProducts() {
  try {

    const cached =
      localStorage.getItem(
        "magadh_products"
      );

    if (!cached) {
      return [];
    }

    const parsed =
      JSON.parse(cached);

    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch (err) {

    return [];

  }
}

function getStoredUser() {
  try {

    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      return null;
    }

    const user =
      JSON.parse(storedUser);

    return user &&
      typeof user === "object"
      ? user
      : null;

  } catch (err) {

    return null;

  }
}

function Cart() {

  const navigate = useNavigate();

  /*
   * Cached cart is used only for instant rendering.
   * Backend remains the source of truth.
   */
  const [cart, setCart] =
    useState(getCachedCart);

  /*
   * Products are already cached by Products.jsx.
   * This avoids waiting for /api/products every time
   * the cart page opens.
   */
  const [products, setProducts] =
    useState(getCachedProducts);

  const [loading, setLoading] =
    useState(
      getCachedCart() === null
    );

  const [error, setError] =
    useState("");

  const [updatingItemId, setUpdatingItemId] =
    useState(null);

  const productImages = {
    "MAGADH-OIL-1L": product1L,
    "MAGADH-OIL-1L-POUCH": product1LPouch,
    "MAGADH-OIL-500ML-BOTTLE": product500ML,
    "MAGADH-OIL-500ML-POUCH": product500MLPouch,
    "MAGADH-OIL-200ML-BOTTLE": product200ML,
    "MAGADH-OIL-5L-JAR": product5L,
    "MAGADH-OIL-15L-TIN": product15L
  };


  /* =========================================
     ANIMATED CART
  ========================================= */

  const AnimatedCart = () => (

    <div className="animated-cart-area">

      <div className="flying-product product-one">
        <img
          src={product1L}
          alt="MAGADH 1L Mustard Oil"
        />
      </div>

      <div className="flying-product product-two">
        <img
          src={product500ML}
          alt="MAGADH 500ML Mustard Oil"
        />
      </div>

      <div className="flying-product product-three">
        <img
          src={product1LPouch}
          alt="MAGADH 1L Mustard Oil Pouch"
        />
      </div>

      <div className="flying-product product-four">
        <img
          src={product200ML}
          alt="MAGADH 200ML Mustard Oil"
        />
      </div>

      <div className="flying-product product-five">
        <img
          src={product500MLPouch}
          alt="MAGADH 500ML Mustard Oil Pouch"
        />
      </div>

      <div className="flying-product product-six">
        <img
          src={product5L}
          alt="MAGADH 5L Mustard Oil"
        />
      </div>

      <div className="big-cart-icon">

        <div className="cart-gold-glow"></div>

        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >

          <path
            d="M5 8H12L18 42H51L58 18H15"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle
            cx="24"
            cy="53"
            r="4"
            fill="currentColor"
          />

          <circle
            cx="48"
            cy="53"
            r="4"
            fill="currentColor"
          />

          <path
            d="M21 42H18"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />

        </svg>

      </div>

    </div>

  );


  /* =========================================
     FETCH CART
  ========================================= */

  const fetchCart = async ({
    showLoading = false
  } = {}) => {

    try {

      setError("");

      const token =
        localStorage.getItem("token");

      if (!token) {

        setLoading(false);

        return;

      }

      /*
       * Keep existing user resolution.
       *
       * If user information already exists in
       * localStorage, use its ID immediately.
       *
       * Otherwise fall back to /api/users/me.
       */

      let user =
        getStoredUser();

      let userId =
        Number(user?.id);

      if (
        !Number.isFinite(userId) ||
        userId <= 0
      ) {

        const userResponse =
          await fetch(
            `${BACKEND_URL}/api/users/me`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json"
              }
            }
          );

        if (
          userResponse.status === 401 ||
          userResponse.status === 403
        ) {

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          setError(
            "Your login session has expired. Please login again."
          );

          return;

        }

        if (!userResponse.ok) {

          const message =
            await userResponse
              .text()
              .catch(() => "");

          throw new Error(
            message ||
            "Unable to find user."
          );

        }

        user =
          await userResponse.json();

        userId =
          Number(user?.id);

        /*
         * Keep user cache synchronized.
         */

        if (
          Number.isFinite(userId) &&
          userId > 0
        ) {

          try {

            localStorage.setItem(
              "user",
              JSON.stringify(user)
            );

          } catch (err) {
            // Cache failure must not block cart.
          }

        }

      }

      if (
        !Number.isFinite(userId) ||
        userId <= 0
      ) {

        throw new Error(
          "User ID not received."
        );

      }

      /*
       * Cart and products are independent.
       *
       * Fetch them in parallel instead of:
       *
       * user → cart → products
       */

      const cartPromise =
        fetch(
          `${BACKEND_URL}/api/carts/user/${userId}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json"
            }
          }
        );

      /*
       * Only request products if there is no
       * usable cached product data.
       *
       * Products.jsx already keeps this cache
       * updated from the backend.
       */

      const productsPromise =
        products.length > 0
          ? Promise.resolve(null)
          : fetch(
              `${BACKEND_URL}/api/products`
            );

      const [
        cartResponse,
        productsResponse
      ] = await Promise.all([
        cartPromise,
        productsPromise
      ]);

      if (
        cartResponse.status === 401 ||
        cartResponse.status === 403
      ) {

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        setError(
          "Your login session has expired. Please login again."
        );

        return;

      }

      if (!cartResponse.ok) {

        throw new Error(
          "Failed to fetch cart."
        );

      }

      const cartData =
        await cartResponse.json();

      /*
       * Backend cart is always the source
       * of truth.
       */

      setCart(cartData);

      /*
       * Save latest cart for instant rendering
       * on the next visit.
       */

      try {

        localStorage.setItem(
          CART_CACHE_KEY,
          JSON.stringify(cartData)
        );

      } catch (err) {
        // Cache failure must not block cart.
      }


      /* ================= PRODUCTS ================= */

      if (productsResponse) {

        if (!productsResponse.ok) {

          throw new Error(
            "Failed to fetch product details."
          );

        }

        const productsData =
          await productsResponse.json();

        const productList =
          Array.isArray(productsData)
            ? productsData
            : productsData?.content || [];

        setProducts(
          productList
        );

        try {

          localStorage.setItem(
            "magadh_products",
            JSON.stringify(productList)
          );

        } catch (err) {
          // Cache failure must not block cart.
        }

      }

    } catch (err) {

      /*
       * If cached cart exists, keep it visible.
       * Do not replace working cached UI with
       * an error just because background refresh
       * failed.
       */

      if (!cart) {

        setError(
          err.message ||
          "Something went wrong."
        );

      } else {

        console.error(
          "Cart refresh error:",
          err
        );

      }

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    /*
     * Cached cart is already visible.
     *
     * Backend refresh happens in background.
     */

    fetchCart();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /* =========================================
     PRODUCT
  ========================================= */

  const getProduct = (productId) => {

    return products.find(
      (product) =>
        Number(product.id) ===
        Number(productId)
    );

  };


  /* =========================================
     UPDATE QUANTITY
  ========================================= */

  const updateQuantity = async (
    item,
    newQuantity
  ) => {

    if (newQuantity < 1) {
      return;
    }

    try {

      setUpdatingItemId(
        item.id
      );

      const token =
        localStorage.getItem("token");

      if (!token) {

        navigate("/login");

        return;

      }

      /*
       * Use stored user first.
       * This avoids /api/users/me when possible.
       */

      let user =
        getStoredUser();

      let userId =
        Number(user?.id);

      /*
       * Fallback to the existing /me flow
       * if user ID is not available.
       */

      if (
        !Number.isFinite(userId) ||
        userId <= 0
      ) {

        const userResponse =
          await fetch(
            `${BACKEND_URL}/api/users/me`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json"
              }
            }
          );

        if (!userResponse.ok) {

          throw new Error(
            "Unable to find user."
          );

        }

        user =
          await userResponse.json();

        userId =
          Number(user?.id);

      }

      const response =
        await fetch(
          `${BACKEND_URL}/api/carts/user/${userId}/items/${item.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
              productId:
                item.productId,

              quantity:
                newQuantity
            })
          }
        );

      if (!response.ok) {

        const data =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          data?.message ||
          "Failed to update quantity."
        );

      }

      /*
       * Refresh the current cart using
       * the existing backend source of truth.
       *
       * No page loading screen is shown.
       */

      await fetchCart();

    } catch (err) {

      setError(
        err.message ||
        "Something went wrong."
      );

    } finally {

      setUpdatingItemId(
        null
      );

    }

  };


  /* =========================================
     DELETE ITEM
  ========================================= */

  const removeItem = async (
    itemId
  ) => {

    try {

      setUpdatingItemId(
        itemId
      );

      const token =
        localStorage.getItem("token");

      if (!token) {

        navigate("/login");

        return;

      }

      /*
       * Use cached user ID first.
       */

      let user =
        getStoredUser();

      let userId =
        Number(user?.id);

      /*
       * Existing fallback remains intact.
       */

      if (
        !Number.isFinite(userId) ||
        userId <= 0
      ) {

        const userResponse =
          await fetch(
            `${BACKEND_URL}/api/users/me`,
            {
              method: "GET",

              headers: {
                Authorization:
                  `Bearer ${token}`,

                "Content-Type":
                  "application/json"
              }
            }
          );

        if (!userResponse.ok) {

          throw new Error(
            "Unable to find user."
          );

        }

        user =
          await userResponse.json();

        userId =
          Number(user?.id);

      }

      const response =
        await fetch(
          `${BACKEND_URL}/api/carts/user/${userId}/items/${itemId}`,
          {
            method: "DELETE",

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

      if (!response.ok) {

        throw new Error(
          "Failed to remove product."
        );

      }

      /*
       * Refresh current backend cart.
       */

      await fetchCart();

    } catch (err) {

      setError(
        err.message ||
        "Something went wrong."
      );

    } finally {

      setUpdatingItemId(
        null
      );

    }

  };


  /* =========================================
     NAVBAR
  ========================================= */

  const Navbar = () => (

    <nav className="cart-navbar">

      <div
        className="cart-brand"
        onClick={() =>
          navigate("/")
        }
      >

        <strong>
          MAGADH
        </strong>

        <span>
          Org
        </span>

      </div>

      <div className="cart-search">

        <span>
          ⌕
        </span>

        <input
          type="text"
          placeholder="Search for Products, Brands and More"
        />

      </div>

      <button
        type="button"
        className="cart-nav-login"
        onClick={() =>
          navigate("/login")
        }
      >

        <span className="cart-user-icon">
          ♙
        </span>

        Login

      </button>

      <button
        type="button"
        className="cart-nav-cart"
        onClick={() =>
          navigate("/cart")
        }
      >

        <span>
          🛒
        </span>

        Cart

      </button>

    </nav>

  );


  /* =========================================
     TOKEN
  ========================================= */

  const token =
    localStorage.getItem("token");


  /* =========================================
     LOGGED OUT
  ========================================= */

  if (!token) {

    return (

      <main className="cart-page">

        <Navbar />

        <section className="cart-login-content">

          <AnimatedCart />

          <h2>
            Login to view your cart
          </h2>

          <p>
            Please login or create an account to access
            your cart and continue shopping.
          </p>

          <div className="cart-login-actions">

            <button
              type="button"
              className="cart-login-button"
              onClick={() => {

                localStorage.setItem(
                  "returnAfterLogin",
                  "/cart"
                );

                navigate("/login");

              }}
            >
              LOGIN
            </button>

            <button
              type="button"
              className="cart-register-button"
              onClick={() => {

                localStorage.setItem(
                  "returnAfterLogin",
                  "/cart"
                );

                navigate("/register");

              }}
            >
              CREATE ACCOUNT
            </button>

          </div>

        </section>

      </main>

    );

  }


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {

    return (

      <main className="cart-page">

        <Navbar />

        <div className="cart-message">
          Loading your cart...
        </div>

      </main>

    );

  }


  /* =========================================
     ERROR
  ========================================= */

  if (error) {

    return (

      <main className="cart-page">

        <Navbar />

        <div className="cart-message cart-error">

          {error}

          {(error.includes("session") ||
            error.includes("login")) && (

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="cart-error-login"
            >
              LOGIN AGAIN
            </button>

          )}

        </div>

      </main>

    );

  }


  const items =
    cart?.items || [];


  /* =========================================
     GRAND TOTAL
  ========================================= */

  const grandTotal =
    items.reduce(
      (total, item) => {

        const product =
          getProduct(
            item.productId
          );

        const price =
          Number(
            product?.price || 0
          );

        const quantity =
          Number(
            item.quantity || 0
          );

        return total +
          price * quantity;

      },
      0
    );


  /* =========================================
     CART
  ========================================= */

  return (

    <main className="cart-page">

      <Navbar />

      {items.length === 0 ? (

        <section className="empty-cart">

          <AnimatedCart />

          <h2>
            Your cart is empty
          </h2>

          <p>
            Add some MAGADH Org products to continue.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/products")
            }
          >
            SHOP PRODUCTS
          </button>

        </section>

      ) : (

        <section className="cart-layout">


          {/* =================================
              LEFT
          ================================= */}

          <div className="cart-items-section">

            <div className="cart-items-top">

              <div>

                <span className="section-eyebrow">
                  MAGADH ORG
                </span>

                <h2>
                  Your Shopping Cart
                </h2>

              </div>

              <div className="cart-item-count">

                {items.length}

                <span>
                  {items.length === 1
                    ? " PRODUCT"
                    : " PRODUCTS"}
                </span>

              </div>

            </div>


            <div className="cart-products-list">

              {items.map((item) => {

                const product =
                  getProduct(
                    item.productId
                  );

                const price =
                  Number(
                    product?.price || 0
                  );

                /*
                 * Admin uploaded Cloudinary image
                 * is preferred.
                 *
                 * Existing local SKU image remains
                 * as fallback for old products.
                 */

                const image =
                  product?.imageUrl ||
                  productImages[
                    product?.sku
                  ];

                const itemTotal =
                  price *
                  Number(
                    item.quantity || 0
                  );


                return (

                  <article
                    className="cart-product"
                    key={item.id}
                  >

                    {/* PRODUCT IMAGE */}

                    <div className="cart-product-image">

                      <div className="image-gold-glow"></div>

                      {image ? (

                        <img
                          src={image}
                          alt={item.productName}
                        />

                      ) : (

                        <div className="cart-image-placeholder">
                          MAGADH
                        </div>

                      )}

                    </div>


                    {/* DETAILS */}

                    <div className="cart-product-details">

                      <span className="cart-product-category">
                        PREMIUM MUSTARD OIL
                      </span>

                      <h3>
                        {item.productName}
                      </h3>

                      <div className="product-unit-price">

                        ₹{price.toFixed(2)}

                        <span>
                          {" "}
                          / unit
                        </span>

                      </div>


                      <div className="cart-product-actions">

                        <div className="quantity-control">

                          <button
                            type="button"
                            disabled={
                              updatingItemId === item.id ||
                              item.quantity <= 1
                            }
                            onClick={() =>
                              updateQuantity(
                                item,
                                item.quantity - 1
                              )
                            }
                          >
                            −
                          </button>

                          <span>
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={
                              updatingItemId === item.id
                            }
                            onClick={() =>
                              updateQuantity(
                                item,
                                item.quantity + 1
                              )
                            }
                          >
                            +
                          </button>

                        </div>


                        {/* DELETE */}

                        <button
                          type="button"
                          className="remove-button"
                          disabled={
                            updatingItemId === item.id
                          }
                          onClick={() =>
                            removeItem(
                              item.id
                            )
                          }
                          aria-label="Remove item"
                          title="Remove item"
                        >

                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >

                            <path
                              d="M4 7H20"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />

                            <path
                              d="M10 11V17"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />

                            <path
                              d="M14 11V17"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />

                            <path
                              d="M6 7L7 20H17L18 7"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinejoin="round"
                            />

                            <path
                              d="M9 7V4H15V7"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinejoin="round"
                            />

                          </svg>

                        </button>

                      </div>

                    </div>


                    {/* TOTAL */}

                    <div className="cart-product-total">

                      <span className="item-total-label">
                        ITEM TOTAL
                      </span>

                      <strong>
                        ₹{itemTotal.toFixed(2)}
                      </strong>

                    </div>

                  </article>

                );

              })}

            </div>


            {/* CONTINUE */}

            <button
              type="button"
              className="continue-shopping bottom-continue"
              onClick={() =>
                navigate("/products")
              }
            >

              <span>
                ←
              </span>

              Continue Shopping

            </button>

          </div>


          {/* =================================
              SUMMARY
          ================================= */}

          <aside className="cart-summary">

            <span className="summary-eyebrow">
              MAGADH ORG
            </span>

            <h2>
              Order Summary
            </h2>


            <div className="summary-line">

              <span>
                Products
              </span>

              <strong>
                {items.length}
              </strong>

            </div>


            <div className="summary-line">

              <span>
                Subtotal
              </span>

              <strong>
                ₹{grandTotal.toFixed(2)}
              </strong>

            </div>


            <div className="summary-line">

              <span>
                Delivery
              </span>

              <strong className="free-delivery">
                FREE
              </strong>

            </div>


            <div className="summary-divider"></div>


            <div className="summary-total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹{grandTotal.toFixed(2)}
              </strong>

            </div>


            <button
              type="button"
              className="checkout-button"
              onClick={() =>
                navigate("/checkout")
              }
            >

              <span>
                PROCEED TO CHECKOUT
              </span>

              <strong>
                →
              </strong>

            </button>


            <div className="secure-note">

              <span className="secure-icon">
                ✓
              </span>

              Secure &amp; trusted checkout

            </div>

          </aside>

        </section>

      )}

    </main>

  );

}

export default Cart;