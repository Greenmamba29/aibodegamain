import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { useTranslation } from '../../hooks/useTranslation';
import { TrendingUp, TrendingDown, Users, Download, Star, DollarSign, FileDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

const downloadData = [
  { name: 'Jan', downloads: 400 },
  { name: 'Feb', downloads: 300 },
  { name: 'Mar', downloads: 600 },
  { name: 'Apr', downloads: 800 },
  { name: 'May', downloads: 700 },
  { name: 'Jun', downloads: 900 },
];

const ratingData = [
  { name: 'Jan', rating: 4.2 },
  { name: 'Feb', rating: 4.3 },
  { name: 'Mar', rating: 4.1 },
  { name: 'Apr', rating: 4.5 },
  { name: 'May', rating: 4.4 },
  { name: 'Jun', rating: 4.6 },
];

const categoryData = [
  { name: 'NLP', value: 35, color: '#8B5CF6' },
  { name: 'Computer Vision', value: 25, color: '#3B82F6' },
  { name: 'ML Tools', value: 20, color: '#10B981' },
  { name: 'Data Analysis', value: 15, color: '#F59E0B' },
  { name: 'Other', value: 5, color: '#EF4444' },
];

interface DeveloperAnalyticsProps {
  onExportDownloads: () => void;
}

export const DeveloperAnalytics: React.FC<DeveloperAnalyticsProps> = ({ onExportDownloads }) => {
  const { t } = useTranslation();
  
  const handleExportCSV = () => {
    // Generate CSV data
    const csvData = [
      ['Date', 'App', 'Downloads', 'Revenue'],
      ['2024-06-01', 'DreamCanvas AI', '150', '$105.00'],
      ['2024-06-02', 'TextMind Pro', '200', '$140.00'],
      ['2024-06-03', 'CodeGenius AI', '175', '$122.50'],
      ['2024-06-04', 'VoiceClone Studio', '125', '$87.50'],
      ['2024-06-05', 'DataViz Intelligence', '100', '$70.00'],
      ['2024-06-06', 'MindMate AI', '225', '$157.50'],
      ['2024-06-07', 'DreamCanvas AI', '180', '$126.00'],
    ];
    
    // Convert to CSV string
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'downloads_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(t('csv_download_success'));
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('total_revenue')}</p>
                <p className="text-3xl font-bold text-gray-900">$2,847</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('monthly_downloads')}</p>
                <p className="text-3xl font-bold text-gray-900">1,247</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">+8%</span>
                <span className="text-gray-500 ml-1">vs last month</span>
              </div>
              <button
                onClick={handleExportCSV}
                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                title="Export CSV"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('new_followers')}</p>
                <p className="text-3xl font-bold text-gray-900">89</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-red-600 font-medium">-3%</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('avg_rating')}</p>
                <p className="text-3xl font-bold text-gray-900">4.6</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+0.2</span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Downloads Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{t('downloads_over_time')}</h3>
              <button
                onClick={handleExportCSV}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Export CSV"
              >
                <FileDown className="w-5 h-5" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={downloadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="downloads" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Trend */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">{t('rating_trend')}</h3>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Line type="monotone" dataKey="rating" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">{t('downloads_by_category')}</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Apps */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">{t('top_performing_apps')}</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'AI Image Generator', downloads: 1247, rating: 4.8, revenue: '$1,200' },
              { name: 'Text Summarizer Pro', downloads: 892, rating: 4.6, revenue: '$890' },
              { name: 'Voice Cloner AI', downloads: 654, rating: 4.5, revenue: '$650' },
              { name: 'Code Assistant', downloads: 432, rating: 4.7, revenue: '$430' },
            ].map((app, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">{app.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{app.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{app.downloads} downloads</span>
                      <span className="flex items-center">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                        {app.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{app.revenue}</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};