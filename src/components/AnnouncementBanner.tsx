import React, { useState, useEffect } from 'react';

interface Announcement {
  message: string;
}

const formatMessage = (message: string) => {
  return message.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      {index < message.split('\n').length - 1 && <br />}
    </React.Fragment>
  ));
};

const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/announcement.json')
      .then(response => response.json())
      .then(data => setAnnouncement(data))
      .catch(err => {
        console.error('Error loading announcement:', err);
        setError('حدث خطأ في تحميل الإعلان');
      });
  }, []);

  if (error || !announcement) return null;

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-4 mt-4">
      {formatMessage(announcement.message)}
    </div>
  );
};

export default AnnouncementBanner;