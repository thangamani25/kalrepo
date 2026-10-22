const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const statusMessage = document.getElementById("status");
const resultCount = document.getElementById("resultCount");

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const query = searchInput.value.trim();
  if (!query) {
    statusMessage.textContent = "Please enter a search term.";
    resultCount.textContent = "";
    results.innerHTML = "";
    return;
  }

  results.innerHTML = "";
  resultCount.textContent = "";
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
      throw new Error("The image service returned an error (" + response.status + ").");
    }

    const data = await response.json();
    const pages = Object.values(data.query?.pages || {});
    const images = pages.filter((page) => page.imageinfo && page.imageinfo[0]);

    if (images.length === 0) {
      statusMessage.textContent = "No images found. Try another search term.";
      resultCount.textContent = "0 results";
      return;
    }

    images.forEach((page) => {
      const imageInfo = page.imageinfo[0];
      const imageUrl = imageInfo.thumburl || imageInfo.url;
      const sourceUrl = "https://commons.wikimedia.org/wiki/" + encodeURIComponent(page.title).replace(/%3A/g, ":").replace(/%2F/g, "/");

      const card = document.createElement("article");
      card.className = "image-card";

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
    resultCount.textContent = "Showing " + images.length + " image" + (images.length === 1 ? "" : "s") + " for “" + query + "”.";
  } catch (error) {
    statusMessage.textContent = error.message || "Something went wrong. Please try again.";
    resultCount.textContent = "";
  }
});