import React, { useState, useEffect } from 'react';
import { Github, Globe, Twitter, MapPin, Building, Users, Star, Download, Calendar, Edit, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useDeveloperStore } from '../../store/developerStore';
import { uploadUserAvatar } from '../../lib/storage';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile } = useAuthStore();
  const { apps, stats, fetchDeveloperApps, fetchDeveloperStats } = useDeveloperStore();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [userSettings, setUserSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDeveloperApps();
      fetchDeveloperStats();
      fetchUserSettings();
    }
  }, [profile, fetchDeveloperApps, fetchDeveloperStats]);

  const fetchUserSettings = async () => {
    if (!profile) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', profile.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user settings:', error);
        return;
      }
      
      setUserSettings(data);
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setLoading(false);
    }
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

  const handleEditProfile = () => {
    window.location.href = '/settings';
  };

  const getSocialLink = (type: string) => {
    if (!userSettings) return null;
    
    switch (type) {
      case 'github':
        return userSettings.github_url;
      case 'website':
        return userSettings.website_url;
      case 'twitter':
        return userSettings.twitter_handle ? `https://twitter.com/${userSettings.twitter_handle}` : null;
      default:
        return null;
    }
  };

  const achievements = [
    { label: 'Total Downloads', value: stats?.totalDownloads?.toLocaleString() || '0', icon: Download },
    { label: 'Average Rating', value: stats?.averageRating?.toFixed(1) || '0.0', icon: Star },
    { label: 'Total Apps', value: stats?.totalApps || 0, icon: Users },
    { label: 'Member Since', value: new Date(profile?.created_at || '').getFullYear() || '2024', icon: Calendar },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar with Upload */}
            <div className="flex-shrink-0 relative">
              <button
                onClick={() => document.getElementById('profile-avatar-upload')?.click()}
                className="relative group"
                disabled={avatarUploading}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-purple-200 group-hover:ring-purple-300 transition-all"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center ring-4 ring-purple-200 group-hover:ring-purple-300 transition-all">
                    <span className="text-white font-bold text-4xl">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </button>
              <input
                id="profile-avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={avatarUploading}
              />
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{profile?.full_name}</h1>
                <Button 
                  variant="outline" 
                  icon={Edit} 
                  size="sm"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </Button>
              </div>
              
              <p className="text-gray-600 mb-4">
                {loading ? 'Loading...' : (userSettings?.bio || 'No bio provided')}
              </p>

              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                {userSettings?.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{userSettings.location}</span>
                  </div>
                )}
                {userSettings?.company && (
                  <div className="flex items-center space-x-1">
                    <Building className="w-4 h-4" />
                    <span>{userSettings.company}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{profile?.followers_count || 0} followers</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {getSocialLink('github') && (
                  <a
                    href={getSocialLink('github')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm hover:underline text-gray-700"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {getSocialLink('website') && (
                  <a
                    href={getSocialLink('website')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm hover:underline text-blue-600"
                  >
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                  </a>
                )}
                {getSocialLink('twitter') && (
                  <a
                    href={getSocialLink('twitter')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-sm hover:underline text-black"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6 text-center">
                <Icon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{achievement.value}</p>
                <p className="text-sm text-gray-600">{achievement.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Featured Apps */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Featured Apps</h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-40"></div>
                </div>
              ))}
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No apps published yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apps.slice(0, 6).map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                      {app.logo_url ? (
                        <img src={app.logo_url} alt={app.title} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <span className="text-purple-600 font-semibold">{app.title.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{app.title}</h4>
                      <p className="text-sm text-gray-500">{app.category?.name}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{app.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>{app.downloads_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{app.rating_average.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Received 5-star review on "DreamCanvas AI"</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Download className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">100 new downloads this week</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Gained 15 new followers</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};