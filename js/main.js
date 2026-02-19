// ===================================
// Main Website JavaScript
// ===================================

// ===================================
// Property Inquiry Cart (global state)
// ===================================
let inquiryCart = []; // Array of { id, title, location, price }

function togglePropertyInquiry(propertyId) {
  const property = propertyManager.getById(propertyId);
  if (!property) return;

  const idx = inquiryCart.findIndex(p => p.id === property.id);

  if (idx > -1) {
    // Already in cart — remove it
    inquiryCart.splice(idx, 1);
  } else {
    // Check max 3
    if (inquiryCart.length >= 3) {
      alert('You can select a maximum of 3 properties for a single inquiry.');
      return;
    }
    inquiryCart.push({
      id: property.id,
      title: property.title,
      location: property.location,
      price: property.price
    });
  }

  updateInquiryCartUI();
  // Refresh the property grid to update button states
  const properties = propertyManager.getFeatured();
  displayProperties(properties);
}

function updateInquiryCartUI() {
  const cartFloat = document.getElementById('inquiryCartFloat');
  const badge = document.getElementById('inquiryCartBadge');
  if (!cartFloat || !badge) return;

  badge.textContent = inquiryCart.length;
  cartFloat.style.display = inquiryCart.length > 0 ? 'block' : 'none';
}

function openPropertyInquiryModal() {
  if (inquiryCart.length === 0) return;

  // Reset form UI
  const successMsg = document.getElementById('inquirySuccessMsg');
  const formContainer = document.getElementById('inquiryFormContainer');
  const form = document.getElementById('propertyInquiryForm');

  if (successMsg) successMsg.classList.add('d-none');
  if (formContainer) formContainer.classList.remove('d-none');
  if (form) form.reset();

  // Set min date on the date picker
  const dateInput = document.getElementById('inqPreferredDate');
  if (dateInput) {
    dateInput.min = new Date().toISOString().split('T')[0];
  }

  // Populate selected properties list
  const listContainer = document.getElementById('inquirySelectedList');
  if (listContainer) {
    listContainer.innerHTML = inquiryCart.map(p => `
      <div class="d-flex align-items-start justify-content-between p-3 rounded-3"
           style="background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2);">
        <div>
          <div class="fw-semibold text-dark">${p.title}</div>
          <small class="text-muted">
            <i class="bi bi-geo-alt-fill me-1"></i>${p.location}
            &nbsp;|&nbsp;
            <i class="bi bi-tag-fill me-1"></i>${PropertyManager.formatPrice(p.price)}
          </small>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger ms-2 flex-shrink-0"
          onclick="removeFromInquiryCart(${p.id})" title="Remove">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    `).join('');
  }

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('propertyInquiryModal'));
  modal.show();
}

function removeFromInquiryCart(propertyId) {
  inquiryCart = inquiryCart.filter(p => p.id !== propertyId);
  updateInquiryCartUI();

  // If cart now empty — close modal
  if (inquiryCart.length === 0) {
    const modalEl = document.getElementById('propertyInquiryModal');
    const instance = bootstrap.Modal.getInstance(modalEl);
    if (instance) instance.hide();
    // Refresh grid so buttons reset
    displayProperties(propertyManager.getFeatured());
    return;
  }

  // Otherwise re-open (refresh the list)
  openPropertyInquiryModal();
  // Re-show (the modal is already open, just re-populate)
}

function clearInquiryCart() {
  inquiryCart = [];
  updateInquiryCartUI();
  displayProperties(propertyManager.getFeatured());
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  loadProperties();
  setupContactForm();
  setupScrollAnimations();
  setupPropertyInquiryForm();
});

// Property inquiry form submission
function setupPropertyInquiryForm() {
  const form = document.getElementById('propertyInquiryForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const phone = document.getElementById('inqPhone').value.trim();
    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      alert('Please enter a valid 10-digit Indian mobile number starting with 6-9.');
      return;
    }

    const data = {
      type: 'property-inquiry',
      loanType: 'Property Inquiry',
      properties: inquiryCart.map(p => ({ id: p.id, title: p.title, location: p.location, price: p.price })),
      name: document.getElementById('inqName').value.trim(),
      phone: phone,
      email: document.getElementById('inqEmail').value.trim(),
      location: document.getElementById('inqLocation').value,
      preferredDate: document.getElementById('inqPreferredDate').value,
      preferredTime: document.getElementById('inqPreferredTime').value,
      message: document.getElementById('inqMessage').value.trim()
    };

    const result = meetingManager.submitRequest(data);
    if (result.success) {
      document.getElementById('inquiryFormContainer').classList.add('d-none');
      document.getElementById('inquirySuccessMsg').classList.remove('d-none');
    }
  });
}

// Navigation initialization
function initNavigation() {
  const authNav = document.getElementById('authNav');
  if (!authNav) return;

  if (auth.isLoggedIn()) {
    const user = auth.getCurrentUser();

    // Show the My Meetings nav tab
    const myMeetingsNav = document.getElementById('myMeetingsNav');
    if (myMeetingsNav) myMeetingsNav.classList.remove('d-none');

    authNav.innerHTML = `
      <div class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
          <i class="bi bi-person-circle"></i> ${user.name}
        </a>
        <ul class="dropdown-menu">
          ${user.role === 'admin' ? '<li><a class="dropdown-item" href="admin.html"><i class="bi bi-gear"></i> Admin Panel</a></li>' : ''}
          <li><a class="dropdown-item" href="#" onclick="handleLogout()"><i class="bi bi-box-arrow-right"></i> Logout</a></li>
        </ul>
      </div>
    `;
  }
}

