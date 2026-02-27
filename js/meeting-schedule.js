// ===================================
// Meeting Schedule System
// ===================================

// Document library matching website's Required Documents section
const LOAN_DOC_CATEGORIES = {
  salaried: {
    label: 'Salaried Employees',
    icon: 'bi-person-badge',
    docs: [
      'Last 6 months salary slip (Original)',
      'Bank statements for 1 year (Salary Account)',
      'Pan card, I card, Aadhar card Color xerox',
      'Appointment & Confirmation Letter, Form No.16 Last 2 yrs',
      'PF Statement (For Government Employee)',
      'Residential Proof (Ration Card, Light bill)',
      'Qualification Certificate, 3 Colour Photo',
      'All loan details & Statement',
      'Co applicant (Pan card, Aadhar card Color, Photos 3)',
      'Cheque (1)'
    ]
  },
  business: {
    label: 'Business Profile',
    icon: 'bi-briefcase',
    docs: [
      'Last 3yrs ITR C.A Attested (Statement of income, Profit & Loss A/c, Balance sheet, Capital A/c, Tax paid challan), Form 26AS',
      'Bank statements for 1 year (Saving & Current Account)',
      'Pan card, Aadhar card Color xerox',
      'Gumsta License, Udyog Aadhar, Shop Agreement, Light bill copy',
      'Business Profile in company letter head',
      'Residential Proof (Ration Card, Light bill)',
      'Qualification Certificate, 3 Color Photo',
      'All loan details & Statement',
      'Co applicant (Pan card, Aadhar card color, Photos 3)',
      'Cheque'
    ]
  },
  propertyBuilder: {
    label: 'Property Document (Builder)',
    icon: 'bi-building',
    docs: [
      'Builder Legal Documents (Development Agr. / Partnership Deed / Power of Attorney / 7/12 / Extrac / Title / Search Copy / Blue Print Plan Copy)',
      'Sale Agreement Original / Draft Agreement',
      'Builder NOC Favour of Bank (Format), Demand & Architect Letter',
      'OCR Receipt & Bank Clearance'
    ]
  },
  propertyResale: {
    label: 'Property Document – Resale / Mortgage / LAP',
    icon: 'bi-house-door',
    docs: [
      'Purchase Agreement Copy / Chain of Agreement',
      'Tax, Maintenance, Light Bill Latest Copy',
      'Share Certificate',
      'Society Registration Certificate',
      'OC Copy, Plan Copy',
      'Society NOC Favour of Bank (Format), OCR with Bank Clearance',
      'Seller Pan Card / Aadhar Card / Photo / Cancelled Cheque / Request Letter'
    ]
  },
  balanceTransfer: {
    label: 'Balance Transfer + Top Up',
    icon: 'bi-arrow-left-right',
    docs: [
      'List of Documents, Outstanding Letter & Track Report'
    ]
  }
};

