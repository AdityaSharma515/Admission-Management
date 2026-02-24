import React from 'react';
import { useAdmission } from '../hooks/useContext';
import { Stepper } from '../components/Stepper';
import { Button, Card, Alert, Loading } from '../components/FormComponents';

export const PaymentPage = ({ onNext }) => {
  const { admissionData, generatePaymentLink, confirmPayment, loading } = useAdmission();
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const payment = admissionData.payment || {};
  const paymentLink = payment.payment_link || payment.link || payment.paymentLink;
  const paymentStatus = payment.payment_status || payment.status;
  const paymentComplete = paymentStatus === 'completed';

  const handleGenerateLink = async () => {
    setError('');
    setSuccess('');
    const result = await generatePaymentLink(null);
    if (result.success) {
      setSuccess('Payment link generated successfully! Redirecting...');
      setTimeout(() => onNext(), 1500);
    } else {
      setError(result.error);
    }
  };

  const handleConfirmPayment = async () => {
    if (
      window.confirm(
        'Please confirm that you have completed the payment. This action cannot be undone.'
      )
    ) {
      setError('');
      setSuccess('');
      const result = await confirmPayment(null);
      if (result.success) {
        setSuccess('Payment confirmed! Proceeding to status...');
        setTimeout(() => onNext(), 1500);
      } else {
        setError(result.error);
      }
    }
  };

  if (loading && !paymentLink) return <Loading />;

  return (
    <div>
      <Stepper currentStep={3} />

      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <Card className="border-l-4 border-success">
        <h2 className="text-2xl font-bold text-primary mb-6">Step 3: Payment</h2>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-gray-700 text-sm mb-4">Admission Processing Fee</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-primary">₹</span>
            <span className="text-4xl font-bold text-primary">1,000</span>
          </div>

          {paymentComplete ? (
            <div className="inline-block px-4 py-2 bg-success text-white rounded-lg font-semibold">
              ✅ Payment Completed
            </div>
          ) : paymentStatus === 'pending' && paymentLink ? (
            <div className="inline-block px-4 py-2 bg-warning text-gray-800 rounded-lg font-semibold">
              ⏳ Payment Pending
            </div>
          ) : null}
        </div>

        {paymentLink && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Payment Link:</h3>
            <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm break-all">
              {paymentLink}
            </div>
          </div>
        )}

        {!paymentComplete && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-4">Payment Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Click the button below to generate your payment link</li>
              <li>You will be redirected to SBI payment gateway</li>
              <li>Complete the payment as per instructions</li>
              <li>Return to confirm payment completion</li>
            </ol>
          </div>
        )}

        <div className="flex gap-4 justify-end pt-6">
          {!paymentLink ? (
            <Button
              variant="primary"
              onClick={handleGenerateLink}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Payment Link'}
            </Button>
          ) : paymentComplete ? (
            <Button variant="success" onClick={onNext}>
              Continue to Status
            </Button>
          ) : (
            <>
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-red-600 transition"
              >
                Open Payment Link
              </a>
              <Button
                variant="primary"
                onClick={handleConfirmPayment}
                disabled={loading}
              >
                {loading ? 'Confirming...' : "I've Completed Payment"}
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
