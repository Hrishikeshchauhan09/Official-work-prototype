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
    const searchQuery = (document.getElementById('meetingSearchInput')?.value || '').trim().toLowerCase();

    // Show / hide the clear button
    const clearBtn = document.getElementById('meetingSearchClearBtn');
    if (clearBtn) clearBtn.style.display = searchQuery ? 'inline-flex' : 'none';

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

    // Filter by status
    if (filterStatus !== 'all') {
        meetings = meetings.filter(m => m.status === filterStatus);
    }

    // Filter by search query (name, phone, email)
    if (searchQuery) {
        meetings = meetings.filter(m =>
            (m.name && m.name.toLowerCase().includes(searchQuery)) ||
            (m.phone && m.phone.toLowerCase().includes(searchQuery)) ||
            (m.email && m.email.toLowerCase().includes(searchQuery))
        );
    }

    // Sort: newest first
    meetings.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    const tbody = document.getElementById('meetingsTable');
    if (!tbody) return;

    if (meetings.length === 0) {
        const emptyMsg = searchQuery
            ? `<i class="bi bi-search me-2"></i>No results found for "<strong>${searchQuery}</strong>"`
            : `<i class="bi bi-calendar-x me-2"></i>No meeting requests found`;
        tbody.innerHTML = `<tr><td colspan="12" class="text-center text-muted py-4">${emptyMsg}</td></tr>`;
        return;
    }

    tbody.innerHTML = meetings.map((m, idx) => {
        const statusBadge = {
            pending: '<span class="badge bg-warning text-dark">Pending</span>',
            confirmed: '<span class="badge bg-success">Confirmed</span>',
            form_sent: '<span class="badge bg-info">Form Sent</span>',
            form_filled: '<span class="badge bg-primary">Form Filled</span>',
            cancelled: '<span class="badge bg-secondary">Cancelled</span>'
        }[m.status] || '<span class="badge bg-warning text-dark">Pending</span>';

        const confirmedInfo = m.status === 'confirmed'
            ? `${meetingManager.formatDate(m.confirmedDate)}<br><small>${m.confirmedTime}</small>${m.adminNote ? `<br><small class="text-muted">${m.adminNote}</small>` : ''}`
            : m.status === 'cancelled' && m.cancellationReason
                ? `<small class="text-danger"><i class="bi bi-ban me-1"></i><strong>Reason:</strong> ${m.cancellationReason}</small><br><small class="text-muted">${m.cancelledAt ? meetingManager.formatDate(m.cancelledAt) : ''}</small>`
                : '-';

        // Build "type" column - show properties list for property-inquiry
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

        let actions = '';
        if (m.status === 'pending') {
            actions = `<button class="btn btn-sm btn-success me-1" onclick="openConfirmMeeting(${m.id})" title="Confirm Meeting"><i class="bi bi-check-circle"></i></button>
               <button class="btn btn-sm btn-warning me-1" onclick="openCancelMeeting(${m.id})" title="Cancel"><i class="bi bi-x-circle"></i></button>`;
        } else if (m.status === 'confirmed') {
            actions = `<button class="btn btn-sm btn-info me-1 text-white" onclick="sendLoanFormAdmin(${m.id})" title="Send Loan Form to Customer"><i class="bi bi-file-earmark-text"></i></button>
               <button class="btn btn-sm btn-warning me-1" onclick="openCancelMeeting(${m.id})" title="Cancel"><i class="bi bi-x-circle"></i></button>`;
        } else if (m.status === 'form_sent') {
            actions = `<span class="badge bg-light text-muted border me-1" style="font-size:.75rem;"><i class="bi bi-hourglass-split me-1"></i>Awaiting customer</span>`;
        } else if (m.status === 'form_filled') {
            actions = `<button class="btn btn-sm btn-primary me-1" onclick="adminViewLoanSheet(${m.id})" title="View Loan Sheet"><i class="bi bi-eye"></i></button>
               <button class="btn btn-sm btn-outline-success me-1" onclick="openManageDocs(${m.id})" title="Manage Documents"><i class="bi bi-folder-check"></i></button>`;
        }
        const deleteBtn = `<button class="btn btn-sm btn-danger" onclick="deleteMeetingAdmin(${m.id})" title="Delete"><i class="bi bi-trash"></i></button>`;

        const pdfBtn = `<button class="btn btn-sm btn-outline-secondary me-1" onclick="downloadSingleMeetingPDF(${m.id})" title="Download Customer Form PDF"><i class="bi bi-file-earmark-person"></i></button>`;

        return `<tr>
            <td>${idx + 1}</td>
            <td><strong>${m.name}</strong><br><small class="text-muted">${m.email || ''}</small></td>
            <td>+91 ${m.phone}</td>
            ${typeCell}
            <td>${m.loanAmount ? 'Rs.' + Number(m.loanAmount).toLocaleString('en-IN') : '<span class="text-muted">-</span>'}</td>
            <td>${m.location ? `<i class="bi bi-geo-alt-fill text-primary me-1"></i>${m.location}` : '<span class="text-muted">-</span>'}</td>
            <td>${meetingManager.formatDate(m.preferredDate)}</td>
            <td>${m.preferredTime}</td>
            <td>${m.employmentType || '-'}</td>
            <td>${statusBadge}</td>
            <td>${confirmedInfo}</td>
            <td>${pdfBtn}${actions}${deleteBtn}</td>
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

// ===================================
// Loan Form & Document Tracker - Admin
// ===================================

// Admin: Send loan form permission to customer
function sendLoanFormAdmin(id) {
    if (!confirm('Send Loan Detail Form to this customer? They will see a "Fill Loan Details" button in My Meetings.')) return;
    const result = meetingManager.enableLoanForm(id);
    if (result.success) {
        loadMeetingsTable();
        alert('Loan form sent! Customer can now fill the detail sheet.');
    }
}

// Admin: View filled loan sheet
function adminViewLoanSheet(id) {
    const m = meetingManager.getAll().find(x => x.id === id);
    if (!m || !m.loanDetails) {
        alert('Loan details not filled yet by customer.');
        return;
    }
    const ld = m.loanDetails;

    // Build read-only view
    const html = `
    <div style="font-size:.88rem;">
      <div class="row g-2">
        <div class="col-12"><h6 class="text-primary border-bottom pb-1 mb-2">Loan Info</h6></div>
        <div class="col-md-6"><strong>Loan Type:</strong> ${ld.loanType || '-'}</div>
        <div class="col-md-6"><strong>Amount:</strong> Rs.${ld.loanAmount ? Number(ld.loanAmount).toLocaleString('en-IN') : '-'}</div>
        <div class="col-12"><h6 class="text-primary border-bottom pb-1 mb-2 mt-2">Applicant</h6></div>
        <div class="col-md-6"><strong>Name:</strong> ${ld.applicantName || '-'}</div>
        <div class="col-md-6"><strong>Mobile:</strong> +91 ${ld.applicantMobile || '-'}</div>
        <div class="col-md-6"><strong>Co-Applicant:</strong> ${ld.coApplicantName || '-'}</div>
        <div class="col-md-6"><strong>Co-App Mobile:</strong> ${ld.coApplicantMobile ? '+91 ' + ld.coApplicantMobile : '-'}</div>
        <div class="col-12"><h6 class="text-primary border-bottom pb-1 mb-2 mt-2">Personal</h6></div>
        <div class="col-md-6"><strong>1. Education:</strong> ${ld.education || '-'}</div>
        <div class="col-md-6"><strong>2. Marital:</strong> ${ld.maritalStatus || '-'}</div>
        <div class="col-md-6"><strong>5. Mother:</strong> ${ld.motherName || '-'}</div>
        <div class="col-md-6"><strong>6. Dependents:</strong> ${ld.dependents ?? '-'}</div>
        <div class="col-12"><h6 class="text-primary border-bottom pb-1 mb-2 mt-2">Residence</h6></div>
        <div class="col-md-6"><strong>7. Yrs Residence:</strong> ${ld.yrsResidence || '-'}</div>
        <div class="col-md-6"><strong>8. Yrs City:</strong> ${ld.yrsCity || '-'}</div>
        <div class="col-md-12"><strong>9. Current Address:</strong> ${ld.currentAddress || '-'}</div>
        <div class="col-md-6"><strong>10. Landmark:</strong> ${ld.landmark || '-'}</div>
        <div class="col-12"><h6 class="text-primary border-bottom pb-1 mb-2 mt-2">Contact</h6></div>
        <div class="col-md-6"><strong>11. Personal Email:</strong> ${ld.personalEmail || '-'}</div>
        <div class="col-md-6"><strong>12. Official Email:</strong> ${ld.officialEmail || '-'}</div>
        <div class="col-md-12"><strong>13. Permanent Address:</strong> ${ld.permanentAddress || '-'}</div>
        <div class="col-md-6"><strong>14. Perm. Contact:</strong> ${ld.permanentContact || '-'}</div>
        <div class="col-12"><h6 class="text-primary border-bottom pb-1 mb-2 mt-2">Employment</h6></div>
        <div class="col-md-6"><strong>15. Yrs in Company:</strong> ${ld.yrsCompany || '-'}</div>
        <div class="col-md-6"><strong>16. Total Exp:</strong> ${ld.totalExperience || '-'} yrs</div>
        <div class="col-md-12"><strong>17. Office Address:</strong> ${ld.officeAddress || '-'}</div>
        <div class="col-md-6"><strong>18. Landline:</strong> ${ld.officeLandline || '-'}</div>
        <div class="col-12"><h6 class="text-primary border-bottom pb-1 mb-2 mt-2">References</h6></div>
        <div class="col-md-4"><strong>Friend:</strong> ${ld.friend1Name || '-'}</div>
        <div class="col-md-4"><strong>Mobile:</strong> ${ld.friend1Mobile || '-'}</div>
        <div class="col-12"><small class="text-muted">${ld.friend1Address || ''}</small></div>
        <div class="col-md-4"><strong>Relative:</strong> ${ld.relative1Name || '-'}</div>
        <div class="col-md-4"><strong>Mobile:</strong> ${ld.relative1Mobile || '-'}</div>
        <div class="col-12"><small class="text-muted">${ld.relative1Address || ''}</small></div>
      </div>
    </div>`;

    // Create/reuse modal
    let modal = document.getElementById('adminViewLoanSheetModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'adminViewLoanSheetModal';
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
          <div class="modal-dialog modal-xl modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header" style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:white;">
                <h5 class="modal-title"><i class="bi bi-file-earmark-text-fill me-2"></i>Loan Detail Sheet</h5>
                <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body p-4" id="adminViewLoanSheetBody"></div>
            </div>
          </div>`;
        document.body.appendChild(modal);
    }
    document.getElementById('adminViewLoanSheetBody').innerHTML = html;
    new bootstrap.Modal(modal).show();
}

