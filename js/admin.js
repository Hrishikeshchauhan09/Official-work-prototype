// ===================================
// Admin Panel JavaScript
// ===================================

// Check admin authentication on page load
document.addEventListener('DOMContentLoaded', function () {
    // Require admin access
    if (!auth.requireAuth()) return;
    if (!auth.requireAdmin()) return;

    // Initialize admin panel
    initAdminPanel();
    loadDashboard();
    setupEventListeners();
});

// Initialize admin panel
function initAdminPanel() {
    const user = auth.getCurrentUser();
    document.getElementById('adminName').textContent = `Welcome, ${user.name}`;
}

// Logout handler
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
        window.location.href = 'login.html';
    }
}

// Show different sections
function showSection(section, el) {
    // Close mobile sidebar when navigating
    if (typeof closeMobileSidebar === 'function') closeMobileSidebar();

    // Hide all sections
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('meetingsSection').style.display = 'none';
    document.getElementById('propertiesSection').style.display = 'none';
    document.getElementById('addPropertySection').style.display = 'none';

    // Show selected section
    if (section === 'dashboard') {
        document.getElementById('dashboardSection').style.display = 'block';
        loadDashboard();
    } else if (section === 'meetings') {
        document.getElementById('meetingsSection').style.display = 'block';
        loadMeetingsTable();
    } else if (section === 'properties') {
        document.getElementById('propertiesSection').style.display = 'block';
        loadPropertiesTable();
    } else if (section === 'addProperty') {
        document.getElementById('addPropertySection').style.display = 'block';
    }

    // Update active nav link
    document.querySelectorAll('.admin-sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    if (el) el.classList.add('active');
}

// Load dashboard statistics
function loadDashboard() {
    const properties = propertyManager.getAll();
    const featured = properties.filter(p => p.featured);
    const visible = properties.filter(p => p.visible);

    document.getElementById('totalProperties').textContent = properties.length;
    document.getElementById('featuredProperties').textContent = featured.length;
    document.getElementById('visibleProperties').textContent = visible.length;

    // Pending meetings count
    const meetings = meetingManager.getAll();
    const pending = meetings.filter(m => m.status === 'pending');
    document.getElementById('pendingMeetingsCount').textContent = pending.length;

    // Update sidebar badge
    const sidebarBadge = document.getElementById('sidebarMeetingBadge');
    if (sidebarBadge) {
        sidebarBadge.textContent = pending.length > 0 ? pending.length : '';
    }

    // Load recent properties
    loadRecentProperties();
}

// Load recent properties for dashboard
function loadRecentProperties() {
    const properties = propertyManager.getAll().slice(0, 5);
    const tbody = document.getElementById('recentPropertiesTable');

    tbody.innerHTML = properties.map(prop => {
        const thumb = (prop.images && prop.images.length > 0) ? prop.images[0] : prop.image;
        return `
        <tr>
          <td><img src="${thumb}" alt="${prop.title}" class="property-image-small"></td>
          <td>${prop.title}</td>
          <td>${prop.location}</td>
          <td>${PropertyManager.formatPrice(prop.price)}</td>
          <td>
            <span class="badge ${prop.visible ? 'bg-success' : 'bg-secondary'}">
              ${prop.visible ? 'Visible' : 'Hidden'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
}

// Load all properties in management table
function loadPropertiesTable() {
    const properties = propertyManager.getAll();
    const tbody = document.getElementById('propertiesTable');

    tbody.innerHTML = properties.map(prop => {
        const thumb = (prop.images && prop.images.length > 0) ? prop.images[0] : prop.image;
        const imgCount = (prop.images && prop.images.length > 0) ? prop.images.length : 1;
        const hasVideo = prop.videoUrl && prop.videoUrl.trim() !== '';
        return `
        <tr>
          <td style="position:relative;">
            <img src="${thumb}" alt="${prop.title}" class="property-image-small">
            ${imgCount > 1 ? `<span class="badge bg-dark" style="position:absolute;bottom:2px;right:2px;font-size:0.6rem;"><i class="bi bi-images"></i> ${imgCount}</span>` : ''}
            ${hasVideo ? `<span class="badge bg-danger ms-1" style="font-size:0.6rem;"><i class="bi bi-play-circle"></i></span>` : ''}
          </td>
          <td>${prop.title}</td>
          <td><span class="badge bg-info">${prop.type}</span></td>
          <td>${prop.location}</td>
          <td>${PropertyManager.formatPrice(prop.price)}</td>
          <td>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" ${prop.visible ? 'checked' : ''}
                     onchange="toggleVisibility(${prop.id})">
            </div>
          </td>
          <td>
            <div class="form-check form-switch">
              <input class="form-check-input" type="checkbox" ${prop.featured ? 'checked' : ''}
                     onchange="toggleFeatured(${prop.id})">
            </div>
          </td>
          <td>
            <button class="btn btn-sm btn-primary me-1" onclick="editProperty(${prop.id})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteProperty(${prop.id})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Add property form
    document.getElementById('addPropertyForm').addEventListener('submit', handleAddProperty);
}

// Handle add property form submission
function handleAddProperty(e) {
    e.preventDefault();

    // Collect all image URLs
    const imageInputs = document.querySelectorAll('.prop-image-url');
    const images = Array.from(imageInputs)
        .map(inp => inp.value.trim())
        .filter(url => url !== '');

    if (images.length === 0) {
        alert('Please add at least one image URL.');
        return;
    }

    const propertyData = {
        title: document.getElementById('propTitle').value,
        type: document.getElementById('propType').value,
        location: document.getElementById('propLocation').value,
        price: parseInt(document.getElementById('propPrice').value),
        area: document.getElementById('propArea').value,
        bedrooms: document.getElementById('propBedrooms').value ? parseInt(document.getElementById('propBedrooms').value) : null,
        bathrooms: document.getElementById('propBathrooms').value ? parseInt(document.getElementById('propBathrooms').value) : null,
        image: images[0],
        images: images,
        videoUrl: document.getElementById('propVideoUrl').value.trim(),
        auctionDate: document.getElementById('propAuctionDate').value,
        description: document.getElementById('propDescription').value,
        visible: document.getElementById('propVisible').checked,
        featured: document.getElementById('propFeatured').checked
    };

    const result = propertyManager.add(propertyData);

    if (result.success) {
        alert('Property added successfully!');
        document.getElementById('addPropertyForm').reset();
        // Reset image inputs to single row
        resetImageInputs('propImagesContainer', 'propImageRowTemplate');
        loadDashboard();
    } else {
        alert('Error adding property: ' + result.message);
    }
}

// Toggle property visibility
function toggleVisibility(id) {
    const result = propertyManager.toggleVisibility(id);
    if (result.success) {
        loadDashboard();
        loadPropertiesTable();
    }
}

// Toggle featured status
function toggleFeatured(id) {
    const result = propertyManager.toggleFeatured(id);
    if (result.success) {
        loadDashboard();
        loadPropertiesTable();
    }
}

// Edit property
function editProperty(id) {
    const property = propertyManager.getById(id);
    if (!property) return;

    // Populate edit form
    document.getElementById('editPropId').value = property.id;
    document.getElementById('editPropTitle').value = property.title;
    document.getElementById('editPropType').value = property.type;
    document.getElementById('editPropLocation').value = property.location;
    document.getElementById('editPropPrice').value = property.price;
    document.getElementById('editPropArea').value = property.area;
    document.getElementById('editPropBedrooms').value = property.bedrooms || '';
    document.getElementById('editPropBathrooms').value = property.bathrooms || '';
    document.getElementById('editPropAuctionDate').value = property.auctionDate;
    document.getElementById('editPropDescription').value = property.description;
    document.getElementById('editPropVideoUrl').value = property.videoUrl || '';

    // Populate multi-image inputs
    const existingImages = (property.images && property.images.length > 0)
        ? property.images
        : (property.image ? [property.image] : []);
    populateEditImageInputs(existingImages);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('editPropertyModal'));
    modal.show();
}

// Save property edit
function savePropertyEdit() {
    const id = parseInt(document.getElementById('editPropId').value);

    // Collect edited images
    const editImageInputs = document.querySelectorAll('.edit-prop-image-url');
    const images = Array.from(editImageInputs)
        .map(inp => inp.value.trim())
        .filter(url => url !== '');

    if (images.length === 0) {
        alert('Please add at least one image URL.');
        return;
    }

    const updates = {
        title: document.getElementById('editPropTitle').value,
        type: document.getElementById('editPropType').value,
        location: document.getElementById('editPropLocation').value,
        price: parseInt(document.getElementById('editPropPrice').value),
        area: document.getElementById('editPropArea').value,
        bedrooms: document.getElementById('editPropBedrooms').value ? parseInt(document.getElementById('editPropBedrooms').value) : null,
        bathrooms: document.getElementById('editPropBathrooms').value ? parseInt(document.getElementById('editPropBathrooms').value) : null,
        image: images[0],
        images: images,
        videoUrl: document.getElementById('editPropVideoUrl').value.trim(),
        auctionDate: document.getElementById('editPropAuctionDate').value,
        description: document.getElementById('editPropDescription').value
    };

    const result = propertyManager.update(id, updates);

    if (result.success) {
        alert('Property updated successfully!');
        bootstrap.Modal.getInstance(document.getElementById('editPropertyModal')).hide();
        loadDashboard();
        loadPropertiesTable();
    } else {
        alert('Error updating property: ' + result.message);
    }
}

// Delete property
function deleteProperty(id) {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
        return;
    }

    const result = propertyManager.delete(id);

    if (result.success) {
        alert('Property deleted successfully!');
        loadDashboard();
        loadPropertiesTable();
    } else {
        alert('Error deleting property: ' + result.message);
    }
}

// ===================================
// Multi-Image Input Helpers
// ===================================

// Add a new image URL row to the given container
function addImageRow(containerId, cssClass, maxImages = 6) {
    const container = document.getElementById(containerId);
    const rows = container.querySelectorAll('.image-url-row');
    if (rows.length >= maxImages) {
        alert(`You can add a maximum of ${maxImages} images.`);
        return;
    }
    const div = document.createElement('div');
    div.className = 'image-url-row d-flex gap-2 align-items-center mb-2';
    div.innerHTML = `
        <input type="url" class="form-control ${cssClass}" placeholder="https://...">
        <button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.image-url-row').remove()">
          <i class="bi bi-x-lg"></i>
        </button>`;
    container.appendChild(div);
}

// Reset image inputs to single empty row
function resetImageInputs(containerId, cssClass) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="image-url-row d-flex gap-2 align-items-center mb-2">
          <input type="url" class="form-control ${cssClass}" placeholder="https://..." required>
        </div>`;
}

// Pre-populate edit modal image rows
function populateEditImageInputs(images) {
    const container = document.getElementById('editPropImagesContainer');
    if (!container) return;
    container.innerHTML = '';
    images.forEach((url, idx) => {
        const isFirst = idx === 0;
        const div = document.createElement('div');
        div.className = 'image-url-row d-flex gap-2 align-items-center mb-2';
        div.innerHTML = `
            <input type="url" class="form-control edit-prop-image-url" placeholder="https://..." value="${url}"${isFirst ? ' required' : ''}>
            ${!isFirst ? `<button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('.image-url-row').remove()"><i class="bi bi-x-lg"></i></button>` : ''}`;
        container.appendChild(div);
    });
}



// ===================================
// Meeting Management Functions
// ===================================

function loadMeetingsTable() {
    const filterStatus = document.getElementById('meetingFilterStatus')?.value || 'all';
    let meetings = meetingManager.getAll();

    // Update badges
    const pending = meetings.filter(m => m.status === 'pending');
    const confirmed = meetings.filter(m => m.status === 'confirmed');
    const cancelled = meetings.filter(m => m.status === 'cancelled');

    const pendingBadge = document.getElementById('pendingBadge');
    const confirmedBadge = document.getElementById('confirmedBadge');
    const cancelledBadge = document.getElementById('cancelledBadge');
    if (pendingBadge) pendingBadge.textContent = `${pending.length} Pending`;
    if (confirmedBadge) confirmedBadge.textContent = `${confirmed.length} Confirmed`;
    if (cancelledBadge) cancelledBadge.textContent = `${cancelled.length} Cancelled`;

    // Filter
    if (filterStatus !== 'all') {
        meetings = meetings.filter(m => m.status === filterStatus);
    }

    // Sort: newest first
    meetings.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    const tbody = document.getElementById('meetingsTable');
    if (!tbody) return;

    if (meetings.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" class="text-center text-muted py-4"><i class="bi bi-calendar-x me-2"></i>No meeting requests found</td></tr>`;
        return;
    }

    tbody.innerHTML = meetings.map((m, idx) => {
        const statusBadge = {
            pending: '<span class="badge bg-warning text-dark">Pending</span>',
            confirmed: '<span class="badge bg-success">Confirmed</span>',
            cancelled: '<span class="badge bg-secondary">Cancelled</span>'
        }[m.status] || '';

        const confirmedInfo = m.status === 'confirmed'
            ? `${meetingManager.formatDate(m.confirmedDate)}<br><small>${m.confirmedTime}</small>${m.adminNote ? `<br><small class="text-muted">${m.adminNote}</small>` : ''}`
            : m.status === 'cancelled' && m.cancellationReason
                ? `<small class="text-danger"><i class="bi bi-ban me-1"></i><strong>Reason:</strong> ${m.cancellationReason}</small><br><small class="text-muted">${m.cancelledAt ? meetingManager.formatDate(m.cancelledAt) : ''}</small>`
                : '-';

        // Build "type" column — show properties list for property-inquiry
        let typeCell = '';
        if (m.type === 'property-inquiry' && m.properties && m.properties.length > 0) {
            const propList = m.properties.map(p =>
                `<div class="badge bg-info text-dark mb-1 d-block text-start fw-normal" style="white-space:normal;">
                    <i class="bi bi-building me-1"></i>${p.title}<br>
                    <small class="text-muted"><i class="bi bi-geo-alt me-1"></i>${p.location}</small>
                </div>`
            ).join('');
            typeCell = `<td><span class="badge bg-warning text-dark mb-1">Property Inquiry</span>${propList}</td>`;
        } else {
            typeCell = `<td><span class="badge bg-info">${m.loanType}</span></td>`;
        }

        const actions = m.status === 'pending'
            ? `<button class="btn btn-sm btn-success me-1" onclick="openConfirmMeeting(${m.id})" title="Confirm Meeting"><i class="bi bi-check-circle"></i></button>
               <button class="btn btn-sm btn-warning me-1" onclick="openCancelMeeting(${m.id})" title="Cancel"><i class="bi bi-x-circle"></i></button>`
            : '';
        const deleteBtn = `<button class="btn btn-sm btn-danger" onclick="deleteMeetingAdmin(${m.id})" title="Delete"><i class="bi bi-trash"></i></button>`;

        return `<tr>
            <td>${idx + 1}</td>
            <td><strong>${m.name}</strong><br><small class="text-muted">${m.email || ''}</small></td>
            <td>+91 ${m.phone}</td>
            ${typeCell}
            <td>${m.loanAmount ? '₹' + Number(m.loanAmount).toLocaleString('en-IN') : '<span class="text-muted">—</span>'}</td>
            <td>${m.location ? `<i class="bi bi-geo-alt-fill text-primary me-1"></i>${m.location}` : '<span class="text-muted">—</span>'}</td>
            <td>${meetingManager.formatDate(m.preferredDate)}</td>
            <td>${m.preferredTime}</td>
            <td>${m.employmentType || '-'}</td>
            <td>${statusBadge}</td>
            <td>${confirmedInfo}</td>
            <td>${actions}${deleteBtn}</td>
        </tr>`;
    }).join('');
}

