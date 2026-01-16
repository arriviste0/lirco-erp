'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSettings } from '@/lib/settings-context';

export default function SettingsPage() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();

  if (!settings) {
    return <div>Loading...</div>;
  }

  const handleResetData = async () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      try {
        const response = await fetch('/api/reset', {
          method: 'POST',
        });
        if (response.ok) {
          alert('Data reset successfully!');
        } else {
          alert('Failed to reset data');
        }
      } catch (error) {
        console.error('Error resetting data:', error);
        alert('Error resetting data');
      }
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-8">
      <div>
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="font-headline text-3xl font-semibold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Configure your application preferences and system settings.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color scheme.
                </p>
              </div>
              <Select value={settings.theme} onValueChange={(value) => updateSettings({ theme: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sidebar Collapsed</Label>
                <p className="text-sm text-muted-foreground">
                  Keep the sidebar collapsed by default.
                </p>
              </div>
              <Switch checked={settings.sidebarCollapsed} onCheckedChange={(checked) => updateSettings({ sidebarCollapsed: checked })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Manage your notification preferences. (Coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email.
                </p>
              </div>
              <Switch checked={settings.emailNotifications} onCheckedChange={(checked) => updateSettings({ emailNotifications: checked })} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when items are low in stock.
                </p>
              </div>
              <Switch checked={settings.lowStockAlerts} onCheckedChange={(checked) => updateSettings({ lowStockAlerts: checked })} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Order Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates on order status changes.
                </p>
              </div>
              <Switch checked={settings.orderUpdates} onCheckedChange={(checked) => updateSettings({ orderUpdates: checked })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Preferences</CardTitle>
            <CardDescription>
              Configure system-wide settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value={settings.companyName} onChange={(e) => updateSettings({ companyName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => updateSettings({ timezone: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="utc+0">GMT (UTC+0)</SelectItem>
                    <SelectItem value="utc+1">Central European Time (UTC+1)</SelectItem>
                    <SelectItem value="utc+5:30">India Standard Time (UTC+5:30)</SelectItem>
                    <SelectItem value="utc+8">China Standard Time (UTC+8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select value={settings.currency} onValueChange={(value) => updateSettings({ currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="inr">INR (₹)</SelectItem>
                    <SelectItem value="jpy">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => alert('Settings saved!')}>Save Settings</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reset All Data</Label>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all inventory and order data.
                </p>
              </div>
              <Button variant="destructive" onClick={handleResetData}>Reset Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