// Admin: Open Manage Documents panel
function openManageDocs(id) {
    const m = meetingManager.getAll().find(x => x.id === id);
    if (!m) return;

    // Create/reuse modal
    let modal = document.getElementById('adminManageDocsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'adminManageDocsModal';
        modal.className = 'modal fade';
        modal.setAttribute('tabindex', '-1');
        modal.innerHTML = `
          <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header" style="background:linear-gradient(135deg,#1e3a8a,#3b82f6);color:white;">
                <div>
                  <h5 class="modal-title mb-0"><i class="bi bi-folder-check me-2"></i>Manage Documents</h5>
                  <small style="opacity:.8;">Select categories, mark received docs, add custom ones.</small>
                </div>
                <button class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body p-4" id="adminManageDocsBody"></div>
            </div>
          </div>`;
        document.body.appendChild(modal);
    }

    renderDocChecklistAdmin(id);
    new bootstrap.Modal(modal).show();
}

// Render the full document manager panel
function renderDocChecklistAdmin(id) {
    const m = meetingManager.getAll().find(x => x.id === id);
    if (!m) return;

    const selectedCats = m.selectedDocCategories || [];
    const docStatus = m.documentsStatus || {};
    const customDocs = m.customDocs || [];

    // Get all standard docs from selected categories
    const standardDocs = meetingManager.getLoanDocsByCategories(selectedCats);

    // Category checkboxes
    const catHtml = Object.entries(LOAN_DOC_CATEGORIES).map(([key, cat]) => `
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" id="cat_${key}_${id}"
          ${selectedCats.includes(key) ? 'checked' : ''}
          onchange="adminToggleCat(${id}, '${key}', this.checked)">
        <label class="form-check-label" for="cat_${key}_${id}">
          <i class="bi ${cat.icon} me-1 text-primary"></i><strong>${cat.label}</strong>
          <span class="badge bg-light text-muted border ms-1">${cat.docs.length} docs</span>
        </label>
      </div>`).join('');

    // Standard doc checklist
    const stdDocHtml = standardDocs.length > 0
        ? standardDocs.map(doc => `
        <div class="form-check mb-2 d-flex align-items-start gap-2">
          <input class="form-check-input mt-1 flex-shrink-0" type="checkbox"
            id="doc_${id}_${doc.replace(/[^a-zA-Z0-9]/g, '_')}"
            ${docStatus[doc] ? 'checked' : ''}
            onchange="adminToggleDoc(${id}, '${doc}', this.checked)">
          <label class="form-check-label" style="font-size:.85rem;" for="doc_${id}_${doc.replace(/[^a-zA-Z0-9]/g, '_')}">
            ${doc}
          </label>
        </div>`).join('')
        : '<p class="text-muted small">Select categories above to load document checklist.</p>';

    // Custom docs
    const customDocHtml = customDocs.map(d => `
      <div class="d-flex align-items-start gap-2 mb-2">
        <input class="form-check-input mt-1 flex-shrink-0" type="checkbox"
          id="cust_${id}_${d.name.replace(/[^a-zA-Z0-9]/g, '_')}"
          ${docStatus[d.name] ? 'checked' : ''}
          onchange="adminToggleDoc(${id}, '${d.name}', this.checked)">
        <label class="form-check-label flex-grow-1" style="font-size:.85rem;">${d.name}</label>
        <button class="btn btn-link btn-sm text-danger p-0" onclick="adminRemoveCustomDoc(${id}, '${d.name.replace(/'/g, "\\'")}')"
          title="Remove"><i class="bi bi-x-circle"></i></button>
      </div>`).join('');

    document.getElementById('adminManageDocsBody').innerHTML = `
      <!-- Step 1: Select Categories -->
      <div class="mb-4">
        <h6 class="fw-bold text-primary-blue mb-3"><span class="badge bg-primary me-2">1</span>Select Document Categories</h6>
        <div class="p-3 rounded-3 border">${catHtml}</div>
      </div>

      <!-- Step 2: Standard doc checklist -->
      <div class="mb-4">
        <h6 class="fw-bold text-primary-blue mb-3">
          <span class="badge bg-primary me-2">2</span>Mark Received Documents
          ${standardDocs.length > 0 ? `<span class="badge bg-light text-muted border ms-2">${standardDocs.filter(d => docStatus[d]).length} / ${standardDocs.length} received</span>` : ''}
        </h6>
        <div class="p-3 rounded-3 border">${stdDocHtml}</div>
      </div>

      <!-- Step 3: Custom docs -->
      <div class="mb-3">
        <h6 class="fw-bold text-primary-blue mb-3"><span class="badge bg-primary me-2">3</span>Add Custom Documents</h6>
        <div class="p-3 rounded-3 border">
          ${customDocs.length > 0 ? customDocHtml : '<p class="text-muted small">No custom documents added yet.</p>'}
          <div class="d-flex gap-2 mt-3">
            <input type="text" class="form-control form-control-sm" id="customDocInput_${id}"
              placeholder="Type custom document name..." style="max-width:320px;">
            <button class="btn btn-outline-primary btn-sm px-3" onclick="adminAddCustomDoc(${id})">
              <i class="bi bi-plus-lg me-1"></i>Add
            </button>
          </div>
        </div>
      </div>`;
}