const meetingManager = {

  // Save a new meeting request
  submitRequest: function (data) {
    const meetings = this.getAll();
    const newMeeting = {
      id: Date.now(),
      ...data,
      status: 'pending', // pending | confirmed | form_sent | form_filled | cancelled
      confirmedDate: null,
      confirmedTime: null,
      adminNote: '',
      submittedAt: new Date().toISOString(),
      // Loan Detail Sheet fields
      loanFormEnabled: false,
      loanDetails: null,
      // Document tracker fields
      selectedDocCategories: [],
      documentsStatus: {},
      customDocs: []
    };
    meetings.push(newMeeting);
    localStorage.setItem('sra_meetings', JSON.stringify(meetings));
    return { success: true, meeting: newMeeting };
  },

  // Get all meeting requests
  getAll: function () {
    return JSON.parse(localStorage.getItem('sra_meetings') || '[]');
  },

  // Get meetings for a specific phone number
  getByPhone: function (phone) {
    return this.getAll().filter(m => m.phone === phone);
  },

  // Admin: confirm a meeting with date/time
  confirmMeeting: function (id, confirmedDate, confirmedTime, adminNote) {
    const meetings = this.getAll();
    const idx = meetings.findIndex(m => m.id === id);
    if (idx === -1) return { success: false, message: 'Meeting not found' };
    meetings[idx].status = 'confirmed';
    meetings[idx].confirmedDate = confirmedDate;
    meetings[idx].confirmedTime = confirmedTime;
    meetings[idx].adminNote = adminNote || '';
    meetings[idx].confirmedAt = new Date().toISOString();
    localStorage.setItem('sra_meetings', JSON.stringify(meetings));
    return { success: true, meeting: meetings[idx] };
  },

  // Admin: cancel a meeting (reason is mandatory)
  cancelMeeting: function (id, reason) {
    const meetings = this.getAll();
    const idx = meetings.findIndex(m => m.id === id);
    if (idx === -1) return { success: false };
    meetings[idx].status = 'cancelled';
    meetings[idx].cancellationReason = reason || 'No reason provided';
    meetings[idx].cancelledAt = new Date().toISOString();
    meetings[idx].cancelledBy = 'admin';
    localStorage.setItem('sra_meetings', JSON.stringify(meetings));
    return { success: true };
  },

  // Admin: delete a meeting
  deleteMeeting: function (id) {
    let meetings = this.getAll();
    meetings = meetings.filter(m => m.id !== id);
    localStorage.setItem('sra_meetings', JSON.stringify(meetings));
    return { success: true };
  },

  // Admin: enable loan detail form for customer
  enableLoanForm: function (id) {
    const meetings = this.getAll();
    const idx = meetings.findIndex(m => m.id === id);
    if (idx === -1) return { success: false };
    meetings[idx].loanFormEnabled = true;
    meetings[idx].status = 'form_sent';
    meetings[idx].formSentAt = new Date().toISOString();
    localStorage.setItem('sra_meetings', JSON.stringify(meetings));
    return { success: true };
  },

  // Customer: save filled loan detail sheet
  saveLoanDetails: function (id, formData) {
    const meetings = this.getAll();
    const idx = meetings.findIndex(m => m.id === id);
    if (idx === -1) return { success: false };
    meetings[idx].loanDetails = formData;
    meetings[idx].status = 'form_filled';
    meetings[idx].formFilledAt = new Date().toISOString();
    localStorage.setItem('sra_meetings', JSON.stringify(meetings));
    return { success: true };
  },

  // Admin: save selected document categories
  saveDocCategories: function (id, categories) {
    const meetings = this.getAll();
    const idx = meetings.findIndex(m => m.id === id);
    if (idx === -1) return { success: false };
    meetings[idx].selectedDocCategories = categories;
    localStorage.setItem('sra_meetings', JSON.stringify(meetings));
    return { success: true };
  },

  // Admin: mark/unmark a document as received
  updateDocumentStatus: function (id, docName, received) {
    const meetings = this.getAll();
    const idx = meetings.findIndex(m => m.id === id);
    if (idx === -1) return { success: false };
    if (!meetings[idx].documentsStatus) meetings[idx].documentsStatus = {};
    meetings[idx].documentsStatus[docName] = received;
    localStorage.setItem('sra_meetings', JSON.stringify(meetings));
    return { success: true };
  },

  // Admin: add a custom document
  addCustomDoc: function (id, docName) {
    const meetings = this.getAll();
    const idx = meetings.findIndex(m => m.id === id);
    if (idx === -1) return { success: false };
    if (!meetings[idx].customDocs) meetings[idx].customDocs = [];
    if (!meetings[idx].customDocs.find(d => d.name === docName)) {
      meetings[idx].customDocs.push({ name: docName, received: false });
    }
    localStorage.setItem('sra_meetings', JSON.stringify(meetings));
    return { success: true };
  },

  // Admin: remove a custom document
  removeCustomDoc: function (id, docName) {
    const meetings = this.getAll();
    const idx = meetings.findIndex(m => m.id === id);
    if (idx === -1) return { success: false };
    meetings[idx].customDocs = (meetings[idx].customDocs || []).filter(d => d.name !== docName);
    // Also remove its status
    if (meetings[idx].documentsStatus) delete meetings[idx].documentsStatus[docName];
    localStorage.setItem('sra_meetings', JSON.stringify(meetings));
    return { success: true };
  },

  // Get merged document list for selected categories
  getLoanDocsByCategories: function (categories) {
    const docs = [];
    const seen = new Set();
    (categories || []).forEach(cat => {
      const catData = LOAN_DOC_CATEGORIES[cat];
      if (catData) {
        catData.docs.forEach(doc => {
          if (!seen.has(doc)) { seen.add(doc); docs.push(doc); }
        });
      }
    });
    return docs;
  },

  // Format date for display
  formatDate: function (dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
};


// ===================================
// Schedule Meeting Modal Logic (index.html)
// ===================================

function openScheduleMeeting(loanType) {
  // Reset form
  const form = document.getElementById('scheduleMeetingForm');
  const successMsg = document.getElementById('meetingSuccessMsg');
  const formContainer = document.getElementById('meetingFormContainer');

  if (form) form.reset();
  if (successMsg) successMsg.classList.add('d-none');
  if (formContainer) formContainer.classList.remove('d-none');

  // Pre-fill loan type (readonly input)
  const loanTypeInput = document.getElementById('meetingLoanType');
  if (loanTypeInput) {
    loanTypeInput.value = loanType || 'General Enquiry';
  }

  // Reset location field
  const locationSelect = document.getElementById('meetingLocation');
  if (locationSelect) locationSelect.value = '';

  // Set minimum date to today
  const dateInput = document.getElementById('meetingPreferredDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('scheduleMeetingModal'));
  modal.show();
}

function checkUserConfirmedMeetings() {
  const alertDiv = document.getElementById('confirmedMeetingAlert');
  const detailsDiv = document.getElementById('confirmedMeetingDetails');
  if (!alertDiv || !detailsDiv) return;

  // Try to get phone from logged-in user session or localStorage
  const session = localStorage.getItem('sra_session');
  if (!session) {
    alertDiv.classList.add('d-none');
    return;
  }

  const user = JSON.parse(session);
  const phone = user.phone;
  if (!phone) {
    alertDiv.classList.add('d-none');
    return;
  }

  const confirmed = meetingManager.getByPhone(phone).filter(m => m.status === 'confirmed');
  if (confirmed.length > 0) {
    const latest = confirmed[confirmed.length - 1];
    alertDiv.classList.remove('d-none');
    const isPropertyInquiry = latest.type === 'property-inquiry';
    detailsDiv.innerHTML = `
      ${isPropertyInquiry && latest.properties ? `<strong>Properties:</strong> ${latest.properties.map(p => p.title).join(', ')}<br>` : `<strong>Loan Type:</strong> ${latest.loanType}<br>`}
      <strong>Confirmed Date:</strong> ${meetingManager.formatDate(latest.confirmedDate)}<br>
      <strong>Confirmed Time:</strong> ${latest.confirmedTime}<br>
      ${latest.adminNote ? `<strong>Note from Admin:</strong> ${latest.adminNote}` : ''}
    `;
  } else {
    alertDiv.classList.add('d-none');
  }
}

// Handle meeting form submission
document.addEventListener('DOMContentLoaded', function () {
  const meetingForm = document.getElementById('scheduleMeetingForm');
  if (!meetingForm) return;

  meetingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const phone = document.getElementById('meetingPhone').value.trim();

    // Validate Indian phone number
    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      alert('Please enter a valid 10-digit Indian mobile number starting with 6-9.');
      return;
    }

    const data = {
      type: 'loan-meeting',
      loanType: document.getElementById('meetingLoanType').value,
      name: document.getElementById('meetingName').value.trim(),
      phone: phone,
      email: document.getElementById('meetingEmail').value.trim(),
      location: document.getElementById('meetingLocation').value,
      preferredDate: document.getElementById('meetingPreferredDate').value,
      preferredTime: document.getElementById('meetingPreferredTime').value,
      loanAmount: document.getElementById('meetingLoanAmount').value,
      employmentType: document.getElementById('meetingEmploymentType').value,
      message: document.getElementById('meetingMessage').value.trim()
    };

    const result = meetingManager.submitRequest(data);

    if (result.success) {
      document.getElementById('meetingFormContainer').classList.add('d-none');
      document.getElementById('meetingSuccessMsg').classList.remove('d-none');
    }
  });
});

