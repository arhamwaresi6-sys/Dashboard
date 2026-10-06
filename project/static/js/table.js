/* =========================
   MOBILE MENU
========================= */

const menuButton = document.getElementById("menuButton");
const sidebar = document.querySelector(".sidebar");

if (menuButton && sidebar) {
  menuButton.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });
}

/* =========================
   STATUS FILTER
========================= */

const statusFilter = document.getElementById("statusFilter");
const rows = document.querySelectorAll("#ordersTable tbody tr");

if (statusFilter) {
  statusFilter.addEventListener("change", () => {
    const selectedStatus = statusFilter.value;

    rows.forEach((row) => {
      const rowStatus = row.dataset.status;

      if (selectedStatus === "all" || rowStatus === selectedStatus) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  });
}

/* =========================
   EXPORT
========================= */

const exportButton = document.getElementById("exportButton");

if (exportButton) {
  exportButton.addEventListener("click", () => {
    alert("Export functionality will be connected to Flask later.");
  });
}

/* =========================
   CUSTOMER SEARCH
========================= */

const searchInput = document.getElementById("orderSearch");
const suggestions = document.getElementById("searchSuggestions");

if (searchInput && suggestions) {
  searchInput.addEventListener("input", async () => {
    const value = searchInput.value.trim();

    console.log("Searching:", value);

    // Empty search
    if (!value) {
      suggestions.innerHTML = "";
      suggestions.classList.remove("show");
      return;
    }

    try {
      const response = await fetch(
        `/api/search?name=${encodeURIComponent(value)}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const customers = await response.json();

      console.log("Customers:", customers);

      suggestions.innerHTML = "";

      // No customers found
      if (customers.length === 0) {
        suggestions.innerHTML = `
          <div class="no-results">
            No customers found
          </div>
        `;

        suggestions.classList.add("show");
        return;
      }

      // Create suggestions
      customers.forEach((customer) => {
        const div = document.createElement("div");

        div.className = "suggestion";
        div.dataset.id = customer.id;

        const nameParts = customer.name.trim().split(/\s+/);

        const firstInitial = nameParts[0][0];
        const lastInitial = nameParts[nameParts.length - 1][0];

        div.innerHTML = `
          <div class="suggestion-avatar">
            ${firstInitial}${lastInitial}
          </div>

          <div class="suggestion-info">
            <span class="suggestion-name">
              ${customer.name}
            </span>

            <span class="suggestion-id">
              Customer #${customer.id}
            </span>
          </div>
        `;

        suggestions.appendChild(div);
      });

      suggestions.classList.add("show");
    } catch (error) {
      console.error("Search failed:", error);
    }
  });
}
/* ==================================================
   ORDER PAGINATION
   ================================================== */

const ordersTable = document.getElementById("ordersTable");
const paginationInfo = document.getElementById("paginationInfo");
const paginationButtons = document.getElementById("paginationButtons");

const ordersBody = ordersTable ? ordersTable.querySelector("tbody") : null;

/* =========================
   SETTINGS
   ========================= */

const rowsPerPage = 5;

let currentPage = 1;

/* =========================
   GET ALL ROWS
   ========================= */

function getOrderRows() {
  if (!ordersBody) {
    return [];
  }

  return Array.from(ordersBody.querySelectorAll("tr"));
}

/* =========================
   SHOW PAGE
   ========================= */

function showPage(page) {
  const rows = getOrderRows();

  const totalRows = rows.length;

  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  /* Keep page inside valid range */

  currentPage = Math.max(1, Math.min(page, totalPages));

  /* =========================
     HIDE / SHOW ROWS
     ========================= */

  const start = (currentPage - 1) * rowsPerPage;

  const end = start + rowsPerPage;

  rows.forEach((row, index) => {
    if (index >= start && index < end) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });

  /* =========================
     PAGINATION INFO
     ========================= */

  if (paginationInfo) {
    if (totalRows === 0) {
      paginationInfo.textContent = "Showing 0–0 of 0 orders";
    } else {
      const first = start + 1;

      const last = Math.min(end, totalRows);

      paginationInfo.textContent = `Showing ${first}–${last} of ${totalRows} orders`;
    }
  }

  /* =========================
     BUTTONS
     ========================= */

  renderPaginationButtons(totalPages);
}

/* =========================
   CREATE PAGINATION
   ========================= */

function renderPaginationButtons(totalPages) {
  if (!paginationButtons) {
    return;
  }

  paginationButtons.innerHTML = "";

  /* =========================
     PREVIOUS
     ========================= */

  const previousButton = document.createElement("button");

  previousButton.type = "button";

  previousButton.textContent = "←";

  previousButton.disabled = currentPage === 1;

  previousButton.addEventListener("click", () => {
    if (currentPage > 1) {
      showPage(currentPage - 1);
    }
  });

  paginationButtons.appendChild(previousButton);

  /* =========================
     PAGE NUMBERS
     ========================= */

  const pages = getPageNumbers(currentPage, totalPages);

  pages.forEach((page) => {
    /* Ellipsis */

    if (page === "...") {
      const dots = document.createElement("span");

      dots.textContent = "...";

      paginationButtons.appendChild(dots);

      return;
    }

    /* Page button */

    const button = document.createElement("button");

    button.type = "button";

    button.textContent = page;

    if (page === currentPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      showPage(page);
    });

    paginationButtons.appendChild(button);
  });

  /* =========================
     NEXT
     ========================= */

  const nextButton = document.createElement("button");

  nextButton.type = "button";

  nextButton.textContent = "→";

  nextButton.disabled = currentPage === totalPages;

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      showPage(currentPage + 1);
    }
  });

  paginationButtons.appendChild(nextButton);
}

/* =========================
   PAGE NUMBER LOGIC
   ========================= */

function getPageNumbers(current, total) {
  /* Few pages */

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages = [];

  /* First page */

  pages.push(1);

  /* Left dots */

  if (current > 4) {
    pages.push("...");
  }

  /*
     Pages around current page
  */

  const start = Math.max(2, current - 1);

  const end = Math.min(total - 1, current + 1);

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  /* Right dots */

  if (current < total - 3) {
    pages.push("...");
  }

  /* Last page */

  pages.push(total);

  return pages;
}

/* =========================
   INITIALIZE
   ========================= */

showPage(1);