// Toggle a category selection
function adminToggleCat(id, catKey, checked) {
    const m = meetingManager.getAll().find(x => x.id === id);
    if (!m) return;
    let cats = m.selectedDocCategories || [];
    if (checked && !cats.includes(catKey)) cats.push(catKey);
    else if (!checked) cats = cats.filter(c => c !== catKey);
    meetingManager.saveDocCategories(id, cats);
    renderDocChecklistAdmin(id);
}

// Mark/unmark a doc as received
function adminToggleDoc(id, docName, received) {
    meetingManager.updateDocumentStatus(id, docName, received);
    // Update badge without re-rendering entire panel
    const m = meetingManager.getAll().find(x => x.id === id);
    if (!m) return;
    const standardDocs = meetingManager.getLoanDocsByCategories(m.selectedDocCategories || []);
    const docStatus = m.documentsStatus || {};
    // Re-render to refresh counts
    renderDocChecklistAdmin(id);
}

// Add custom document
function adminAddCustomDoc(id) {
    const input = document.getElementById(`customDocInput_${id}`);
    const name = input ? input.value.trim() : '';
    if (!name) { alert('Please enter a document name.'); return; }
    meetingManager.addCustomDoc(id, name);
    renderDocChecklistAdmin(id);
}

// Remove custom document
function adminRemoveCustomDoc(id, docName) {
    if (!confirm(`Remove "${docName}" from the list?`)) return;
    meetingManager.removeCustomDoc(id, docName);
    renderDocChecklistAdmin(id);
}

