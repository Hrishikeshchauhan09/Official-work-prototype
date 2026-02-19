// ===================================
// Meeting Schedule System
// ===================================

const meetingManager = {

    // Save a new meeting request
    submitRequest: function (data) {
        const meetings = this.getAll();
        const newMeeting = {
            id: Date.now(),
            ...data,
            status: 'pending', // pending | confirmed | cancelled
            confirmedDate: null,
            confirmedTime: null,
            adminNote: '',
            submittedAt: new Date().toISOString()
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
