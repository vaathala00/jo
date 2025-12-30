const axios = require("axios");
const fs = require("fs");

const STREAM_JSON_URL = "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/jtv.m3u";
const OUTPUT_FILE = "stream.json";

async function fetchAndSaveJson() {
  try {
    const { data } = await axios.get(STREAM_JSON_URL);

    // Make sure it's an array
    if (!Array.isArray(data)) {
      throw new Error("Expected JSON array from the stream URL");
    }

    const result = {};
    let idCounter = 143; // start from 143 as per your example

    for (const item of data) {
      if (!item.license || !item.url) continue;

      result[idCounter++] = {
        kid: item.license.kid,
        key: item.license.key,
        url: item.url
      };
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), "utf-8");
    console.log("✅ stream.json saved successfully.");

  } catch (error) {
    console.error("❌ Failed to fetch JSON:", error.message);
    process.exit(1);
  }
}

fetchAndSaveJson();
