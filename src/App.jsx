import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import SavedAddress from "./pages/SavedAddress";
import Orders from "./pages/Orders";
import TrackOrder from "./pages/TrackOrder";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/AdminDashboard";
import AdminManagement from "./pages/AdminManagement";
import Invoice from "./pages/Invoice";
import Contact from "./pages/Contact";
import WhyUs from "./pages/WhyUs";
import Certification from "./pages/Certification";



/* =========================================================
   GET CURRENT USER ROLE
========================================================= */

const getUserRole = () => {

  try {

    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      return "";
    }

    const user =
      JSON.parse(savedUser);

    const role =
      user?.role ||
      user?.roles?.[0] ||
      "";

    return String(role)
      .toUpperCase()
      .replace("ROLE_", "");

  } catch {

    return "";

  }
};


/* =========================================================
   ADMIN ROUTE
========================================================= */

/*
 * Only ADMIN can access:
 *
 * /admin
 * /admin/products
 * /admin/orders
 * /admin/...
 *
 * Normal user:
 *     /admin
 *          ↓
 *         /
 */

function AdminRoute({ children }) {

  const token =
    localStorage.getItem("token");

  const role =
    getUserRole();


  if (!token) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  if (role !== "ADMIN") {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  return children;
}


/* =========================================================
   CUSTOMER PURCHASE ROUTE
========================================================= */

/*
 * USER:
 *
 * /cart
 * /checkout
 * /payment
 *
 *     ✅ ACCESS
 *
 *
 * ADMIN:
 *
 * /cart
 * /checkout
 * /payment
 *
 *     ❌ NO ACCESS
 *
 * Admin is redirected to Home.
 *
 * Admin can then use:
 *
 * ADMIN PANEL → Dashboard
 */

function CustomerPurchaseRoute({ children }) {

  const token =
    localStorage.getItem("token");

  const role =
    getUserRole();


  /*
   * Not logged in
   */
  if (!token) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }


  /*
   * Admin cannot purchase.
   */
  if (role === "ADMIN") {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }


  /*
   * Normal customer.
   */
  return children;
}


/* =========================================================
   APP
========================================================= */

function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* =================================================
            HOME
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* =================================================
            AUTH
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =================================================
            PRODUCTS
        ================================================= */}

        <Route
          path="/products"
          element={<Products />}
        />


        {/* =================================================
            CONTACT
        ================================================= */}

        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* =================================================
            CERTIFICATION
        ================================================= */}

        <Route
          path="/certification"
          element={<Certification />}
        />

        {/* =================================================
            WHY US
        ================================================= */}

        <Route
          path="/why-us"
          element={<WhyUs />}
        />

        {/* =================================================
            CUSTOMER CART
        ================================================= */}

        <Route
          path="/cart"
          element={
            <CustomerPurchaseRoute>
              <Cart />
            </CustomerPurchaseRoute>
          }
        />


        {/* =================================================
            CUSTOMER CHECKOUT
        ================================================= */}

        <Route
          path="/checkout"
          element={
            <CustomerPurchaseRoute>
              <Checkout />
            </CustomerPurchaseRoute>
          }
        />


        {/* =================================================
            CUSTOMER PAYMENT
        ================================================= */}

        <Route
          path="/payment"
          element={
            <CustomerPurchaseRoute>
              <Payment />
            </CustomerPurchaseRoute>
          }
        />


        {/* =================================================
            CUSTOMER ACCOUNT
        ================================================= */}

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/saved-address"
          element={<SavedAddress />}
        />

        <Route
          path="/orders"
          element={<Orders />}
        />

        <Route
          path="/track-order"
          element={<TrackOrder />}
        />


        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />


        {/* =================================================
            ADMIN INVOICE
        ================================================= */}

        <Route
          path="/admin/orders/:id/invoice"
          element={
            <AdminRoute>
              <Invoice />
            </AdminRoute>
          }
        />


        {/* =================================================
            ADMIN MANAGEMENT
        ================================================= */}

        <Route
          path="/admin/:section"
          element={
            <AdminRoute>
              <AdminManagement />
            </AdminRoute>
          }
        />


        {/* =================================================
            UNKNOWN ROUTE
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;