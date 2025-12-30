const axios = require("axios");
const fs = require("fs");

const STREAM_JSON_URL = "https://jo-json.vodep39240327.workers.dev";
const OUTPUT_FILE = "stream1.json";

function formatNameFromUrl(url) {
  // Extract the channel name from URL, e.g., Colors_Tamil from .../Colors_Tamil_MOB/...
  const match = url.match(/\/bpk-tv\/([^_]+_[^_]+)_MOB\//);
  return match ? match[1].replace("_", " ") : "Unknown";
}

function formatLogoUrl(name) {
  // Replace spaces with underscores to match logo URL pattern
  const logoName = name.replace(/\s+/g, "_");
  return `https://jiotv.catchup.cdn.jio.com/dare_images/images/${logoName}.png`;
}

function formatLink(url, name, keyId, key) {
  const encodedName = encodeURIComponent(name);
  return `https://dash.vodep39240327.workers.dev/?url=${encodeURIComponent(url)}&name=${encodedName}&keyId=${keyId}&key=${key}&cookie=__hdnea__`;
}

async function fetchAndTransformJson() {
  try {
    const response = await axios.get(STREAM_JSON_URL);
    const rawData = response.data;

    const transformed = Object.entries(rawData).map(([id, item]) => {
      const name = formatNameFromUrl(item.url);
      const logo = formatLogoUrl(name);

      return {
        name: name,
        id: id,
        logo: logo,
        group: "Jio+",
        link: formatLink(item.url, name, item.kid, item.key)
      };
    });

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(transformed, null, 2), "utf-8");
    console.log(`✅ ${OUTPUT_FILE} saved successfully.`);
  } catch (error) {
    console.error("❌ Failed to fetch or transform JSON:", error.message);
    process.exit(1);
  }
}

fetchAndTransformJson();
