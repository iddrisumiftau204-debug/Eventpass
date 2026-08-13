import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function TicketQr({ value, size = 96 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    QRCode.toCanvas(canvasRef.current, value, { width: size, margin: 1 }, () => {});
  }, [value, size]);

  return <canvas ref={canvasRef} width={size} height={size} />;
}
