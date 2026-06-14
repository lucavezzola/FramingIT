// Import Express framework for building the web server
const express = require('express');
// Import CORS middleware to enable cross-origin requests from other domains
const cors = require('cors');

// Create an Express application instance
const app = express();

// Enable CORS to allow requests from different origins
app.use(cors());

// Parse incoming request bodies as JSON
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));