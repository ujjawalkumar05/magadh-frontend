import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import BACKEND_URL from "../config/api";
import "./AdminManagement.css";

const API = `${BACKEND_URL}/api`;

const sectionConfig = {
  products: {
    title: "Products",
    endpoint: "/products",
    columns: ["id", "name", "sku", "price", "category", "active"],
  },

  categories: {
    title: "Categories",
    endpoint: "/categories",
    columns: ["id", "name", "description", "active"],
  },

  inventory: {
    title: "Inventory",
    endpoint: "/inventory",
    columns: ["id", "product", "sku", "quantity"],
  },

  orders: {
    title: "Orders",
    endpoint: "/orders",
    columns: [
      "id",
      "user",
      "totalAmount",
      "items",
      "payment",
      "createdAt",
      "status",
    ],
  },

  customers: {
    title: "Customers",
    endpoint: "/users",
    columns: ["id", "name", "email", "phone", "role"],
  },

  coupons: {
    title: "Coupons",
    endpoint: "/coupons",
    columns: ["id", "code", "discount", "active"],
  },

  payments: {
    title: "Payments",
    endpoint: "/payments",
    columns: ["id", "order", "amount", "status"],
  },

  reviews: {
    title: "Reviews",
    endpoint: "/reviews",
    columns: ["id", "product", "rating", "comment"],
  },

  roles: {
    title: "Roles",
    endpoint: "/roles",
    columns: ["id", "name"],
  },
};

