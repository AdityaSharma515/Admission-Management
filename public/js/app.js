const API_URL = 'http://localhost:3000/api';

class AdmissionApp {
    constructor() {
        this.currentPage = 'login';
        this.userId = null;
        this.admissionId = null;
        this.admissionData = {};
        this.init();
    }

    async init() {
        this.renderApp();
        await this.checkAuth();
    }

    async checkAuth() {
        try {
            const response = await fetch(`${API_URL}/auth/me`);
            if (response.ok) {
                const data = await response.json();
                this.userId = data.userId;
                this.admissionId = data.admissionId;
                this.currentPage = 'dashboard';
                this.renderApp();
                await this.loadAdmissionData();
            }
        } catch (error) {
            console.log('Not authenticated');
        }
    }

    async loadAdmissionData() {
        if (!this.admissionId) return;

        try {
            const response = await fetch(`${API_URL}/admission/${this.admissionId}/full`);
            const data = await response.json();
            this.admissionData = data;
        } catch (error) {
            console.error('Error loading admission data:', error);
        }
    }

    renderApp() {
        const app = document.getElementById('app');
        app.innerHTML = '';

        if (this.currentPage === 'login') {
            app.appendChild(this.renderLoginPage());
        } else if (this.currentPage === 'dashboard') {
            app.appendChild(this.renderDashboard());
        }
    }

