// ===================================
// Loan Application Management System
// ===================================

class LoanApplicationManager {
    constructor() {
        this.applications = [];
        this.init();
    }

    init() {
        // Load applications from localStorage
        const stored = localStorage.getItem('sra_loan_applications');
        if (stored) {
            this.applications = JSON.parse(stored);
        }
    }

    // Save applications to localStorage
    save() {
        localStorage.setItem('sra_loan_applications', JSON.stringify(this.applications));
    }

    // Submit new loan application
    submitApplication(formData) {
        const application = {
            id: this.applications.length > 0 ? Math.max(...this.applications.map(a => a.id)) + 1 : 1,
            ...formData,
            status: 'pending',
            submittedAt: new Date().toISOString()
        };

        this.applications.push(application);
        this.save();
        return { success: true, application };
    }

    // Get all applications
    getAll() {
        return this.applications;
    }

    // Get application by ID
    getById(id) {
        return this.applications.find(a => a.id === parseInt(id));
    }

    // Update application status
    updateStatus(id, status) {
        const index = this.applications.findIndex(a => a.id === parseInt(id));
        if (index === -1) {
            return { success: false, message: 'Application not found' };
        }

        this.applications[index].status = status;
        this.applications[index].updatedAt = new Date().toISOString();
        this.save();
        return { success: true, application: this.applications[index] };
    }

    // Validate phone number
    static validatePhone(phone) {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    }

    // Validate email
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Create global loan application manager instance
const loanAppManager = new LoanApplicationManager();

// Open loan application modal with pre-selected loan type
function openLoanApplication(loanType) {
    const modal = new bootstrap.Modal(document.getElementById('loanApplicationModal'));
    const loanTypeSelect = document.getElementById('loanType');

    if (loanTypeSelect && loanType) {
        loanTypeSelect.value = loanType;
    }

    modal.show();
}

// Handle loan application form submission
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('loanApplicationForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Collect form data
        const formData = {
            // Loan Details
            loanType: document.getElementById('loanType').value,
            loanAmount: document.getElementById('loanAmount').value,

            // Applicant Details
            applicantName: document.getElementById('applicantName').value,
            applicantMobile: document.getElementById('applicantMobile').value,

            // Co-Applicant Details
            coApplicantName: document.getElementById('coApplicantName').value,
            coApplicantMobile: document.getElementById('coApplicantMobile').value,

            // Personal Information
            education: document.getElementById('education').value,
            maritalStatus: document.getElementById('maritalStatus').value,
            motherName: document.getElementById('motherName').value,
            dependents: document.getElementById('dependents').value,

            // Residence Information
            yearsInResidence: document.getElementById('yearsInResidence').value,
            yearsInCity: document.getElementById('yearsInCity').value,
            currentAddress: document.getElementById('currentAddress').value,
            landmark: document.getElementById('landmark').value,

            // Contact Information
            personalEmail: document.getElementById('personalEmail').value,
            officialEmail: document.getElementById('officialEmail').value,
            permanentAddress: document.getElementById('permanentAddress').value,
            permanentContact: document.getElementById('permanentContact').value,

            // Employment Information
            yearsInCompany: document.getElementById('yearsInCompany').value,
            totalExperience: document.getElementById('totalExperience').value,
            officeAddress: document.getElementById('officeAddress').value,
            officeLandline: document.getElementById('officeLandline').value,

            // References
            friend1Name: document.getElementById('friend1Name').value,
            friend1Mobile: document.getElementById('friend1Mobile').value,
            friend1Address: document.getElementById('friend1Address').value,
            relative1Name: document.getElementById('relative1Name').value,
            relative1Mobile: document.getElementById('relative1Mobile').value,
            relative1Address: document.getElementById('relative1Address').value
        };

        // Submit application
        const result = loanAppManager.submitApplication(formData);

        if (result.success) {
            // Show success message
            alert(`Thank you! Your ${formData.loanType} application has been submitted successfully. Application ID: ${result.application.id}\n\nOur team will contact you within 24-48 hours.`);

            // Reset form
            form.reset();

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('loanApplicationModal'));
            modal.hide();
        } else {
            alert('There was an error submitting your application. Please try again.');
        }
    });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoanApplicationManager;
}
