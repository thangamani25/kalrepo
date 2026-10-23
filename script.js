const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const statusMessage = document.getElementById("status");
const resultCount = document.getElementById("resultCount");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) {
    statusMessage.classList.remove("is-loading", "is-error");
    statusMessage.textContent = "Please enter a search term.";
    resultCount.textContent = "";
    results.replaceChildren();
    return;
  }

  results.replaceChildren();
  resultCount.textContent = "";
  statusMessage.classList.remove("is-error");
  statusMessage.classList.add("is-loading");
  statusMessage.textContent = "Searching for images…";

  const url = "https://commons.wikimedia.org/w/api.php" +
    "?action=query" +
    "&generator=search" +
    "&gsrsearch=" + encodeURIComponent(query) +
    "&gsrnamespace=6" +
    "&gsrlimit=12" +
    "&prop=imageinfo" +
    "&iiprop=url" +
    "&iiurlwidth=500" +
    "&format=json" +
    "&origin=*";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Image service returned HTTP " + response.status);
    }

    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});
    const images = pages.filter((page) => page.imageinfo && page.imageinfo[0]);

    statusMessage.classList.remove("is-loading");

    if (images.length === 0) {
      statusMessage.textContent = "No results for “" + query + "”. Try another search.";
      resultCount.textContent = "0 results";
      return;
    }

    images.forEach((page, index) => {
      const imageInfo = page.imageinfo[0];
      const imageUrl = imageInfo.thumburl || imageInfo.url;
      const sourceUrl = "https://commons.wikimedia.org/wiki/" +
        encodeURIComponent(page.title).replace(/%3A/g, ":").replace(/%2F/g, "/");

      const card = document.createElement("article");
      card.className = "image-card";
      card.style.animationDelay = (Math.min(index, 8) * 35) + "ms";

      const link = document.createElement("a");
      link.href = sourceUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", "Open source page for " + page.title.replace(/^File:/, ""));

      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = page.title.replace(/^File:/, "");
      image.loading = "lazy";

      const title = document.createElement("h2");
      title.textContent = page.title.replace(/^File:/, "").replace(/_/g, " ");

      link.appendChild(image);
      link.appendChild(title);
      card.appendChild(link);
      results.appendChild(card);
    });

    statusMessage.textContent = "Search complete.";
    resultCount.textContent = "Showing " + images.length + " image" +
      (images.length === 1 ? "" : "s") + " for “" + query + "”.";
  } catch (error) {
    console.error("Image search failed:", error);
    statusMessage.classList.remove("is-loading");
    statusMessage.classList.add("is-error");
    statusMessage.textContent = "Something went wrong. Check your connection and try again.";
    resultCount.textContent = "";
  }
});