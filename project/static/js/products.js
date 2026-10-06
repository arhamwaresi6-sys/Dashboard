let products = [];
let deleteProductId = null;

/* =========================
   DOM
   ========================= */

const productsGrid = document.getElementById("productsGrid");
const emptyProducts = document.getElementById("emptyProducts");

const productModal = document.getElementById("productModal");
const deleteModal = document.getElementById("deleteModal");

const productForm = document.getElementById("productForm");

const modalTitle = document.getElementById("modalTitle");
const productId = document.getElementById("productId");

const productName = document.getElementById("productName");
const productCategory = document.getElementById("productCategory");
const productPrice = document.getElementById("productPrice");
const productStock = document.getElementById("productStock");
const productGoal = document.getElementById("productGoal");
const productStatus = document.getElementById("productStatus");
const productDescription = document.getElementById("productDescription");

const searchInput = document.getElementById("searchInput");
const sortProducts = document.getElementById("sortProducts");

const addProductButton = document.getElementById("addProductButton");
const emptyAddButton = document.getElementById("emptyAddButton");

const closeModal = document.getElementById("closeModal");
const cancelProduct = document.getElementById("cancelProduct");

const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");

/* =========================
   API RESPONSE HELPER
   ========================= */

async function getResponseData(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

/* =========================
   LOAD PRODUCTS
   ========================= */

async function loadProducts() {
  try {
    const response = await fetch("/api/products");

    const data = await getResponseData(response);

    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to load products");
    }

    products = Array.isArray(data) ? data : [];

    renderProducts(sortedProducts(products));
  } catch (error) {
    console.error("Load products error:", error);

    if (productsGrid) {
      productsGrid.innerHTML = `
        <div class="empty-products">
          <div class="empty-icon">!</div>

          <h3>Failed to load products</h3>

          <p>
            Please refresh the page and try again.
          </p>
        </div>
      `;
    }
  }
}

/* =========================
   RENDER PRODUCTS
   ========================= */

function renderProducts(list) {
  updateStats(list);

  if (!productsGrid) {
    return;
  }

  productsGrid.innerHTML = "";

  if (list.length === 0) {
    if (emptyProducts) {
      emptyProducts.hidden = false;
    }

    return;
  }

  if (emptyProducts) {
    emptyProducts.hidden = true;
  }

  list.forEach((product) => {
    const card = createProductCard(product);

    productsGrid.appendChild(card);
  });
}

/* =========================
   PRODUCT CARD
   ========================= */

function createProductCard(product) {
  const card = document.createElement("article");

  card.className = "full-product-card";

  const images = getProductImages(product);
  const mainImage = images[0];

  let imageHTML = "";

  if (mainImage) {
    imageHTML = `
      <img
        src="${escapeHTML(mainImage.url || mainImage)}"
        alt="${escapeHTML(product.name || "Product")}"
      />
    `;
  } else {
    imageHTML = `
      <div class="product-image-placeholder">
        ${escapeHTML(product.initials || getInitials(product.name))}
      </div>
    `;
  }

  const isActive = product.status === true;

  card.innerHTML = `

    <div class="product-main-image">

      ${imageHTML}

      ${
        images.length > 0
          ? `
            <div class="image-count">
              ${images.length} image${images.length > 1 ? "s" : ""}
            </div>
          `
          : ""
      }

    </div>


    <div class="full-product-body">

      <div class="full-product-top">

        <div>

          <div class="product-category">
            ${escapeHTML(product.category || "Uncategorized")}
          </div>

          <h3>
            ${escapeHTML(product.name || "Unnamed Product")}
          </h3>

        </div>

        <div class="product-price">
          ${formatPrice(product.price)}
        </div>

      </div>


      <p class="product-description">
        ${escapeHTML(product.description || "No description available.")}
      </p>


      <div class="product-meta">

        <div class="product-meta-item">

          <span>
            Stock
          </span>

          <strong>
            ${product.stock ?? 0}
          </strong>

        </div>


        <div class="product-meta-item">

          <span>
            Status
          </span>

          <strong>

            <span
              class="status ${isActive ? "active" : "inactive"}"
            >
              ${isActive ? "Active" : "Inactive"}
            </span>

          </strong>

        </div>

      </div>


      <div class="product-actions">

        <button
          class="product-action"
          data-edit="${product.id}"
        >
          Edit
        </button>

        <button
          class="product-action delete"
          data-delete="${product.id}"
        >
          Delete
        </button>

      </div>

    </div>

  `;

  /* EDIT */

  const editButton = card.querySelector("[data-edit]");

  if (editButton) {
    editButton.addEventListener("click", () => {
      openEditModal(product);
    });
  }

  /* DELETE */

  const deleteButton = card.querySelector("[data-delete]");

  if (deleteButton) {
    deleteButton.addEventListener("click", () => {
      openDeleteModal(product.id);
    });
  }

  return card;
}

