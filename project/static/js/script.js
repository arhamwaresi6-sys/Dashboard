const menuButton = document.getElementById("menuButton");
const sidebar = document.querySelector(".sidebar");

/* SIDEBAR */
if (menuButton && sidebar) {
  menuButton.addEventListener("click", () => {
    sidebar.classList.toggle("show");
  });
}

/* DATE */
const dateElement = document.getElementById("currentDate");

if (dateElement) {
  const today = new Date();

  dateElement.textContent = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* CHART DEFAULTS */
Chart.defaults.font.family =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

Chart.defaults.font.size = 11;
Chart.defaults.color = "#888888";

/* SALES CHART */
function boxChart(data) {
  const salesCanvas = document.getElementById("salesChart");

  if (!salesCanvas) return;

  new Chart(salesCanvas, {
    type: "bar",

    data: {
      labels: data.dataMonth,

      datasets: [
        {
          label: "Sales",

          // Don't modify the original array
          data: [...data.revenue_data].reverse(),

          backgroundColor: "#111111",
          borderRadius: 5,
          barThickness: 18,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        x: {
          grid: {
            display: false,
          },

          border: {
            display: false,
          },
        },

        y: {
          beginAtZero: true,

          grid: {
            color: "#eeeeee",
          },

          border: {
            display: false,
          },

          ticks: {
            callback: function (value) {
              return "$" + value / 1000 + "k";
            },
          },
        },
      },
    },
  });
}

/* ORDER DONUT */
function pieChart(data) {
  const orderCanvas = document.getElementById("orderChart");

  if (!orderCanvas) return;

  new Chart(orderCanvas, {
    type: "doughnut",

    data: {
      labels: ["Completed", "Processing", "Cancelled"],

      datasets: [
        {
          data: data,

          backgroundColor: ["#111111", "#777777", "#dddddd"],

          borderWidth: 0,

          hoverOffset: 3,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      cutout: "72%",

      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

/* REVENUE CHART */
function graph(data) {
  const revenueCanvas = document.getElementById("revenueChart");

  if (!revenueCanvas) return;

  new Chart(revenueCanvas, {
    type: "line",

    data: {
      labels: data.dataMonth,

      datasets: [
        {
          label: "Revenue",

          // Don't modify the original array
          data: [...data.revenue_data].reverse(),

          borderColor: "#111111",

          backgroundColor: "rgba(0, 0, 0, 0.05)",

          borderWidth: 2,

          tension: 0.35,

          fill: true,

          pointRadius: 3,

          pointBackgroundColor: "#111111",
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false,
        },
      },

      scales: {
        x: {
          grid: {
            display: false,
          },

          border: {
            display: false,
          },
        },

        y: {
          beginAtZero: true,

          grid: {
            color: "#eeeeee",
          },

          border: {
            display: false,
          },

          ticks: {
            callback: function (value) {
              return "$" + value / 1000 + "k";
            },
          },
        },
      },
    },
  });
}

/* NOTIFICATION */
const notificationButton = document.getElementById("notificationBtn");

if (notificationButton) {
  notificationButton.addEventListener("click", () => {
    console.log("Notifications clicked");
  });
}

/* CUSTOMER SEARCH */
const search = document.getElementById("orderSearch");
const suggestions = document.getElementById("searchSuggestions");

if (search && suggestions) {
  search.addEventListener("input", async () => {
    const value = search.value.trim();

    /* Empty search */
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
        throw new Error("Search request failed");
      }

      const customers = await response.json();

      suggestions.innerHTML = "";

      /* No customers */
      if (customers.length === 0) {
        suggestions.innerHTML = `
          <div class="no-results">
            No customers found
          </div>
        `;

        suggestions.classList.add("show");

        return;
      }

      /* Show customers */
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
      console.error("Customer search error:", error);

      suggestions.innerHTML = `
        <div class="no-results">
          Something went wrong
        </div>
      `;

      suggestions.classList.add("show");
    }
  });
}
