const axios = require("axios");
const fs = require("fs");

const STREAM_URL = "https://raw.githubusercontent.com/alex8875/m3u/refs/heads/main/jtv.m3u";
const OUTPUT_FILE = "stream.json";

async function fetchAndSaveJson() {
  try {
    // Tell axios to get text, not try to parse JSON
    const response = await axios.get(STREAM_URL, { responseType: "text" });
    const data = response.data;

    const lines = data.split("\n");
    const result = {};
    let idCounter = 143; // Start at 143 as in your example

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith("#KODIPROP:inputstream.adaptive.license_key=")) {
        const [kid, key] = line.split("=")[1].split(":");

        // The URL is usually two lines below
        const urlLine = lines[i + 2];
        if (urlLine && urlLine.startsWith("http")) {
          result[idCounter++] = {
            kid,
            key,
            url: urlLine.trim()
          };
        }
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
