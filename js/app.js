/**
 * FC Demo — app.js
 * Vanilla JavaScript: haalt nieuwsberichten op uit data/news.json,
 * verwerkt ze en toont ze dynamisch in de #news-grid container.
 *
 * Geen inline JavaScript, geen frameworks, alleen fetch() + DOM API.
 */

(function () {
  "use strict";

  const NEWS_JSON_PATH = "data/news.json";

  const newsGrid = document.getElementById("news-grid");
  const newsStatus = document.getElementById("news-status");

  /**
   * Zet het jaartal in de footer.
   */
  function setCurrentYear() {
    const yearEl = document.getElementById("current-year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  /**
   * Normaliseert de opgehaalde JSON naar een array van nieuwsitems.
   * Ondersteunt zowel { "items": [...] } (Decap CMS-structuur)
   * als een kaal array [...] voor extra robuustheid.
   * @param {unknown} data
   * @returns {Array<object>}
   */
  function extractItems(data) {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    throw new Error("Onverwachte JSON-structuur in data/news.json");
  }

  /**
   * Sorteert nieuwsitems op datum, nieuwste eerst.
   * @param {Array<object>} items
   * @returns {Array<object>}
   */
  function sortByDateDesc(items) {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  }

  /**
   * Formatteert een ISO-datum (YYYY-MM-DD) naar leesbare Nederlandse notatie.
   * @param {string} isoDate
   * @returns {string}
   */
  function formatDate(isoDate) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return isoDate;
    }
    return date.toLocaleDateString("nl-BE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /**
   * Bouwt een <article> kaart voor één nieuwsitem.
   * @param {object} item
   * @returns {HTMLElement}
   */
  function createNewsCard(item) {
    const article = document.createElement("article");
    article.className = "news-card";

    const img = document.createElement("img");
    img.src = item.image || "assets/images/news-1.svg";
    img.alt = item.image_alt || "";
    img.loading = "lazy";
    article.appendChild(img);

    const body = document.createElement("div");
    body.className = "news-card-body";

    const time = document.createElement("time");
    if (item.date) {
      time.dateTime = item.date;
      time.textContent = formatDate(item.date);
    }
    body.appendChild(time);

    const title = document.createElement("h3");
    title.textContent = item.title || "Naamloos bericht";
    body.appendChild(title);

    const excerpt = document.createElement("p");
    excerpt.textContent = item.excerpt || "";
    body.appendChild(excerpt);

    article.appendChild(body);
    return article;
  }

  /**
   * Rendert een lijst nieuwsitems in de #news-grid container.
   * @param {Array<object>} items
   */
  function renderNews(items) {
    newsGrid.innerHTML = "";

    if (items.length === 0) {
      newsStatus.textContent = "Er zijn momenteel geen nieuwsberichten.";
      newsStatus.classList.remove("is-hidden", "is-error");
      return;
    }

    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      fragment.appendChild(createNewsCard(item));
    });
    newsGrid.appendChild(fragment);

    newsStatus.textContent = "";
    newsStatus.classList.add("is-hidden");
  }

  /**
   * Toont een nette foutmelding wanneer het nieuws niet geladen kan worden.
   * @param {Error} error
   */
  function renderError(error) {
    console.error("Fout bij laden van nieuws:", error);
    newsStatus.textContent =
      "Nieuws kon niet worden geladen. Probeer de pagina later opnieuw te laden.";
    newsStatus.classList.remove("is-hidden");
    newsStatus.classList.add("is-error");
  }

  /**
   * Haalt data/news.json op, verwerkt en rendert de nieuwsberichten.
   */
  async function loadNews() {
    try {
      const response = await fetch(NEWS_JSON_PATH);

      if (!response.ok) {
        throw new Error(
          `Kon ${NEWS_JSON_PATH} niet ophalen (status ${response.status})`
        );
      }

      const data = await response.json();
      const items = extractItems(data);
      const sortedItems = sortByDateDesc(items);

      renderNews(sortedItems);
    } catch (error) {
      renderError(error);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    setCurrentYear();
    loadNews();
  });
})();