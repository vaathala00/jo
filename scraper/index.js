const axios = require("axios");
const fs = require("fs");
const path = require("path");

const STREAM_JSON_URL = "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/jtv.m3u";

// IMPORTANT: save INSIDE scraper folder
const RAW_OUTPUT_FILE = path.join(__dirname, "stream.json");
const TRANSFORMED_OUTPUT_FILE = path.join(__dirname, "stream1.json");

// ---------- helpers ----------

function extractCode(url) {
  const match = url.match(/\/bpk-tv\/([^\/]+)\//);
  return match ? match[1] : null;
}

function formatName(code) {
  return code
    .replace(/_MOB$/i, "")
    .replace(/_BTS$/i, "")
    .replace(/_/g, " ")
    .trim();
}

function formatLogo(code) {
  const clean = code
    .replace(/_MOB$/i, "")
    .replace(/_BTS$/i, "");

  return `https://jiotv.catchup.cdn.jio.com/dare_images/images/${clean}.png`;
}

function buildLink(originalUrl, name, kid, key) {
  const [baseUrl, query] = originalUrl.split("?");

  // IMPORTANT: replace domain
  const mobUrl = baseUrl.replace(
    "jiotvmblive.cdn.jio.com",
    "jiotvbpkmob.cdn.jio.com"
  );

  return (
    "https://dash.vodep39240327.workers.dev/?" +
    "url=" + encodeURIComponent(mobUrl) +
    "&name=" + encodeURIComponent(name) +
    "&keyId=" + kid +
    "&key=" + key +
    "&cookie=" + encodeURIComponent(query || "")
  );
}

// ---------- main ----------

async function run() {
  try {
    const res = await axios.get(STREAM_JSON_URL);
    const rawData = res.data;

    // save raw
    fs.writeFileSync(RAW_OUTPUT_FILE, JSON.stringify(rawData, null, 2));
    console.log("✅ scraper/stream.json saved");

    const result = [];

    for (const [id, item] of Object.entries(rawData)) {
      const code = extractCode(item.url);
      if (!code) continue;

      const name = formatName(code);
      const logo = formatLogo(code);

      result.push({
        name,
        id,
        logo,
        group: "Jio+",
        link: buildLink(item.url, name, item.kid, item.key)
      });
    }

    fs.writeFileSync(
      TRANSFORMED_OUTPUT_FILE,
      JSON.stringify(result, null, 2)
    );
    console.log("✅ scraper/stream1.json saved");

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

run();
