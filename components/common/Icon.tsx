import React from 'react';

// A huge list of all icons used in the app, generated from lucide-react.
// In a real app, we would use a library or tree-shake this.
export type IconName =
  | 'loader-2'
  | 'book-open'
  | 'plus'
  | 'search'
  | 'list'
  | 'layout-grid'
  | 'check-square'
  | 'square'
  | 'clock'
  | 'servings'
  | 'arrow-left'
  | 'printer'
  | 'edit'
  | 'trash-2'
  | 'sparkles'
  | 'globe'
  | 'warning'
  | 'alert-circle'
  | 'x'
  | 'upload-cloud'
  | 'clipboard-list'
  | 'package'
  | 'thermometer'
  | 'shopping-cart'
  | 'clipboard-check'
  | 'calendar'
  | 'scale'
  | 'truck'
  | 'bell'
  | 'settings'
  | 'users'
  | 'sun'
  | 'moon'
  | 'image'
  | 'save'
  | 'phone-off'
  | 'link'
  | 'check-circle-2'
  | 'circle'
  | 'check'
  | 'phone'
  | 'phone-incoming'
  | 'mic'
  | 'mic-off'
  | 'video'
  | 'video-off'
  | 'send'
  | 'qr-code'
  | 'arrow-right-left'
  | 'layout-dashboard'
  | 'file-up'
  | 'history'
  | 'trending-up'
  | 'trending-down'
  | 'help-circle'
  | 'thumbs-up'
  | 'thumbs-down'
  | 'key'
  | 'eye'
  | 'eye-off'
  | 'star'
  | 'copy'
  | 'euro'
  | 'filter'
  | 'utensils'
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-right'
  | 'play'
  | 'pause';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const ICONS: Record<IconName, React.ReactNode> = {
    'loader-2': <path d="M21 12a9 9 0 1 1-6.219-8.56" />,
    'book-open': <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>,
    'plus': <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    'search': <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    'list': <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    'layout-grid': <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
    'check-square': <><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>,
    'square': <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />,
    'clock': <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    'servings': <><path d="M2 12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3Z" /><path d="M22 17H2" /><path d="m5 17 1.29-2.58a1 1 0 0 1 .9-.42h8.62a1 1 0 0 1 .9.42L19 17" /></>,
    'arrow-left': <><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>,
    'printer': <><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></>,
    'edit': <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    'trash-2': <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></>,
    'sparkles': <path d="m12 3-1.9 1.9-1.9-1.9-1.9 1.9L4.4 3l1.9 1.9-1.9 1.9 1.9 1.9-1.9 1.9 1.9 1.9 1.9-1.9 1.9 1.9 1.9-1.9 1.9 1.9 1.9-1.9-1.9-1.9 1.9-1.9-1.9-1.9 1.9-1.9Z"/>,
    'globe': <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
    'warning': <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
    'alert-circle': <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
    'x': <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    'upload-cloud': <><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></>,
    'clipboard-list': <><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></>,
    'package': <><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></>,
    'thermometer': <><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" /></>,
    'shopping-cart': <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>,
    'clipboard-check': <><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="m9 14 2 2 4-4" /></>,
    'calendar': <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
    'scale': <><path d="m16 16-4-4-4 4" /><path d="M12 20v-8" /><path d="M4 13.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5.5" /><path d="M7.5 13.5h9" /><path d="M21.12 6.16a2.38 2.38 0 0 0-3.36 0L3 18" /><path d="M17.76 2.82a2.38 2.38 0 0 0-3.36 0L3 14.18" /></>,
    'truck': <><path d="M10 17h4V5H2v12h3" /><path d="M22 17h-4.32a1 1 0 0 1-.95-.68l-1.42-3.22a1 1 0 0 0-.95-.67H10V5h10v12h2Z" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></>,
    'bell': <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    'settings': <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></>,
    'users': <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    'sun': <><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></>,
    'moon': <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
    'image': <><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></>,
    'save': <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></>,
    'phone-off': <><path d="M10.68 13.31a16 16 0 0 0 3.41 3.41l3.17-3.17a2 2 0 0 1 2.83 2.83l-1.83 1.83a16 16 0 0 1-7.07 3.53l-2.5-2.5a16 16 0 0 1 3.53-7.07l-1.83-1.83a2 2 0 0 1 2.83-2.83z" /><path d="M22 2 2 22" /></>,
    'link': <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" /></>,
    'check-circle-2': <><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="m9 12 2 2 4-4" /></>,
    'circle': <circle cx="12" cy="12" r="10" />,
    'check': <polyline points="20 6 9 17 4 12" />,
    'phone': <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
    'phone-incoming': <><polyline points="16 2 16 8 22 8" /><line x1="22" y1="16.92" x2="22" y2="16.92"/><path d="M16.92 22a2 2 0 0 1-2-2.18 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2.11 2H5a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v0Z"/></>,
    'mic': <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></>,
    'mic-off': <><line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M12 19v4"/><path d="M12 1a3 3 0 0 0-3 3v6.34"/><path d="M9 9a3 3 0 0 0 5.12 2.12"/></>,
    'video': <><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2" ry="2"/></>,
    'video-off': <><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/><path d="M22 8v8"/><path d="m2 2 20 20"/><path d="M14 8h2a2 2 0 0 1 2 2v2"/></>,
    'send': <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    'qr-code': <><rect x="3" y="3" width="7" height="7"/><path d="M7 17v-4h4"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M17 17v-4h4"/></>,
    'arrow-right-left': <><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></>,
    'layout-dashboard': <><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></>,
    'file-up': <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 12v6" /><path d="m15 15-3-3-3 3" /></>,
    'history': <><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/></>,
    'trending-up': <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
    'trending-down': <><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" /></>,
    'help-circle': <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></>,
    'thumbs-up': <><path d="M7 10v12" /><path d="M18 10V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v6H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2.76a2 2 0 0 1 1.79 1.11L12 22h7a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-3z" /></>,
    'thumbs-down': <><path d="M17 14V2" /><path d="M6 14v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2.76a2 2 0 0 1-1.79-1.11L12 2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1z" /></>,
    'key': <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />,
    'eye': <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    'eye-off': <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></>,
    'star': <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>,
    'copy': <><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    'euro': <><path d="M4 10h12" /><path d="M4 14h9" /><path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12a7.9 7.9 0 0 0 7.8 8 7.7 7.7 0 0 0 5.2-2" /></>,
    'filter': <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></>,
    'utensils': <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></>,
    'arrow-up': <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>,
    'arrow-down': <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>,
    'arrow-right': <><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>,
    'play': <polygon points="5 3 19 12 5 21 5 3" />,
    'pause': <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>,
  };

export const Icon: React.FC<IconProps> = ({ name, className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {ICONS[name]}
    </svg>
  );
};