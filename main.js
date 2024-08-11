// Initialize variables for navigation hover effect and search functionality
let list = document.querySelectorAll(".navigation li");
let currentFilter = null;
let searchQuery = ''; // Store the search query

// Select all navigation menu items
const menuItems = document.querySelectorAll(".navigation ul li a");

// Add 'hovered' class on mouse enter to highlight the menu item
function addHoverClass() {
  this.classList.add("hovered");
}

// Remove 'hovered' class on mouse leave to unhighlight the menu item
function removeHoverClass() {
  this.classList.remove("hovered");
}

// Activate the clicked menu item and update the URL hash
function setActiveMenuItem() {

  menuItems.forEach(item => item.classList.remove("active"));

  this.classList.add("active");

  if (this.getAttribute('href').startsWith('#')) {
    window.location.hash = this.getAttribute('href');
  }
}

// Update the active menu item based on the current URL hash
function navigate() {

  const currentHash = window.location.hash || "#dashboard";

  menuItems.forEach(item => {
    if (item.getAttribute('href') === currentHash) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
};

// Attach event listeners for hover effects and menu item activation
menuItems.forEach((item) => {
  item.addEventListener("mouseenter", addHoverClass);
  item.addEventListener("mouseleave", removeHoverClass);
  item.addEventListener("click", setActiveMenuItem);
});


navigate();

window.addEventListener("hashchange", navigate);



// Select all elements with class 'main', 'navigation', and 'toggle'
const mains = document.querySelectorAll(".main");
const navigations = document.querySelectorAll(".navigation");
const toggles = document.querySelectorAll(".toggle");

// Function to toggle 'active' class on all navigations and mains
function toggleActiveClass() {
  navigations.forEach(navigation => navigation.classList.toggle("active"));
  mains.forEach(main => main.classList.toggle("active"));
}

// Attach click event listeners to all toggle elements
toggles.forEach(toggle => {
  toggle.addEventListener("click", toggleActiveClass);
});


// Update the displayed member counts based on their membership status
function updateMemberCounts() {
  const members = getMembers();
  const counts = members.reduce((acc, member) => {
    acc[member.membership_status] = (acc[member.membership_status] || 0) + 1;
    return acc;
  }, {});

  document.getElementById('premiumCount').textContent = counts.premium || 0;
  document.getElementById('goldCount').textContent = counts.gold || 0;
  document.getElementById('vipEliteCount').textContent = counts['vip/elite'] || 0;
  document.getElementById('lifetimeCount').textContent = counts.lifetime || 0;
}

// Set the current filter and re-render the members list
function filterMembers(category) {
  currentFilter = category;
  renderMembers();
}

// Render the list of members based on the current filter and search query
function renderMembers() {
  const members = getMembers();
  const itemList = document.getElementById('itemList');
  itemList.innerHTML = '';

  const filteredMembers = members.filter(member => {
    const matchesFilter = !currentFilter || member.membership_status === currentFilter;
    const matchesSearch = member.name.toLowerCase().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  filteredMembers.forEach((member) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${member.name}</td>
      <td>${member.membership_status}</td>
      <td><ion-icon name="create-outline" onclick="openEditModal('${member.id}')"></ion-icon></td>
      <td><ion-icon name="trash-outline" onclick="deleteMember('${member.id}')"></ion-icon></td>
    `;
    itemList.appendChild(row);
  });
}

// Render Recent Members List
function renderRecentMembers() {
  const members = getMembers();
  const recentMembersTable = document.getElementById('recentMembersTable');

  recentMembersTable.innerHTML = '';

  const sortedMembers = members.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  sortedMembers.forEach((member) => {
    const row = document.createElement('tr');
    row.innerHTML = `
          <td>
              <div class="imgBx"><ion-icon name="person-circle-outline"></ion-icon></div>
          </td>
          <td>
              <h4>${member.name} <br> <span>${member.membership_status}</span></h4>
          </td>
      `;
    recentMembersTable.appendChild(row);
  });
}

// Load Initial Data from JSON
async function loadInitialData() {
  try {
    const response = await fetch('./data.json');
    if (!response.ok) {
      throw new Error('Network response was not ok: ' + response.statusText);
    }
    const data = await response.json();

    data.forEach((item, index) => {
      item.id = index.toString();
      item.timestamp = new Date().toISOString();
    });

    localStorage.setItem('members', JSON.stringify(data));

    renderMembers();
    renderRecentMembers();
    updateMemberCounts();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Retrieve Members from Local Storage
function getMembers() {
  const members = localStorage.getItem('members');
  return members ? JSON.parse(members) : [];
}

// Save Members to Local Storage
function saveMembers(members) {
  localStorage.setItem('members', JSON.stringify(members));
}

// Handle Adding or Editing a Member
function handleMember(isEdit = false) {
  const itemName = document.getElementById('itemName').value.trim();
  const membershipStatus = document.getElementById('membershipStatus').value;
  const members = getMembers();

  if (itemName === '') {
    alert('Name cannot be empty');
    return;
  }

  const id = document.getElementById('editMemberId').value;
  const existingIndex = members.findIndex(member => member.id === id);

  if (isEdit) {
    if (existingIndex >= 0) {
      const isDuplicate = members.some(member =>
        member.name.toLowerCase() === itemName.toLowerCase() && member.id !== id
      );

      if (isDuplicate) {
        alert('A member with this name already exists.');
        return;
      }

      members[existingIndex].name = itemName;
      members[existingIndex].membership_status = membershipStatus;
    }
  } else {
    const isDuplicate = members.some(member =>
      member.name.toLowerCase() === itemName.toLowerCase()
    );

    if (isDuplicate) {
      alert('A member with this name already exists.');
      return;
    }

    // Generate a new unique ID and add the new member
    const newId = (members.length > 0 ? Math.max(...members.map(m => parseInt(m.id))) + 1 : 0).toString();
    members.push({
      id: newId,
      name: itemName,
      membership_status: membershipStatus,
      timestamp: new Date().toISOString() // Add current timestamp
    });
  }

  // Reset form fields
  document.getElementById('itemName').value = '';
  document.getElementById('membershipStatus').value = 'premium';

  // Save the updated members list and refresh the UI

  saveMembers(members);
  renderMembers();
  renderRecentMembers();
  updateMemberCounts();

  document.getElementById('editModal').style.display = 'none';
}

// Open the Edit Modal for a Specific Member
function openEditModal(id) {
  const members = getMembers();
  const member = members.find(member => member.id === id);

  document.getElementById('editItemName').value = member.name;
  document.getElementById('editMembershipStatus').value = member.membership_status;
  document.getElementById('editMemberId').value = id;

  document.getElementById('editModal').style.display = 'block';
}

document.querySelector('.close').onclick = function () {
  document.getElementById('editModal').style.display = 'none';
}

// Handle Edit Form Submission
document.getElementById('editForm').onsubmit = function (event) {
  event.preventDefault();

  const id = document.getElementById('editMemberId').value;
  const itemName = document.getElementById('editItemName').value.trim();
  const membershipStatus = document.getElementById('editMembershipStatus').value;
  const members = getMembers();

  if (itemName === '') {
    alert('Name cannot be empty');
    return;
  }

  // Check for duplicate member names, excluding the current member
  const isDuplicate = members.some(member =>
    member.name.toLowerCase() === itemName.toLowerCase() && member.id !== id
  );

  if (isDuplicate) {
    alert('A member with this name already exists.');
    return;
  }

  // Update the member's information if found
  const member = members.find(member => member.id === id);
  if (member) {
    member.name = itemName;
    member.membership_status = membershipStatus;
  }

  saveMembers(members);
  renderMembers();
  updateMemberCounts();

  document.getElementById('editModal').style.display = 'none';
};

// Delete a Member
function deleteMember(id) {
  if (confirm('Are you sure you want to delete this member?')) {
    let members = getMembers();

    members = members.filter(member => member.id !== id);

    saveMembers(members);
    renderMembers();
    updateMemberCounts();
  }
}

// Display All Members (Remove Filter)
function showAllMembers() {
  currentFilter = null;
  renderMembers();
}

// Sort Members by the Selected Key
function sortMembers(sortKey) {
  const members = getMembers();
  let sortedMembers;

  // Sort members based on the selected sort key
  switch (sortKey) {
    case 'name-asc':
      sortedMembers = members.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      sortedMembers = members.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'status-asc':
      sortedMembers = members.sort((a, b) => a.membership_status.localeCompare(b.membership_status));
      break;
    case 'status-desc':
      sortedMembers = members.sort((a, b) => b.membership_status.localeCompare(a.membership_status));
      break;
    default:
      sortedMembers = members;
  }

  saveMembers(sortedMembers);
  renderMembers();
}

// Add Event Listeners to Sort Icons
document.querySelectorAll('.sort-icon').forEach(icon => {
  icon.addEventListener('click', (event) => {
    const sortKey = event.target.getAttribute('data-sort');
    sortMembers(sortKey);
  });
});

// Update Search Query and Re-render Members
function updateSearchQuery(query) {
  searchQuery = query.toLowerCase();
  renderMembers(); // Re-render members based on the updated search query
}

// Attach Event Listener to Search Input
document.querySelector('.search input').addEventListener('input', function (event) {
  updateSearchQuery(event.target.value);
});

// Initialize Application on Document Ready
document.addEventListener('DOMContentLoaded', () => {
  if (getMembers().length === 0) {
    loadInitialData();
  } else {
    renderMembers();
    renderRecentMembers();
    updateMemberCounts();
  }
});
