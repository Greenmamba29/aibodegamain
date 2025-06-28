import React, { useState } from 'react';
import { Github, Globe, Twitter, MapPin, Building, Users, Star, Download, Calendar, Edit, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useDeveloperStore } from '../../store/developerStore';
import { uploadUserAvatar } from '../../lib/storage';
import { toast } from 'react-hot-toast';

export const ProfileView: React.FC = () => {
  const { profile, updateProfile } = useAuthStore();
  const { apps, stats } = useDeveloperStore();
  const [avatarUploading, setAvatarUploading] = useState(false);

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

  const socialLinks = [
    { icon: Github, label: 'GitHub', url: 'https://github.com/username', color: 'text-gray-700' },
    { icon: Globe, label: 'Website', url: 'https://yourwebsite.com', color: 'text-blue-600' },
    { icon: Twitter, label: 'X (Twitter)', url: 'https://x.com/username', color: 'text-black' },
  ];

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
                <Button variant="outline" icon={Edit} size="sm">
                  Edit Profile
                </Button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Passionate AI developer creating innovative solutions for the future. 
                Specializing in machine learning, computer vision, and natural language processing.
              </p>

              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Building className="w-4 h-4" />
                  <span>AI Innovations Inc.</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{profile?.followers_count || 0} followers</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {socialLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center space-x-1 text-sm hover:underline ${link.color}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </a>
                  );
                })}
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