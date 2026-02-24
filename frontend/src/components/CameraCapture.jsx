import React, { useRef, useState, useEffect } from 'react';
import { Button } from './FormComponents';

export const CameraCapture = ({ onCapture, currentPhoto }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(currentPhoto || null);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      // Cleanup: stop video stream when component unmounts
      stopStream();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64 image
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    
    // Stop camera after capture
    stopStream();

    // Pass captured image to parent
    if (onCapture) {
      onCapture(imageDataUrl);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const removePhoto = () => {
    setCapturedImage(null);
    if (onCapture) {
      onCapture(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!capturedImage ? (
        <div className="space-y-4">
          {/* Video Preview */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full ${isStreaming ? 'block' : 'hidden'}`}
              style={{ maxHeight: '400px' }}
            />
            
            {!isStreaming && (
              <div className="flex items-center justify-center bg-gray-200 rounded-lg" style={{ height: '300px' }}>
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-sm">Camera not started</p>
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex gap-3 justify-center">
            {!isStreaming ? (
              <Button variant="primary" onClick={startCamera}>
                🎥 Start Camera
              </Button>
            ) : (
              <>
                <Button variant="primary" onClick={capturePhoto}>
                  📸 Capture Photo
                </Button>
                <Button variant="secondary" onClick={stopStream}>
                  ❌ Close Camera
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Captured Image Preview */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full rounded-lg"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              ✓ Photo Captured
            </div>
          </div>

          {/* Captured Image Controls */}
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={retakePhoto}>
              🔄 Retake Photo
            </Button>
            <Button variant="secondary" onClick={removePhoto}>
              🗑️ Remove Photo
            </Button>
          </div>
        </div>
      )}

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