function AdminManagement() {
  const { section } = useParams();
  const navigate = useNavigate();

  const config = sectionConfig[section];

  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState({});
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inventorySaving, setInventorySaving] = useState(false);

  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [inventoryEditor, setInventoryEditor] = useState(null);

  const [form, setForm] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =====================================================
     PRODUCT IMAGE
  ===================================================== */

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageInputKey, setImageInputKey] = useState(0);

  const token = localStorage.getItem("token");

  /* =====================================================
     AUTH
  ===================================================== */

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (!token || user?.role !== "ADMIN") {
      navigate("/");
    }
  }, [navigate, token]);

  /* =====================================================
     API HELPER
  ===================================================== */

  const api = async (url, options = {}) => {
    const response = await fetch(`${API}${url}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let message = "Request failed";

      try {
        const body = await response.json();

        message =
          body?.message ||
          body?.error ||
          `Request failed (${response.status})`;
      } catch {
        message = `Request failed (${response.status})`;
      }

      throw new Error(message);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  /* =====================================================
     IMAGE UPLOAD API
  ===================================================== */

  const uploadProductImage = async (
    productId,
    file
  ) => {
    if (!productId || !file) {
      return null;
    }

    const formData = new FormData();

    formData.append("image", file);

    const response = await fetch(
      `${API}/products/${productId}/image`,
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: formData,
      }
    );

    if (!response.ok) {
      let message =
        "Product image upload failed";

      try {
        const body =
          await response.json();

        message =
          body?.message ||
          body?.error ||
          message;
      } catch {
        message = `Image upload failed (${response.status})`;
      }

      throw new Error(message);
    }

    return response.json();
  };

  /* =====================================================
     PRODUCT IMAGE SELECT
  ===================================================== */

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Only JPG, PNG and WEBP images are allowed."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image size must be less than 5 MB."
      );

      event.target.value = "";
      return;
    }

    setError("");

    setImageFile(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(
      previewUrl
    );
  };

  /* =====================================================
     CLEAR PRODUCT IMAGE
  ===================================================== */

  const clearProductImage = () => {
    setImageFile(null);
    setImagePreview("");

    setImageInputKey(
      (previous) =>
        previous + 1
    );
  };

  /* =====================================================
     LOAD DATA
  ===================================================== */

  const loadData = async () => {
    if (!config) return;

    try {
      setLoading(true);
      setError("");

      let result;

      /* =================================================
         PRODUCTS
      ================================================= */

      if (section === "products") {
        result = await api(
          "/products?page=0&size=100"
        );

        const products =
          result?.content ||
          result ||
          [];

        setData(products);

        try {
          const categoryData =
            await api("/categories");

          setCategories(
            Array.isArray(
              categoryData
            )
              ? categoryData
              : categoryData?.content ||
                  []
          );
        } catch {
          setCategories([]);
        }
      }

      /* =================================================
         ORDERS
      ================================================= */

      else if (section === "orders") {
        result = await api(
          "/orders/status/CONFIRMED"
        );

        const confirmed =
          Array.isArray(result)
            ? result
            : result?.content || [];

        let allOrders = [
          ...confirmed,
        ];

        const statuses = [
          "PENDING",
          "PROCESSING",
          "SHIPPED",
          "DELIVERED",
          "CANCELLED",
        ];

        for (const status of statuses) {
          try {
            const statusResult =
              await api(
                `/orders/status/${status}`
              );

            const statusOrders =
              Array.isArray(
                statusResult
              )
                ? statusResult
                : statusResult?.content ||
                  [];

            allOrders = [
              ...allOrders,
              ...statusOrders,
            ];
          } catch {
            // Keep existing orders if a status endpoint fails.
          }
        }

        const uniqueOrders =
          Array.from(
            new Map(
              allOrders.map(
                (order) => [
                  order.id,
                  order,
                ]
              )
            ).values()
          );

        uniqueOrders.sort(
          (a, b) =>
            new Date(
              b.createdAt || 0
            ) -
            new Date(
              a.createdAt || 0
            )
        );

        setData(uniqueOrders);

        /* LOAD USERS */

        try {
          const userResult =
            await api("/users");

          const userList =
            Array.isArray(
              userResult
            )
              ? userResult
              : userResult?.content ||
                [];

          setUsers(userList);
        } catch {
          setUsers([]);
        }

        /* LOAD PAYMENTS */

        const paymentMap = {};

        await Promise.all(
          uniqueOrders.map(
            async (order) => {
              try {
                const payment =
                  await api(
                    `/payments/order/${order.id}`
                  );

                if (payment) {
                  paymentMap[
                    order.id
                  ] = payment;
                }
              } catch {
                // No payment record is fine for COD/orders
              }
            }
          )
        );

        setPayments(paymentMap);
      }

      /* =================================================
         INVENTORY
      ================================================= */

      else if (section === "inventory") {
        const productResult =
          await api(
            "/products?page=0&size=100"
          );

        const products =
          productResult?.content ||
          productResult ||
          [];

        const inventoryResults =
          await Promise.all(
            products.map(
              async (product) => {
                try {
                  const inventory =
                    await api(
                      `/inventory/product/${product.id}`
                    );

                  if (
                    inventory &&
                    !Array.isArray(
                      inventory
                    )
                  ) {
                    return {
                      ...inventory,

                      productId:
                        product.id,

                      productName:
                        product.name,

                      sku:
                        product.sku,

                      product: {
                        ...(inventory.product ||
                          {}),
                        id: product.id,
                        name: product.name,
                        sku: product.sku,
                      },
                    };
                  }

                  if (
                    Array.isArray(
                      inventory
                    ) &&
                    inventory.length >
                      0
                  ) {
                    const item =
                      inventory[0];

                    return {
                      ...item,

                      productId:
                        product.id,

                      productName:
                        product.name,

                      sku:
                        product.sku,

                      product: {
                        ...(item.product ||
                          {}),
                        id: product.id,
                        name: product.name,
                        sku: product.sku,
                      },
                    };
                  }

                  return {
                    id: null,
                    productId:
                      product.id,
                    productName:
                      product.name,
                    sku: product.sku,
                    quantity: 0,
                    inventoryMissing:
                      true,

                    product: {
                      id: product.id,
                      name: product.name,
                      sku: product.sku,
                    },
                  };
                } catch {
                  return {
                    id: null,
                    productId:
                      product.id,
                    productName:
                      product.name,
                    sku: product.sku,
                    quantity: 0,
                    inventoryMissing:
                      true,

                    product: {
                      id: product.id,
                      name: product.name,
                      sku: product.sku,
                    },
                  };
                }
              }
            )
          );

        setData(
          inventoryResults
        );
      }

      /* =================================================
         OTHER SECTIONS
      ================================================= */

      else {
        result =
          await api(
            config.endpoint
          );

        const list =
          Array.isArray(result)
            ? result
            : result?.content || [];

        setData(list);
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to load data"
      );

      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [section]);

  /* =====================================================
     REFRESH
  ===================================================== */

  const handleRefresh = async () => {
    if (loading) return;

    setError("");

    await loadData();
  };

  /* =====================================================
     FORM
  ===================================================== */

  const resetForm = () => {
    setEditingId(null);
    setForm({});

    setImageFile(null);
    setImagePreview("");

    setImageInputKey(
      (previous) =>
        previous + 1
    );
  };

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  /* =====================================================
     INVENTORY CONTROL
  ===================================================== */

  const openInventoryEditor = (
    item
  ) => {
    if (!item.id) {
      setError(
        "Inventory record not found for this product."
      );
      return;
    }

    setError("");

    setInventoryEditor({
      id: item.id,
      productId: item.productId,
      productName:
        item.productName ||
        item.product?.name ||
        "Product",
      sku:
        item.sku ||
        item.product?.sku ||
        "—",
      quantity: Number(
        item.quantity || 0
      ),
    });
  };

  const closeInventoryEditor = () => {
    if (inventorySaving) return;

    setInventoryEditor(null);
  };

  const updateInventoryQuantity =
    async (newQuantity) => {
      if (!inventoryEditor) return;

      const quantity =
        Number(newQuantity);

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity < 0
      ) {
        setError(
          "Quantity must be a valid number greater than or equal to 0."
        );
        return;
      }

      try {
        setInventorySaving(
          true
        );
        setError("");

        await api(
          `/inventory/${inventoryEditor.id}`,
          {
            method: "PUT",

            body: JSON.stringify({
              productId:
                Number(
                  inventoryEditor.productId
                ),

              quantity,
            }),
          }
        );

        setInventoryEditor(null);

        await loadData();
      } catch (err) {
        setError(
          err.message ||
            "Failed to update inventory"
        );
      } finally {
        setInventorySaving(
          false
        );
      }
    };

  const addInventoryStock = async (
    item
  ) => {
    const current =
      Number(item.quantity || 0);

    const amount =
      window.prompt(
        `How many units do you want to add?\nCurrent stock: ${current}`,
        "10"
      );

    if (
      amount === null ||
      amount.trim() === ""
    ) {
      return;
    }

    const add = Number(amount);

    if (
      !Number.isInteger(add) ||
      add <= 0
    ) {
      setError(
        "Please enter a valid quantity greater than 0."
      );
      return;
    }

    await updateInventoryDirect(
      item,
      current + add
    );
  };

  const removeInventoryStock =
    async (item) => {
      const current =
        Number(
          item.quantity || 0
        );

      const amount =
        window.prompt(
          `How many units do you want to remove?\nCurrent stock: ${current}`,
          "10"
        );

      if (
        amount === null ||
        amount.trim() === ""
      ) {
        return;
      }

      const remove =
        Number(amount);

      if (
        !Number.isInteger(
          remove
        ) ||
        remove <= 0
      ) {
        setError(
          "Please enter a valid quantity greater than 0."
        );
        return;
      }

      const newQuantity =
        current - remove;

      if (newQuantity < 0) {
        setError(
          `Cannot remove ${remove} units. Current stock is only ${current}.`
        );
        return;
      }

      await updateInventoryDirect(
        item,
        newQuantity
      );
    };

  const updateInventoryDirect =
    async (
      item,
      quantity
    ) => {
      if (!item.id) {
        setError(
          "Inventory record not found for this product."
        );
        return;
      }

      try {
        setInventorySaving(
          true
        );
        setError("");

        await api(
          `/inventory/${item.id}`,
          {
            method: "PUT",

            body: JSON.stringify({
              productId:
                Number(
                  item.productId
                ),

              quantity:
                Number(quantity),
            }),
          }
        );

        await loadData();
      } catch (err) {
        setError(
          err.message ||
            "Failed to update inventory"
        );
      } finally {
        setInventorySaving(
          false
        );
      }
    };

  /* =====================================================
     SAVE
  ===================================================== */

  const handleSave = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      let payload = {
        ...form,
      };

      if (
        section === "products"
      ) {
        payload = {
          name: form.name || "",
          sku: form.sku || "",
          price: Number(
            form.price || 0
          ),
          description:
            form.description || "",
          active:
            form.active !== false,

          categoryId:
            form.categoryId
              ? Number(
                  form.categoryId
                )
              : null,
        };
      }

      if (
        section === "categories"
      ) {
        payload = {
          name: form.name || "",

          description:
            form.description || "",

          active:
            form.active !== false,
        };
      }

      if (
        section === "coupons"
      ) {
        payload = {
          code: form.code || "",

          discount: Number(
            form.discount || 0
          ),

          active:
            form.active !== false,
        };
      }

      /*
       * =========================================
       * SAVE PRODUCT
       * =========================================
       */

      let savedItem;

      if (editingId) {
        savedItem = await api(
          `${config.endpoint}/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(
              payload
            ),
          }
        );
      } else {
        savedItem = await api(
          config.endpoint,
          {
            method: "POST",
            body: JSON.stringify(
              payload
            ),
          }
        );
      }

      /*
       * =========================================
       * PRODUCT IMAGE UPLOAD
       * =========================================
       *
       * Product must exist first so that
       * we have the product ID.
       */

      if (
        section === "products" &&
        imageFile
      ) {
        const productId =
          savedItem?.id ||
          editingId;

        if (!productId) {
          throw new Error(
            "Product saved but product ID was not received. Image was not uploaded."
          );
        }

        try {
          await uploadProductImage(
            productId,
            imageFile
          );
        } catch (imageError) {
          setEditingId(
            productId
          );

          setError(
            `Product saved successfully, but image upload failed: ${imageError.message}`
          );

          return;
        }
      }

      resetForm();

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          "Failed to save"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =====================================================
     EDIT
  ===================================================== */

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      ...item,

      categoryId:
        item.category?.id ||
        item.categoryId ||
        "",

      imageUrl:
        item.imageUrl || "",
    });

    /*
     * Show existing Cloudinary image
     * when editing.
     */

    setImageFile(null);

    setImagePreview(
      item.imageUrl || ""
    );

    setImageInputKey(
      (previous) =>
        previous + 1
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete = async (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this item?"
      );

    if (!confirmed) return;

    try {
      setError("");

      await api(
        `${config.endpoint}/${id}`,
        {
          method: "DELETE",
        }
      );

      await loadData();
    } catch (err) {
      setError(
        err.message ||
          "Delete failed"
      );
    }
  };

  /* =====================================================
     ORDER STATUS
  ===================================================== */

  const updateOrderStatus =
    async (
      orderId,
      status
    ) => {
      try {
        setError("");

        await api(
          `/orders/${orderId}/status?status=${status}`,
          {
            method: "PATCH",
          }
        );

        await loadData();
      } catch (err) {
        setError(
          err.message ||
            "Failed to update order status"
        );
      }
    };

  /* =====================================================
     USER NAME
  ===================================================== */

  const getUserName = (
    order
  ) => {
    const userId =
      order?.user?.id ||
      order?.userId ||
      order?.customer?.id;

    const directName =
      order?.user?.name ||
      order?.customer?.name ||
      order?.userName ||
      order?.customerName;

    if (directName) {
      return directName;
    }

    const user =
      users.find(
        (item) =>
          Number(item.id) ===
          Number(userId)
      );

   return user?.name || "";
  };

  /* =====================================================
     PAYMENT DISPLAY
  ===================================================== */

  const getPaymentInfo = (
    order
  ) => {
    const payment =
      payments[order.id];

    if (!payment) {
      return {
        label: "COD",
        type: "cod",
      };
    }

    const method =
      String(
        payment.paymentMethod ||
          payment.method ||
          payment.type ||
          ""
      ).toUpperCase();

    const paymentId =
      payment.razorpayPaymentId ||
      payment.paymentId ||
      payment.transactionId ||
      payment.gatewayPaymentId;

    const status =
      String(
        payment.status || ""
      ).toUpperCase();

    if (
      paymentId &&
      method !== "COD" &&
      method !==
        "CASH_ON_DELIVERY"
    ) {
      return {
        label: paymentId,
        type: "online",
      };
    }

    if (
      method === "COD" ||
      method ===
        "CASH_ON_DELIVERY"
    ) {
      return {
        label: "COD",
        type: "cod",
      };
    }

    if (
      status === "SUCCESS" ||
      status === "COMPLETED" ||
      status === "PAID"
    ) {
      return {
        label: "Paid",
        type: "online",
      };
    }

    return {
      label: "—",
      type: "pending",
    };
  };

  /* =====================================================
     FORMATTERS
  ===================================================== */

  const formatMoney = (
    amount
  ) => {
    return `₹${Number(
      amount || 0
    ).toLocaleString("en-IN")}`;
  };

  const formatDate = (
    date
  ) => {
    if (!date) return "—";

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return date;
    }

    return parsed.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }
    );
  };

  const getOrderItemsCount = (
    order
  ) => {
    if (
      Array.isArray(
        order.items
      )
    ) {
      return order.items.reduce(
        (total, item) =>
          total +
          Number(
            item.quantity || 0
          ),
        0
      );
    }

    return (
      order.totalItems ||
      order.itemCount ||
      order.itemsCount ||
      0
    );
  };

  const getCategoryName = (
    product
  ) => {
    if (
      product.category?.name
    ) {
      return product.category.name;
    }

    if (
      product.categoryName
    ) {
      return product.categoryName;
    }

    const category =
      categories.find(
        (item) =>
          Number(item.id) ===
          Number(
            product.categoryId
          )
      );

    return (
      category?.name || "—"
    );
  };

  /* =====================================================
     FORM UI
  ===================================================== */

  const renderForm = () => {
    if (
      ![
        "products",
        "categories",
        "coupons",
      ].includes(section)
    ) {
      return null;
    }

    return (
      <form
        className="admin-management-form"
        onSubmit={handleSave}
      >
        <div className="admin-management-form-header">

          <div>
            <span className="admin-section-label">
              {editingId
                ? "EDIT"
                : "CREATE"}
            </span>

            <h2>
              {editingId
                ? `Edit ${config.title.slice(
                    0,
                    -1
                  )}`
                : `Add ${config.title.slice(
                    0,
                    -1
                  )}`}
            </h2>
          </div>

          <div className="admin-form-actions">

            <button
              type="button"
              className="admin-secondary-button"
              onClick={
                resetForm
              }
            >
              Clear
            </button>

            <button
              type="submit"
              className="admin-primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save"}
            </button>

          </div>
        </div>

        <div className="admin-form-grid">

          {section ===
            "products" && (
            <>
              <label>
                Product Name

                <input
                  name="name"
                  value={
                    form.name || ""
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                SKU

                <input
                  name="sku"
                  value={
                    form.sku || ""
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                Price

                <input
                  name="price"
                  type="number"
                  value={
                    form.price || ""
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                Category

                <select
                  name="categoryId"
                  value={
                    form.categoryId ||
                    ""
                  }
                  onChange={
                    handleChange
                  }
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="admin-full-field">
                Description

                <textarea
                  name="description"
                  value={
                    form.description ||
                    ""
                  }
                  onChange={
                    handleChange
                  }
                  rows="4"
                />
              </label>

              {/* =========================================
                  PRODUCT IMAGE UPLOAD
              ========================================= */}

              <div className="admin-full-field admin-product-image-field">

                <label>
                  Product Image
                </label>

                <div className="admin-product-image-upload">

                  <input
                    key={
                      imageInputKey
                    }
                    id="admin-product-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleImageChange
                    }
                    hidden
                  />

                  <label
                    htmlFor="admin-product-image"
                    className="admin-image-upload-button"
                  >
                    <span>
                      +
                    </span>

                    {imageFile
                      ? "Change Image"
                      : "Upload Product Image"}
                  </label>

                  <span className="admin-image-upload-hint">
                    JPG, PNG or WEBP · Max 5 MB
                  </span>

                </div>

                {imagePreview && (
                  <div className="admin-product-image-preview">

                    <img
                      src={
                        imagePreview
                      }
                      alt="Product preview"
                    />

                    <div className="admin-product-image-preview-info">

                      <strong>
                        {imageFile
                          ? imageFile.name
                          : "Current Product Image"}
                      </strong>

                      {imageFile && (
                        <span>
                          {(
                            imageFile.size /
                            1024 /
                            1024
                          ).toFixed(2)}
                          {" MB"}
                        </span>
                      )}

                    </div>

                    <button
                      type="button"
                      className="admin-image-remove-button"
                      onClick={
                        clearProductImage
                      }
                    >
                      Remove
                    </button>

                  </div>
                )}

              </div>

              <label className="admin-checkbox-field">
                <input
                  type="checkbox"
                  name="active"
                  checked={
                    form.active !==
                    false
                  }
                  onChange={
                    handleChange
                  }
                />

                Active
              </label>
            </>
          )}

          {section ===
            "categories" && (
            <>
              <label>
                Category Name

                <input
                  name="name"
                  value={
                    form.name || ""
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                Description

                <input
                  name="description"
                  value={
                    form.description ||
                    ""
                  }
                  onChange={
                    handleChange
                  }
                />
              </label>

              <label className="admin-checkbox-field">
                <input
                  type="checkbox"
                  name="active"
                  checked={
                    form.active !==
                    false
                  }
                  onChange={
                    handleChange
                  }
                />

                Active
              </label>
            </>
          )}

          {section ===
            "coupons" && (
            <>
              <label>
                Coupon Code

                <input
                  name="code"
                  value={
                    form.code || ""
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label>
                Discount

                <input
                  name="discount"
                  type="number"
                  value={
                    form.discount ||
                    ""
                  }
                  onChange={
                    handleChange
                  }
                  required
                />
              </label>

              <label className="admin-checkbox-field">
                <input
                  type="checkbox"
                  name="active"
                  checked={
                    form.active !==
                    false
                  }
                  onChange={
                    handleChange
                  }
                />

                Active
              </label>
            </>
          )}

        </div>
      </form>
    );
  };

  /* =====================================================
     INVENTORY TABLE
  ===================================================== */

  const renderInventoryTable =
    () => {
      return (
        <div className="admin-management-table-wrapper">

          <table className="admin-management-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>QUANTITY</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="admin-empty-cell"
                  >
                    Loading...
                  </td>
                </tr>
              ) : data.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="admin-empty-cell"
                  >
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                data.map(
                  (item) => {
                    const quantity =
                      Number(
                        item.quantity ||
                          0
                      );

                    const lowStock =
                      quantity <=
                      10;

                    return (
                      <tr
                        key={
                          item.id ||
                          item.productId
                        }
                      >

                        <td>
                          <strong>
                            {item.id ||
                              "—"}
                          </strong>
                        </td>

                        <td>
                          <div className="admin-inventory-product">

                            <strong>
                              {item.productName ||
                                item.product
                                  ?.name ||
                                "Unknown Product"}
                            </strong>

                            {lowStock && (
                              <span className="admin-low-stock-badge">
                                Low Stock
                              </span>
                            )}

                          </div>
                        </td>

                        <td>
                          {item.sku ||
                            item
                              .product
                              ?.sku ||
                            "—"}
                        </td>

                        <td>
                          <strong
                            className={
                              lowStock
                                ? "admin-low-stock-number"
                                : "admin-stock-number"
                            }
                          >
                            {
                              quantity
                            }
                          </strong>
                        </td>

                        <td>

                          <div className="admin-inventory-actions">

                            <button
                              type="button"
                              className="admin-stock-minus"
                              disabled={
                                inventorySaving ||
                                quantity <=
                                  0
                              }
                              onClick={() =>
                                removeInventoryStock(
                                  item
                                )
                              }
                            >
                              − Remove
                            </button>

                            <button
                              type="button"
                              className="admin-stock-edit"
                              disabled={
                                inventorySaving
                              }
                              onClick={() =>
                                openInventoryEditor(
                                  item
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="admin-stock-plus"
                              disabled={
                                inventorySaving
                              }
                              onClick={() =>
                                addInventoryStock(
                                  item
                                )
                              }
                            >
                              + Add
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>
      );
    };

  /* =====================================================
     INVENTORY EDITOR
  ===================================================== */

  const renderInventoryEditor =
    () => {
      if (!inventoryEditor) {
        return null;
      }

      return (
        <div className="admin-inventory-modal-overlay">

          <div className="admin-inventory-modal">

            <div className="admin-inventory-modal-header">

              <div>
                <span className="admin-section-label">
                  INVENTORY CONTROL
                </span>

                <h2>
                  Update Stock
                </h2>
              </div>

              <button
                type="button"
                className="admin-inventory-close"
                onClick={
                  closeInventoryEditor
                }
                disabled={
                  inventorySaving
                }
              >
                ×
              </button>

            </div>

            <div className="admin-inventory-modal-product">

              <strong>
                {
                  inventoryEditor.productName
                }
              </strong>

              <span>
                {
                  inventoryEditor.sku
                }
              </span>

            </div>

            <div className="admin-inventory-current">

              <span>
                Current Stock
              </span>

              <strong>
                {
                  inventoryEditor.quantity
                }
              </strong>

            </div>

            <label className="admin-inventory-quantity-field">

              <span>
                New Quantity
              </span>

              <input
                type="number"
                min="0"
                value={
                  inventoryEditor.quantity
                }
                onChange={(
                  event
                ) =>
                  setInventoryEditor(
                    (previous) => ({
                      ...previous,

                      quantity:
                        event.target
                          .value ===
                        ""
                          ? ""
                          : Number(
                              event
                                .target
                                .value
                            ),
                    })
                  )
                }
                disabled={
                  inventorySaving
                }
                autoFocus
              />

            </label>

            <div className="admin-inventory-modal-actions">

              <button
                type="button"
                className="admin-secondary-button"
                onClick={
                  closeInventoryEditor
                }
                disabled={
                  inventorySaving
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-primary-button"
                disabled={
                  inventorySaving ||
                  inventoryEditor.quantity ===
                    ""
                }
                onClick={() =>
                  updateInventoryQuantity(
                    inventoryEditor.quantity
                  )
                }
              >
                {inventorySaving
                  ? "Updating..."
                  : "Update Stock"}
              </button>

            </div>

          </div>

        </div>
      );
    };

  /* =====================================================
     ORDERS TABLE
  ===================================================== */

  const renderOrdersTable =
    () => {
      return (
        <div className="admin-management-table-wrapper">

          <table className="admin-management-table">

            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>AMOUNT</th>
                <th>ITEMS</th>
                <th>PAYMENT</th>
                <th>CREATED</th>
                <th>STATUS</th>
                <th>INVOICE</th>
              </tr>
            </thead>

            <tbody>

              {data.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="admin-empty-cell"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                data.map(
                  (order) => {
                    const payment =
                      getPaymentInfo(
                        order
                      );

                    return (
                      <tr
                        key={
                          order.id
                        }
                      >

                        <td>
                          <strong>
                            #
                            {
                              order.id
                            }
                          </strong>
                        </td>

                        <td>
                          <div className="admin-order-user">

                            <strong>
                              {getUserName(
                                order
                              )}
                            </strong>

                            {(order
                              .user
                              ?.email ||
                              order
                                .customer
                                ?.email) && (
                              <small>
                                {order
                                  .user
                                  ?.email ||
                                  order
                                    .customer
                                    ?.email}
                              </small>
                            )}

                          </div>
                        </td>

                        <td>
                          {formatMoney(
                            order.totalAmount
                          )}
                        </td>

                        <td>
                          {getOrderItemsCount(
                            order
                          )}
                        </td>

                        <td>
                          <span
                            className={`admin-payment-badge ${payment.type}`}
                            title={
                              payment.label
                            }
                          >
                            {
                              payment.label
                            }
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            order.createdAt
                          )}
                        </td>

                        <td>
                          <select
                            className="admin-order-status-select"
                            value={
                              order.status ||
                              "PENDING"
                            }
                            onChange={(
                              event
                            ) =>
                              updateOrderStatus(
                                order.id,
                                event
                                  .target
                                  .value
                              )
                            }
                          >
                            <option value="PENDING">
                              PENDING
                            </option>

                            <option value="CONFIRMED">
                              CONFIRMED
                            </option>

                            <option value="PROCESSING">
                              PROCESSING
                            </option>

                            <option value="SHIPPED">
                              SHIPPED
                            </option>

                            <option value="DELIVERED">
                              DELIVERED
                            </option>

                            <option value="CANCELLED">
                              CANCELLED
                            </option>
                          </select>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="admin-invoice-button"
                            onClick={() =>
                              navigate(
                                `/admin/orders/${order.id}/invoice`
                              )
                            }
                          >
                            View Invoice
                          </button>
                        </td>

                      </tr>
                    );
                  }
                )
              )}

            </tbody>

          </table>

        </div>
      );
    };

  /* =====================================================
     OTHER TABLES
  ===================================================== */

  const renderOtherTable =
    () => {
      return (
        <div className="admin-management-table-wrapper">

          <table className="admin-management-table">

            <thead>
              <tr>

                {config.columns.map(
                  (column) => (
                    <th
                      key={
                        column
                      }
                    >
                      {column
                        .replace(
                          /([A-Z])/g,
                          " $1"
                        )
                        .toUpperCase()}
                    </th>
                  )
                )}

                {![
                  "inventory",
                  "payments",
                  "orders",
                ].includes(
                  section
                ) && (
                  <th>
                    ACTIONS
                  </th>
                )}

              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan={
                      config
                        .columns
                        .length +
                      1
                    }
                    className="admin-empty-cell"
                  >
                    Loading...
                  </td>
                </tr>
              ) : data.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={
                      config
                        .columns
                        .length +
                      1
                    }
                    className="admin-empty-cell"
                  >
                    No records found.
                  </td>
                </tr>
              ) : (
                data.map(
                  (item) => (
                    <tr
                      key={
                        item.id ||
                        item.productId
                      }
                    >

                      {config.columns.map(
                        (column) => {
                          let value =
                            item[column];

                          if (
                            column ===
                            "price"
                          ) {
                            value =
                              formatMoney(
                                value
                              );
                          }

                          if (
                            column ===
                            "category"
                          ) {
                            value =
                              getCategoryName(
                                item
                              );
                          }

                          if (
                            column ===
                            "product"
                          ) {
                            value =
                              item
                                .product
                                ?.name ||
                              item.productName ||
                              `Product #${
                                item.productId ||
                                "—"
                              }`;
                          }

                          if (
                            column ===
                            "sku"
                          ) {
                            value =
                              item.sku ||
                              item
                                .product
                                ?.sku ||
                              "—";
                          }

                          if (
                            column ===
                            "role"
                          ) {
                            value =
                              item
                                .role
                                ?.name ||
                              item.role ||
                              "—";
                          }

                          if (
                            column ===
                            "active"
                          ) {
                            value =
                              item.active
                                ? "Active"
                                : "Inactive";
                          }

                          if (
                            column ===
                            "createdAt"
                          ) {
                            value =
                              formatDate(
                                value
                              );
                          }

                          if (
                            column ===
                            "quantity"
                          ) {
                            value =
                              Number(
                                value ||
                                  0
                              );
                          }

                          return (
                            <td
                              key={
                                column
                              }
                            >
                              {value ??
                                "—"}
                            </td>
                          );
                        }
                      )}

                      {![
                        "inventory",
                        "payments",
                        "orders",
                      ].includes(
                        section
                      ) && (
                        <td>

                          <div className="admin-row-actions">

                            <button
                              type="button"
                              className="admin-edit-button"
                              onClick={() =>
                                handleEdit(
                                  item
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="admin-delete-button"
                              onClick={() =>
                                handleDelete(
                                  item.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>
                      )}

                    </tr>
                  )
                )
              )}

            </tbody>

          </table>

        </div>
      );
    };

  /* =====================================================
     TABLE SELECTOR
  ===================================================== */

  const renderTable = () => {
    if (
      section ===
      "inventory"
    ) {
      return renderInventoryTable();
    }

    if (
      section ===
      "orders"
    ) {
      return renderOrdersTable();
    }

    return renderOtherTable();
  };

  /* =====================================================
     INVALID SECTION
  ===================================================== */

  if (!config) {
    return (
      <div className="admin-management-page">

        <div className="admin-management-error">
          Section not found.
        </div>

      </div>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <div className="admin-management-page">

      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <aside
        className={`admin-sidebar ${
          sidebarOpen
            ? "open"
            : ""
        }`}
      >

        <div className="admin-brand">

          <div className="admin-brand-mark">
            M
          </div>

          <div>
            <strong>
              MAGADH
            </strong>

            <span>
              ORG ADMIN
            </span>
          </div>

        </div>

        <button
          type="button"
          className="admin-sidebar-close"
          onClick={() =>
            setSidebarOpen(false)
          }
        >
          ×
        </button>

        <nav className="admin-nav">

          <button
            type="button"
            className="admin-nav-item"
            onClick={() =>
              navigate("/admin")
            }
          >
            <span>
              ▦
            </span>

            Dashboard
          </button>

          {[
            [
              "products",
              "◇",
              "Products",
            ],
            [
              "categories",
              "◈",
              "Categories",
            ],
            [
              "inventory",
              "▤",
              "Inventory",
            ],
            [
              "orders",
              "⌁",
              "Orders",
            ],
            [
              "customers",
              "♙",
              "Customers",
            ],
            [
              "coupons",
              "◇",
              "Coupons",
            ],
            [
              "payments",
              "₹",
              "Payments",
            ],
            [
              "reviews",
              "★",
              "Reviews",
            ],
            [
              "roles",
              "⚿",
              "Roles",
            ],
          ].map(
            ([
              key,
              icon,
              label,
            ]) => (
              <button
                type="button"
                key={key}
                className={`admin-nav-item ${
                  section === key
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  navigate(
                    `/admin/${key}`
                  )
                }
              >
                <span>
                  {icon}
                </span>

                {label}
              </button>
            )
          )}

        </nav>

        <div className="admin-sidebar-bottom">

          <button
            type="button"
            className="admin-store-button"
            onClick={() =>
              navigate("/")
            }
          >
            ← View Store
          </button>

          <button
            type="button"
            className="admin-logout"
            onClick={() => {
              localStorage.removeItem(
                "token"
              );

              localStorage.removeItem(
                "user"
              );

              navigate(
                "/login"
              );
            }}
          >
            Logout
          </button>

        </div>

      </aside>

      <main className="admin-management-main">

        <button
          type="button"
          className="admin-mobile-menu"
          onClick={() =>
            setSidebarOpen(true)
          }
        >
          ☰
        </button>

        <header className="admin-management-header">

          <div>

            <span className="admin-eyebrow">
              MAGADH ORG · ADMIN
            </span>

            <h1>
              {config.title}
            </h1>

          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={
              handleRefresh
            }
            disabled={loading}
          >
            {loading
              ? "↻ Refreshing..."
              : "↻ Refresh"}
          </button>

        </header>

        {error && (
          <div className="admin-management-error">
            {error}
          </div>
        )}

        {renderForm()}

        <section className="admin-management-panel">
          {renderTable()}
        </section>

      </main>

      {renderInventoryEditor()}

    </div>
  );
}

export default AdminManagement;