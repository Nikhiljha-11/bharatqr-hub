import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  qrId: string;
  name: string;
}

const QRCodeDisplay = ({ qrId, name }: QRCodeDisplayProps) => {
  const qrValue = `${window.location.origin}/dashboard/${qrId}`;

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg border-2 border-slate-200">
      <div className="bg-white p-4 rounded-lg">
        <QRCodeSVG
          value={qrValue}
          size={200}
          level="H"
          includeMargin={true}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">Citizen ID: {qrId}</p>
        <p className="text-xs text-slate-600 mt-1">{name}</p>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
