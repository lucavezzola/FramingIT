const API_URL = "http://localhost:3000/api";

async function loadTimeFrameDetails() {
  // Get TFid from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const TFid = urlParams.get('tfid');

  if (!TFid) {
    document.getElementById('events-container').textContent = 'No timeframe selected.';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/timeframes/${TFid}`);
    const data = await response.json();

    if (data.success) {
      const timeFrame = data.data;
      document.getElementById('timeframe-title').textContent = timeFrame.title;
      document.getElementById('timeframe-description').textContent = timeFrame.description;
      createEventsTable(timeFrame.events);
    } else {
      document.getElementById('events-container').textContent = 'TimeFrame not found.';
    }
  } catch (error) {
    console.error('Loading error:', error);
    document.getElementById('events-container').textContent = 'Server connection error!';
  }
}

function createEventsTable(events) {
  const container = document.getElementById('events-container');
  container.innerHTML = '';

  // Check if events array is empty
  if (!Array.isArray(events) || events.length === 0) {
    container.textContent = 'No events in this timeframe.';
    return;
  }

  // Create table
  const table = document.createElement('table');

  // Create table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = Object.keys(events[0]);

  headers.forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement('tbody');
  events.forEach(event => {
    const row = document.createElement('tr');
    headers.forEach(key => {
      const cell = document.createElement('td');
      const value = event[key];
      cell.textContent = (value === undefined || value === null) ? '' : value;
      row.appendChild(cell);
    });
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

loadTimeFrameDetails();
