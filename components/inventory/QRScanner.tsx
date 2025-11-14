import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../common/Icon';
import { useTranslation } from '../../i18n';

interface QRScannerProps {
  onClose: () => void;
  onScanSuccess: (data: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onClose, onScanSuccess }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    let animationFrameId: number;

    const startScan = async () => {
      if (!('BarcodeDetector' in window)) {
        setError('Barcode Detector API is not supported in this browser.');
        return;
      }

      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = streamRef.current;
          await videoRef.current.play();
        }

        const barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });

        const detect = async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              onScanSuccess(barcodes[0].rawValue);
              return; // Stop scanning once one is found
            }
          }
          animationFrameId = requestAnimationFrame(detect);
        };
        detect();

      } catch (err) {
        console.error('Error accessing camera:', err);
        setError(t('qr_scan_no_camera'));
      }
    };

    startScan();

    return () => {
      // Cleanup
      cancelAnimationFrame(animationFrameId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScanSuccess, t]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <video ref={videoRef} className="absolute top-0 left-0 w-full h-full object-cover" playsInline />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">{t('qr_scan_title')}</h2>
        
        <div className="w-64 h-64 border-4 border-white/50 rounded-lg relative">
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white" />
        </div>
        
        {error && <p className="mt-4 bg-red-500/80 px-4 py-2 rounded">{error}</p>}
      </div>

      <button
        onClick={onClose}
        className="absolute bottom-8 z-10 bg-white/20 backdrop-blur-md text-white font-semibold px-6 py-3 rounded-full"
      >
        {t('cancel')}
      </button>
    </div>
  );
};

export default QRScanner;
