import React, { useEffect, useState } from 'react';
import { useAdmission } from '../hooks/useContext';
import { Stepper } from '../components/Stepper';
import { Alert, Button, Card, FormGroup, Loading } from '../components/FormComponents';

const toDateInputValue = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const PersonalDetailsPage = ({ onNext }) => {
  const { admissionData, submitPersonalDetails, loading } = useAdmission();
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    religion: '',
    aadhaarNumber: '',
    contactNumber: '',
    parentName: '',
    parentContactNumber: '',
    parentEmail: '',
    permanentAddress: '',
    state: '',
    seatSource: '',
    allottedCategory: '',
    allottedBranch: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const profile = admissionData.profile;
    if (!profile) return;

    setFormData({
      fullName: profile.fullName || '',
      dateOfBirth: toDateInputValue(profile.dateOfBirth),
      gender: profile.gender || '',
      bloodGroup: profile.bloodGroup || '',
      religion: profile.religion || '',
      aadhaarNumber: profile.aadhaarNumber || '',
      contactNumber: profile.contactNumber || '',
      parentName: profile.parentName || '',
      parentContactNumber: profile.parentContactNumber || '',
      parentEmail: profile.parentEmail || '',
      permanentAddress: profile.permanentAddress || '',
      state: profile.state || '',
      seatSource: profile.seatSource || '',
      allottedCategory: profile.allottedCategory || '',
      allottedBranch: profile.allottedBranch || ''
    });
  }, [admissionData.profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const result = await submitPersonalDetails(null, formData);
    if (result.success) {
      setSuccess('Personal details saved successfully!');
      setTimeout(() => onNext?.(), 1500);
    } else {
      setError(result.error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Stepper currentStep={1} />

      {error && (
        <Alert type="error" onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && <Alert type="success">{success}</Alert>}

      <Card>
        <h2 className="text-2xl font-bold text-primary mb-6">Step 1: Personal Details</h2>

        <div className="bg-blue-50 border-l-4 border-primary p-4 mb-6 rounded">
          <p className="text-sm text-gray-700">
            <strong>📌 Important:</strong> Please fill in all required fields accurately. Information should match your documents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormGroup
            label="Full Name"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={handleChange}
            />

            <FormGroup
              label="Gender"
              name="gender"
              required
              onChange={handleChange}
              value={formData.gender}
            >
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="Blood Group"
              name="bloodGroup"
              required
              value={formData.bloodGroup}
              onChange={handleChange}
              placeholder="e.g. O+"
            />

            <FormGroup
              label="Religion"
              name="religion"
              required
              value={formData.religion}
              onChange={handleChange}
              placeholder="Enter religion"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="Aadhaar Number"
              name="aadhaarNumber"
              required
              value={formData.aadhaarNumber}
              onChange={handleChange}
              placeholder="Enter Aadhaar number"
            />

            <FormGroup
              label="Contact Number"
              name="contactNumber"
              type="tel"
              required
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter contact number"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="Parent/Guardian Name"
              name="parentName"
              required
              value={formData.parentName}
              onChange={handleChange}
              placeholder="Enter parent/guardian name"
            />

            <FormGroup
              label="Parent Contact Number"
              name="parentContactNumber"
              type="tel"
              required
              value={formData.parentContactNumber}
              onChange={handleChange}
              placeholder="Enter parent contact number"
            />
          </div>

          <FormGroup
            label="Parent Email"
            name="parentEmail"
            type="email"
            required
            value={formData.parentEmail}
            onChange={handleChange}
            placeholder="Enter parent email"
          />

          <FormGroup
            label="Permanent Address"
            name="permanentAddress"
            required
            value={formData.permanentAddress}
            onChange={handleChange}
          >
            <textarea
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your address"
            />
          </FormGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="State"
              name="state"
              required
              value={formData.state}
              onChange={handleChange}
              placeholder="Enter state"
            />

            <FormGroup
              label="Seat Source"
              name="seatSource"
              required
              onChange={handleChange}
              value={formData.seatSource}
            >
              <select
                name="seatSource"
                value={formData.seatSource}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Seat Source</option>
                <option value="JOSAA">JoSAA</option>
                <option value="CSAB">CSAB</option>
              </select>
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="Allotted Category"
              name="allottedCategory"
              required
              onChange={handleChange}
              value={formData.allottedCategory}
            >
              <select
                name="allottedCategory"
                value={formData.allottedCategory}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="OPEN">OPEN</option>
                <option value="OPEN_PWD">OPEN (PWD)</option>
                <option value="EWS">EWS</option>
                <option value="EWS_PWD">EWS (PWD)</option>
                <option value="SC">SC</option>
                <option value="SC_PWD">SC (PWD)</option>
                <option value="ST">ST</option>
                <option value="ST_PWD">ST (PWD)</option>
                <option value="OBC_NCL">OBC-NCL</option>
                <option value="OBC_NCL_PWD">OBC-NCL (PWD)</option>
              </select>
            </FormGroup>

            <FormGroup
              label="Allotted Branch"
              name="allottedBranch"
              required
              value={formData.allottedBranch}
              onChange={handleChange}
              placeholder="e.g. CSE"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Continue to Documents'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