    renderLoginPage() {
        const container = document.createElement('div');
        container.innerHTML = `
            <nav class="navbar">
                <div class="navbar-brand">🎓 IIIT Dharwad Admission Portal</div>
            </nav>

            <div class="login-container">
                <div class="form-card">
                    <h2>Welcome to IIIT Dharwad</h2>
                    <div id="authMessage"></div>
                    
                    <div id="loginForm">
                        <h3 style="margin-bottom: 1.5rem; color: var(--primary-color);">Login</h3>
                        <form id="loginFormElement">
                            <div class="form-group">
                                <label for="loginEmail">Email Address <span class="required">*</span></label>
                                <input type="email" id="loginEmail" name="email" required placeholder="Enter your email">
                            </div>
                            <div class="form-group">
                                <label for="loginPassword">Password <span class="required">*</span></label>
                                <input type="password" id="loginPassword" name="password" required placeholder="Enter your password">
                            </div>
                            <button type="submit" class="btn btn-primary">Login</button>
                        </form>
                        <div class="form-footer" style="margin-top: 2rem;">
                            Don't have an account? <a href="#" onclick="app.toggleForm()">Create one here</a>
                        </div>
                    </div>

                    <div id="registerForm" style="display: none;">
                        <h3 style="margin-bottom: 1.5rem; color: var(--primary-color);">Create Account</h3>
                        <form id="registerFormElement">
                            <div class="form-group">
                                <label for="registerEmail">Email Address <span class="required">*</span></label>
                                <input type="email" id="registerEmail" name="email" required placeholder="Enter your email">
                            </div>
                            <div class="form-group">
                                <label for="registerPassword">Password <span class="required">*</span></label>
                                <input type="password" id="registerPassword" name="password" required placeholder="Create a password">
                            </div>
                            <div class="form-group">
                                <label for="confirmPassword">Confirm Password <span class="required">*</span></label>
                                <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Confirm your password">
                            </div>
                            <button type="submit" class="btn btn-primary">Register</button>
                        </form>
                        <div class="form-footer" style="margin-top: 2rem;">
                            Already have an account? <a href="#" onclick="app.toggleForm()">Login here</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const loginForm = container.querySelector('#loginFormElement');
        const registerForm = container.querySelector('#registerFormElement');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin(
                document.getElementById('loginEmail').value,
                document.getElementById('loginPassword').value
            );
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister(
                document.getElementById('registerEmail').value,
                document.getElementById('registerPassword').value,
                document.getElementById('confirmPassword').value
            );
        });

        return container;
    }

    toggleForm() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
        registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
    }

    async handleLogin(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.userId = data.userId;
                this.admissionId = data.admissionId;
                this.currentPage = 'dashboard';
                await this.loadAdmissionData();
                this.renderApp();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Login failed', 'error');
        }
    }

    async handleRegister(email, password, confirmPassword) {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, confirmPassword })
            });

            const data = await response.json();

            if (response.ok) {
                this.userId = data.userId;
                this.admissionId = data.admissionId;
                this.currentPage = 'dashboard';
                await this.loadAdmissionData();
                this.renderApp();
            } else {
                this.showMessage(data.error, 'error');
            }
        } catch (error) {
            this.showMessage('Registration failed', 'error');
        }
    }

    showMessage(message, type = 'error') {
        const messageDiv = document.getElementById('authMessage');
        if (messageDiv) {
            messageDiv.innerHTML = `<div class="${type}-message">${message}</div>`;
        }
    }

    renderDashboard() {
        const container = document.createElement('div');
        container.innerHTML = `
            <nav class="navbar">
                <div class="navbar-brand">🎓 IIIT Dharwad Admission Portal</div>
                <div class="navbar-nav">
                    <span>${this.userId}</span>
                    <a onclick="app.logout()">Logout</a>
                </div>
            </nav>

            <div class="container">
                <div class="dashboard">
                    <div class="sidebar">
                        <ul class="sidebar-menu">
                            <li><a href="#" class="active" onclick="app.goToStep(1)">📝 Personal Details</a></li>
                            <li><a href="#" onclick="app.goToStep(2)">📄 Upload Documents</a></li>
                            <li><a href="#" onclick="app.goToStep(3)">💳 Payment</a></li>
                            <li><a href="#" onclick="app.goToStep(4)">✅ Status</a></li>
                        </ul>
                    </div>

                    <div class="main-content" id="mainContent">
                        <!-- Content will be rendered here -->
                    </div>
                </div>
            </div>
        `;

        const mainContent = container.querySelector('#mainContent');
        const currentStep = this.admissionData.admission?.step || 1;

        switch (currentStep) {
            case 1:
                mainContent.appendChild(this.renderPersonalDetailsForm());
                break;
            case 2:
                mainContent.appendChild(this.renderDocumentUploadForm());
                break;
            case 3:
                mainContent.appendChild(this.renderPaymentForm());
                break;
            case 4:
                mainContent.appendChild(this.renderStatusPage());
                break;
            default:
                mainContent.appendChild(this.renderPersonalDetailsForm());
        }

        return container;
    }

    goToStep(step) {
        const currentStep = this.admissionData.admission?.step || 1;
        
        // Only allow going to next step or returning to previous
        if (step <= currentStep) {
            this.admissionData.admission.step = step;
            this.renderApp();
        } else {
            alert('Complete current step first!');
        }
    }

    renderPersonalDetailsForm() {
        const details = this.admissionData.personalDetails || {};
        const admission = this.admissionData.admission || {};

        const form = document.createElement('div');
        form.className = 'registration-form';
        form.innerHTML = `
            <div class="stepper">
                <div class="step ${admission.step >= 1 ? 'active' : ''}">
                    <div class="step-number">1</div>
                    <div class="step-label">Personal Details</div>
                </div>
                <div class="step ${admission.step >= 2 ? 'completed' : ''}">
                    <div class="step-number">2</div>
                    <div class="step-label">Documents</div>
                </div>
                <div class="step ${admission.step >= 3 ? 'completed' : ''}">
                    <div class="step-number">3</div>
                    <div class="step-label">Payment</div>
                </div>
                <div class="step ${admission.step >= 4 ? 'completed' : ''}">
                    <div class="step-number">4</div>
                    <div class="step-label">Status</div>
                </div>
            </div>

            <h2 style="margin-bottom: 1.5rem;">Step 1: Personal Details</h2>
            
            <form id="personalDetailsForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstName">First Name <span class="required">*</span></label>
                        <input type="text" id="firstName" name="firstName" required value="${details.first_name || ''}">
                    </div>
                    <div class="form-group">
                        <label for="lastName">Last Name <span class="required">*</span></label>
                        <input type="text" id="lastName" name="lastName" required value="${details.last_name || ''}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="fatherName">Father's Name <span class="required">*</span></label>
                        <input type="text" id="fatherName" name="fatherName" required value="${details.father_name || ''}">
                    </div>
                    <div class="form-group">
                        <label for="motherName">Mother's Name <span class="required">*</span></label>
                        <input type="text" id="motherName" name="motherName" required value="${details.mother_name || ''}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="jeeRollNo">JEE Roll No. <span class="required">*</span></label>
                        <input type="text" id="jeeRollNo" name="jeeRollNo" required value="${details.jee_roll_no || ''}">
                    </div>
                    <div class="form-group">
                        <label for="dob">Date of Birth <span class="required">*</span></label>
                        <input type="date" id="dob" name="dob" required value="${details.dob || ''}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="caste">Caste <span class="required">*</span></label>
                        <select id="caste" name="caste" required>
                            <option value="">Select Caste</option>
                            <option value="general" ${details.caste === 'general' ? 'selected' : ''}>General</option>
                            <option value="obc" ${details.caste === 'obc' ? 'selected' : ''}>OBC</option>
                            <option value="sc" ${details.caste === 'sc' ? 'selected' : ''}>SC</option>
                            <option value="st" ${details.caste === 'st' ? 'selected' : ''}>ST</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="category">Category <span class="required">*</span></label>
                        <select id="category" name="category" required>
                            <option value="">Select Category</option>
                            <option value="general" ${details.category === 'general' ? 'selected' : ''}>General</option>
                            <option value="ewsf" ${details.category === 'ewsf' ? 'selected' : ''}>EWSF</option>
                            <option value="obcnc" ${details.category === 'obcnc' ? 'selected' : ''}>OBCNC</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="gender">Gender <span class="required">*</span></label>
                        <select id="gender" name="gender" required>
                            <option value="">Select Gender</option>
                            <option value="male" ${details.gender === 'male' ? 'selected' : ''}>Male</option>
                            <option value="female" ${details.gender === 'female' ? 'selected' : ''}>Female</option>
                            <option value="other" ${details.gender === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="phone">Phone Number <span class="required">*</span></label>
                        <input type="tel" id="phone" name="phone" required value="${details.phone || ''}">
                    </div>
                </div>

                <div class="form-row full">
                    <div class="form-group">
                        <label for="address">Address <span class="required">*</span></label>
                        <textarea id="address" name="address" rows="3" required>${details.address || ''}</textarea>
                    </div>
                </div>

                <div class="button-group">
                    <button type="submit" class="btn btn-primary">Continue to Documents</button>
                </div>
            </form>
        `;

        form.querySelector('#personalDetailsForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitPersonalDetails();
        });

        return form;
    }

    async submitPersonalDetails() {
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            fatherName: document.getElementById('fatherName').value,
            motherName: document.getElementById('motherName').value,
            jeeRollNo: document.getElementById('jeeRollNo').value,
            dob: document.getElementById('dob').value,
            caste: document.getElementById('caste').value,
            category: document.getElementById('category').value,
            gender: document.getElementById('gender').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value
        };

        try {
            const response = await fetch(`${API_URL}/admission/${this.admissionId}/personal-details`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                await this.loadAdmissionData();
                this.renderApp();
            } else {
                alert('Error saving details');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error saving details');
        }
    }

    renderDocumentUploadForm() {
        const documents = this.admissionData.documents || [];
        const admission = this.admissionData.admission || {};

        const requiredDocs = [
            { type: 'admit_card', label: 'JEE Admit Card' },
            { type: 'aadhar_card', label: 'Aadhar Card' },
            { type: 'seat_allotment', label: 'Seat Allotment Letter' },
            { type: 'marksheet_10', label: '10th Marksheet' },
            { type: 'marksheet_12', label: '12th Marksheet' }
        ];

        const form = document.createElement('div');
        form.className = 'registration-form';
        form.innerHTML = `
            <div class="stepper">
                <div class="step ${admission.step >= 1 ? 'completed' : ''}">
                    <div class="step-number">1</div>
                    <div class="step-label">Personal Details</div>
                </div>
                <div class="step ${admission.step >= 2 ? 'active' : ''}">
                    <div class="step-number">2</div>
                    <div class="step-label">Documents</div>
                </div>
                <div class="step ${admission.step >= 3 ? 'completed' : ''}">
                    <div class="step-number">3</div>
                    <div class="step-label">Payment</div>
                </div>
                <div class="step ${admission.step >= 4 ? 'completed' : ''}">
                    <div class="step-number">4</div>
                    <div class="step-label">Status</div>
                </div>
            </div>

            <h2 style="margin-bottom: 1.5rem;">Step 2: Upload Documents</h2>
            
            <div class="info-box">
                <strong>📌 Required Documents:</strong> Please upload all required documents in PDF or JPG/PNG format (Max 10MB each)
            </div>

            <div id="documentsContainer"></div>

            <div class="button-group">
                <button type="button" class="btn btn-primary" onclick="app.checkDocumentsAndProceed()">Continue to Payment</button>
            </div>
        `;

        const container = form.querySelector('#documentsContainer');
        
        requiredDocs.forEach(doc => {
            const uploadedDoc = documents.find(d => d.document_type === doc.type);
            const docDiv = document.createElement('div');
            docDiv.className = 'form-group';
            docDiv.innerHTML = `
                <label for="${doc.type}">${doc.label} <span class="required">*</span></label>
                <div class="document-upload" onclick="document.getElementById('${doc.type}').click()">
                    <div class="upload-icon">📤</div>
                    <p>Click to upload or drag and drop</p>
                    <p style="font-size: 0.85rem; color: var(--text-light);">PDF, JPG or PNG (Max 10MB)</p>
                </div>
                <input type="file" id="${doc.type}" accept=".pdf,.jpg,.jpeg,.png" style="display: none;">
                ${uploadedDoc ? `
                    <div class="document-item">
                        <div>
                            <div class="document-item-name">✅ ${uploadedDoc.document_type}</div>
                            <div class="document-item-size">${(uploadedDoc.file_size / 1024).toFixed(2)} KB</div>
                        </div>
                        <button type="button" class="btn-delete" onclick="app.deleteDocument('${uploadedDoc.id}')">Delete</button>
                    </div>
                ` : ''}
            `;

            container.appendChild(docDiv);

            const input = docDiv.querySelector(`#${doc.type}`);
            input.addEventListener('change', (e) => this.uploadDocument(e, doc.type));
        });

