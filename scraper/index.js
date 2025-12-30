const axios = require("axios");
const fs = require("fs");

const STREAM_JSON_URL = "https://jo-json.vodep39240327.workers.dev";
const OUTPUT_FILE = "stream.json";

async function fetchAndSaveJson() {
  try {
    const { data } = await axios.get(STREAM_JSON_URL);
    
    // Parse the M3U-style entries
    const lines = data.split("\n");
    const result = {};
    let idCounter = 1; // You can start from 143 if you want

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#KODIPROP:inputstream.adaptive.license_key=")) {
        const [kid, key] = lines[i].split("=")[1].split(":");
        const urlLine = lines[i + 2]; // the URL is 2 lines below
        result[idCounter++] = {
          kid,
          key,
          url: urlLine.trim()
        };
      }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), "utf-8");
    console.log("✅ stream.json saved successfully.");

  } catch (error) {
    console.error("❌ Failed to fetch JSON:", error.message);
    process.exit(1);
  }
}

fetchAndSaveJson();
