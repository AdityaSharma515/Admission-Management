import React, { useState, useEffect } from 'react';
import { useAdmission } from '../hooks/useContext';
import { Stepper } from '../components/Stepper';
import { FormGroup, Button, Card, Alert, Loading } from '../components/FormComponents';
import { CameraCapture } from '../components/CameraCapture';

export const PersonalDetailsPage = ({ admissionId, onNext }) => {
  const { admissionData, submitPersonalDetails, loading } = useAdmission();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fatherName: '',
    motherName: '',
    jeeRollNo: '',
    dob: '',
    caste: '',
    category: '',
    gender: '',
    phone: '',
    address: '',
    photo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const details = admissionData.personalDetails;
    if (details) {
      setFormData({
        firstName: details.first_name || '',
        lastName: details.last_name || '',
        fatherName: details.father_name || '',
        motherName: details.mother_name || '',
        jeeRollNo: details.jee_roll_no || '',
        dob: details.dob || '',
        caste: details.caste || '',
        category: details.category || '',
        gender: details.gender || '',
        phone: details.phone || '',
        address: details.address || '',
        photo: details.photo || '',
      });
    }
  }, [admissionData.personalDetails]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoCapture = (photoData) => {
    setFormData((prev) => ({ ...prev, photo: photoData }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate photo is captured
    if (!formData.photo) {
      setError('Please capture your photo before continuing');
      return;
    }

    const result = await submitPersonalDetails(admissionId, formData);
    if (result.success) {
      setSuccess('Personal details saved successfully!');
      setTimeout(() => onNext(), 1500);
    } else {
      setError(result.error);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Stepper currentStep={1} />

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <Card>
        <h2 className="text-2xl font-bold text-primary mb-6">Step 1: Personal Details</h2>

        <div className="bg-blue-50 border-l-4 border-primary p-4 mb-6 rounded">
          <p className="text-sm text-gray-700">
            <strong>📌 Important:</strong> Please fill in all required fields accurately. Information should match your documents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="First Name"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
            />
            <FormGroup
              label="Last Name"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="Father's Name"
              name="fatherName"
              required
              value={formData.fatherName}
              onChange={handleChange}
              placeholder="Enter father's name"
            />
            <FormGroup
              label="Mother's Name"
              name="motherName"
              required
              value={formData.motherName}
              onChange={handleChange}
              placeholder="Enter mother's name"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="JEE Roll No."
              name="jeeRollNo"
              required
              value={formData.jeeRollNo}
              onChange={handleChange}
              placeholder="Enter JEE roll number"
            />
            <FormGroup
              label="Date of Birth"
              name="dob"
              type="date"
              required
              value={formData.dob}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup
              label="Caste"
              name="caste"
              required
              onChange={handleChange}
              value={formData.caste}
            >
              <select
                name="caste"
                value={formData.caste}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Caste</option>
                <option value="general">General</option>
                <option value="obc">OBC</option>
                <option value="sc">SC</option>
                <option value="st">ST</option>
              </select>
            </FormGroup>

            <FormGroup
              label="Category"
              name="category"
              required
              onChange={handleChange}
              value={formData.category}
            >
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="general">General</option>
                <option value="ewsf">EWSF</option>
                <option value="obcnc">OBCNC</option>
              </select>
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </FormGroup>

            <FormGroup
              label="Phone Number"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <FormGroup
            label="Address"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
          >
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter your address"
            />
          </FormGroup>

          {/* Photo Capture Section */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-bold text-primary mb-4">
              📸 Capture Your Photo <span className="text-danger">*</span>
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-4">
                Please capture a clear passport-size photo. Make sure your face is clearly visible and well-lit.
              </p>
              <CameraCapture 
                onCapture={handlePhotoCapture}
                currentPhoto={formData.photo}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button
              variant="primary"
              type="submit"
              disabled={loading || !formData.photo}
            >
              {loading ? 'Saving...' : 'Continue to Documents'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
