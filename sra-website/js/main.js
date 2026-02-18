// ===================================
// Main Website JavaScript
// ===================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  loadProperties();
  setupContactForm();
  setupScrollAnimations();
});

// Navigation initialization
function initNavigation() {
  const authNav = document.getElementById('authNav');
  if (!authNav) return;

  if (auth.isLoggedIn()) {
    const user = auth.getCurrentUser();
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
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
              <i class="bi bi-calendar-event"></i> Auction: ${PropertyManager.formatDate(property.auctionDate)}
            </small>
            <a href="#contact" class="btn btn-sm btn-primary">Inquire</a>
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