// ===================================
// PDF Report Generation
// ===================================

function downloadMeetingPDF(period) {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) { alert('PDF library not loaded. Please check your internet connection.'); return; }

    const now = new Date();
    let meetings = meetingManager.getAll();
    let periodLabel = '';
    let fromDate = null;

    switch (period) {
        case 'weekly': {
            // Start of current week (Monday)
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            fromDate = new Date(now.getFullYear(), now.getMonth(), diff, 0, 0, 0);
            periodLabel = 'Weekly (' + fromDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' -- ' + now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ')';
            break;
        }
        case 'monthly': {
            fromDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
            periodLabel = 'Monthly (' + now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) + ')';
            break;
        }
        case 'yearly': {
            fromDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
            periodLabel = 'Yearly (' + now.getFullYear() + ')';
            break;
        }
        default:
            periodLabel = 'All Records';
    }

    // Filter by date range
    if (fromDate) {
        meetings = meetings.filter(m => {
            const d = new Date(m.submittedAt || m.preferredDate || m.createdAt);
            return d >= fromDate && d <= now;
        });
    }

    // Sort: newest first
    meetings.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    // Summary counts
    const totalCount = meetings.length;
    const pendingCount = meetings.filter(m => m.status === 'pending').length;
    const confirmedCount = meetings.filter(m => m.status === 'confirmed').length;
    const cancelledCount = meetings.filter(m => m.status === 'cancelled').length;

    // â”€â”€ Init jsPDF (A4 landscape for wider table) â”€â”€
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    // â”€â”€ Header Banner â”€â”€
    doc.setFillColor(30, 58, 138);          // dark blue
    doc.rect(0, 0, pageW, 22, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Siddhivinayak Realtors & Associates', 14, 10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Meeting Requests Report  |  ' + periodLabel, 14, 17);
    doc.text('Generated: ' + now.toLocaleString('en-IN'), pageW - 14, 17, { align: 'right' });

    // â”€â”€ Summary Row â”€â”€
    const summaryY = 28;
    const boxW = 55;
    const boxes = [
        { label: 'Total', value: totalCount, color: [30, 58, 138] },
        { label: 'Pending', value: pendingCount, color: [202, 138, 4] },
        { label: 'Confirmed', value: confirmedCount, color: [22, 101, 52] },
        { label: 'Cancelled', value: cancelledCount, color: [185, 28, 28] }
    ];
    boxes.forEach((b, i) => {
        const x = 14 + i * (boxW + 4);
        doc.setFillColor(...b.color);
        doc.roundedRect(x, summaryY, boxW, 16, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(String(b.value), x + boxW / 2, summaryY + 8, { align: 'center' });
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(b.label, x + boxW / 2, summaryY + 13, { align: 'center' });
    });

    // â”€â”€ Table â”€â”€
    if (meetings.length === 0) {
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(12);
        doc.text('No meeting requests found for the selected period.', pageW / 2, summaryY + 30, { align: 'center' });
    } else {
        const tableRows = meetings.map((m, i) => {
            const statusLabel = (m.status || 'pending').charAt(0).toUpperCase() + (m.status || 'pending').slice(1);
            const submittedDate = m.submittedAt ? new Date(m.submittedAt).toLocaleDateString('en-IN') : '-';
            const properties = (m.properties && m.properties.length > 0)
                ? m.properties.map(p => p.title || p.id).join(', ')
                : (m.loanType || m.type || '-');
            return [
                i + 1,
                m.name || '-',
                m.phone || '-',
                m.email || '-',
                m.location || m.preferredLocation || '-',
                m.preferredDate || '-',
                m.preferredTime || '-',
                properties,
                statusLabel,
                submittedDate
            ];
        });

        doc.autoTable({
            startY: summaryY + 22,
            head: [['#', 'Name', 'Phone', 'Email', 'Location', 'Pref. Date', 'Time', 'Properties / Service', 'Status', 'Submitted']],
            body: tableRows,
            theme: 'grid',
            styles: { fontSize: 7.5, cellPadding: 2.5, overflow: 'linebreak' },
            headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 8 },
            alternateRowStyles: { fillColor: [240, 244, 255] },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center' },
                1: { cellWidth: 28 },
                2: { cellWidth: 22 },
                3: { cellWidth: 40 },
                4: { cellWidth: 22 },
                5: { cellWidth: 20 },
                6: { cellWidth: 14 },
                7: { cellWidth: 45 },
                8: { cellWidth: 18, halign: 'center' },
                9: { cellWidth: 22 }
            },
            didDrawCell(data) {
                // Color-code the Status column
                if (data.column.index === 8 && data.section === 'body') {
                    const val = (data.cell.text[0] || '').toLowerCase();
                    const colors = { pending: [202, 138, 4], confirmed: [22, 101, 52], cancelled: [185, 28, 28] };
                    if (colors[val]) {
                        doc.setTextColor(...colors[val]);
                        doc.setFont('helvetica', 'bold');
                        doc.setFontSize(7.5);
                        doc.text(data.cell.text[0], data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
                    }
                }
            }
        });
    }

    // â”€â”€ Footer on each page â”€â”€
    const totalPages = doc.internal.getNumberOfPages();
    for (let pg = 1; pg <= totalPages; pg++) {
        doc.setPage(pg);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.setFont('helvetica', 'normal');
        doc.text('Siddhivinayak Realtors & Associates - Confidential', 14, doc.internal.pageSize.getHeight() - 5);
        doc.text(`Page ${pg} of ${totalPages}`, pageW - 14, doc.internal.pageSize.getHeight() - 5, { align: 'right' });
    }

    // â”€â”€ Save â”€â”€
    const safeDate = now.toLocaleDateString('en-IN').replace(/\//g, '-');
    doc.save(`SRA_Meeting_Report_${period.charAt(0).toUpperCase() + period.slice(1)}_${safeDate}.pdf`);
}

