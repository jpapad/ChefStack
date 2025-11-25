import React, { useState } from 'react';
import { useTranslation } from '../../i18n';
import { Icon } from '../common/Icon';
import { Shift, ShiftSchedule, User, ShiftTypeKey } from '../../types';
import { SHIFT_TYPE_DETAILS } from '../../types';
import QRCode from 'qrcode';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ShiftSchedule;
  shifts: Shift[];
  users: User[];
}

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
  isOpen,
  onClose,
  schedule,
  shifts,
  users,
}) => {
  const { t, language } = useTranslation();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  if (!isOpen) return null;

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'el' ? 'el-GR' : 'en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (time?: string): string => {
    if (!time) return '';
    return time;
  };

  const generateICalFile = () => {
    const scheduleShifts = shifts.filter(s => s.teamId === schedule.teamId);
    
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ChefStack//Shift Schedule//EN
CALSCALE:GREGORIAN
X-WR-CALNAME:${schedule.name}
X-WR-TIMEZONE:Europe/Athens
BEGIN:VTIMEZONE
TZID:Europe/Athens
BEGIN:STANDARD
DTSTART:19701025T040000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
TZOFFSETFROM:+0300
TZOFFSETTO:+0200
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:19700329T030000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
TZOFFSETFROM:+0200
TZOFFSETTO:+0300
END:DAYLIGHT
END:VTIMEZONE
`;

    scheduleShifts.forEach(shift => {
      const user = users.find(u => u.id === shift.userId);
      const shiftType = SHIFT_TYPE_DETAILS[shift.type];
      const description = shiftType[language];
      
      // Parse date and time
      const dateParts = shift.date.split('-').map(Number);
      const startTimeParts = shift.startTime ? shift.startTime.split(':').map(Number) : [9, 0];
      const endTimeParts = shift.endTime ? shift.endTime.split(':').map(Number) : [17, 0];
      
      // Create datetime strings in iCal format (YYYYMMDDTHHMMSS)
      const startDateTime = `${dateParts[0]}${String(dateParts[1]).padStart(2, '0')}${String(dateParts[2]).padStart(2, '0')}T${String(startTimeParts[0]).padStart(2, '0')}${String(startTimeParts[1]).padStart(2, '0')}00`;
      
      // Handle overnight shifts
      let endDate = new Date(shift.date);
      if (shift.endTime && shift.startTime && shift.endTime < shift.startTime) {
        endDate.setDate(endDate.getDate() + 1);
      }
      const endDateParts = [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()];
      const endDateTime = `${endDateParts[0]}${String(endDateParts[1]).padStart(2, '0')}${String(endDateParts[2]).padStart(2, '0')}T${String(endTimeParts[0]).padStart(2, '0')}${String(endTimeParts[1]).padStart(2, '0')}00`;
      
      icsContent += `BEGIN:VEVENT
UID:${shift.id}@chefstack.app
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART;TZID=Europe/Athens:${startDateTime}
DTEND;TZID=Europe/Athens:${endDateTime}
SUMMARY:${description} - ${user?.name || 'Unknown'}
DESCRIPTION:${description}\\nΒάρδια: ${formatTime(shift.startTime)} - ${formatTime(shift.endTime)}
LOCATION:${schedule.name}
STATUS:CONFIRMED
END:VEVENT
`;
    });

    icsContent += 'END:VCALENDAR';

    // Create download
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${schedule.name.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const generateWhatsAppText = (): string => {
    const scheduleShifts = shifts.filter(s => s.teamId === schedule.teamId);
    
    // Group by date
    const shiftsByDate = new Map<string, Shift[]>();
    scheduleShifts.forEach(shift => {
      const existing = shiftsByDate.get(shift.date) || [];
      shiftsByDate.set(shift.date, [...existing, shift]);
    });
    
    // Sort dates
    const sortedDates = Array.from(shiftsByDate.keys()).sort();
    
    let message = `📅 *${schedule.name}*\n`;
    message += `${formatDate(schedule.startDate)} - ${formatDate(schedule.endDate)}\n\n`;
    
    sortedDates.forEach(date => {
      const dayShifts = shiftsByDate.get(date) || [];
      message += `*${formatDate(date)}*\n`;
      
      dayShifts.forEach(shift => {
        const user = users.find(u => u.id === shift.userId);
        const shiftType = SHIFT_TYPE_DETAILS[shift.type];
        const icon = shift.type === 'morning' ? '☀️' : shift.type === 'evening' ? '🌙' : shift.type === 'split' ? '⏱️' : '🚫';
        
        message += `${icon} ${user?.name}: ${shiftType[language]}`;
        if (shift.startTime && shift.endTime) {
          message += ` (${formatTime(shift.startTime)} - ${formatTime(shift.endTime)})`;
        }
        message += `\n`;
      });
      
      message += `\n`;
    });
    
    return message;
  };

  const shareViaWhatsApp = () => {
    const text = generateWhatsAppText();
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const generateQRCode = async () => {
    const text = generateWhatsAppText();
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${schedule.name.replace(/\s+/g, '_')}_QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
            {t('shifts_export')}
          </h2>
          <button onClick={onClose} className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary">
            <Icon name="x" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
            {t('shifts_export_subtitle')}
          </div>

          {/* iCal Export */}
          <button
            onClick={generateICalFile}
            className="w-full flex items-center gap-3 p-4 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center">
              <Icon name="calendar" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                {t('shifts_export_ical')}
              </div>
              <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {t('shifts_export_ical_desc')}
              </div>
            </div>
            <Icon name="download" className="text-blue-500" />
          </button>

          {/* WhatsApp Export */}
          <button
            onClick={shareViaWhatsApp}
            className="w-full flex items-center gap-3 p-4 bg-green-500/10 dark:bg-green-500/20 border border-green-500/30 rounded-lg hover:bg-green-500/20 dark:hover:bg-green-500/30 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center">
              <Icon name="message-circle" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                {t('shifts_export_whatsapp')}
              </div>
              <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                {t('shifts_export_whatsapp_desc')}
              </div>
            </div>
            <Icon name="share-2" className="text-green-500" />
          </button>

          {/* QR Code Export */}
          <div className="space-y-2">
            <button
              onClick={generateQRCode}
              className="w-full flex items-center gap-3 p-4 bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 dark:hover:bg-purple-500/30 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-purple-500 text-white rounded-lg flex items-center justify-center">
                <Icon name="qr-code" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {t('shifts_qr_code')}
                </div>
                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  {t('shifts_qr_code_desc')}
                </div>
              </div>
              <Icon name="maximize" className="text-purple-500" />
            </button>

            {qrCodeUrl && (
              <div className="bg-white p-4 rounded-lg flex flex-col items-center gap-3">
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                <button
                  onClick={downloadQRCode}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  <Icon name="download" />
                  {t('shifts_download_qr')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-light-text-primary dark:text-dark-text-primary rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
