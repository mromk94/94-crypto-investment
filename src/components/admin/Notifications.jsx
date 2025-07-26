import React, { useState } from 'react';
import NotificationModal from './NotificationModal';

const NOTIF_FIELDS = [
  { name: 'to', label: 'To', required: true },
  { name: 'type', label: 'Type', required: true },
  { name: 'message', label: 'Message', required: true, type: 'textarea' },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      time: '2025-07-13 16:01',
      to: 'All Users',
      type: 'Alert',
      message: 'Scheduled maintenance at 22:00',
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalNotif, setModalNotif] = useState({});

  function handleSend(notif) {
    setNotifications([
      { ...notif, time: new Date().toISOString().replace('T', ' ').slice(0, 16) },
      ...notifications,
    ]);
    setModalOpen(false);
  }
  return (
    <section className="py-8">
      <h2 className="text-3xl font-extrabold mb-6 text-accent">Notifications</h2>
      <NotificationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSend={handleSend}
        initial={modalNotif}
        title="Send Notification"
        fields={NOTIF_FIELDS}
      />
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl">
        <p className="text-gray-400 mb-4">Send notifications to users or admins, and view system alerts.</p>
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <button className="bg-accent text-gray-900 font-bold px-4 py-2 rounded-lg shadow hover:bg-sui transition" onClick={() => setModalOpen(true)}>Send Notification</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-accent/20">
            <thead>
              <tr className="text-accent text-left">
                <th className="py-2 px-2">Time</th>
                <th className="py-2 px-2">To</th>
                <th className="py-2 px-2">Type</th>
                <th className="py-2 px-2">Message</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notif, idx) => (
                <tr key={idx} className="hover:bg-accent/10">
                  <td className="py-2 px-2">{notif.time}</td>
                  <td className="py-2 px-2">{notif.to}</td>
                  <td className="py-2 px-2">{notif.type}</td>
                  <td className="py-2 px-2">{notif.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
