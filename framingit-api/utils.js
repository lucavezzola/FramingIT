const fs = require('fs').promises;

async function upload_json(filePath) {
  try {
    const jsonText = await fs.readFile(filePath, 'utf8');
    const timeFrames = JSON.parse(jsonText).timeFrames;
    console.success("File uploaded successfully!");
    return timeFrames;
  } catch (err) {
    console.error("Error reading JSON:", err);
    return [];
  }
}

async function save_json(timeFrames, filePath) {
  try {
    const json = JSON.stringify({ timeFrames: timeFrames }, null, 2);
    await fs.writeFile(filePath, json);
    console.log("JSON saved successfully!");
  } catch (err) {
    console.error("Error writing JSON:", err);
  }
}

module.exports = { upload_json, save_json };