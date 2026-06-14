// Import Express framework for building the web server
const express = require('express');
// Import CORS middleware to enable cross-origin requests from other domains
const cors = require('cors');
// Import helper functions from utils.js
const { upload_json, save_json } = require('./utils');

// Create an Express application instance
const app = express();

// Enable CORS to allow requests from different origins
app.use(cors());

// Parse incoming request bodies as JSON
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

let timeFrames = upload_json('./data.json');

app.get('api/timeframes:TFid', (req, res) => {
  const TFid = parseInt(req.params.TFid);
  const index = timeFrames.findIndex(tf => tf.id === TFid);

  // TimeFrame requested not found
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: `TimeFrame with TFid ${TFid} not found`
    });
  }

  // TimeFrame requested found
  res.json({
    success: true,
    data: timeFrames[index]
  });
});