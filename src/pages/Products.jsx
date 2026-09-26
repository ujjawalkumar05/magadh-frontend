import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Products.css";

import product1L from "../assets/prodimage.png";
import product1LPouch from "../assets/1l-pouch.png";
import product500ML from "../assets/500ml-bottle.png";
import product500MLPouch from "../assets/500ml-pouch.png";
import product200ML from "../assets/200ml-bottle.png";
import product5L from "../assets/5l-jar.png";
import product15L from "../assets/15l-tin.png";
import BACKEND_URL from "../config/api";
import FadeImage from "../components/FadeImage";

function Products() {

  const navigate = useNavigate();

  /* ================= PRODUCT IMAGES ================= */

  const productImages = {
    "MAGADH-OIL-1L": product1L,
    "MAGADH-OIL-1L-POUCH": product1LPouch,
    "MAGADH-OIL-500ML-BOTTLE": product500ML,
    "MAGADH-OIL-500ML-POUCH": product500MLPouch,
    "MAGADH-OIL-200ML-BOTTLE": product200ML,
    "MAGADH-OIL-5L-JAR": product5L,
    "MAGADH-OIL-15L-TIN": product15L
  };

  /* ================= PRODUCT ORDER ================= */

  const productOrder = [
    "MAGADH-OIL-1L",
    "MAGADH-OIL-1L-POUCH",
    "MAGADH-OIL-500ML-BOTTLE",
    "MAGADH-OIL-500ML-POUCH",
    "MAGADH-OIL-200ML-BOTTLE",
    "MAGADH-OIL-5L-JAR",
    "MAGADH-OIL-15L-TIN"
  ];

  /* ================= CACHED PRODUCTS ================= */

  const getCachedProducts = () => {

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

  };

  /* ================= USER ID ================= */

  /*
   * Existing login flow already stores user data
   * in localStorage.
   *
   * We use the stored ID when available so that
   * ADD TO CART does not need an extra
   * /api/users/email request every time.
   *
   * Backend remains the source of truth.
   */

  const getStoredUserId = () => {

    try {

      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      const user =
        JSON.parse(storedUser);

      const userId =
        Number(user?.id);

      return Number.isFinite(userId) &&
        userId > 0
        ? userId
        : null;

    } catch (err) {

      return null;

    }

  };

  /* ================= JWT EMAIL ================= */

  const getEmailFromToken = (token) => {

    try {

      const payload =
        token.split(".")[1];

      const base64 =
        payload
          .replace(/-/g, "+")
          .replace(/_/g, "/");

      const paddedBase64 =
        base64 +
        "=".repeat(
          (4 - (base64.length % 4)) % 4
        );

      const decodedPayload =
        JSON.parse(
          atob(paddedBase64)
        );

      return decodedPayload.sub;

    } catch (err) {

      return null;

    }

  };

  /* ================= STATE ================= */

  const [products, setProducts] =
    useState(getCachedProducts);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [addingProductId, setAddingProductId] =
    useState(null);

  const [cartMessage, setCartMessage] =
    useState("");


  /* ================= ADD TO CART ================= */

  const addProductToCart = async (
    productId
  ) => {

    const token =
      localStorage.getItem("token");

    if (!token) {

      localStorage.setItem(
        "pendingCartProductId",
        String(productId)
      );

      navigate("/login");

      return;
    }

    /*
     * Prevent duplicate requests.
     *
     * This also protects against rapid
     * multiple clicks on the same product.
     */

    if (addingProductId === productId) {
      return;
    }

    try {

      setAddingProductId(productId);
      setCartMessage("");
      setError("");

      let userId =
        getStoredUserId();

      /*
       * FALLBACK:
       *
       * If localStorage does not contain a valid
       * user ID, keep the existing API flow.
       *
       * This ensures the current login/cart
       * functionality does not break.
       */

      if (!userId) {

        const email =
          getEmailFromToken(token);

        if (!email) {

          throw new Error(
            "Invalid login session. Please login again."
          );

        }

        const userResponse =
          await fetch(
            `${BACKEND_URL}/api/users/email?email=${encodeURIComponent(email)}`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        if (!userResponse.ok) {

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

            localStorage.setItem(
              "pendingCartProductId",
              String(productId)
            );

            navigate("/login");

            return;

          }

          throw new Error(
            "Unable to find user."
          );

        }

        const user =
          await userResponse.json();

        userId =
          Number(user?.id);

        if (
          !Number.isFinite(userId) ||
          userId <= 0
        ) {

          throw new Error(
            "User ID not received."
          );

        }

        /*
         * Keep the existing user information
         * updated for future cart operations.
         */

        try {

          const currentUser =
            JSON.parse(
              localStorage.getItem("user") ||
              "null"
            );

          localStorage.setItem(
            "user",
            JSON.stringify({
              ...(currentUser || {}),
              ...user
            })
          );

        } catch (err) {
          // Do not block cart operation if cache update fails.
        }

      }

      /* ================= ADD CART ITEM ================= */

      const cartResponse =
        await fetch(
          `${BACKEND_URL}/api/carts/user/${userId}/items`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            },

            body: JSON.stringify({
              productId:
                productId,

              quantity: 1
            })
          }
        );

      if (!cartResponse.ok) {

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

          localStorage.setItem(
            "pendingCartProductId",
            String(productId)
          );

          navigate("/login");

          return;

        }

        const cartData =
          await cartResponse
            .json()
            .catch(() => null);

        throw new Error(
          cartData?.message ||
          "Failed to add product to cart."
        );

      }

      /*
       * Keep the existing success message.
       * Nothing about the visible product UI changes.
       */

      setCartMessage(
        "Product added to cart."
      );

      setTimeout(() => {

        setCartMessage("");

      }, 2500);

    } catch (err) {

      setError(
        err.message ||
        "Something went wrong."
      );

    } finally {

      setAddingProductId(null);

    }

  };


  /* ================= FETCH PRODUCTS ================= */

  useEffect(() => {

    let isMounted = true;

    const fetchProducts =
      async () => {

        try {

          setError("");

          const response =
            await fetch(
              `${BACKEND_URL}/api/products`
            );

          if (!response.ok) {

            throw new Error(
              "Failed to fetch products"
            );

          }

          const data =
            await response.json();

          const productList =
            Array.isArray(data)
              ? data
              : data?.content || [];

          productList.sort(
            (a, b) => {

              const indexA =
                productOrder.indexOf(
                  a.sku
                );

              const indexB =
                productOrder.indexOf(
                  b.sku
                );

              return indexA - indexB;

            }
          );

          if (
            isMounted &&
            productList.length > 0
          ) {

            /* =========================
               UPDATE UI WITH LATEST DATA
            ========================= */

            setProducts(
              productList
            );

            /* =========================
               SAVE LATEST BACKEND DATA
            ========================= */

            localStorage.setItem(
              "magadh_products",
              JSON.stringify(
                productList
              )
            );

          }

        } catch (err) {

          console.error(
            "Products API error:",
            err
          );

          /*
           * Cached products remain visible
           * when backend refresh fails.
           */

          if (
            isMounted &&
            products.length === 0
          ) {

            setError(
              "Unable to load products right now."
            );

          }

        } finally {

          if (isMounted) {
            setLoading(false);
          }

        }

      };

    fetchProducts();

    return () => {
      isMounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /* ================= PENDING CART PRODUCT ================= */

  useEffect(() => {

    if (
      loading ||
      products.length === 0
    ) {

      return;

    }

    const pendingProductId =
      localStorage.getItem(
        "pendingCartProductId"
      );

    if (!pendingProductId) {

      return;

    }

    localStorage.removeItem(
      "pendingCartProductId"
    );

    addProductToCart(
      Number(
        pendingProductId
      )
    );

  }, [
    loading,
    products
  ]);


  /* ================= SEARCH ================= */

  const filteredProducts =
    products.filter(
      (product) => {

        const searchText =
          search.toLowerCase();

        return (

          product.name
            ?.toLowerCase()
            .includes(searchText) ||

          product.description
            ?.toLowerCase()
            .includes(searchText) ||

          product.sku
            ?.toLowerCase()
            .includes(searchText)

        );

      }
    );


  return (

    <main className="products-page">


      {/* ================= FLOATING CART ================= */}

      <button
        type="button"
        className="products-floating-cart"
        onClick={() =>
          navigate("/cart")
        }
        aria-label="Open Cart"
      >

        <span className="floating-cart-icon">

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

        </span>

        <span className="floating-cart-text">
          Cart
        </span>

      </button>


      {/* ================= HERO ================= */}

      <section className="products-hero">

        <h1>
          Our Products
        </h1>

        <div className="products-tagline">
          PURE • AUTHENTIC • ROOTED
        </div>

        <p>
          100% Pure Goodness, Rooted in the Heart of Bihar —
          Crafted for Your Everyday Kitchen.
        </p>

      </section>


      {/* ================= SEARCH ================= */}

      <section className="products-search-section">

        <div className="products-search">

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

          {search && (

            <button
              className="search-clear"
              onClick={() =>
                setSearch("")
              }
              type="button"
            >
              ×
            </button>

          )}

        </div>

      </section>


      {/* ================= PRODUCTS ================= */}

      <section className="products-section">

        <div className="products-heading">

          <span>
            MAGADH ORG
          </span>

          <h2>
            Our Collection
          </h2>

        </div>


        {/* ================= CART MESSAGE ================= */}

        {cartMessage && (

          <div className="products-message products-success">
            {cartMessage}
          </div>

        )}


        {/* ================= ERROR ================= */}

        {error && (

          <div className="products-message products-error">
            {error}
          </div>

        )}


        {/* ================= NO PRODUCTS ================= */}

        {!error &&
          products.length === 0 &&
          !loading && (

            <div className="products-message">
              No products found.
            </div>

          )}


        {/* ================= PRODUCT GRID ================= */}

        {filteredProducts.length > 0 && (

          <div className="products-grid">

            {filteredProducts.map(
              (product) => {

                /*
                 * IMAGE PRIORITY:
                 *
                 * 1. Cloudinary image uploaded from Admin
                 * 2. Existing local SKU image
                 * 3. Existing MAGADH placeholder
                 */

                const productImage =
                  product.imageUrl ||
                  productImages[
                    product.sku
                  ];

                return (

                  <article
                    className="product-card"
                    key={product.id}
                  >

                    <div className="product-image">

                      {productImage ? (

                        <FadeImage
                          src={productImage}
                          alt={
                            product.name
                          }
                        />

                      ) : (

                        <div className="product-image-placeholder">
                          MAGADH
                        </div>

                      )}

                    </div>


                    <div className="product-content">

                      <span className="product-category">
                        Mustard Oil
                      </span>


                      <h3>
                        {product.name}
                      </h3>


                      {product.description && (

                        <p className="product-description">
                          {
                            product.description
                          }
                        </p>

                      )}


                      <div className="product-bottom">

                        <span className="product-price">
                          ₹{product.price}
                        </span>


                        <button
                          className="add-cart-button"
                          type="button"
                          onClick={() =>
                            addProductToCart(
                              product.id
                            )
                          }
                          disabled={
                            addingProductId ===
                            product.id
                          }
                        >

                          {addingProductId ===
                          product.id
                            ? "ADDING..."
                            : "ADD"}

                          <span>
                            +
                          </span>

                        </button>

                      </div>

                    </div>

                  </article>

                );

              }
            )}

          </div>

        )}

      </section>

    </main>

  );

}

export default Products;