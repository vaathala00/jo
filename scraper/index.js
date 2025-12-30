const axios = require("axios");
const fs = require("fs");
const path = require("path");

const STREAM_JSON_URL = "https://jo-json.vodep39240327.workers.dev";
const RAW_OUTPUT_FILE = path.join(__dirname, "../stream.json");
const TRANSFORMED_OUTPUT_FILE = path.join(__dirname, "../stream1.json");

/**
 * CHANNEL METADATA MAP
 * (This is REQUIRED to get Colors Tamil, MOB URLs, logos, etc.)
 */
const CHANNEL_MAP = {
  "429": {
    name: "Colors Tamil",
    mobUrl: "https://jiotvbpkmob.cdn.jio.com/bpk-tv/Colors_Tamil_MOB/WDVLive/index.mpd",
    logo: "https://jiotv.catchup.cdn.jio.com/dare_images/images/Colors_Tamil.png"
  }
  // 👉 add more channels here
};

// Build final DASH proxy link
function buildLink(mobUrl, name, kid, key, cookie) {
  return (
    "https://dash.vodep39240327.workers.dev/?" +
    "url=" + encodeURIComponent(mobUrl) +
    "&name=" + encodeURIComponent(name) +
    "&keyId=" + kid +
    "&key=" + key +
    "&cookie=" + encodeURIComponent(cookie)
  );
}

async function run() {
  try {
    // 1️⃣ Fetch RAW JSON
    const res = await axios.get(STREAM_JSON_URL);
    const rawData = res.data;

    // Save stream.json
    fs.writeFileSync(RAW_OUTPUT_FILE, JSON.stringify(rawData, null, 2));
    console.log("✅ stream.json saved");

    // 2️⃣ Transform → stream1.json
    const result = [];

    for (const [id, data] of Object.entries(rawData)) {
      // Skip channels we don’t have metadata for
      if (!CHANNEL_MAP[id]) continue;

      const channel = CHANNEL_MAP[id];

      // Extract cookie from original URL
      const cookie = data.url.split("?")[1] || "";

      result.push({
        name: channel.name,
        id: id,
        logo: channel.logo,
        group: "Jio+",
        link: buildLink(
          channel.mobUrl,
          channel.name,
          data.kid,
          data.key,
          cookie
        )
      });
    }

    fs.writeFileSync(TRANSFORMED_OUTPUT_FILE, JSON.stringify(result, null, 2));
    console.log("✅ stream1.json saved");

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

run();