/* =========================
   GET PRODUCT IMAGES
   ========================= */

function getProductImages(product) {
  if (Array.isArray(product.images)) {
    return product.images.filter(Boolean).slice(0, 3);
  }

  return [product.image1, product.image2, product.image3].filter(Boolean);
}

/* =========================
   ADD PRODUCT
   ========================= */

if (addProductButton) {
  addProductButton.addEventListener("click", openAddModal);
}

if (emptyAddButton) {
  emptyAddButton.addEventListener("click", openAddModal);
}

function openAddModal() {
  if (!productForm) {
    return;
  }

  productForm.reset();

  productId.value = "";

  modalTitle.textContent = "Add Product";

  const saveButton = document.getElementById("saveProduct");

  if (saveButton) {
    saveButton.textContent = "Save Product";
  }

  clearImagePreviews();

  productModal.hidden = false;
}

/* =========================
   EDIT PRODUCT
   ========================= */

function openEditModal(product) {
  productId.value = product.id;

  productName.value = product.name || "";

  productCategory.value = product.category || "";

  productPrice.value = product.price ?? "";

  productStock.value = product.stock ?? "";

  productGoal.value = product.goal ?? "";

  productStatus.value = product.status ? "true" : "false";

  productDescription.value = product.description || "";

  modalTitle.textContent = "Edit Product";

  const saveButton = document.getElementById("saveProduct");

  if (saveButton) {
    saveButton.textContent = "Save Changes";
  }

  showExistingImages(product);

  productModal.hidden = false;
}

/* =========================
   CLOSE PRODUCT MODAL
   ========================= */

if (closeModal) {
  closeModal.addEventListener("click", closeProductModal);
}

if (cancelProduct) {
  cancelProduct.addEventListener("click", closeProductModal);
}

if (productModal) {
  productModal.addEventListener("click", (event) => {
    if (event.target === productModal) {
      closeProductModal();
    }
  });
}

function closeProductModal() {
  if (productModal) {
    productModal.hidden = true;
  }
}

/* =========================
   IMAGE PREVIEW
   ========================= */

function setupImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  if (!input || !preview) {
    return;
  }

  input.addEventListener("change", () => {
    const file = input.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      preview.classList.add("has-image");

      preview.innerHTML = `
        <img
          src="${event.target.result}"
          alt="Preview"
        />
      `;
    };

    reader.readAsDataURL(file);
  });
}

setupImagePreview("image1", "preview1");
setupImagePreview("image2", "preview2");
setupImagePreview("image3", "preview3");

/* =========================
   CLEAR IMAGE PREVIEWS
   ========================= */

function clearImagePreviews() {
  for (let i = 1; i <= 3; i++) {
    const input = document.getElementById(`image${i}`);
    const preview = document.getElementById(`preview${i}`);

    if (!input || !preview) {
      continue;
    }

    input.value = "";

    preview.classList.remove("has-image");

    preview.innerHTML = `
      <span>+</span>
      <small>Image ${i}</small>
    `;
  }
}

/* =========================
   EXISTING IMAGES
   ========================= */

function showExistingImages(product) {
  clearImagePreviews();

  const images = getProductImages(product);

  images.forEach((imgObj, index) => {
    const preview = document.getElementById(`preview${index + 1}`);

    if (!preview) {
      return;
    }

    const url = typeof imgObj === "string" ? imgObj : imgObj.url;

    if (!url) return;

    preview.classList.add("has-image");

    preview.innerHTML = `
      <img
        src="${escapeHTML(url)}"
        alt="Product image"
      />
    `;
  });
}

/* =========================
   SAVE PRODUCT
   ========================= */

