import React from 'react';
import { useAdmission } from '../hooks/useContext';
import { Stepper } from '../components/Stepper';
import { Button, Card, Alert, Loading } from '../components/FormComponents';
import { API_ORIGIN } from '../api/http';

export const PaymentPage = ({ onNext }) => {
  const { admissionData, submitPaymentReceipt, confirmPayment, loading } = useAdmission();
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const [instituteTxnId, setInstituteTxnId] = React.useState('');
  const [instituteAmount, setInstituteAmount] = React.useState('');
  const [instituteFile, setInstituteFile] = React.useState(null);

  const [hostelTxnId, setHostelTxnId] = React.useState('');
  const [hostelAmount, setHostelAmount] = React.useState('');
  const [hostelFile, setHostelFile] = React.useState(null);

  const payment = admissionData.payment || {};
  const paymentStatus = payment.payment_status || payment.status;
  const paymentComplete = paymentStatus === 'completed';

  const documents = admissionData.documents || [];
  const instituteReceipt = documents.find((d) => d.type === 'INSTITUTE_FEE_RECEIPT');
  const hostelReceipt = documents.find((d) => d.type === 'HOSTEL_FEE_RECEIPT');
  const receiptsComplete = !!instituteReceipt && !!hostelReceipt;

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];

  const handleUploadReceipt = async (receiptType) => {
    setError('');
    setSuccess('');

    const isInstitute = receiptType === 'INSTITUTE_FEE_RECEIPT';
    const transactionId = isInstitute ? instituteTxnId : hostelTxnId;
    const amount = isInstitute ? instituteAmount : hostelAmount;
    const file = isInstitute ? instituteFile : hostelFile;

    if (!transactionId) {
      setError('Transaction ID is required');
      return;
    }

    if (!amount) {
      setError('Amount is required');
      return;
    }

    if (!file) {
      setError('Please select a receipt file');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF, JPG, or PNG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      return;
    }

    const result = await submitPaymentReceipt({
      type: receiptType,
      transactionId,
      amount,
      file
    });

    if (result.success) {
      setSuccess('Receipt submitted successfully!');
      setTimeout(() => setSuccess(''), 2000);
      if (isInstitute) {
        setInstituteFile(null);
      } else {
        setHostelFile(null);
      }
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

  if (loading && !instituteReceipt && !hostelReceipt) return <Loading />;

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
          ) : (
            <div className="inline-block px-4 py-2 bg-warning text-gray-800 rounded-lg font-semibold">
              ⏳ Payment Pending
            </div>
          )}
        </div>

        {!paymentComplete && (
          <div className="mb-6 space-y-6">
            <ReceiptUploader
              title="Institute Fee Receipt (SBI Collect)"
              receiptType="INSTITUTE_FEE_RECEIPT"
              existing={instituteReceipt}
              txnId={instituteTxnId}
              setTxnId={setInstituteTxnId}
              amount={instituteAmount}
              setAmount={setInstituteAmount}
              file={instituteFile}
              setFile={setInstituteFile}
              onUpload={handleUploadReceipt}
              disabled={loading}
            />

            <ReceiptUploader
              title="Hostel Fee Receipt (SBI Collect)"
              receiptType="HOSTEL_FEE_RECEIPT"
              existing={hostelReceipt}
              txnId={hostelTxnId}
              setTxnId={setHostelTxnId}
              amount={hostelAmount}
              setAmount={setHostelAmount}
              file={hostelFile}
              setFile={setHostelFile}
              onUpload={handleUploadReceipt}
              disabled={loading}
            />
          </div>
        )}

        <div className="flex gap-4 justify-end pt-6">
          {paymentComplete ? (
            <Button variant="success" onClick={onNext}>
              Continue to Status
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleConfirmPayment}
              disabled={loading || !receiptsComplete}
            >
              {loading ? 'Confirming...' : "Confirm Payment"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

const ReceiptUploader = ({
  title,
  receiptType,
  existing,
  txnId,
  setTxnId,
  amount,
  setAmount,
  file,
  setFile,
  onUpload,
  disabled
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className="font-semibold text-gray-800">{title}</div>
          <div className="text-xs text-gray-500">PDF, JPG or PNG (Max 5MB)</div>
        </div>
        {existing ? (
          <div className="text-xs text-success font-semibold">Uploaded</div>
        ) : (
          <div className="text-xs text-warning font-semibold">Not uploaded</div>
        )}
      </div>

      {existing && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <div className="text-sm text-gray-700">Txn: {existing.transactionId || '-'}</div>
          <div className="text-sm text-gray-700">Amount: {existing.amount ?? '-'}</div>
          {existing.fileUrl && (
            <a
              href={`${API_ORIGIN}${existing.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary font-semibold hover:underline"
            >
              View receipt
            </a>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction ID</label>
          <input
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="Enter transaction ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            inputMode="decimal"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Receipt File</label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <Button
          variant="primary"
          onClick={() => onUpload(receiptType)}
          disabled={disabled}
        >
          {disabled ? 'Uploading...' : 'Submit Receipt'}
        </Button>
      </div>
    </div>
  );
};
