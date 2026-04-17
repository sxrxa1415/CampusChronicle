'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Shield, Bell, Palette, Lock, Globe, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';

const INITIAL_SETTINGS = {
  notifications: true,
  emailAlerts: true,
  darkMode: false,
  twoFactor: false,
};

export default function SettingsPage() {
  const { currentUser } = useAppStore();
  const [settings, setSettings] = useState({ ...INITIAL_SETTINGS });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Persist settings via API if available
      if (currentUser) {
        await fetch(`/api/users/${currentUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            emailNotificationsOn: settings.emailAlerts,
            theme: settings.darkMode ? "dark" : "light",
          }),
        });
      }
      toast.success("Settings saved successfully.");
    } catch {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSettings({ ...INITIAL_SETTINGS });
    toast.info("Changes discarded.");
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
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