function openConfirmMeeting(id) {
    document.getElementById('confirmMeetingId').value = id;
    document.getElementById('confirmMeetingDate').value = '';
    document.getElementById('confirmMeetingTime').value = '';
    document.getElementById('confirmMeetingNote').value = '';
    // Set min date to today
    document.getElementById('confirmMeetingDate').min = new Date().toISOString().split('T')[0];
    const modal = new bootstrap.Modal(document.getElementById('confirmMeetingModal'));
    modal.show();
}

function saveConfirmMeeting() {
    const id = parseInt(document.getElementById('confirmMeetingId').value);
    const date = document.getElementById('confirmMeetingDate').value;
    const time = document.getElementById('confirmMeetingTime').value;
    const note = document.getElementById('confirmMeetingNote').value;

    if (!date || !time) {
        alert('Please select a confirmed date and time.');
        return;
    }

    const result = meetingManager.confirmMeeting(id, date, time, note);
    if (result.success) {
        bootstrap.Modal.getInstance(document.getElementById('confirmMeetingModal')).hide();
        loadMeetingsTable();
        loadDashboard();
        alert('Meeting confirmed successfully! The client will see the confirmed date and time.');
    }
}

function openCancelMeeting(id) {
    document.getElementById('cancelMeetingId').value = id;
    document.getElementById('cancelMeetingReason').value = '';
    document.getElementById('cancelReasonError').classList.add('d-none');
    const modal = new bootstrap.Modal(document.getElementById('cancelMeetingModal'));
    modal.show();
}

function saveCancelMeeting() {
    const id = parseInt(document.getElementById('cancelMeetingId').value);
    const reason = document.getElementById('cancelMeetingReason').value.trim();

    if (!reason) {
        document.getElementById('cancelReasonError').classList.remove('d-none');
        return;
    }

    const result = meetingManager.cancelMeeting(id, reason);
    if (result.success) {
        bootstrap.Modal.getInstance(document.getElementById('cancelMeetingModal')).hide();
        loadMeetingsTable();
        loadDashboard();
    }
}

function deleteMeetingAdmin(id) {
    if (!confirm('Delete this meeting request permanently?')) return;
    meetingManager.deleteMeeting(id);
    loadMeetingsTable();
    loadDashboard();
}
