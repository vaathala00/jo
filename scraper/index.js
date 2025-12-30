const axios = require("axios");
const fs = require("fs");

const STREAM_URL = "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/jtv.m3u";
const OUTPUT_FILE = "stream.json";

async function fetchAndSaveJson() {
  try {
    const response = await axios.get(STREAM_URL, { responseType: "text" });
    const lines = response.data.split("\n");

    const result = {};
    let idCounter = 143; // start from 143

    let currentKid = null;
    let currentKey = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Extract kid and key
      if (trimmed.startsWith("#KODIPROP:inputstream.adaptive.license_key=")) {
        const [kid, key] = trimmed.split("=")[1].split(":");
        currentKid = kid;
        currentKey = key;
      }

      // Extract URL after license
      if (currentKid && currentKey && trimmed.startsWith("http")) {
        result[idCounter++] = {
          kid: currentKid,
          key: currentKey,
          url: trimmed
        };
        // Reset for next entry
        currentKid = null;
        currentKey = null;
      }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), "utf-8");
    console.log("✅ stream.json saved successfully.");

  } catch (err) {
    console.error("❌ Failed to fetch M3U:", err.message);
    process.exit(1);
  }
}

fetchAndSaveJson();
