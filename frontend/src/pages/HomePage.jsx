import React from 'react';
import { Card, Button } from '../components/FormComponents';

export const HomePage = ({ onGetStarted }) => {
  const notices = [
    {
      id: 1,
      title: 'Admission 2026 Now Open',
      date: 'January 1, 2026',
      type: 'important',
      content: 'Applications are now open for B.Tech programs. Last date to apply: March 31, 2026.'
    },
    {
      id: 2,
      title: 'Required Documents',
      date: 'December 28, 2025',
      type: 'info',
      content: 'Please keep all required documents ready: JEE Admit Card, Aadhar Card, Seat Allotment Letter, 10th & 12th Marksheets.'
    },
    {
      id: 3,
      title: 'Payment Information',
      date: 'December 25, 2025',
      type: 'info',
      content: 'Admission processing fee is ₹1,000. Payment can be made via SBI payment gateway.'
    }
  ];

  const features = [
    { icon: '📝', title: 'Easy Registration', desc: 'Simple multi-step form' },
    { icon: '📄', title: 'Document Upload', desc: 'Secure file uploads' },
    { icon: '💳', title: 'Online Payment', desc: 'SBI payment gateway' },
    { icon: '📊', title: 'Track Status', desc: 'Real-time application status' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <nav className="bg-primary text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎓</span>
              <div>
                <h1 className="text-2xl font-bold">IIIT Dharwad</h1>
                <p className="text-sm text-blue-200">Admission Portal 2026</p>
              </div>
            </div>
            <Button variant="outline" onClick={onGetStarted} className="bg-white text-primary hover:bg-blue-50 border-white">
              Login / Register
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">
            Welcome to IIIT Dharwad
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            Indian Institute of Information Technology, Dharwad
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Apply for B.Tech programs for Academic Year 2026-27. Complete your admission process online in 4 simple steps.
          </p>
          <Button 
            variant="primary" 
            onClick={onGetStarted}
            className="text-lg px-8 py-4"
          >
            🚀 Start Registration Now
          </Button>

          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-600">Admin / Verifier portal</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => onGetStarted({ mode: 'login', role: 'VERIFIER' })}
                className="bg-white"
              >
                Verifier Login
              </Button>
              <Button
                variant="outline"
                onClick={() => onGetStarted({ mode: 'login', role: 'ADMIN' })}
                className="bg-white"
              >
                Admin Login
              </Button>
              <Button
                variant="outline"
                onClick={() => onGetStarted({ mode: 'register', role: 'ADMIN' })}
                className="bg-white"
              >
                Admin Signup
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition">
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-primary mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Notice Board */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">
        <Card className="bg-white">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📢</span>
            <h2 className="text-2xl font-bold text-primary">Notice Board</h2>
          </div>
          
          <div className="space-y-4">
            {notices.map((notice) => (
              <div 
                key={notice.id} 
                className={`p-4 rounded-lg border-l-4 ${
                  notice.type === 'important' 
                    ? 'bg-red-50 border-danger' 
                    : 'bg-blue-50 border-primary'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-800">{notice.title}</h3>
                  <span className="text-xs text-gray-500">{notice.date}</span>
                </div>
                <p className="text-gray-700 text-sm">{notice.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">
        <h2 className="text-3xl font-bold text-primary text-center mb-8">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: 1, title: 'Register', desc: 'Create your account with email and password' },
            { step: 2, title: 'Fill Details', desc: 'Enter personal details and upload documents' },
            { step: 3, title: 'Make Payment', desc: 'Pay ₹1,000 admission fee online' },
            { step: 4, title: 'Submit', desc: 'Submit application and track status' }
          ].map((step) => (
            <Card key={step.step} className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                {step.step}
              </div>
              <h3 className="font-bold text-lg text-primary mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Important Information */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-yellow-50 border-l-4 border-warning">
            <h3 className="font-bold text-lg text-gray-800 mb-4">📋 Required Documents</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>✓ JEE Admit Card</li>
              <li>✓ Aadhar Card</li>
              <li>✓ JoSAA Seat Allotment Letter</li>
              <li>✓ Class 10th Marksheet</li>
              <li>✓ Class 12th Marksheet</li>
            </ul>
          </Card>
          
          <Card className="bg-green-50 border-l-4 border-success">
            <h3 className="font-bold text-lg text-gray-800 mb-4">💰 Fee Structure</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Admission Processing Fee</span>
                <span className="font-bold text-primary">₹1,000</span>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                * Payment can be made via SBI payment gateway using Debit Card, Credit Card, or Net Banking.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">Ready to Join IIIT Dharwad?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Start your admission process now and secure your seat for 2026-27
          </p>
          <Button 
            variant="outline" 
            onClick={onGetStarted}
            className="text-lg px-8 py-4 bg-white text-primary hover:bg-blue-50"
          >
            Begin Registration →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2026 Indian Institute of Information Technology, Dharwad. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            For any queries, contact: admissions@iiitdwd.ac.in
          </p>
        </div>
      </footer>
    </div>
  );
};