// Restore all main sections (hide My Meetings) — called when clicking Home/Loans/etc
function restoreMainSections() {
  document.querySelectorAll('body > section').forEach(el => {
    if (el.id !== 'my-meetings') el.classList.remove('d-none');
  });
  const myMeetings = document.getElementById('my-meetings');
  if (myMeetings) myMeetings.classList.add('d-none');
}

// Logout handler
function handleLogout() {
  auth.logout();
  window.location.reload();
}

// Load and display properties
function loadProperties() {
  const grid = document.getElementById('propertiesGrid');
  if (!grid) return;

  const properties = propertyManager.getFeatured();
  displayProperties(properties);
}

// Display properties in grid
function displayProperties(properties) {
  const grid = document.getElementById('propertiesGrid');
  if (!grid) return;

  if (properties.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search display-1 text-muted"></i>
        <p class="text-muted mt-3">No properties found matching your criteria</p>
      </div>
    `;
    return;
  }

  const isLoggedIn = auth.isLoggedIn();

  grid.innerHTML = properties.map(property => {
    if (!isLoggedIn) {
      // Show blurred property card for non-logged-in users
      return `
    <div class="col-lg-4 col-md-6">
      <div class="property-card glass-property-card">
        <div style="position: relative;">
          <img src="${property.image}" alt="${property.title}" loading="lazy" style="filter: blur(8px);">
          ${property.featured ? '<span class="badge-featured">Featured</span>' : ''}
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; background: rgba(0,0,0,0.7); padding: 20px; border-radius: 10px; width: 80%;">
            <i class="bi bi-lock-fill text-white display-4 mb-2"></i>
            <p class="text-white mb-2">Login to View Details</p>
            <a href="login.html" class="btn btn-sm btn-gold">Login Now</a>
          </div>
        </div>
        <div class="property-card-body">
          <div class="text-center py-3">
            <i class="bi bi-eye-slash text-muted"></i>
            <p class="text-muted mb-0">Property details available after login</p>
          </div>
        </div>
      </div>
    </div>
  `;
    } else {
      // Check if this property is in the inquiry cart
      const inCart = inquiryCart.some(p => p.id === property.id);
      const addBtnClass = inCart ? 'btn-success' : 'btn-outline-primary';
      const addBtnIcon = inCart ? 'bi-check2-circle' : 'bi-plus-circle';
      const addBtnText = inCart ? 'Added' : 'Add to Inquiry';

      // Show full property details for logged-in users
      return `
    <div class="col-lg-4 col-md-6">
      <div class="property-card glass-property-card">
        <div style="position: relative;">
          <img src="${property.image}" alt="${property.title}" loading="lazy">
          ${property.featured ? '<span class="badge-featured">Featured</span>' : ''}
        </div>
        <div class="property-card-body">
          <div class="property-price">${PropertyManager.formatPrice(property.price)}</div>
          <h5 class="property-title">${property.title}</h5>
          <p class="property-location">
            <i class="bi bi-geo-alt-fill text-muted"></i> ${property.location}
          </p>
          <div class="property-details">
            <span class="property-detail-item">
              <i class="bi bi-rulers"></i> ${property.area}
            </span>
            ${property.bedrooms ? `
              <span class="property-detail-item">
                <i class="bi bi-door-closed"></i> ${property.bedrooms} BHK
              </span>
            ` : ''}
            <span class="property-detail-item">
              <i class="bi bi-tag"></i> ${property.type}
            </span>
          </div>
          <p class="text-muted mt-3 mb-3" style="font-size: 0.9rem;">
            ${property.description.substring(0, 100)}...
          </p>
          <div class="d-flex justify-content-between align-items-center gap-2">
            <small class="text-muted">
              <i class="bi bi-calendar-event"></i> Auction: ${PropertyManager.formatDate(property.auctionDate)}
            </small>
            <button class="btn btn-sm ${addBtnClass} d-flex align-items-center gap-1"
              onclick="togglePropertyInquiry(${property.id})"
              style="white-space:nowrap; font-size:0.82rem;">
              <i class="bi ${addBtnIcon}"></i> ${addBtnText}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
    }
  }).join('');
}

// Apply filters
function applyFilters() {
  const filters = {
    type: document.getElementById('filterType')?.value,
    location: document.getElementById('filterLocation')?.value,
    minPrice: document.getElementById('filterMinPrice')?.value,
    maxPrice: document.getElementById('filterMaxPrice')?.value
  };

  const filtered = propertyManager.filter(filters);
  displayProperties(filtered);
}

// Setup contact form
function setupContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Show success message
    alert('Thank you for your message! We will get back to you soon.');
    form.reset();
  });
}

// Scroll animations
function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);

  // Observe all cards
  document.querySelectorAll('.glass-card, .property-card, .custom-card').forEach(card => {
    observer.observe(card);
  });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href.length > 1) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 80; // Account for fixed navbar
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }
  });
});

// Navbar background on scroll
window.addEventListener('scroll', function () {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)';
  } else {
    navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.1)';
  }
});
