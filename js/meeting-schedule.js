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

    // Admin: cancel a meeting
    cancelMeeting: function (id) {
        const meetings = this.getAll();
        const idx = meetings.findIndex(m => m.id === id);
        if (idx === -1) return { success: false };
        meetings[idx].status = 'cancelled';
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

    // Set minimum date to today
    const dateInput = document.getElementById('meetingPreferredDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }

    // Check for confirmed meetings for logged-in user
    checkUserConfirmedMeetings();

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
        detailsDiv.innerHTML = `
      <strong>Loan Type:</strong> ${latest.loanType}<br>
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
            loanType: document.getElementById('meetingLoanType').value,
            name: document.getElementById('meetingName').value.trim(),
            phone: phone,
            email: document.getElementById('meetingEmail').value.trim(),
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
