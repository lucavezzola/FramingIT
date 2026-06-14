const API_URL = "http://localhost:3000/api";
let idBeingEdited = null;

// Modifies the behaviour of the submit button to not reload the page
const form = document.getElementById("TF-form");
form.addEventListener('submit', function(event) {
  event.preventDefault();
  addTF();
})

// Writes in the log - it will show API calls
function writeLog(method, url, state) {
  const log = document.getElementById(`api-log-entries`);
  const logClass = `log-${method.toLowerCase()}`;
  const ora = new Date().toLocaleTimeString();
  
  // Removes the word "latest" from the previous latest text
  const latestText = document.getElementById("latestText");
  if(latestText){
    latestText.remove();
  }

  log.innerHTML = `<div class="log-entry">
    <span class="${logClass}">[${method}]</span>
    ${url}
    -> <strong>${state}</strong> <span style="color:#7f8c8d"> (${ora})  </span>
    <span id="latestText" style="color: green;">(LATEST)</span>
  </div>` + log.innerHTML;
}

// Shows temporary notification messages
function showMessage(text, type) {
  const div = document.getElementById(`message`);
  div.textContent = text;
  div.className = `message message-${type}`;
  div.style.display = `block`;

  setTimeout(() => {
    div.style.display = `none`;
  }, 5000);
}

async function loadTimeFrames() {
  try {
    const response = await fetch(`${API_URL}/timeframes`);
    const JSON_data = await response.json();

    writeLog('GET', '/api/timeframes', response.status);

    if(JSON_data.success) {
      createTFTable(JSON_data.data);
    }
  } catch (error) {
    console.error('Loading error:', error);
    showMessage('Server connection error!', 'error');
  }
}

function createTFTable(data) {
  const container = document.getElementById("table-container");
  container.innerHTML = "";

  // Check that the data is an array and that is not empty
  if (!Array.isArray(data) || data.length === 0) {
    container.textContent = "No timeframe created.";
    return;
  }

  // Creates the table element
  const table = document.createElement("table");

  // Create the table header and its row
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  // Extracts the dict keys from data (first row formats all rows), minus the events list
  const headers = Object.keys(data[0]).filter(key => key !== 'events');
  // Creates a column for each dict key found
  headers.forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Creates the rows of the table body
  const tbody = document.createElement("tbody");
  data.forEach(item => {
    const row = document.createElement("tr");
    row.style.cursor = "pointer";
    row.onclick = () => navigateToTimeFrame(item.TFid);
    
    // Populate cells only for the previously computed headers (this excludes 'events')
    headers.forEach(key => {
      const cell = document.createElement("td");
      const value = item[key];
      cell.textContent = (value === undefined || value === null) ? '' : value;
      row.appendChild(cell);
    });

    // Adds two cells to the rows: edit and remove buttons
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.onclick = () => showTFEdit(item.TFid, item.title, item.description);
    editBtn.textContent = "✏️";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.onclick = () => removeTF(item.TFid, item.title);
    removeBtn.textContent = "❌";

    const editCell = document.createElement("td");
    editCell.appendChild(editBtn);
    row.appendChild(editCell);

    const removeCell = document.createElement("td");
    removeCell.appendChild(removeBtn);
    row.appendChild(removeCell);

    // Adds the row to the table
    tbody.appendChild(row);
  });
  table.appendChild(tbody);

  // Appends the table to the table container
  document.getElementById("table-container").appendChild(table)
}

function showTFEdit(TFid, title, description) {
  idBeingEdited = TFid;
  const titleInput = document.getElementById('titleInput');
  const descriptionInput = document.getElementById('descriptionInput');
  const submitButton = document.getElementById('btn-submit');

  if (!titleInput || !descriptionInput || !submitButton) {
    console.error('Edit form elements are missing.');
    return;
  }

  titleInput.value = title;
  descriptionInput.value = description;
  submitButton.value = "Update the timeframe";
  submitButton.textContent = "Update the timeframe";
}

async function addTF() {
  // Gets the form elements with their id
  const title = document.getElementById(`titleInput`).value.trim();
  const description = document.getElementById(`descriptionInput`).value.trim();

  if (!title) {
    showMessage(`The title is required!`, `error`);
    return;
  }

  if (idBeingEdited !== null) {
    // TF edit shortcut
    await editTF(idBeingEdited, { title, description });
    return;
  }

  try {
    const response = await fetch(`${API_URL}/timeframes`, {
      method: `POST`,
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ title, description })
    });

    // Wait to see if the server acknowledged the post request
    const data = await response.json();
    writeLog(`POST`, `/api/timeframes`, response.status);

    if (data.success) {
      showMessage(`Timeframe "${title}" created!`, `success`);
      cleanForm();
      loadTimeFrames(); // Reloads the timeframes list
    } else {
      showMessage(data.error, `error`);
    }
  } catch (error) {
    console.error(`Creation error:`, error);
    showMessage(`Server correction error!`, `error`);
  }
}

function cleanForm() {
  document.getElementById(`titleInput`).value = ``;
  document.getElementById(`descriptionInput`).value = ``;
  idBeingEdited = null;
  document.getElementById(`btn-submit`).value = `Add the timeframe`;
  document.getElementById(`btn-submit`).textContent = `Add the timeframe`;
}

async function editTF(TFid, editedData) {
  try {
    const response = await fetch(`${API_URL}/timeframes/${TFid}`, {
      method: `PUT`,
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(editedData)
    });

    const data = await response.json();
    writeLog(`PUT`, `/api/timeframes/${TFid}`, response.status);

    if (data.success) {
      showMessage(`TimeFrame edited!`, `success`);
      idBeingEdited = null;
      document.getElementById(`btn-submit`).value = `Add TimeFrame`;
      cleanForm();
      loadTimeFrames();
    } else {
      showMessage(data.error, `error`);
    }
  } catch (error) {
    console.error(`Error in the editing:`, error);
    showMessage(`Server connection error`, `error`);
  }
}

async function removeTF(TFid, title) {
  event.stopPropagation(); // Prevent row click navigation
  if (!confirm(`Are you sure you want to remove ${title}?`)) {
    return; // If the user clicks "cancel", don't do anything
  }
  
  try {
    const response = await fetch(`${API_URL}/timeframes/${TFid}`, {
      method: `DELETE`
    });
    const data = await response.json();
    writeLog(`DELETE`, `/api/timeframes/${TFid}`, response.status);
    if (data.success) {
      showMessage(`"${title}" removed`, `success`);
      loadTimeFrames();
    } else {
      showMessage(data.error, `error`);
    }
  } catch (error) {
    console.error(`Elimination error:`, error);
  }
}

function navigateToTimeFrame(TFid) {
  window.location.href = `timeframe-details.html?tfid=${TFid}`;
}

loadTimeFrames();