// ===================================
// Individual Customer Form PDF
// ===================================

function downloadSingleMeetingPDF(meetingId) {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) { alert('PDF library not loaded. Please check your internet connection.'); return; }

    const m = meetingManager.getAll().find(x => x.id === meetingId);
    if (!m) { alert('Meeting not found.'); return; }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const now = new Date();
    const hasLoanDetails = m.status === 'form_filled' && m.loanDetails;

    // â”€â”€ Helper: check page break â”€â”€
    const checkBreak = (yPos, needed = 20) => {
        if (yPos + needed > pageH - 18) {
            doc.addPage();
            // mini header on new page
            doc.setFillColor(30, 58, 138);
            doc.rect(0, 0, pageW, 10, 'F');
            doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
            doc.text('Siddhivinayak Realtors & Associates  |  LOAN DETAIL SHEET  |  Form ID: #' + m.id, pageW / 2, 6.5, { align: 'center' });
            addFooter();
            return 18;
        }
        return yPos;
    };

    // â”€â”€ Helper: add footer â”€â”€
    const addFooter = () => {
        const fy = pageH - 8;
        doc.setFillColor(30, 58, 138);
        doc.rect(0, fy - 3, pageW, 11, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
        doc.text('Siddhivinayak Realtors & Associates  |  Kalyan(W), Maharashtra  |  System-generated document', pageW / 2, fy + 3, { align: 'center' });
    };

    // â”€â”€ Header Banner â”€â”€
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageW, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('Siddhivinayak Realtors & Associates', 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Shudhanshu Chamber, A-Wing, 2nd Floor, Above Vikas Hotel, Near Railway Station, Kalyan(W), Maharashtra 421301', 14, 17);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(hasLoanDetails ? 'LOAN DETAIL SHEET' : 'CUSTOMER MEETING FORM', pageW - 14, 11, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Generated: ' + now.toLocaleString('en-IN'), pageW - 14, 17, { align: 'right' });
    doc.text('Form ID: #' + m.id, pageW - 14, 22, { align: 'right' });

    let y = 36;

    // â”€â”€ Status Badge â”€â”€
    const statusColors = {
        pending: [202, 138, 4],
        confirmed: [22, 101, 52],
        form_sent: [14, 116, 144],
        form_filled: [29, 78, 216],
        cancelled: [185, 28, 28]
    };
    const statusLabels = {
        pending: 'PENDING', confirmed: 'CONFIRMED',
        form_sent: 'FORM SENT', form_filled: 'FORM FILLED',
        cancelled: 'CANCELLED'
    };
    const statusLabel = statusLabels[m.status] || 'PENDING';
    const sc = statusColors[m.status] || [100, 100, 100];
    doc.setFillColor(...sc);
    doc.roundedRect(14, y - 5, 42, 9, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(statusLabel, 35, y + 0.5, { align: 'center' });

    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Submitted: ' + (m.submittedAt ? new Date(m.submittedAt).toLocaleString('en-IN') : '-'), 62, y + 0.5);

    y += 10;

    // â”€â”€ Section helper â”€â”€
    const sectionTitle = (title, yPos) => {
        doc.setFillColor(240, 244, 255);
        doc.rect(14, yPos, pageW - 28, 7, 'F');
        doc.setDrawColor(200, 215, 255);
        doc.rect(14, yPos, pageW - 28, 7, 'S');
        doc.setTextColor(30, 58, 138);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(title, 17, yPos + 5);
        return yPos + 10;
    };

    const fieldRow = (label, value, yPos, fullWidth = false) => {
        doc.setTextColor(80, 80, 80);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(label + ':', 17, yPos);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(30, 30, 30);

        // Measure label width to decide same-line vs next-line placement
        const labelWidth = doc.getTextWidth(label + ':');
        const valueX = 55;

        if (fullWidth || labelWidth > 36) {
            // Long label: put value on next line, indented
            const maxW = pageW - 38;
            const lines = doc.splitTextToSize(value || '-', maxW);
            doc.text(lines, 22, yPos + 5);
            return yPos + 5 + (lines.length * 5) + 1;
        } else {
            // Short label: value on same line
            const maxW = pageW - 72;
            const lines = doc.splitTextToSize(value || '-', maxW);
            doc.text(lines, valueX, yPos);
            return yPos + (lines.length * 5) + 1;
        }
    };

    const twoColField = (lLabel, lVal, rLabel, rVal, yPos) => {
        const half = (pageW - 28) / 2;
        doc.setTextColor(80, 80, 80); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
        doc.text(lLabel + ':', 17, yPos);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
        doc.text(String(lVal || '-'), 17 + 38, yPos);
        doc.setTextColor(80, 80, 80); doc.setFont('helvetica', 'bold');
        doc.text(rLabel + ':', 17 + half, yPos);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
        doc.text(String(rVal || '-'), 17 + half + 40, yPos);
        return yPos + 6;
    };

    // ===========================================================
    //  PART A: Original Meeting Request Details
    // ===========================================================

    // â”€â”€ SECTION 1: Customer Details â”€â”€
    y = sectionTitle('1.  CUSTOMER DETAILS', y);
    const col1x = 14, col2x = pageW / 2;
    const startY1 = y;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(80, 80, 80);
    doc.text('Full Name:', col1x + 3, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    doc.text(m.name || '-', col1x + 35, y); y += 6;

    doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 80);
    doc.text('Phone:', col1x + 3, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    doc.text('+91 ' + (m.phone || '-'), col1x + 35, y); y += 6;

    doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 80);
    doc.text('Email:', col1x + 3, y);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    doc.text(m.email || '-', col1x + 35, y); y += 6;

    let yr = startY1;
    doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 80);
    doc.text('Employment Type:', col2x + 3, yr);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    doc.text(m.employmentType || '-', col2x + 38, yr); yr += 6;

    doc.setFont('helvetica', 'bold'); doc.setTextColor(80, 80, 80);
    doc.text('Preferred Location:', col2x + 3, yr);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30);
    doc.text(m.location || '-', col2x + 38, yr); yr += 6;

    y = Math.max(y, yr) + 4;

    // â”€â”€ SECTION 2: Meeting Details â”€â”€
    y = sectionTitle('2.  MEETING REQUEST DETAILS', y);
    const meetingType = m.type === 'property-inquiry' ? 'Property Inquiry' : 'Loan Meeting (' + (m.loanType || '-') + ')';
    y = fieldRow('Request Type', meetingType, y);
    y = fieldRow('Preferred Date', m.preferredDate ? new Date(m.preferredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '-', y);
    y = fieldRow('Preferred Time', m.preferredTime || '-', y);
    if (m.type !== 'property-inquiry') {
        y = fieldRow('Loan Amount', m.loanAmount ? 'Rs.' + Number(m.loanAmount).toLocaleString('en-IN') : '-', y);
    }
    if (m.message) y = fieldRow('Message / Note', m.message, y, true);
    y += 2;

    // â”€â”€ SECTION 3: Property Inquiry (if applicable) â”€â”€
    if (m.type === 'property-inquiry' && m.properties && m.properties.length > 0) {
        y = sectionTitle('3.  PROPERTIES OF INTEREST', y);
        m.properties.forEach((p, i) => {
            doc.setFillColor(248, 250, 255);
            doc.rect(17, y - 3, pageW - 34, 12, 'F');
            doc.setDrawColor(200, 210, 240);
            doc.rect(17, y - 3, pageW - 34, 12, 'S');
            doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 138); doc.setFontSize(8.5);
            doc.text((i + 1) + '.  ' + (p.title || '-'), 21, y + 2);
            doc.setFont('helvetica', 'normal'); doc.setTextColor(80, 80, 80); doc.setFontSize(7.5);
            doc.text('Location: ' + (p.location || '-') + '   |   Price: ' + (p.price ? 'Rs.' + Number(p.price).toLocaleString('en-IN') : '-'), 21, y + 7);
            y += 16;
        });
        y += 2;
    }

    // â”€â”€ SECTION 4: Status Info â”€â”€
    const secNum = (m.type === 'property-inquiry') ? '4' : '3';
    y = sectionTitle(secNum + '.  STATUS & ADMIN NOTES', y);
    if (m.status === 'confirmed' || m.status === 'form_sent' || m.status === 'form_filled') {
        y = fieldRow('Confirmed Date', m.confirmedDate ? new Date(m.confirmedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '-', y);
        y = fieldRow('Confirmed Time', m.confirmedTime || '-', y);
        if (m.adminNote) y = fieldRow('Admin Note', m.adminNote, y, true);
    } else if (m.status === 'cancelled') {
        y = fieldRow('Cancellation Reason', m.cancellationReason || '-', y, true);
        y = fieldRow('Cancelled On', m.cancelledAt ? new Date(m.cancelledAt).toLocaleString('en-IN') : '-', y);
    } else {
        doc.setFont('helvetica', 'italic'); doc.setTextColor(150, 150, 150); doc.setFontSize(8);
        doc.text('Meeting is pending admin review.', 17, y);
        y += 7;
    }

    // ===========================================================
    //  PART B: Loan Detail Sheet (only if form_filled)
    // ===========================================================
    if (hasLoanDetails) {
        const ld = m.loanDetails;

        // ── NEW PAGE: Loan Detail Sheet starts on its own page ──
        doc.addPage();
        y = 0;

        // Full header for page 2
        doc.setFillColor(30, 58, 138);
        doc.rect(0, 0, pageW, 28, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.text('Siddhivinayak Realtors & Associates', 14, 11);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text('Shudhanshu Chamber, A-Wing, 2nd Floor, Above Vikas Hotel, Near Railway Station, Kalyan(W), Maharashtra 421301', 14, 17);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('LOAN DETAIL SHEET', pageW - 14, 11, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text('Customer Filled Form  |  Form ID: #' + m.id, pageW - 14, 17, { align: 'right' });
        doc.text('Generated: ' + now.toLocaleString('en-IN'), pageW - 14, 23, { align: 'right' });

        y = 35;

        // Status + submitted at
        doc.setFillColor(29, 78, 216);
        doc.roundedRect(14, y - 5, 46, 9, 2, 2, 'F');
        doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.text('FORM FILLED', 37, y + 0.5, { align: 'center' });
        doc.setTextColor(100, 100, 100); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
        doc.text('Submitted by customer on: ' + (ld.submittedAt ? new Date(ld.submittedAt).toLocaleString('en-IN') : '--'), 66, y + 0.5);
        y += 12;

        // â”€â”€ LD Section A: Loan Info â”€â”€
        y = checkBreak(y, 20);
        y = sectionTitle('A.  LOAN INFORMATION', y);
        y = twoColField('Loan Type', ld.loanType, 'Loan Amount', ld.loanAmount ? 'Rs.' + Number(ld.loanAmount).toLocaleString('en-IN') : '-', y);
        y += 2;

        // â”€â”€ LD Section B: Applicant Details â”€â”€
        y = checkBreak(y, 30);
        y = sectionTitle('B.  APPLICANT DETAILS', y);
        y = twoColField('Applicant Name', ld.applicantName, 'Mobile No.', ld.applicantMobile ? '+91 ' + ld.applicantMobile : '-', y);
        y = twoColField('Co-Applicant Name', ld.coApplicantName, 'Co-App Mobile', ld.coApplicantMobile ? '+91 ' + ld.coApplicantMobile : '-', y);
        y += 2;

        // â”€â”€ LD Section C: Personal Information â”€â”€
        y = checkBreak(y, 35);
        y = sectionTitle('C.  PERSONAL INFORMATION', y);
        y = twoColField('1. Education', ld.education, '2. Marital Status', ld.maritalStatus, y);
        y = twoColField('5. Mother\'s Name', ld.motherName, '6. No. of Dependents', ld.dependents, y);
        y += 2;

        // â”€â”€ LD Section D: Residence Details â”€â”€
        y = checkBreak(y, 40);
        y = sectionTitle('D.  RESIDENCE DETAILS', y);
        y = twoColField('7. Yrs in Residence', ld.yrsResidence, '8. Yrs in City', ld.yrsCity, y);
        y = fieldRow('9. Current Address', ld.currentAddress, y, true);
        y = fieldRow('10. Landmark', ld.landmark, y);
        y += 2;

        // â”€â”€ LD Section E: Contact Information â”€â”€
        y = checkBreak(y, 35);
        y = sectionTitle('E.  CONTACT INFORMATION', y);
        y = twoColField('11. Personal Email', ld.personalEmail, '12. Official Email', ld.officialEmail, y);
        y = fieldRow('13. Permanent Address', ld.permanentAddress, y, true);
        y = fieldRow('14. Permanent Contact', ld.permanentContact, y);
        y += 2;

        // â”€â”€ LD Section F: Employment Details â”€â”€
        y = checkBreak(y, 40);
        y = sectionTitle('F.  EMPLOYMENT DETAILS', y);
        y = twoColField('15. Yrs in Company', ld.yrsCompany, '16. Total Experience', ld.totalExperience ? ld.totalExperience + ' yrs' : '-', y);
        y = fieldRow('17. Office Address with Landmark', ld.officeAddress, y, true);
        y = fieldRow('18. Office Landline', ld.officeLandline, y);
        y += 2;

        // â”€â”€ LD Section G: References â”€â”€
        y = checkBreak(y, 40);
        y = sectionTitle('G.  19. TWO REFERENCES', y);

        // Reference 1
        doc.setFillColor(248, 250, 255);
        doc.rect(17, y - 2, pageW - 34, 20, 'F');
        doc.setDrawColor(200, 210, 240); doc.rect(17, y - 2, pageW - 34, 20, 'S');
        doc.setFont('helvetica', 'bold'); doc.setTextColor(30, 58, 138); doc.setFontSize(8);
        doc.text('Reference 1 - Friend', 20, y + 3);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30); doc.setFontSize(8);
        doc.text('Name: ' + (ld.friend1Name || '-') + '   |   Mobile: ' + (ld.friend1Mobile || '-'), 20, y + 9);
        const r1Addr = doc.splitTextToSize('Address: ' + (ld.friend1Address || '-'), pageW - 44);
        doc.text(r1Addr, 20, y + 14);
        y += 24;

        // Reference 2
        y = checkBreak(y, 28);
        doc.setFillColor(248, 255, 250);
        doc.rect(17, y - 2, pageW - 34, 20, 'F');
        doc.setDrawColor(180, 230, 200); doc.rect(17, y - 2, pageW - 34, 20, 'S');
        doc.setFont('helvetica', 'bold'); doc.setTextColor(22, 101, 52); doc.setFontSize(8);
        doc.text('Reference 2 - Relative', 20, y + 3);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(30, 30, 30); doc.setFontSize(8);
        doc.text('Name: ' + (ld.relative1Name || '-') + '   |   Mobile: ' + (ld.relative1Mobile || '-'), 20, y + 9);
        const r2Addr = doc.splitTextToSize('Address: ' + (ld.relative1Address || '-'), pageW - 44);
        doc.text(r2Addr, 20, y + 14);
        y += 26;

        // â”€â”€ LD Section H: Document Status â”€â”€
        const allDocs = meetingManager.getLoanDocsByCategories(m.selectedDocCategories || []);
        const customDocs = (m.customDocs || []).map(d => d.name);
        const allDocNames = [...allDocs, ...customDocs];

        if (allDocNames.length > 0) {
            y = checkBreak(y, 20);
            y = sectionTitle('H.  DOCUMENT STATUS TRACKER', y);

            const docStatus = m.documentsStatus || {};
            const received = allDocNames.filter(d => docStatus[d]).length;
            const total = allDocNames.length;
            const pct = Math.round((received / total) * 100);

            // Summary line
            doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
            doc.setTextColor(received === total ? 22 : 30, received === total ? 101 : 58, received === total ? 52 : 138);
            doc.text(`Progress: ${received} / ${total} documents received  (${pct}%)`, 17, y);
            y += 7;

            // Progress bar (drawn manually)
            doc.setFillColor(220, 220, 220);
            doc.roundedRect(17, y, pageW - 34, 4, 1, 1, 'F');
            const barColor = pct === 100 ? [22, 101, 52] : pct >= 50 ? [14, 116, 144] : [202, 138, 4];
            doc.setFillColor(...barColor);
            doc.roundedRect(17, y, (pageW - 34) * pct / 100, 4, 1, 1, 'F');
            y += 9;

            // Doc list in two columns
            const colW = (pageW - 34) / 2;
            allDocNames.forEach((docName, i) => {
                const isLeft = i % 2 === 0;
                const xPos = isLeft ? 17 : 17 + colW + 4;
                if (isLeft) y = checkBreak(y, 8);
                const got = docStatus[docName];
                const markerColor = got ? [22, 101, 52] : [185, 28, 28];
                doc.setFillColor(...markerColor);
                doc.circle(xPos + 2, y - 1, 1.5, 'F');
                doc.setFont('helvetica', got ? 'bold' : 'normal');
                doc.setTextColor(got ? 22 : 100, got ? 101 : 100, got ? 52 : 100);
                doc.setFontSize(7.5);
                const nameParts = doc.splitTextToSize(docName, colW - 10);
                doc.text(nameParts, xPos + 6, y);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(...markerColor);
                doc.text(got ? '[+] Received' : '[-] Pending', xPos + colW - 2, y, { align: 'right' });
                if (isLeft) {
                    // don't advance y yet, let right column use same y
                } else {
                    y += (nameParts.length * 4) + 4;
                }
                if (isLeft && i === allDocNames.length - 1) {
                    // odd total - advance y for last item
                    y += (nameParts.length * 4) + 4;
                }
            });
            y += 4;
        }
    }

    // â”€â”€ Signature Block â”€â”€
    y = checkBreak(y, 28);
    y = Math.max(y + 8, hasLoanDetails ? y + 8 : 230);
    doc.setDrawColor(180, 180, 180); doc.setLineWidth(0.4);
    doc.line(14, y, 80, y);
    doc.line(pageW - 80, y, pageW - 14, y);
    doc.setLineWidth(0.2);
    doc.setTextColor(120, 120, 120); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.text('Customer Signature', 14, y + 5);
    doc.text('Admin / Authorised Signatory', pageW - 80, y + 5);

    // â”€â”€ Footer on all pages â”€â”€
    const totalPages = doc.internal.getNumberOfPages();
    for (let pg = 1; pg <= totalPages; pg++) {
        doc.setPage(pg);
        const fy = pageH - 8;
        doc.setFillColor(30, 58, 138);
        doc.rect(0, fy - 3, pageW, 11, 'F');
        doc.setTextColor(255, 255, 255); doc.setFontSize(7); doc.setFont('helvetica', 'normal');
        doc.text('Siddhivinayak Realtors & Associates  |  Kalyan(W), Maharashtra  |  System-generated document', pageW / 2, fy + 3, { align: 'center' });
        if (totalPages > 1) {
            doc.text(`Page ${pg} of ${totalPages}`, pageW - 14, fy + 3, { align: 'right' });
        }
    }

    // â”€â”€ Save â”€â”€
    const safeName = (m.name || 'Customer').replace(/[^a-z0-9]/gi, '_');
    const safeDate = now.toLocaleDateString('en-IN').replace(/\//g, '-');
    const fileName = hasLoanDetails
        ? `SRA_LoanDetailSheet_${safeName}_${safeDate}.pdf`
        : `SRA_Meeting_${safeName}_${safeDate}.pdf`;
    doc.save(fileName);
}

