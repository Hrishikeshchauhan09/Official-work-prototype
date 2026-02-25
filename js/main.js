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
    // Determine image array (backward compat)
    const imgs = (property.images && property.images.length > 0) ? property.images : [property.image];
    const hasVideo = property.videoUrl && property.videoUrl.trim() !== '';
    const carouselId = 'carousel-' + property.id;

    if (!isLoggedIn) {
      // Show blurred property card for non-logged-in users
      return `
    <div class="col-lg-4 col-md-6">
      <div class="property-card glass-property-card">
        <div style="position: relative;">
          <img src="${imgs[0]}" alt="${property.title}" loading="lazy" style="filter: blur(8px); width:100%; height:220px; object-fit:cover;">
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

      // Build carousel slides
      const imageSlides = imgs.map((url, idx) => `
        <div class="carousel-item ${idx === 0 ? 'active' : ''}">
          <img src="${url}" class="d-block w-100" alt="${property.title} image ${idx + 1}"
               style="height:220px; object-fit:cover; cursor:pointer;"
               onclick="openMediaLightbox(${property.id}, ${idx})">
        </div>
      `).join('');

      const videoSlide = hasVideo ? `
        <div class="carousel-item">
          <div class="d-flex align-items-center justify-content-center bg-dark"
               style="height:220px; cursor:pointer;" onclick="openMediaLightbox(${property.id}, 'video')">
            <div class="text-center text-white">
              <i class="bi bi-play-circle-fill display-3 mb-2 text-warning"></i>
              <p class="mb-0 small">Watch Video Tour</p>
            </div>
          </div>
        </div>
      ` : '';

      const carouselControls = (imgs.length > 1 || hasVideo) ? `
        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" style="filter:drop-shadow(0 0 2px #000)"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
          <span class="carousel-control-next-icon" style="filter:drop-shadow(0 0 2px #000)"></span>
        </button>
      ` : '';

      const mediaBadges = `
        ${imgs.length > 1 ? `<span class="badge bg-dark bg-opacity-75 me-1"><i class="bi bi-images me-1"></i>${imgs.length}</span>` : ''}
        ${hasVideo ? '<span class="badge bg-danger bg-opacity-85"><i class="bi bi-play-circle me-1"></i>Video</span>' : ''}
      `;

      // Show full property details for logged-in users
      return `
    <div class="col-lg-4 col-md-6">
      <div class="property-card glass-property-card">
        <div style="position: relative;">
          <div id="${carouselId}" class="carousel slide" data-bs-ride="false">
            <div class="carousel-inner">
              ${imageSlides}
              ${videoSlide}
            </div>
            ${carouselControls}
          </div>
          ${property.featured ? '<span class="badge-featured">Featured</span>' : ''}
          ${(imgs.length > 1 || hasVideo) ? `
            <span style="position:absolute;bottom:8px;left:8px;z-index:10;">${mediaBadges}</span>
          ` : ''}
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

// ------ Media Lightbox ------
// propertyId, slideIndex (number) or 'video'
function openMediaLightbox(propertyId, slideTarget) {
  const property = propertyManager.getById(propertyId);
  if (!property) return;
  const imgs = (property.images && property.images.length > 0) ? property.images : [property.image];
  const hasVideo = property.videoUrl && property.videoUrl.trim() !== '';

  const body = document.getElementById('mediaLightboxBody');
  if (!body) return;

  if (slideTarget === 'video') {
    // Embed video
    let embed = '';
    const url = property.videoUrl.trim();
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const embedUrl = url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
      embed = `<div class="ratio ratio-16x9"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div>`;
    } else {
      embed = `<video controls class="w-100" style="max-height:70vh;"><source src="${url}"><p class="text-white">Your browser does not support video.</p></video>`;
    }
    body.innerHTML = embed;
  } else {
    // Image lightbox — overlay buttons, mobile-safe
    let currentIdx = typeof slideTarget === 'number' ? slideTarget : 0;
    window._lbCurrent = { propertyId, imgs, hasVideo };
    window._lbCurrent.currentIdx = currentIdx;

    const renderImg = () => {
      const ci = window._lbCurrent.currentIdx;
      const multiImg = imgs.length > 1;
      body.innerHTML = `
        <div style="position:relative; display:flex; align-items:center; justify-content:center; min-height:200px;">
          <img src="${imgs[ci]}" class="img-fluid rounded" style="max-height:65vh; width:100%; object-fit:contain;" alt="Property image">
          ${multiImg ? `
            <button class="btn btn-dark btn-sm opacity-75"
              onclick="lbPrev(${propertyId})"
              style="position:absolute;left:6px;top:50%;transform:translateY(-50%);z-index:10;border-radius:50%;width:36px;height:36px;padding:0;">
              <i class="bi bi-chevron-left"></i>
            </button>
            <button class="btn btn-dark btn-sm opacity-75"
              onclick="lbNext(${propertyId})"
              style="position:absolute;right:6px;top:50%;transform:translateY(-50%);z-index:10;border-radius:50%;width:36px;height:36px;padding:0;">
              <i class="bi bi-chevron-right"></i>
            </button>
          ` : ''}
        </div>
        <p class="text-center text-muted mt-2 mb-0" style="font-size:0.85rem;">
          ${ci + 1} / ${imgs.length}
          ${hasVideo ? ` &mdash; <span class="text-warning" style="cursor:pointer;" onclick="openMediaLightbox(${propertyId},'video')"><i class="bi bi-play-circle"></i> Watch Video</span>` : ''}
        </p>
      `;
    };
    renderImg();
  }

  const existing = bootstrap.Modal.getInstance(document.getElementById('mediaLightboxModal'));
  if (existing) { existing.show(); return; }
  const modal = new bootstrap.Modal(document.getElementById('mediaLightboxModal'));
  modal.show();
}

function lbPrev(propertyId) {
  if (!window._lbCurrent) return;
  const { imgs } = window._lbCurrent;
  window._lbCurrent.currentIdx = (window._lbCurrent.currentIdx - 1 + imgs.length) % imgs.length;
  openMediaLightbox(propertyId, window._lbCurrent.currentIdx);
}
function lbNext(propertyId) {
  if (!window._lbCurrent) return;
  const { imgs } = window._lbCurrent;
  window._lbCurrent.currentIdx = (window._lbCurrent.currentIdx + 1) % imgs.length;
  openMediaLightbox(propertyId, window._lbCurrent.currentIdx);
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
