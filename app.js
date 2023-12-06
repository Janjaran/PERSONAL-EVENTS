// Initialize events from localStorage or use an empty array
let events = JSON.parse(localStorage.getItem('events')) || [];

// Save events to localStorage
function saveEvents() {
  localStorage.setItem('events', JSON.stringify(events));
}

// Add a new event to the list
function addEvent(name, date, time, location, notes) {
  const newEvent = {
    name,
    date,
    time,
    location,
    notes,
  };
  events.push(newEvent);
  saveEvents();
  displayEvents();
  updateMap();
}

// Delete an event from the list
function deleteEvent(index) {
  events.splice(index, 1);
  saveEvents();
  displayEvents();
  updateMap();
}

// Edit an existing event
function editEvent(index) {
  const event = events[index];

  // Prefill form with existing event details
  document.getElementById('eventName').value = event.name;
  document.getElementById('eventDate').value = event.date;
  document.getElementById('eventTime').value = event.time;
  document.getElementById('eventLocation').value = event.location;
  document.getElementById('eventNotes').value = event.notes;

  // Update the submit button to work as an update button
  const submitButton = document.querySelector('button[type="submit"]');
  submitButton.innerHTML = 'Update Event';
  submitButton.removeEventListener('click', handleFormSubmission);
  submitButton.addEventListener('click', function (event) {
    event.preventDefault();
    updateEvent(index);
  });
}

function updateEvent(index) {
  const name = document.getElementById('eventName').value;
  const date = document.getElementById('eventDate').value;
  const time = document.getElementById('eventTime').value;
  const location = document.getElementById('eventLocation').value;
  const notes = document.getElementById('eventNotes').value;

  events[index] = {
    name,
    date,
    time,
    location,
    notes,
  };

  saveEvents();
  displayEvents();
  updateMap();

  // Reset the form after updating
  document.getElementById('eventForm').reset();

  // Display the form to add more events
  document.getElementById('eventForm').style.display = 'block';
}

// Handle form submission
function handleFormSubmission(event) {
  event.preventDefault();
  const name = document.getElementById('eventName').value;
  const date = document.getElementById('eventDate').value;
  const time = document.getElementById('eventTime').value;
  const location = document.getElementById('eventLocation').value;
  const notes = document.getElementById('eventNotes').value;
  addEvent(name, date, time, location, notes);
  document.getElementById('eventForm').reset();
}

const darkModeButton = document.getElementById('darkModeButton');
const body = document.body;

darkModeButton.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  toggleButtonText();
});

function toggleButtonText() {
  const button = document.getElementById('darkModeButton');
  if (body.classList.contains('dark-mode')) {
    button.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
  } else {
    button.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
  }
}

document.getElementById('searchButton').addEventListener('click', function() {
  const name = document.getElementById('searchName').value.toLowerCase();
  const date = document.getElementById('searchDate').value;
  const location = document.getElementById('searchLocation').value.toLowerCase();

  const filteredEvents = events.filter(event => {
    const eventName = event.name.toLowerCase();
    const eventDate = event.date;
    const eventLocation = event.location.toLowerCase();

    const nameMatch = eventName.includes(name);
    const dateMatch = (date === '' || eventDate === date);
    const locationMatch = eventLocation.includes(location);

    return nameMatch && dateMatch && locationMatch;
  });

  displayFilteredEvents(filteredEvents);
});

function displayFilteredEvents(filteredEvents) {
  console.log(filteredEvents); 
  const eventList = document.getElementById('eventList');
  eventList.innerHTML = '';

  filteredEvents.forEach((event, index) => {
    console.log(event); 
    const eventItem = document.createElement('div');
    eventItem.classList.add('event-item');
    eventItem.innerHTML = `
      <h2>${event.name}</h2>
      <p>Date: ${event.date}</p>
      <p>Time: ${event.time}</p>
      <p>Location: ${event.location}</p>
      <p>Notes: ${event.notes}</p>
      <button onclick="deleteEvent(${index})">Delete</button>
      <button onclick="editEvent(${index})">Edit</button>
    `;
    eventList.appendChild(eventItem);
  });
}

// Display events in the list
function displayEvents() {
  const eventList = document.getElementById('eventList');
  eventList.innerHTML = '';
  events.forEach((event, index) => {
    const eventItem = document.createElement('div');
    eventItem.classList.add('event-item');
    eventItem.innerHTML = `
      <h2>${event.name}</h2>
      <p>Date: ${event.date}</p>
      <p>Time: ${event.time}</p>
      <p>Location: ${event.location}</p>
      <p>Notes: ${event.notes}</p>
      <button onclick="deleteEvent(${index})">Delete</button>
      <button onclick="editEvent(${index})">Edit</button>
    `;
    eventList.appendChild(eventItem);
  });
}

const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let isSelectingLocation = false;
let selectedLocation = null;

const selectLocationButton = document.getElementById('selectLocationButton');

selectLocationButton.addEventListener('click', () => {
  if (!isSelectingLocation) {
    selectLocationButton.textContent = 'Cancel Selection';
    isSelectingLocation = true;
    map.on('click', handleMapClick);
  } else {
    selectLocationButton.textContent = 'Select Location on Map';
    isSelectingLocation = false;
    map.off('click', handleMapClick);
  }
});

function handleMapClick(e) {
  if (isSelectingLocation) {
    if (selectedLocation) {
      selectedLocation.setLatLng(e.latlng);
    } else {
      selectedLocation = L.marker(e.latlng, { draggable: true }).addTo(map);
      selectedLocation.on('dragend', handleMarkerDrag);
    }
    document.getElementById('eventLocation').value = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`;
  }
}

function handleMarkerDrag(e) {
  const latlng = e.target.getLatLng();
  document.getElementById('eventLocation').value = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
}

// Add a new event to the list
function addEvent(name, date, time, location, notes) {
  const newEvent = {
    name,
    date,
    time,
    location,
    notes,
  };
  events.push(newEvent);
  saveEvents();
  displayEvents();
  updateMapWithMarkers();
}

function updateMapWithMarkers() {
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  events.forEach(event => {
    const { location, name } = event;
    const [lat, lng] = location.split(',').map(coord => parseFloat(coord));
    const marker = L.marker([lat, lng]).addTo(map).bindPopup(name);
  });
}

function displayEventLocationOnMap(location) {
  const [lat, lng] = location.split(',').map(coord => parseFloat(coord));
  if (!isNaN(lat) && !isNaN(lng)) {
    map.setView([lat, lng], 15); 
    L.marker([lat, lng]).addTo(map); 
  } else {
    console.error('Invalid location data:', location);
  }
}

function displayEvents() {
  const eventList = document.getElementById('eventList');
  eventList.innerHTML = '';

  events.forEach((event, index) => {
    const eventItem = document.createElement('div');
    eventItem.classList.add('event-item');
    eventItem.innerHTML = `
      <h2>${event.name}</h2>
      <p>Date: ${event.date}</p>
      <p>Time: ${event.time}</p>
      <p>Location: ${event.location}</p>
      <p>Notes: ${event.notes}</p>
      <button onclick="deleteEvent(${index})">Delete</button>
      <button onclick="editEvent(${index})">Edit</button>
    `;
    
    eventItem.onclick = () => {
      displayEventLocationOnMap(event.location);
    };

    eventList.appendChild(eventItem);
  });
}


document.getElementById('searchButton').addEventListener('click', function() {
  displayFilteredEvents(filteredEvents);
});

document.getElementById('eventForm').addEventListener('submit', handleFormSubmission);
displayEvents();
updateMap();
