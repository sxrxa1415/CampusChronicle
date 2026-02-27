'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Shield, Bell, Palette, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';

export default function SettingsPage() {
  const { showToast } = useAppStore();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    twoFactor: false,
  });

  const handleSave = () => {
    showToast('Settings saved successfully!', 'success');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 space-y-6">
          {/* Notifications */}
          <div className="space-y-4 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            </div>
            <div className="space-y-3 ml-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-foreground">Enable in-app notifications</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-foreground">Email alerts for important updates</span>
              </label>
            </div>
          </div>

          {/* Appearance */}
          <div className="space-y-4 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
            </div>
            <div className="space-y-3 ml-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-foreground">Dark mode</span>
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4 pb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Security</h2>
            </div>
            <div className="space-y-3 ml-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.twoFactor}
                  onChange={(e) => setSettings({ ...settings, twoFactor: e.target.checked })}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm text-foreground">Two-factor authentication</span>
              </label>
              <Button variant="outline" className="gap-2 mt-2">
                <Lock className="w-4 h-4" />
                Change Password
              </Button>
            </div>
          </div>

          {/* Save */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