        return form;
    }

    async uploadDocument(event, docType) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentType', docType);

        try {
            const response = await fetch(`${API_URL}/admission/${this.admissionId}/documents`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                await this.loadAdmissionData();
                this.renderApp();
            } else {
                alert('Error uploading document');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error uploading document');
        }
    }

    async deleteDocument(documentId) {
        if (confirm('Are you sure you want to delete this document?')) {
            try {
                const response = await fetch(`${API_URL}/admission/${this.admissionId}/documents/${documentId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await this.loadAdmissionData();
                    this.renderApp();
                } else {
                    alert('Error deleting document');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error deleting document');
            }
        }
    }

    checkDocumentsAndProceed() {
        const requiredDocs = ['admit_card', 'aadhar_card', 'seat_allotment', 'marksheet_10', 'marksheet_12'];
        const uploadedDocs = (this.admissionData.documents || []).map(d => d.document_type);

        const missingDocs = requiredDocs.filter(doc => !uploadedDocs.includes(doc));

        if (missingDocs.length > 0) {
            alert(`Please upload all required documents. Missing: ${missingDocs.join(', ')}`);
            return;
        }

        this.admissionData.admission.step = 3;
        this.renderApp();
    }

    renderPaymentForm() {
        const payment = this.admissionData.payment || {};
        const admission = this.admissionData.admission || {};

        const form = document.createElement('div');
        form.className = 'registration-form';
        form.innerHTML = `
            <div class="stepper">
                <div class="step ${admission.step >= 1 ? 'completed' : ''}">
                    <div class="step-number">1</div>
                    <div class="step-label">Personal Details</div>
                </div>
                <div class="step ${admission.step >= 2 ? 'completed' : ''}">
                    <div class="step-number">2</div>
                    <div class="step-label">Documents</div>
                </div>
                <div class="step ${admission.step >= 3 ? 'active' : ''}">
                    <div class="step-number">3</div>
                    <div class="step-label">Payment</div>
                </div>
                <div class="step ${admission.step >= 4 ? 'completed' : ''}">
                    <div class="step-number">4</div>
                    <div class="step-label">Status</div>
                </div>
            </div>

            <h2 style="margin-bottom: 1.5rem;">Step 3: Payment</h2>
            
            <div class="payment-section">
                <div class="payment-info">
                    <div>Admission Fee</div>
                    <div class="payment-amount">₹ 1,000</div>
                    <div class="payment-status ${payment.payment_status || 'pending'}">
                        Status: ${payment.payment_status === 'completed' ? 'Completed ✅' : 'Pending ⏳'}
                    </div>
                </div>

                <div style="margin-top: 1.5rem;">
                    <h4>Payment Link:</h4>
                    <div class="payment-link">${payment.payment_link || 'Generate payment link to continue'}</div>
                </div>

                <div style="margin-top: 1.5rem;">
                    <h4>Instructions:</h4>
                    <ol style="margin-left: 1.5rem;">
                        <li>Click the button below to generate your payment link</li>
                        <li>You will be redirected to SBI payment gateway</li>
                        <li>Complete the payment as per instructions</li>
                        <li>Return to confirm payment completion</li>
                    </ol>
                </div>

                <div class="button-group" style="margin-top: 2rem;">
                    ${!payment.payment_link ? `
                        <button type="button" class="btn btn-primary" onclick="app.generatePaymentLink()">Generate Payment Link</button>
                    ` : payment.payment_status === 'completed' ? `
                        <button type="button" class="btn btn-success" onclick="app.proceedToStatus()">Continue to Status</button>
                    ` : `
                        <a href="${payment.payment_link}" target="_blank" class="btn btn-secondary">Open Payment Link</a>
                        <button type="button" class="btn btn-primary" onclick="app.confirmPayment()">I've Completed Payment</button>
                    `}
                </div>
            </div>
        `;

        return form;
    }

    async generatePaymentLink() {
        try {
            const response = await fetch(`${API_URL}/admission/${this.admissionId}/payment`, {
                method: 'POST'
            });

            if (response.ok) {
                await this.loadAdmissionData();
                this.renderApp();
            } else {
                alert('Error generating payment link');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error generating payment link');
        }
    }

    async confirmPayment() {
        if (confirm('Please confirm that you have completed the payment. This action cannot be undone.')) {
            try {
                const response = await fetch(`${API_URL}/admission/${this.admissionId}/payment/confirm`, {
                    method: 'POST'
                });

                if (response.ok) {
                    await this.loadAdmissionData();
                    this.renderApp();
                } else {
                    alert('Error confirming payment');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error confirming payment');
            }
        }
    }

    proceedToStatus() {
        this.admissionData.admission.step = 4;
        this.renderApp();
    }

    renderStatusPage() {
        const admission = this.admissionData.admission || {};
        const submission = this.admissionData.submission || {};

        const form = document.createElement('div');
        form.className = 'registration-form';
        form.innerHTML = `
            <div class="stepper">
                <div class="step ${admission.step >= 1 ? 'completed' : ''}">
                    <div class="step-number">1</div>
                    <div class="step-label">Personal Details</div>
                </div>
                <div class="step ${admission.step >= 2 ? 'completed' : ''}">
                    <div class="step-number">2</div>
                    <div class="step-label">Documents</div>
                </div>
                <div class="step ${admission.step >= 3 ? 'completed' : ''}">
                    <div class="step-number">3</div>
                    <div class="step-label">Payment</div>
                </div>
                <div class="step ${admission.step >= 4 ? 'active' : ''}">
                    <div class="step-number">4</div>
                    <div class="step-label">Status</div>
                </div>
            </div>

            <h2 style="margin-bottom: 1.5rem;">Step 4: Submission Status</h2>
            
            <div class="status-card">
                <div class="status-icon">📋</div>
                <div class="status-title">Ready to Submit</div>
                <div class="status-message">All your details and documents are complete. Submit your admission form to complete the process.</div>
                
                ${submission.submission_status ? `
                    <div class="status-details">
                        <div class="status-detail-row">
                            <span class="status-detail-label">Submission Status:</span>
                            <span class="status-detail-value">${submission.submission_status}</span>
                        </div>
                        <div class="status-detail-row">
                            <span class="status-detail-label">Admin Review Status:</span>
                            <span class="status-detail-value">${submission.admin_status || 'Under Review'}</span>
                        </div>
                        ${submission.admin_remarks ? `
                            <div class="status-detail-row">
                                <span class="status-detail-label">Admin Remarks:</span>
                                <span class="status-detail-value">${submission.admin_remarks}</span>
                            </div>
                        ` : ''}
                        <div class="status-detail-row">
                            <span class="status-detail-label">Submitted At:</span>
                            <span class="status-detail-value">${new Date(submission.submitted_at).toLocaleString()}</span>
                        </div>
                    </div>
                ` : `
                    <div class="button-group" style="margin-top: 2rem;">
                        <button type="button" class="btn btn-success" onclick="app.submitAdmission()">Submit Admission Form</button>
                    </div>
                `}
            </div>
        `;

        return form;
    }

    async submitAdmission() {
        if (confirm('Are you sure you want to submit your admission form? You will not be able to edit details after submission.')) {
            try {
                const response = await fetch(`${API_URL}/admission/${this.admissionId}/submit`, {
                    method: 'POST'
                });

                if (response.ok) {
                    await this.loadAdmissionData();
                    this.renderApp();
                } else {
                    alert('Error submitting admission');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error submitting admission');
            }
        }
    }

    async logout() {
        try {
            await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
            this.userId = null;
            this.admissionId = null;
            this.currentPage = 'login';
            this.renderApp();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AdmissionApp();
});
