import React, { useState, useEffect } from 'react'
import { Download, Calendar, DollarSign, ExternalLink, Package } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { getUserPurchases } from '../../lib/stripe'

interface Purchase {
  id: string
  amount: number
  currency: string
  status: string
  created_at: string
  app: {
    id: string
    title: string
    logo_url?: string
    developer: {
      full_name: string
    }
  }
}

export const PurchaseHistory: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPurchases()
  }, [])

  const loadPurchases = async () => {
    try {
      const data = await getUserPurchases()
      setPurchases(data)
    } catch (error) {
      console.error('Error loading purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-xl h-24"></div>
          </div>
        ))}
      </div>
    )
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Purchases Yet</h3>
        <p className="text-gray-600 mb-6">You haven't purchased any apps yet. Explore our marketplace to find amazing AI tools!</p>
        <Button>Browse Apps</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Purchase History</h2>
        <div className="text-sm text-gray-500">
          {purchases.length} purchase{purchases.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="space-y-4">
        {purchases.map((purchase) => (
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
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ExternalLink}
                  >
                    Open App
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}