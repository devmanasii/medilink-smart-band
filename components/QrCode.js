'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

export default function QrCode({ value, size = 256 }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    }, (err) => {
      if (err) setError(err.message);
    });
  }, [value, size]);

  if (error) return <p className="text-sm text-destructive">QR Error: {error}</p>;

  return <canvas ref={canvasRef} className="rounded-lg border bg-white p-2" />;
}

export function downloadQrCode(value, fileName = 'patient-qr.png') {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    QRCode.toCanvas(canvas, value, { width: 512, margin: 2 }, (err) => {
      if (err) { reject(err); return; }
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      link.click();
      resolve();
    });
  });
}

export function printQrCode(value) {
  const canvas = document.createElement('canvas');
  QRCode.toCanvas(canvas, value, { width: 384, margin: 2 }, () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Print QR Code</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;">
        <h2>Smart Health Monitoring</h2>
        <p>Patient ID: ${value}</p>
        <img src="${canvas.toDataURL()}" style="width:300px;height:300px;" />
        <p style="margin-top:16px;font-size:12px;color:#666;">Scan to view patient medical information</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  });
}