// ===================================
// My Meetings Page Logic
// ===================================

function showMyMeetings() {
  // Hide all main sections, show only my-meetings
  document.querySelectorAll('body > section, body > div.container').forEach(el => {
    if (el.id !== 'my-meetings') el.classList.add('d-none');
  });
  const section = document.getElementById('my-meetings');
  if (section) section.classList.remove('d-none');
  loadUserMeetings();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function loadUserMeetings() {
  const listEl = document.getElementById('myMeetingsList');
  if (!listEl) return;

  const session = localStorage.getItem('sra_session');
  if (!session) return;
  const user = JSON.parse(session);
  const phone = user.phone;
  if (!phone) return;

  const meetings = meetingManager.getByPhone(phone);

  if (meetings.length === 0) {
    listEl.innerHTML = `
          <div class="text-center py-5 text-muted">
            <i class="bi bi-calendar-x display-1 opacity-30"></i>
            <p class="mt-3 fs-5">No meetings found.</p>
            <p class="small">Schedule a meeting by clicking <strong>"Schedule Meeting"</strong> on any loan card.</p>
          </div>`;
    return;
  }

  // Sort: newest first
  const sorted = [...meetings].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const statusConfig = {
    pending: { cls: 'warning', textCls: 'dark', icon: 'bi-hourglass-split', label: 'Pending Review' },
    confirmed: { cls: 'success', textCls: 'white', icon: 'bi-calendar-check-fill', label: 'Confirmed ✓' },
    form_sent: { cls: 'info', textCls: 'white', icon: 'bi-file-earmark-text', label: 'Fill Loan Form' },
    form_filled: { cls: 'primary', textCls: 'white', icon: 'bi-file-earmark-check', label: 'Details Submitted' },
    cancelled: { cls: 'danger', textCls: 'white', icon: 'bi-x-octagon-fill', label: 'Cancelled' }
  };

  listEl.innerHTML = sorted.map(m => {
    const s = statusConfig[m.status] || statusConfig.pending;
    const isPropertyInquiry = m.type === 'property-inquiry';

    const typeLabel = isPropertyInquiry
      ? `<span class="badge bg-warning text-dark">Property Inquiry</span>`
      : `<span class="badge bg-info text-white">${m.loanType}</span>`;

    const propertiesList = isPropertyInquiry && m.properties && m.properties.length
      ? `<div class="mt-3 pt-2 border-top">
                <div class="fw-semibold mb-2" style="font-size:.85rem; color:#1e3a8a;">
                  <i class="bi bi-buildings me-1"></i>Inquired Properties:
                </div>
                ${m.properties.map(p => `
                  <div class="d-flex align-items-center gap-2 mb-1" style="font-size:.88rem;">
                    <i class="bi bi-building text-primary"></i>
                    <span>${p.title} <small class="text-muted">(${p.location})</small></span>
                  </div>`).join('')}
               </div>`
      : '';

    // ---- Status Detail Section ----
    let statusDetail = '';
    if (m.status === 'confirmed') {
      statusDetail = `
              <div class="alert alert-success py-2 px-3 mt-3 mb-0 d-flex align-items-start gap-2" style="font-size:.88rem;">
                <i class="bi bi-calendar-check-fill fs-5 mt-1 flex-shrink-0"></i>
                <div>
                  <strong>Meeting Confirmed!</strong><br>
                  <span><i class="bi bi-calendar2 me-1"></i>${meetingManager.formatDate(m.confirmedDate)}</span>
                  &nbsp;|&nbsp;
                  <span><i class="bi bi-clock me-1"></i>${m.confirmedTime}</span>
                  ${m.adminNote ? `<br><i class="bi bi-chat-left-text me-1"></i><strong>Note from Admin:</strong> ${m.adminNote}` : ''}
                </div>
              </div>`;

    } else if (m.status === 'form_sent') {
      statusDetail = `
              <div class="alert alert-info py-3 px-3 mt-3 mb-2" style="font-size:.88rem;">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <i class="bi bi-file-earmark-text-fill fs-5 flex-shrink-0"></i>
                  <strong>Loan Detail Form is Ready!</strong>
                </div>
                <p class="mb-2" style="font-size:.85rem;">Our team has reviewed your meeting and is ready to process your loan. Please fill in the detail form below.</p>
                <button class="btn btn-primary btn-sm px-4"
                  onclick="openLoanDetailSheet(${m.id}, '${(m.loanType || '').replace(/'/g, "\\'")}')">
                  <i class="bi bi-pencil-fill me-1"></i>Fill Loan Detail Sheet
                </button>
              </div>`;

    } else if (m.status === 'form_filled') {
      // Build doc tracker
      const allDocs = meetingManager.getLoanDocsByCategories(m.selectedDocCategories || []);
      const customDocs = (m.customDocs || []).map(d => d.name);
      const allDocNames = [...allDocs, ...customDocs];
      const docStatus = m.documentsStatus || {};

      const submittedCount = allDocNames.filter(d => docStatus[d]).length;
      const totalCount = allDocNames.length;
      const pct = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;
      const pctColor = pct === 100 ? 'success' : pct >= 50 ? 'info' : 'warning';

      const docListHtml = allDocNames.length > 0
        ? allDocNames.map(doc => {
          const received = docStatus[doc];
          return `<div class="d-flex align-items-start gap-2 mb-2" style="font-size:.85rem;">
              <i class="bi bi-${received ? 'check-circle-fill text-success' : 'clock text-warning'} flex-shrink-0 mt-1"></i>
              <span class="${received ? 'text-success' : 'text-muted'}">${doc}
                ${received ? '<span class="badge bg-success ms-1" style="font-size:.7rem;">Submitted</span>' : '<span class="badge bg-warning text-dark ms-1" style="font-size:.7rem;">Pending</span>'}
              </span>
            </div>`;
        }).join('')
        : `<p class="text-muted small mb-0">Admin has not assigned documents yet. Please wait.</p>`;

      statusDetail = `
              <div class="alert alert-primary py-2 px-3 mt-3 mb-2 d-flex align-items-center gap-2" style="font-size:.88rem;">
                <i class="bi bi-check-circle-fill fs-5 text-primary flex-shrink-0"></i>
                <div>
                  <strong>Loan Details Submitted!</strong>
                  <span class="ms-2">
                    <button class="btn btn-link btn-sm p-0" style="font-size:.82rem;"
                      onclick="openViewLoanSheet(${m.id})">
                      <i class="bi bi-eye me-1"></i>View your submission
                    </button>
                  </span>
                </div>
              </div>
              ${totalCount > 0 ? `
              <div class="border rounded-3 p-3 mt-2" style="background:#f8fafc;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="fw-semibold" style="font-size:.88rem;"><i class="bi bi-folder2-open me-2 text-primary"></i>Document Tracker</span>
                  <span class="badge bg-${pctColor}">${submittedCount} / ${totalCount} submitted</span>
                </div>
                <div class="progress mb-3" style="height:8px;">
                  <div class="progress-bar bg-${pctColor}" style="width:${pct}%"></div>
                </div>
                ${docListHtml}
              </div>` : `
              <div class="border rounded-3 p-3 mt-2 text-center text-muted" style="background:#f8fafc; font-size:.85rem;">
                <i class="bi bi-folder2-open me-1"></i>Document checklist will appear here once assigned by admin.
              </div>`}`;

    } else if (m.status === 'cancelled') {
      statusDetail = `
              <div class="alert alert-danger py-2 px-3 mt-3 mb-0 d-flex align-items-start gap-2" style="font-size:.88rem;">
                <i class="bi bi-ban fs-5 mt-1 flex-shrink-0"></i>
                <div>
                  <strong>Meeting Cancelled</strong><br>
                  <span><i class="bi bi-chat-square-text me-1"></i><strong>Reason:</strong> ${m.cancellationReason || 'No reason provided'}</span>
                  <br><small class="text-muted">Cancelled on: ${meetingManager.formatDate(m.cancelledAt)}</small>
                </div>
              </div>`;
    } else {
      statusDetail = `
              <div class="alert alert-warning py-2 px-3 mt-3 mb-0 d-flex align-items-center gap-2" style="font-size:.85rem;">
                <i class="bi bi-hourglass-split fs-5 flex-shrink-0"></i>
                <span>Your request is under review. Our team will confirm a date &amp; time soon.</span>
              </div>`;
    }

    return `
        <div class="card border-0 shadow-sm mb-4" style="border-radius:16px; overflow:hidden;">
          <div class="card-header border-0 d-flex align-items-center justify-content-between py-3 px-4"
               style="background: #f8fafc;">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              ${typeLabel}
              <small class="text-muted"><i class="bi bi-clock me-1"></i>${meetingManager.formatDate(m.submittedAt)}</small>
            </div>
            <span class="badge bg-${s.cls} text-${s.textCls} fs-6 px-3 py-2">
              <i class="bi ${s.icon} me-1"></i>${s.label}
            </span>
          </div>
          <div class="card-body px-4 py-3">
            <div class="row g-3">
              <div class="col-sm-6">
                <div class="d-flex flex-column gap-1" style="font-size:.9rem;">
                  <div><i class="bi bi-person-fill text-primary me-2"></i><strong>${m.name}</strong></div>
                  <div><i class="bi bi-telephone-fill text-primary me-2"></i>+91 ${m.phone}</div>
                  ${m.email ? `<div><i class="bi bi-envelope-fill text-primary me-2"></i>${m.email}</div>` : ''}
                  ${m.location ? `<div><i class="bi bi-geo-alt-fill text-primary me-2"></i>${m.location}</div>` : ''}
                </div>
              </div>
              <div class="col-sm-6">
                <div class="d-flex flex-column gap-1" style="font-size:.9rem;">
                  <div><i class="bi bi-calendar-event text-primary me-2"></i>Preferred: <strong>${meetingManager.formatDate(m.preferredDate)}</strong></div>
                  <div><i class="bi bi-clock text-primary me-2"></i>${m.preferredTime}</div>
                  ${m.loanAmount ? `<div><i class="bi bi-currency-rupee text-primary me-2"></i>₹${Number(m.loanAmount).toLocaleString('en-IN')}</div>` : ''}
                </div>
              </div>
            </div>
            ${propertiesList}
            ${statusDetail}
          </div>
        </div>`;
  }).join('');
}

// Open Loan Detail Sheet modal (customer fills)
function openLoanDetailSheet(meetingId, loanType) {
  const form = document.getElementById('loanDetailSheetForm');
  const success = document.getElementById('loanSheetSuccess');
  const container = document.getElementById('loanSheetFormContainer');
  if (form) form.reset();
  if (success) success.classList.add('d-none');
  if (container) container.classList.remove('d-none');

  // Pre-fill loan type
  const ltInput = document.getElementById('lds_loanType');
  if (ltInput) ltInput.value = loanType || 'General Enquiry';

  // Pre-fill applicant name/mobile from session
  const session = localStorage.getItem('sra_session');
  if (session) {
    const user = JSON.parse(session);
    const nameInput = document.getElementById('lds_applicantName');
    const mobileInput = document.getElementById('lds_applicantMobile');
    if (nameInput && user.name) nameInput.value = user.name;
    if (mobileInput && user.phone) mobileInput.value = user.phone;
  }

  // Store meetingId on form for submission
  form.dataset.meetingId = meetingId;

  const modal = new bootstrap.Modal(document.getElementById('loanDetailSheetModal'));
  modal.show();
}

// Open read-only loan sheet for customer
function openViewLoanSheet(meetingId) {
  const meetings = meetingManager.getAll();
  const m = meetings.find(x => x.id === meetingId);
  if (!m || !m.loanDetails) return;
  const ld = m.loanDetails;
  const body = document.getElementById('viewLoanSheetBody');
  body.innerHTML = `
    <div class="row g-3" style="font-size:.9rem;">
      <div class="col-12"><h6 class="text-primary-blue border-bottom pb-1">Loan Information</h6></div>
      <div class="col-md-6"><strong>Loan Type:</strong> ${ld.loanType || '-'}</div>
      <div class="col-md-6"><strong>Loan Amount:</strong> ₹${ld.loanAmount ? Number(ld.loanAmount).toLocaleString('en-IN') : '-'}</div>
      <div class="col-12"><h6 class="text-primary-blue border-bottom pb-1 mt-2">Applicant Details</h6></div>
      <div class="col-md-6"><strong>Applicant Name:</strong> ${ld.applicantName || '-'}</div>
      <div class="col-md-6"><strong>Mobile:</strong> +91 ${ld.applicantMobile || '-'}</div>
      <div class="col-md-6"><strong>Co-Applicant:</strong> ${ld.coApplicantName || '-'}</div>
      <div class="col-md-6"><strong>Co-Applicant Mobile:</strong> ${ld.coApplicantMobile ? '+91 ' + ld.coApplicantMobile : '-'}</div>
      <div class="col-12"><h6 class="text-primary-blue border-bottom pb-1 mt-2">Personal Information</h6></div>
      <div class="col-md-6"><strong>1. Education:</strong> ${ld.education || '-'}</div>
      <div class="col-md-6"><strong>2. Marital Status:</strong> ${ld.maritalStatus || '-'}</div>
      <div class="col-md-6"><strong>5. Mother's Name:</strong> ${ld.motherName || '-'}</div>
      <div class="col-md-6"><strong>6. Dependents:</strong> ${ld.dependents ?? '-'}</div>
      <div class="col-12"><h6 class="text-primary-blue border-bottom pb-1 mt-2">Residence</h6></div>
      <div class="col-md-6"><strong>7. Yrs in Residence:</strong> ${ld.yrsResidence || '-'}</div>
      <div class="col-md-6"><strong>8. Yrs in City:</strong> ${ld.yrsCity || '-'}</div>
      <div class="col-md-12"><strong>9. Current Address:</strong> ${ld.currentAddress || '-'}</div>
      <div class="col-md-6"><strong>10. Landmark:</strong> ${ld.landmark || '-'}</div>
      <div class="col-12"><h6 class="text-primary-blue border-bottom pb-1 mt-2">Contact</h6></div>
      <div class="col-md-6"><strong>11. Personal Email:</strong> ${ld.personalEmail || '-'}</div>
      <div class="col-md-6"><strong>12. Official Email:</strong> ${ld.officialEmail || '-'}</div>
      <div class="col-md-12"><strong>13. Permanent Address:</strong> ${ld.permanentAddress || '-'}</div>
      <div class="col-md-6"><strong>14. Permanent Contact:</strong> ${ld.permanentContact || '-'}</div>
      <div class="col-12"><h6 class="text-primary-blue border-bottom pb-1 mt-2">Employment</h6></div>
      <div class="col-md-6"><strong>15. Yrs in Company:</strong> ${ld.yrsCompany || '-'}</div>
      <div class="col-md-6"><strong>16. Total Experience:</strong> ${ld.totalExperience || '-'} yrs</div>
      <div class="col-md-12"><strong>17. Office Address:</strong> ${ld.officeAddress || '-'}</div>
      <div class="col-md-6"><strong>18. Office Landline:</strong> ${ld.officeLandline || '-'}</div>
      <div class="col-12"><h6 class="text-primary-blue border-bottom pb-1 mt-2">References</h6></div>
      <div class="col-md-4"><strong>Friend Name:</strong> ${ld.friend1Name || '-'}</div>
      <div class="col-md-4"><strong>Mobile:</strong> ${ld.friend1Mobile || '-'}</div>
      <div class="col-md-12"><strong>Address:</strong> ${ld.friend1Address || '-'}</div>
      <div class="col-md-4"><strong>Relative Name:</strong> ${ld.relative1Name || '-'}</div>
      <div class="col-md-4"><strong>Mobile:</strong> ${ld.relative1Mobile || '-'}</div>
      <div class="col-md-12"><strong>Address:</strong> ${ld.relative1Address || '-'}</div>
    </div>`;
  const modal = new bootstrap.Modal(document.getElementById('viewLoanSheetModal'));
  modal.show();
}

// Handle Loan Detail Sheet Form Submission
document.addEventListener('DOMContentLoaded', function () {
  const ldsForm = document.getElementById('loanDetailSheetForm');
  if (!ldsForm) return;

  ldsForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const meetingId = parseInt(ldsForm.dataset.meetingId);
    if (!meetingId) return;

    const mobile = document.getElementById('lds_applicantMobile').value.trim();
    if (!/^[6-9][0-9]{9}$/.test(mobile)) {
      alert('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    const formData = {
      loanType: document.getElementById('lds_loanType').value,
      loanAmount: document.getElementById('lds_loanAmount').value,
      applicantName: document.getElementById('lds_applicantName').value.trim(),
      applicantMobile: mobile,
      coApplicantName: document.getElementById('lds_coApplicantName').value.trim(),
      coApplicantMobile: document.getElementById('lds_coApplicantMobile').value.trim(),
      education: document.getElementById('lds_education').value,
      maritalStatus: document.getElementById('lds_maritalStatus').value,
      motherName: document.getElementById('lds_motherName').value.trim(),
      dependents: document.getElementById('lds_dependents').value,
      yrsResidence: document.getElementById('lds_yrsResidence').value,
      yrsCity: document.getElementById('lds_yrsCity').value,
      currentAddress: document.getElementById('lds_currentAddress').value.trim(),
      landmark: document.getElementById('lds_landmark').value.trim(),
      personalEmail: document.getElementById('lds_personalEmail').value.trim(),
      officialEmail: document.getElementById('lds_officialEmail').value.trim(),
      permanentAddress: document.getElementById('lds_permanentAddress').value.trim(),
      permanentContact: document.getElementById('lds_permanentContact').value.trim(),
      yrsCompany: document.getElementById('lds_yrsCompany').value,
      totalExperience: document.getElementById('lds_totalExperience').value,
      officeAddress: document.getElementById('lds_officeAddress').value.trim(),
      officeLandline: document.getElementById('lds_officeLandline').value.trim(),
      friend1Name: document.getElementById('lds_friend1Name').value.trim(),
      friend1Mobile: document.getElementById('lds_friend1Mobile').value.trim(),
      friend1Address: document.getElementById('lds_friend1Address').value.trim(),
      relative1Name: document.getElementById('lds_relative1Name').value.trim(),
      relative1Mobile: document.getElementById('lds_relative1Mobile').value.trim(),
      relative1Address: document.getElementById('lds_relative1Address').value.trim(),
      submittedAt: new Date().toISOString()
    };

    const result = meetingManager.saveLoanDetails(meetingId, formData);
    if (result.success) {
      document.getElementById('loanSheetFormContainer').classList.add('d-none');
      document.getElementById('loanSheetSuccess').classList.remove('d-none');
      // Refresh My Meetings list
      setTimeout(() => loadUserMeetings(), 500);
    }
  });
});

