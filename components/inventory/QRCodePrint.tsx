import React from 'react';
import { InventoryItem } from '../../types';
import { Icon } from '../common/Icon';

interface QRCodePrintProps {
  item: InventoryItem;
}

const QRCodePrint: React.FC<QRCodePrintProps> = ({ item }) => {
  if (!item) return null;

  const qrData = JSON.stringify({ type: 'inventory_item', id: item.id });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=150x150&q=H`;

  return (
    <div className="font-sans text-black p-2 w-[72mm] bg-white border-2 border-dashed border-black flex flex-col items-center justify-center text-center" style={{ height: '50mm' }}>
        <h1 className="text-lg font-bold leading-tight mb-2">{item.name}</h1>
        <img src={qrUrl} alt={`QR Code for ${item.name}`} className="w-[35mm] h-[35mm]" />
        <p className="text-xs mt-1">ID: {item.id}</p>
    </div>
  );
};

export default QRCodePrint;
