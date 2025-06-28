import React, { useState, useEffect } from 'react';
import { Save, Upload, Github, Globe, Twitter, MapPin, Building, User, Info, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../store/authStore';
import { uploadUserAvatar } from '../../lib/storage';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

export const DeveloperSettings: React.FC = () => {
  const { profile, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [settings, setSettings] = useState({
    full_name: '',
    bio: '',
    github_url: '',
    website_url: '',
    twitter_handle: '',
    location: '',
    company: '',
    notification_preferences: {
      email: true,
      push: true,
      follows: true,
      reviews: true,
      app_updates: true
    },
    privacy_settings: {
      profile_public: true,
      email_public: false,
      show_followers: true,
      show_github: true
    }
  });

  useEffect(() => {
    if (profile) {
      setSettings(prev => ({
        ...prev,
        full_name: profile.full_name || ''
      }));
      fetchUserSettings();
    }
  }, [profile]);

  const fetchUserSettings = async () => {
    if (!profile) return;
    
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', profile.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        return;
      }
      
      if (data) {
        setUserSettings(data);
        setSettings(prev => ({
          ...prev,
          bio: data.bio || '',
          github_url: data.github_url || '',
          website_url: data.website_url || '',
          twitter_handle: data.twitter_handle || '',
          location: data.location || '',
          company: data.company || '',
          notification_preferences: {
            ...prev.notification_preferences,
            ...(data.notification_preferences || {})
          },
          privacy_settings: {
            ...prev.privacy_settings,
            ...(data.privacy_settings || {})
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [field]: value
      }
    }));
  };

  const handlePrivacyChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      privacy_settings: {
        ...prev.privacy_settings,
        [field]: value
      }
    }));
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    setAvatarUploading(true);
    try {
      const result = await uploadUserAvatar(file, profile.id);
      if (result.error) {
        throw new Error(result.error);
      }

      await updateProfile({ avatar_url: result.url });
      toast.success('Avatar updated successfully!');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error('Error uploading avatar. Please try again.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update profile
      await updateProfile({
        full_name: settings.full_name
      });
      
      // Update user settings
      if (userSettings) {
        const { error } = await supabase
          .from('user_settings')
          .update({
            bio: settings.bio,
            github_url: settings.github_url,
            website_url: settings.website_url,
            twitter_handle: settings.twitter_handle,
            location: settings.location,
            company: settings.company,
            notification_preferences: settings.notification_preferences,
            privacy_settings: settings.privacy_settings
          })
          .eq('user_id', profile?.id);
          
        if (error) throw error;
      } else {
        // Create user settings if they don't exist
        const { error } = await supabase
          .from('user_settings')
          .insert({
            user_id: profile?.id,
            bio: settings.bio,
            github_url: settings.github_url,
            website_url: settings.website_url,
            twitter_handle: settings.twitter_handle,
            location: settings.location,
            company: settings.company,
            notification_preferences: settings.notification_preferences,
            privacy_settings: settings.privacy_settings
          });
          
        if (error) throw error;
      }
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
          <p className="text-gray-600">Update your public profile information</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="relative group"
                disabled={avatarUploading}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-200 group-hover:ring-purple-300 transition-all"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center ring-4 ring-purple-200 group-hover:ring-purple-300 transition-all">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </button>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={avatarUploading}
              />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Profile Picture</h4>
              <p className="text-sm text-gray-600">Click on your avatar to upload a new picture</p>
              {avatarUploading && (
                <p className="text-sm text-purple-600">Uploading...</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="Full Name"
                value={settings.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
              <div className="flex items-center space-x-1 mt-1">
                <Info className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  This is how your name will appear across the platform
                </span>
              </div>
            </div>

            <Input
              label="Email"
              value={profile?.email || ''}
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={settings.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={4}
              placeholder="Tell users about yourself and your development experience..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{settings.bio.length}/500 characters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Location"
              icon={MapPin}
              value={settings.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="City, Country"
            />

            <Input
              label="Company"
              icon={Building}
              value={settings.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Your company or organization"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Social Links</h3>
          <p className="text-gray-600">Add links to your social profiles and websites</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="GitHub Profile"
              icon={Github}
              value={settings.github_url}
              onChange={(e) => handleInputChange('github_url', e.target.value)}
              placeholder="https://github.com/username"
            />

            <Input
              label="Website"
              icon={Globe}
              value={settings.website_url}
              onChange={(e) => handleInputChange('website_url', e.target.value)}
              placeholder="https://yourwebsite.com"
            />

            <Input
              label="X (Twitter) Handle"
              icon={Twitter}
              value={settings.twitter_handle}
              onChange={(e) => handleInputChange('twitter_handle', e.target.value)}
              placeholder="@username"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          <p className="text-gray-600">Choose how you want to be notified</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings.notification_preferences).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {key.replace('_', ' ')} Notifications
                </h4>
                <p className="text-sm text-gray-600">
                  Receive notifications for {key.replace('_', ' ').toLowerCase()}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => handleNotificationChange(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
          <p className="text-gray-600">Control who can see your information</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(settings.privacy_settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {key.replace('_', ' ')}
                </h4>
                <p className="text-sm text-gray-600">
                  Make your {key.replace('_', ' ').toLowerCase()} visible to others
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => handlePrivacyChange(key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          loading={loading}
          icon={Save}
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 hover:from-blue-600 hover:via-purple-600 hover:to-yellow-600"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};