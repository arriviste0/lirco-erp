'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const router = useRouter();
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          bio: data.bio,
        });
        setAvatarUrl(data.avatarUrl || userAvatar?.imageUrl || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, avatarUrl }),
      });
      if (response.ok) {
        alert('Profile saved!');
        fetchProfile(); // Refresh data
      } else {
        alert('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      alert('Avatar updated!');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="space-y-4 pt-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 w-fit hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <Image src="/lirco-logo.jpg" alt="Lirco logo" width={16} height={16} />
              Lirco
            </div>
            <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground">
              Profile
            </h1>
            <p className="text-muted-foreground text-xl leading-relaxed">
              Manage your account settings and preferences.
            </p>
          </div>
        </div>

        {/* Cards Section */}
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="shadow-sm border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
              <CardDescription className="text-base">
                Update your personal details and contact information.
              </CardDescription>
            </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex flex-col items-center gap-6 pb-6 border-b border-border/50">
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-primary/10 shadow-lg">
                  <AvatarImage src={avatarUrl} alt="User avatar" />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/10 to-primary/5">
                    {user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('avatar-input')?.click()}
                    className="h-8 w-8 rounded-full p-0 shadow-md"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                </div>
              </div>
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-sm font-medium text-foreground">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-sm font-medium text-foreground">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="h-11"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="h-11"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-sm font-medium text-foreground">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="min-h-[100px] resize-none"
                />
              </div>
            </div>
            <div className="pt-4">
              <Button
                onClick={handleSave}
                className="w-full sm:w-auto h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-semibold">Account Details</CardTitle>
            <CardDescription className="text-base">
              View your account information and role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-foreground">Role</Label>
                  <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                    {user?.role || 'Administrator'}
                  </Badge>
                </div>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-foreground">Account Status</Label>
                  <Badge variant="default" className="text-sm font-medium px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    {user?.accountStatus || 'Active'}
                  </Badge>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-foreground">Member Since</Label>
                  <p className="text-sm font-medium text-foreground">
                    {user?.memberSince ? new Date(user.memberSince).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'January 2024'}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl border border-border/50">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-foreground">Last Login</Label>
                  <p className="text-sm font-medium text-foreground">
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Today'}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
