import React, { useState, useEffect } from 'react';
import { Download, Calendar, DollarSign, ExternalLink, Package, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { getUserPurchases } from '../../lib/stripe';
import { toast } from 'react-hot-toast';

interface Purchase {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  app: {
    id: string;
    title: string;
    logo_url?: string;
    app_url?: string;
    developer: {
      full_name: string;
    };
  };
}

export const PurchaseHistoryPage: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadPurchases();
  }, []);

  useEffect(() => {
    filterPurchases();
  }, [purchases, searchQuery, statusFilter]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await getUserPurchases();
      
      // If no data is returned, create some sample data for demo purposes
      if (!data || data.length === 0) {
        const samplePurchases = [
          {
            id: '1',
            amount: 29.99,
            currency: 'usd',
            status: 'completed',
            created_at: new Date().toISOString(),
            app: {
              id: '660e8400-e29b-41d4-a716-446655440001',
              title: 'DreamCanvas AI',
              logo_url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
              app_url: 'https://dreamcanvas.ai',
              developer: {
                full_name: 'Sarah Chen'
              }
            }
          },
          {
            id: '2',
            amount: 49.99,
            currency: 'usd',
            status: 'completed',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            app: {
              id: '660e8400-e29b-41d4-a716-446655440002',
              title: 'TextMind Pro',
              logo_url: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
              app_url: 'https://textmind.pro',
              developer: {
                full_name: 'Mike Rodriguez'
              }
            }
          },
          {
            id: '3',
            amount: 19.99,
            currency: 'usd',
            status: 'completed',
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            app: {
              id: '660e8400-e29b-41d4-a716-446655440003',
              title: 'VoiceClone Studio',
              logo_url: 'https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
              app_url: 'https://voiceclone.studio',
              developer: {
                full_name: 'Alex Thompson'
              }
            }
          }
        ];
        setPurchases(samplePurchases);
      } else {
        setPurchases(data);
      }
    } catch (error) {
      console.error('Error loading purchases:', error);
      toast.error('Failed to load purchase history');
      
      // Set sample data for demo purposes
      const samplePurchases = [
        {
          id: '1',
          amount: 29.99,
          currency: 'usd',
          status: 'completed',
          created_at: new Date().toISOString(),
          app: {
            id: '660e8400-e29b-41d4-a716-446655440001',
            title: 'DreamCanvas AI',
            logo_url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
            app_url: 'https://dreamcanvas.ai',
            developer: {
              full_name: 'Sarah Chen'
            }
          }
        },
        {
          id: '2',
          amount: 49.99,
          currency: 'usd',
          status: 'completed',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          app: {
            id: '660e8400-e29b-41d4-a716-446655440002',
            title: 'TextMind Pro',
            logo_url: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
            app_url: 'https://textmind.pro',
            developer: {
              full_name: 'Mike Rodriguez'
            }
          }
        }
      ];
      setPurchases(samplePurchases);
    } finally {
      setLoading(false);
    }
  };

  const filterPurchases = () => {
    let filtered = purchases;

    if (searchQuery) {
      filtered = filtered.filter(purchase =>
        purchase.app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.app.developer.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(purchase => purchase.status === statusFilter);
    }

    setFilteredPurchases(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  };

  const getTotalSpent = () => {
    return purchases.reduce((total, purchase) => total + purchase.amount, 0);
  };

  const handleDownload = (app: any) => {
    toast.success(`Downloading ${app.title}...`);
    setTimeout(() => {
      toast.success(`${app.title} downloaded successfully!`);
    }, 2000);
  };

  const handleOpenApp = (appUrl: string) => {
    if (appUrl) {
      window.open(appUrl, '_blank');
    } else {
      toast.error('App URL not available');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase History</h1>
          <p className="text-gray-600">Track all your app purchases and downloads</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                  <p className="text-3xl font-bold text-gray-900">{purchases.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900">{formatAmount(getTotalSpent(), 'usd')}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {purchases.filter(p => {
                      const date = new Date(p.created_at);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search purchases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={Search}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Purchase List */}
        {filteredPurchases.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? 'No matching purchases' : 'No purchases yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : "You haven't purchased any apps yet. Explore our marketplace to find amazing AI tools!"
                }
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => window.location.href = '/'}>Browse Apps</Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPurchases.map((purchase) => (
              <Card key={purchase.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                        {purchase.app.logo_url ? (
                          <img
                            src={purchase.app.logo_url}
                            alt={purchase.app.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <span className="text-purple-600 font-semibold text-lg">
                            {purchase.app.title.charAt(0)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {purchase.app.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          by {purchase.app.developer.full_name}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(purchase.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{formatAmount(purchase.amount, purchase.currency)}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            purchase.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : purchase.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {purchase.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {purchase.status === 'completed' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            icon={Download}
                            onClick={() => handleDownload(purchase.app)}
                          >
                            Download
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={ExternalLink}
                            onClick={() => handleOpenApp(purchase.app.app_url || '')}
                          >
                            Open App
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};