import  { useState } from 'react';
import { Bell, Download } from 'lucide-react';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  threshold?: number;
}

export function Settings() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([
    {
      id: 'engagement',
      title: 'Alertes d\'engagement',
      description: 'Recevez une notification lorsqu\'un post atteint un certain niveau d\'engagement',
      enabled: true,
      threshold: 1000,
    },
    {
      id: 'followers',
      title: 'Alertes d\'abonnés',
      description: 'Soyez notifié lorsque vous gagnez ou perdez un nombre significatif d\'abonnés',
      enabled: true,
      threshold: 100,
    },
    {
      id: 'comments',
      title: 'Alertes de commentaires',
      description: 'Recevez une notification pour les nouveaux commentaires sur vos posts',
      enabled: false,
    },
  ]);

  const handleToggle = (id: string) => {
    setNotificationSettings(settings =>
      settings.map(setting =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

  const handleThresholdChange = (id: string, value: string) => {
    setNotificationSettings(settings =>
      settings.map(setting =>
        setting.id === id ? { ...setting, threshold: parseInt(value) || 0 } : setting
      )
    );
  };

  const handleExport = (format: 'csv' | 'excel') => {
    // Implement export logic here
    console.log(`Exporting data in ${format} format`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>

        <div className="space-y-6">
          {notificationSettings.map((setting) => (
            <div key={setting.id} className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">{setting.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{setting.description}</p>
                {setting.enabled && setting.threshold !== undefined && (
                  <div className="mt-2">
                    <label className="text-sm text-gray-600">Seuil de déclenchement</label>
                    <input
                      type="number"
                      value={setting.threshold}
                      onChange={(e) => handleThresholdChange(setting.id, e.target.value)}
                      className="ml-2 w-24 px-2 py-1 border rounded"
                    />
                  </div>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={setting.enabled}
                  onChange={() => handleToggle(setting.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-semibold">Exportation des données</h2>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Exporter en CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Exporter en Excel
          </button>
        </div>
      </div>
    </div>
  );
}