if (productForm) {
  productForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = productId.value;

    const formData = new FormData();

    formData.append("name", productName.value.trim());
    formData.append("category", productCategory.value.trim());
    formData.append("price", productPrice.value);
    formData.append("stock", productStock.value);
    formData.append("goal", productGoal.value || 0);
    formData.append("status", productStatus.value);
    formData.append("description", productDescription.value.trim());

    /* =========================
       IMAGES
       ========================= */

    for (let i = 1; i <= 3; i++) {
      const input = document.getElementById(`image${i}`);

      if (input && input.files.length > 0) {
        formData.append(`image${i}`, input.files[0]);
      }
    }

    try {
      let url = "/api/products";
      let method = "POST";

      if (id) {
        url = `/api/products/${id}`;
        method = "PUT";
      }

      const response = await fetch(url, {
        method: method,
        body: formData,
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(data.message || data.error || "Could not save product");
      }

      /* SUCCESS */

      closeProductModal();

      await loadProducts();
    } catch (error) {
      console.error("Save product error:", error);

      alert(error.message || "Something went wrong.");
    }
  });
}

/* =========================
   DELETE PRODUCT
   ========================= */

function openDeleteModal(id) {
  deleteProductId = id;

  if (deleteModal) {
    deleteModal.hidden = false;
  }
}

if (cancelDelete) {
  cancelDelete.addEventListener("click", () => {
    deleteProductId = null;

    deleteModal.hidden = true;
  });
}

if (confirmDelete) {
  confirmDelete.addEventListener("click", async () => {
    if (!deleteProductId) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${deleteProductId}`, {
        method: "DELETE",
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Could not delete product",
        );
      }

      /* SUCCESS */

      deleteModal.hidden = true;

      deleteProductId = null;

      await loadProducts();
    } catch (error) {
      console.error("Delete product error:", error);

      alert(error.message || "Could not delete product");
    }
  });
}

/* =========================
   SEARCH
   ========================= */

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
      renderProducts(sortedProducts(products));

      return;
    }

    const filtered = products.filter((product) => {
      return (
        String(product.name || "")
          .toLowerCase()
          .includes(query) ||
        String(product.category || "")
          .toLowerCase()
          .includes(query) ||
        String(product.description || "")
          .toLowerCase()
          .includes(query)
      );
    });

    renderProducts(sortedProducts(filtered));
  });
}

/* =========================
   SORT
   ========================= */

if (sortProducts) {
  sortProducts.addEventListener("change", () => {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : "";

    let list = products;

    if (query) {
      list = products.filter((product) => {
        return (
          String(product.name || "")
            .toLowerCase()
            .includes(query) ||
          String(product.category || "")
            .toLowerCase()
            .includes(query) ||
          String(product.description || "")
            .toLowerCase()
            .includes(query)
        );
      });
    }

    renderProducts(sortedProducts(list));
  });
}

/* =========================
   SORT PRODUCTS
   ========================= */

function sortedProducts(list) {
  const copy = [...list];

  switch (sortProducts?.value) {
    case "name":
      return copy.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || "")),
      );

    case "price-low":
      return copy.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));

    case "price-high":
      return copy.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));

    case "oldest":
      return copy.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));

    case "newest":

    default:
      return copy.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
  }
}

/* =========================
   STATS
   ========================= */

function updateStats(list) {
  const totalProducts = document.getElementById("totalProducts");

  const activeProducts = document.getElementById("activeProducts");

  const outOfStock = document.getElementById("outOfStock");

  if (totalProducts) {
    totalProducts.textContent = list.length;
  }

  if (activeProducts) {
    activeProducts.textContent = list.filter(
      (product) => product.status === true,
    ).length;
  }

  if (outOfStock) {
    outOfStock.textContent = list.filter(
      (product) => Number(product.stock || 0) <= 0,
    ).length;
  }
}

/* =========================
   FORMAT PRICE
   ========================= */

function formatPrice(price) {
  const number = Number(price || 0);

  return `$${number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/* =========================
   INITIALS
   ========================= */

function getInitials(name) {
  if (!name) {
    return "P";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/* =========================
   HTML ESCAPE
   ========================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================
   MOBILE SIDEBAR
   ========================= */

const menuButton = document.getElementById("menuButton");

const sidebar = document.querySelector(".sidebar");

if (menuButton && sidebar) {
  menuButton.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });
}

/* =========================
   CLOSE SIDEBAR
   ========================= */

document.addEventListener("click", (event) => {
  if (
    window.innerWidth <= 768 &&
    sidebar &&
    menuButton &&
    sidebar.classList.contains("show") &&
    !sidebar.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    sidebar.classList.remove("show");
  }
});

/* =========================
   START
   ========================= */

loadProducts();
