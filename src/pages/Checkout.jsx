import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

import product1L from "../assets/prodimage.png";
import product1LPouch from "../assets/1l-pouch.png";
import product500ML from "../assets/500ml-bottle.png";
import product500MLPouch from "../assets/500ml-pouch.png";
import product200ML from "../assets/200ml-bottle.png";
import product5L from "../assets/5l-jar.png";
import product15L from "../assets/15l-tin.png";
import BACKEND_URL from "../config/api";

function Checkout() {

  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState([]);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    buildingNo: "",
    addressLine: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: ""
  });

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
     FETCH CHECKOUT DATA
  ========================================= */

  const fetchCheckoutData = async () => {

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const userResponse = await fetch(
        `${BACKEND_URL}/api/users/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!userResponse.ok) {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
        return;
      }

      const user = await userResponse.json();

      setAddress((previous) => ({
        ...previous,
        name: user.name || "",
        phone: user.phone || ""
      }));


      /* =====================================
         FETCH SAVED ADDRESSES
      ===================================== */

      try {

        const addressesResponse = await fetch(
          `${BACKEND_URL}/api/addresses/user/${user.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (addressesResponse.ok) {

          const addressesData =
            await addressesResponse.json();

          let addressList = [];

          if (Array.isArray(addressesData)) {
            addressList = addressesData;
          } else if (Array.isArray(addressesData.content)) {
            addressList = addressesData.content;
          }

          setSavedAddresses(addressList);

        } else {

          setSavedAddresses([]);

        }

      } catch (_) {

        /*
         * Address loading failure should not
         * break the existing checkout flow.
         */
        setSavedAddresses([]);

      }


      /* =====================================
         FETCH CART
      ===================================== */

      const cartResponse = await fetch(
        `${BACKEND_URL}/api/carts/user/${user.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (!cartResponse.ok) {
        throw new Error("Failed to load cart.");
      }

      const cartData = await cartResponse.json();


      /* =====================================
         FETCH PRODUCTS
      ===================================== */

      const productsResponse = await fetch(
        `${BACKEND_URL}/api/products`
      );

      if (!productsResponse.ok) {
        throw new Error("Failed to load products.");
      }

      const productsData =
        await productsResponse.json();


      setCart(cartData);
      setProducts(productsData.content || []);

    } catch (err) {

      setError(
        err.message || "Something went wrong."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchCheckoutData();
  }, []);


  /* =========================================
     PRODUCT
  ========================================= */

  const getProduct = (productId) => {

    return products.find(
      (product) => product.id === productId
    );

  };


  const items = cart?.items || [];


  /* =========================================
     EMPTY CART REDIRECT
  ========================================= */

  useEffect(() => {

    if (!loading && cart && items.length === 0) {

      navigate("/products", {
        replace: true
      });

    }

  }, [loading, cart, items.length, navigate]);


  const subtotal = items.reduce(
    (total, item) => {

      const product =
        getProduct(item.productId);

      const price =
        Number(product?.price || 0);

      const quantity =
        Number(item.quantity || 0);

      return total + price * quantity;

    },
    0
  );


  /* =========================================
     ADDRESS CHANGE
  ========================================= */

  const handleAddressChange = (event) => {

    const {
      name,
      value
    } = event.target;

    setAddress((previous) => ({
      ...previous,
      [name]: value
    }));

    /*
     * Once user starts entering a new address,
     * remove saved-address selection.
     */
    if (selectedAddressId) {
      setSelectedAddressId(null);
    }

    setUseNewAddress(true);

  };


  /* =========================================
     SELECT SAVED ADDRESS
  ========================================= */

  const handleSavedAddressSelect = (savedAddress) => {

    setSelectedAddressId(savedAddress.id);

    setUseNewAddress(false);

    setError("");

    /*
     * Keep the selected address available in
     * Payment page state as well.
     */
    setAddress({
      name: savedAddress.fullName || "",
      phone: savedAddress.phone || "",
      buildingNo: "",
      addressLine: savedAddress.addressLine || "",
      area: "",
      landmark: "",
      city: savedAddress.city || "",
      state: savedAddress.state || "",
      pincode: savedAddress.pincode || ""
    });

  };


  /* =========================================
     USE NEW ADDRESS
  ========================================= */

  const handleUseNewAddress = () => {

    setSelectedAddressId(null);

    setUseNewAddress(true);

    setError("");

    /*
     * Keep user's existing typed information.
     * Only switch back to new-address mode.
     */

  };


  /* =========================================
     CURRENT LOCATION
  ========================================= */

  const useCurrentLocation = () => {

    setError("");

    setSelectedAddressId(null);
    setUseNewAddress(true);

    if (!navigator.geolocation) {

      setError(
        "Your browser does not support location."
      );

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        try {

          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;


          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`,
            {
              headers: {
                Accept: "application/json"
              }
            }
          );


          if (!response.ok) {
            throw new Error(
              "Unable to find your current address."
            );
          }


          const data =
            await response.json();

          const location =
            data.address || {};


          const buildingNo =
            location.house_number ||
            location.building ||
            "";


          const street =
            location.road ||
            location.pedestrian ||
            location.footway ||
            location.residential ||
            "";


          const area =
            location.neighbourhood ||
            location.suburb ||
            location.quarter ||
            location.residential ||
            location.city_district ||
            "";


          const city =
            location.city ||
            location.town ||
            location.village ||
            location.municipality ||
            location.county ||
            "";


          const state =
            location.state ||
            location.state_district ||
            "";


          const fullAddress =
            data.display_name || "";


          const landmark =
            location.amenity ||
            location.shop ||
            location.tourism ||
            location.office ||
            location.public_building ||
            "";


          let detailedAddress = [
            street,
            area
          ]
            .filter(Boolean)
            .filter(
              (value, index, array) =>
                array.indexOf(value) === index
            )
            .join(", ");


          if (
            !street &&
            fullAddress
          ) {

            detailedAddress =
              fullAddress;

          }


          setAddress((previous) => ({

            ...previous,

            buildingNo:
              buildingNo ||
              previous.buildingNo,

            addressLine:
              detailedAddress ||
              previous.addressLine,

            area:
              area ||
              previous.area,

            landmark:
              landmark ||
              previous.landmark,

            city:
              city ||
              previous.city,

            state:
              state ||
              previous.state,

            pincode:
              previous.pincode

          }));


        } catch (err) {

          setError(
            err.message ||
            "Unable to fetch your address."
          );

        } finally {

          setLocationLoading(false);

        }

      },

      (locationError) => {

        setLocationLoading(false);

        if (
          locationError.code ===
          locationError.PERMISSION_DENIED
        ) {

          setError(
            "Location permission denied. Please allow location access in your browser."
          );

        } else if (
          locationError.code ===
          locationError.POSITION_UNAVAILABLE
        ) {

          setError(
            "Your current location is unavailable."
          );

        } else {

          setError(
            "Unable to get your current location."
          );

        }

      },

      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0
      }

    );

  };


  /* =========================================
     CREATE ADDRESS + ORDER + RAZORPAY ORDER
  ========================================= */

  const handleContinue = async (event) => {

    event.preventDefault();

    setError("");


    const token =
      localStorage.getItem("token");


    if (!token) {

      navigate("/login");

      return;
    }


    setOrderLoading(true);


    try {

      /* =====================================
         STEP 1 — CURRENT USER
      ===================================== */

      const userResponse = await fetch(
        `${BACKEND_URL}/api/users/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );


      if (!userResponse.ok) {
        throw new Error(
          "Unable to identify your account."
        );
      }


      const user =
        await userResponse.json();


      /* =====================================
         STEP 2 — ADDRESS
      ===================================== */

      let addressId;


      /*
       * EXISTING SAVED ADDRESS
       *
       * Do NOT create another address.
       */
      if (
        selectedAddressId &&
        !useNewAddress
      ) {

        addressId =
          selectedAddressId;

      } else {

        /*
         * NEW ADDRESS VALIDATION
         */

        if (
          !address.name.trim() ||
          !address.phone.trim() ||
          !address.buildingNo.trim() ||
          !address.addressLine.trim() ||
          !address.city.trim() ||
          !address.state.trim() ||
          !address.pincode.trim()
        ) {

          setError(
            "Please fill all required delivery details."
          );

          setOrderLoading(false);

          return;
        }


        if (!/^\d{10}$/.test(address.phone)) {

          setError(
            "Please enter a valid 10-digit phone number."
          );

          setOrderLoading(false);

          return;
        }


        if (!/^\d{6}$/.test(address.pincode)) {

          setError(
            "Please enter a valid 6-digit PIN code."
          );

          setOrderLoading(false);

          return;
        }


        const combinedAddress = [
          address.buildingNo,
          address.addressLine,
          address.area,
          address.landmark
        ]
          .filter(Boolean)
          .join(", ");


        const addressResponse = await fetch(
          `${BACKEND_URL}/api/addresses/user/${user.id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              fullName: address.name.trim(),
              phone: address.phone.trim(),
              addressLine: combinedAddress,
              city: address.city.trim(),
              state: address.state.trim(),
              pincode: address.pincode.trim(),
              defaultAddress: true
            })
          }
        );


        if (!addressResponse.ok) {

          let message =
            "Unable to save delivery address.";

          try {

            const data =
              await addressResponse.json();

            if (data.message) {
              message = data.message;
            }

          } catch (_) {}

          throw new Error(message);
        }


        const savedAddress =
          await addressResponse.json();


        addressId =
          savedAddress.id;

      }


      /* =====================================
         STEP 3 — CREATE ORDER
      ===================================== */

      const orderItems = items.map((item) => ({

        productId: item.productId,

        quantity:
          Number(item.quantity)

      }));


      const orderResponse = await fetch(
        `${BACKEND_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({

            userId: user.id,

            addressId,

            items: orderItems

          })
        }
      );


      if (!orderResponse.ok) {

        let message =
          "Unable to create order.";

        try {

          const data =
            await orderResponse.json();

          if (data.message) {
            message = data.message;
          }

        } catch (_) {}

        throw new Error(message);
      }


      const order =
        await orderResponse.json();


      /* =====================================
         STEP 4 — CREATE RAZORPAY ORDER
      ===================================== */

      const razorpayResponse = await fetch(
        `${BACKEND_URL}/api/payments/razorpay/order?orderId=${order.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );


      if (!razorpayResponse.ok) {

        let message =
          "Unable to initialize payment.";

        try {

          const data =
            await razorpayResponse.json();

          if (data.message) {
            message = data.message;
          }

        } catch (_) {}

        throw new Error(message);
      }


      const razorpayOrder =
        await razorpayResponse.json();


      /* =====================================
         STEP 5 — GO TO PAYMENT PAGE
      ===================================== */

      navigate("/payment", {

        state: {

          user,

          address: {
            ...address,
            fullName: address.name
          },

          items,

          products,

          subtotal,

          order,

          orderId: order.id,

          razorpayOrderId:
            razorpayOrder.razorpayOrderId,

          razorpayAmount:
            razorpayOrder.amount,

          razorpayCurrency:
            razorpayOrder.currency,

          razorpayKeyId:
            razorpayOrder.keyId

        }

      });


    } catch (err) {

      setError(
        err.message ||
        "Something went wrong while creating your order."
      );

    } finally {

      setOrderLoading(false);

    }

  };


  /* =========================================
     LOADING
  ========================================= */

  if (loading) {

    return (

      <main className="checkout-page">

        <nav className="checkout-navbar">

          <div
            className="checkout-brand"
            onClick={() => navigate("/")}
          >
            <strong>MAGADH</strong>
            <span>Org</span>
          </div>

        </nav>

        <div className="checkout-loading">
          Loading checkout...
        </div>

      </main>

    );

  }


  /* =========================================
     CHECKOUT PAGE
  ========================================= */

  return (

    <main className="checkout-page">


      <nav className="checkout-navbar">

        <div
          className="checkout-brand"
          onClick={() => navigate("/")}
        >
          <strong>MAGADH</strong>
          <span>Org</span>
        </div>


        <div className="checkout-progress">

          <span className="active">
            01 Cart
          </span>

          <i>—</i>

          <span className="active">
            02 Address
          </span>

          <i>—</i>

          <span>
            03 Payment
          </span>

        </div>


        <button
          type="button"
          className="checkout-cart-button"
          onClick={() => navigate("/cart")}
          disabled={orderLoading}
        >
          ← Back to Cart
        </button>

      </nav>


      <section className="checkout-container">


        <div className="checkout-heading">

          <span>
            MAGADH ORG • SECURE CHECKOUT
          </span>

          <h1>
            Complete Your Order
          </h1>

          <p>
            Enter your delivery details and continue securely to payment.
          </p>

        </div>


        <div className="checkout-grid">


          <div className="checkout-left">

            <form
              className="address-card"
              onSubmit={handleContinue}
            >


              <div className="card-heading">

                <div>

                  <span>
                    02
                  </span>

                  <div>

                    <h2>
                      Delivery Address
                    </h2>

                    <p>
                      Where should we deliver your MAGADH order?
                    </p>

                  </div>

                </div>

                <small>
                  REQUIRED
                </small>

              </div>


              {/* =====================================
                  SAVED ADDRESS SECTION
              ===================================== */}

              <div className="saved-address-section">

                <div className="saved-address-heading">

                  <h3>
                    Use a Saved Address
                  </h3>

                  <p>
                    Select a saved address or enter a new one.
                  </p>

                </div>


                {savedAddresses.length > 0 ? (

                  <div className="saved-address-list">

                    {savedAddresses.map((savedAddress) => (

                      <button
                        type="button"
                        key={savedAddress.id}
                        className={`saved-address-card ${
                          selectedAddressId === savedAddress.id &&
                          !useNewAddress
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleSavedAddressSelect(
                            savedAddress
                          )
                        }
                        disabled={orderLoading}
                      >

                        {/* =====================================
                            SAVED ADDRESS HEADER
                        ===================================== */}

                        <div className="saved-address-form-header">

                          <div>

                            <span className="saved-address-form-step">
                              ADDRESS
                            </span>

                            <h4>
                              Saved Delivery Address
                            </h4>

                          </div>


                          {selectedAddressId === savedAddress.id &&
                            !useNewAddress && (

                              <span className="saved-address-selected-badge">
                                ✓ SELECTED
                              </span>

                            )}

                        </div>


                        {/* =====================================
                            SAVED ADDRESS DETAILS
                        ===================================== */}

                        <div className="saved-address-form-grid">


                          {/* FULL NAME */}

                          <div className="saved-address-field">

                            <span>
                              Full Name
                            </span>

                            <strong>
                              {savedAddress.fullName ||
                                "Not available"}
                            </strong>

                          </div>


                          {/* PHONE */}

                          <div className="saved-address-field">

                            <span>
                              Phone Number
                            </span>

                            <strong>
                              {savedAddress.phone ||
                                "Not available"}
                            </strong>

                          </div>


                          {/* ADDRESS */}

                          <div className="saved-address-field saved-address-field-full">

                            <span>
                              Street / Road / Locality
                            </span>

                            <strong>
                              {savedAddress.addressLine ||
                                "Not available"}
                            </strong>

                          </div>


                          {/* CITY */}

                          <div className="saved-address-field">

                            <span>
                              City
                            </span>

                            <strong>
                              {savedAddress.city ||
                                "Not available"}
                            </strong>

                          </div>


                          {/* STATE */}

                          <div className="saved-address-field">

                            <span>
                              State
                            </span>

                            <strong>
                              {savedAddress.state ||
                                "Not available"}
                            </strong>

                          </div>


                          {/* PIN CODE */}

                          <div className="saved-address-field">

                            <span>
                              PIN Code
                            </span>

                            <strong>
                              {savedAddress.pincode ||
                                "Not available"}
                            </strong>

                          </div>


                        </div>


                        {/* =====================================
                            SELECT HINT
                        ===================================== */}

                        <div className="saved-address-select-hint">

                          <span>
                            Click anywhere on this address to select it
                          </span>

                          <strong>
                            →
                          </strong>

                        </div>

                      </button>

                    ))}

                  </div>

                ) : (

                  <div className="no-saved-address">

                    <strong>
                      No saved address yet
                    </strong>

                    <p>
                      Add your first delivery address below.
                      It will be saved for your future orders.
                    </p>

                  </div>

                )}


                {savedAddresses.length > 0 && (
                  <button
                    type="button"
                    className="new-address-button"
                    onClick={handleUseNewAddress}
                    disabled={orderLoading}
                  >
                    + Add / Use a New Address
                  </button>
                )}

              </div>


              {/* =====================================
                  NEW ADDRESS FORM
              ===================================== */}

              {(
                savedAddresses.length === 0 ||
                useNewAddress ||
                !selectedAddressId
              ) && (

                <>

                  {savedAddresses.length > 0 && (

                    <div className="new-address-heading">

                      <h3>
                        {useNewAddress
                          ? "Enter New Address"
                          : "Or Enter a New Address"}
                      </h3>

                      <p>
                        Your new address will be saved for future orders.
                      </p>

                    </div>

                  )}


                  <button
                    type="button"
                    className="current-location-button"
                    onClick={useCurrentLocation}
                    disabled={
                      locationLoading ||
                      orderLoading
                    }
                  >

                    <span className="location-pin">

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        width="21"
                        height="21"
                      >

                        <path
                          d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                        <circle
                          cx="12"
                          cy="9"
                          r="2.4"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />

                      </svg>

                    </span>


                    <span>

                      {locationLoading
                        ? "Finding your precise address..."
                        : "Using My Current Location"}

                    </span>


                    {!locationLoading && (
                      <span className="location-arrow">
                        →
                      </span>
                    )}

                  </button>


                  <div className="location-helper">

                    Your browser location will be used to find the
                    available street, area, city and address details.

                  </div>


                  <div className="form-grid">


                    <div className="form-group">

                      <label>
                        Full Name
                        <span className="required-star">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={address.name}
                        onChange={handleAddressChange}
                        placeholder="Enter your full name"
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        Phone Number
                        <span className="required-star">
                          *
                        </span>
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        value={address.phone}
                        onChange={handleAddressChange}
                        placeholder="10-digit mobile number"
                        maxLength="10"
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        Building / House No.
                        <span className="required-star">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="buildingNo"
                        value={address.buildingNo}
                        onChange={handleAddressChange}
                        placeholder="Flat / House / Building No."
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        Landmark
                        <span className="optional-label">
                          Optional
                        </span>
                      </label>

                      <input
                        type="text"
                        name="landmark"
                        value={address.landmark}
                        onChange={handleAddressChange}
                        placeholder="Near school, temple, mall..."
                      />

                    </div>


                    <div className="form-group full-width">

                      <label>
                        Street / Road / Locality
                        <span className="required-star">
                          *
                        </span>
                      </label>

                      <textarea
                        name="addressLine"
                        value={address.addressLine}
                        onChange={handleAddressChange}
                        placeholder="Street name, road, locality, colony, etc."
                        rows="3"
                      />

                    </div>


                    <div className="form-group full-width">

                      <label>
                        Area / Neighbourhood
                        <span className="optional-label">
                          Optional
                        </span>
                      </label>

                      <input
                        type="text"
                        name="area"
                        value={address.area}
                        onChange={handleAddressChange}
                        placeholder="Area / neighbourhood / suburb"
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        City
                        <span className="required-star">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder="City"
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        State
                        <span className="required-star">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        placeholder="State"
                      />

                    </div>


                    <div className="form-group">

                      <label>
                        PIN Code
                        <span className="required-star">
                          *
                        </span>
                      </label>

                      <input
                        type="text"
                        name="pincode"
                        value={address.pincode}
                        onChange={handleAddressChange}
                        placeholder="6-digit PIN code"
                        maxLength="6"
                      />

                    </div>

                  </div>

                </>

              )}


              {error && (

                <div className="checkout-form-error">
                  {error}
                </div>

              )}


              <button
                type="submit"
                className="continue-payment-button"
                disabled={orderLoading}
              >

                <span>

                  {orderLoading
                    ? "CREATING YOUR ORDER..."
                    : "CONTINUE TO PAYMENT"}

                </span>

                <strong>
                  →
                </strong>

              </button>

            </form>


            <div className="checkout-security">

              <div className="security-icon">
                ✓
              </div>

              <div>

                <strong>
                  Safe & Secure Checkout
                </strong>

                <p>
                  Your personal information is handled securely.
                </p>

              </div>

            </div>

          </div>


          <aside className="checkout-summary">

            <div className="summary-top">

              <span>
                YOUR ORDER
              </span>

              <h2>
                Order Summary
              </h2>

            </div>


            <div className="checkout-products">

              {items.map((item) => {

                const product =
                  getProduct(item.productId);

                const price =
                  Number(product?.price || 0);

                const total =
                  price *
                  Number(item.quantity || 0);

                /*
                 * Admin uploaded Cloudinary image
                 * is preferred.
                 *
                 * Existing local SKU image remains
                 * as fallback for old products.
                 */
                const image =
                  product?.imageUrl ||
                  productImages[product?.sku];


                return (

                  <div
                    className="checkout-product"
                    key={item.id}
                  >

                    <div className="checkout-product-info">

                      <div className="checkout-product-image">

                        {image ? (

                          <img
                            src={image}
                            alt={item.productName}
                          />

                        ) : (

                          <span>
                            MAGADH
                          </span>

                        )}

                      </div>

                      <div>

                        <h3>
                          {item.productName}
                        </h3>

                        <span>
                          Quantity: {item.quantity}
                        </span>

                      </div>

                    </div>

                    <strong>
                      ₹{total.toFixed(2)}
                    </strong>

                  </div>

                );

              })}

            </div>


            <div className="summary-divider"></div>


            <div className="checkout-summary-line">

              <span>
                Subtotal
              </span>

              <strong>
                ₹{subtotal.toFixed(2)}
              </strong>

            </div>


            <div className="checkout-summary-line">

              <span>
                Delivery
              </span>

              <strong className="free">
                FREE
              </strong>

            </div>


            <div className="summary-divider"></div>


            <div className="checkout-grand-total">

              <span>
                Total Amount
              </span>

              <strong>
                ₹{subtotal.toFixed(2)}
              </strong>

            </div>


            <div className="checkout-note">

              <span>
                ✓
              </span>

              Free delivery on your MAGADH Org order.

            </div>

          </aside>

        </div>

      </section>

    </main>

  );
}

export default Checkout;