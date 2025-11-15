import React from 'react';
import { Icon } from '../common/Icon';

const NotificationSettings: React.FC = () => {
  return (
    <div className="bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg flex items-center gap-2">
      <Icon name="bell" className="w-5 h-5" />
      <p className="font-semibold">
        Οι push ειδοποιήσεις είναι προσωρινά απενεργοποιημένες στο περιβάλλον ανάπτυξης.
      </p>
    </div>
  );
};

export default NotificationSettings;
