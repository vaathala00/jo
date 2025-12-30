const axios = require("axios");
const fs = require("fs");
const path = require("path");

// URLs and file paths
const STREAM_JSON_URL = "https://jo-json.vodep39240327.workers.dev";
const RAW_OUTPUT_FILE = path.join(__dirname, "../stream.json");
const TRANSFORMED_OUTPUT_FILE = path.join(__dirname, "../stream1.json");

// Extract display name from URL
function formatNameFromUrl(url) {
  const match = url.match(/\/bpk-tv\/([^\/]+)\//);
  if (!match) return "Unknown";

  // Replace underscores with spaces for display
  return match[1].replace(/_/g, " ").trim();
}

// Generate logo URL, remove _BTS suffix
function formatLogoUrl(url) {
  const match = url.match(/\/bpk-tv\/([^\/]+)\//);
  let logoName = match ? match[1] : "Unknown";

  // Remove _BTS suffix if exists
  logoName = logoName.replace(/_BTS$/i, "");

  return `https://jiotv.catchup.cdn.jio.com/dare_images/images/${logoName}.png`;
}

// Generate link with keyId, key, cookie
function formatLink(url, name, keyId, key) {
  const encodedName = encodeURIComponent(name);
  return `https://dash.vodep39240327.workers.dev/?url=${encodeURIComponent(url)}&name=${encodedName}&keyId=${keyId}&key=${key}&cookie=__hdnea__`;
}

// Main function
async function fetchAndSaveBoth() {
  try {
    // Fetch raw JSON from API
    const response = await axios.get(STREAM_JSON_URL);
    const rawData = response.data;

    // Save raw JSON
    fs.writeFileSync(RAW_OUTPUT_FILE, JSON.stringify(rawData, null, 2), "utf-8");
    console.log(`✅ ${RAW_OUTPUT_FILE} saved successfully.`);

    // Transform and save stream1.json
    const transformed = Object.entries(rawData).map(([id, item]) => {
      const name = formatNameFromUrl(item.url);
      const logo = formatLogoUrl(item.url);

      return {
        name,
        id,
        logo,
        group: "Jio+",
        link: formatLink(item.url, name, item.kid, item.key)
      };
    });

    fs.writeFileSync(TRANSFORMED_OUTPUT_FILE, JSON.stringify(transformed, null, 2), "utf-8");
    console.log(`✅ ${TRANSFORMED_OUTPUT_FILE} saved successfully.`);
  } catch (error) {
    console.error("❌ Failed to fetch or transform JSON:", error.message);
    process.exit(1);
  }
}

// Run the function
fetchAndSaveBoth();
