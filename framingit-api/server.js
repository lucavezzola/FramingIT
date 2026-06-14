require('./coloredConsole');

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

const JSON_DATA_PATH = 'data.json';

async function startServer() {
  let timeFrames = await upload_json(JSON_DATA_PATH);

  app.get('/api/timeframes', (req, res) => {
    res.json({
      success: true,
      results: timeFrames.length,
      data: timeFrames
    });
  });

  app.get('/api/timeframes/:TFid', (req, res) => {
    const TFid = parseInt(req.params.TFid);
    const index = timeFrames.findIndex(tf => tf.TFid === TFid);

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

  app.post('/api/timeframes', (req, res) => {
    const { title, description } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    // Generate new TFid (find max TFid and add 1)
    const maxTFid = timeFrames.length > 0 ? Math.max(...timeFrames.map(tf => tf.TFid)) : 0;
    const newTFid = maxTFid + 1;

    // Create new timeframe
    const newTimeFrame = {
      TFid: newTFid,
      title: title.trim(),
      description: description ? description.trim() : '',
      events: []
    };

    timeFrames.push(newTimeFrame);
    save_json(timeFrames, JSON_DATA_PATH);

    res.status(201).json({
      success: true,
      data: newTimeFrame,
      message: `TimeFrame "${title}" created successfully`
    });
  });

  app.put('/api/timeframes/:TFid', (req, res) => {
    const TFid = parseInt(req.params.TFid);
    const { title, description } = req.body;
    const index = timeFrames.findIndex(tf => tf.TFid === TFid);

    // TimeFrame not found
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: `TimeFrame with TFid ${TFid} not found`
      });
    }

    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    // Update timeframe
    timeFrames[index].title = title.trim();
    timeFrames[index].description = description ? description.trim() : '';

    save_json(timeFrames, JSON_DATA_PATH);

    res.json({
      success: true,
      data: timeFrames[index],
      message: `TimeFrame "${title}" updated successfully`
    });
  });

  app.delete('/api/timeframes/:TFid', (req, res) => {
    const TFid = parseInt(req.params.TFid);
    const index = timeFrames.findIndex(tf => tf.TFid === TFid);

    // TimeFrame not found
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: `TimeFrame with TFid ${TFid} not found`
      });
    }

    // Remove timeframe
    const deletedTimeFrame = timeFrames.splice(index, 1)[0];
    save_json(timeFrames, JSON_DATA_PATH);

    res.json({
      success: true,
      message: `TimeFrame "${deletedTimeFrame.title}" deleted successfully`,
      data: deletedTimeFrame
    });
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.success('========================================');
    console.success(`  Server Started!`);
    console.success(`  Open: http://localhost:${PORT}/index.html`);
    console.success('========================================');
  });
}

startServer();