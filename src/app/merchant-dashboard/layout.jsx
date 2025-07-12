'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  MessageSquare, 
  CreditCard,
  Menu,
  X,
  LogOut,
  User,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useRouter, usePathname } from 'next/navigation'
import { AuthProvider } from '@/providers/auth-provider'
import { DashboardProvider } from '@/context/DashboardContext'
import Link from 'next/link'

const sidebarItems = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    href: '/merchant-dashboard',
    color: 'text-blue-600' 
  },
  { 
    icon: Package, 
    label: 'Products', 
    href: '/merchant-dashboard/products',
    color: 'text-green-600' 
  },
  { 
    icon: ShoppingCart, 
    label: 'Orders', 
    href: '/merchant-dashboard/orders',
    color: 'text-orange-600' 
  },
  { 
    icon: BarChart3, 
    label: 'Analytics', 
    href: '/merchant-dashboard/analytics',
    color: 'text-purple-600' 
  },
  { 
    icon: MessageSquare, 
    label: 'Chat', 
    href: '/merchant-dashboard/chat',
    color: 'text-pink-600' 
  },
  { 
    icon: CreditCard, 
    label: 'Payments', 
    href: '/merchant-dashboard/payments',
    color: 'text-emerald-600' 
  }
]

function MerchantDashboard({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Mock user data - replace with your actual user context/state
  const user = {
    name: 'Merchant User',
    email: 'merchant@example.com',
    role: 'Merchant',
    avatar: null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:relative lg:translate-x-0"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h1 className="text-xl font-bold text-gray-900">Merchant Hub</h1>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Profile */}
              <div className="p-4 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{user?.name?.[0] || 'M'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Merchant'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {user?.role || 'Merchant'}
                  </Badge>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <Link key={item.href} href={item.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : item.color}`} />
                        <span className="font-medium">{item.label}</span>
                      </motion.div>
                    </Link>
                  )
                })}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600 hover:bg-red-50"
                  onClick={() => {
                    // Handle logout
                    router.push('/auth/login')
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900">
                {sidebarItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 text-xs p-0 flex items-center justify-center">
                  3
                </Badge>
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.[0] || 'M'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default function MerchantLayout({ children }) {
  return (
    <AuthProvider>
      <DashboardProvider>
        <MerchantDashboard>{children}</MerchantDashboard>
      </DashboardProvider>
    </AuthProvider>
  )
}
