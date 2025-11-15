import React, { useState, useEffect } from 'react';
import { Icon } from '../common/Icon';

// This is a dummy VAPID public key. In a real application,
// this would be generated on your server and unique to your application.
const VAPID_PUBLIC_KEY = 'BDI8hB4sBEX_g-h2uS0p244g-vF64u_Y-7yvCdgx0o_B-yJ1d_9A-A3bE2y7NQVv-T-k-c4Z6a1Z2wE';

// Helper function to convert the VAPID key
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const NotificationSettings: React.FC = () => {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(reg => {
          reg.pushManager.getSubscription().then(sub => {
            if (sub) {
              setIsSubscribed(true);
            }
          });
        });
      }
    }
  }, []);

  const subscribeUser = () => {
    navigator.serviceWorker.ready.then(registration => {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      };
      return registration.pushManager.subscribe(subscribeOptions);
    })
    .then(pushSubscription => {
      console.log('Received PushSubscription: ', JSON.stringify(pushSubscription));
      // In a real app, you would send this object to your server to store it.
      setIsSubscribed(true);
      alert('Επιτυχής εγγραφή για ειδοποιήσεις!');
    })
    .catch(err => {
        console.error('Failed to subscribe the user: ', err);
        alert('Η εγγραφή για ειδοποιήσεις απέτυχε.');
    });
  };

  const handleEnableNotifications = async () => {
    const currentPermission = await Notification.requestPermission();
    setPermission(currentPermission);

    if (currentPermission === 'granted') {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered successfully.');
        subscribeUser();
      } catch (err) {
        console.error('Service Worker registration failed: ', err);
      }
    }
  };

  const handleTestNotification = () => {
    if (!('serviceWorker' in navigator)) {
      alert('Service Workers are not supported in this browser.');
      return;
    }
    
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification('Δοκιμή από ChefStack', {
        body: 'Αν βλέπετε αυτό, οι ειδοποιήσεις λειτουργούν!',
        icon: '/chefstack-icon.png',
      });
    }).catch(err => {
        console.error('Showing test notification failed', err);
    });
  };


  if (!isSupported) {
    return (
      <div className="bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg text-center">
        Οι ειδοποιήσεις Push δεν υποστηρίζονται από αυτόν τον browser.
      </div>
    );
  }

  if (permission === 'granted') {
    return (
      <div className="bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Icon name="check-circle-2" className="w-5 h-5"/>
            <span className="font-semibold">Οι ειδοποιήσεις Push είναι ενεργές.</span>
        </div>
        <button onClick={handleTestNotification} className="font-semibold bg-green-200 dark:bg-green-800/80 hover:bg-green-300 dark:hover:bg-green-800 px-3 py-1.5 rounded-full text-sm">
            Αποστολή Δοκιμαστικής Ειδοποίησης
        </button>
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-lg text-center font-semibold">
        Έχετε αποκλείσει τις ειδοποιήσεις. Για να τις ενεργοποιήσετε, αλλάξτε τις ρυθμίσεις του browser σας για αυτή την ιστοσελίδα.
      </div>
    );
  }

  // Default state
  return (
    <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 p-4 rounded-lg flex items-center justify-between">
        <p className="font-semibold">Λάβετε ειδοποιήσεις για σημαντικές ενημερώσεις απευθείας στη συσκευή σας!</p>
        <button onClick={handleEnableNotifications} className="font-bold bg-blue-200 dark:bg-blue-800/80 hover:bg-blue-300 dark:hover:bg-blue-800 px-4 py-2 rounded-full">
            Ενεργοποίηση Ειδοποιήσεων
        </button>
    </div>
  );
};

export default NotificationSettings;