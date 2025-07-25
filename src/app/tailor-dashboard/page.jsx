'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Scissors, 
  Package, 
  Users, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Star,
  Plus,
  Eye,
  CheckCircle,
  AlertCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const statsData = [
  {
    title: 'Active Orders',
    value: '12',
    change: '+2 from yesterday',
    trend: 'up',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    title: 'Pending Measurements',
    value: '5',
    change: '-1 from yesterday',
    trend: 'down',
    icon: Users,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    title: 'This Week Revenue',
    value: '$2,840',
    change: '+12% from last week',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    title: 'Customer Rating',
    value: '4.8',
    change: '+0.2 this month',
    trend: 'up',
    icon: Star,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

const recentOrders = [
  {
    id: 'ORD-001',
    customer: 'Rajesh Kumar',
    item: 'Wedding Suit',
    status: 'completed',
    dueDate: '2024-01-20',
    amount: '$450',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: 'ORD-002',
    customer: 'Priya Sharma',
    item: 'Party Dress',
    status: 'in-progress',
    dueDate: '2024-01-25',
    amount: '$280',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: 'ORD-003',
    customer: 'Amit Patel',
    item: 'Business Blazer',
    status: 'measurement',
    dueDate: '2024-01-30',
    amount: '$320',
    avatar: '/api/placeholder/32/32'
  },
  {
    id: 'ORD-004',
    customer: 'Sarah Johnson',
    item: 'Casual Shirts (3)',
    status: 'pending',
    dueDate: '2024-02-05',
    amount: '$180',
    avatar: '/api/placeholder/32/32'
  }
];

const upcomingAppointments = [
  {
    time: '10:00 AM',
    customer: 'John Doe',
    type: 'Measurement',
    duration: '30 min'
  },
  {
    time: '2:30 PM',
    customer: 'Lisa Chen',
    type: 'Fitting',
    duration: '45 min'
  },
  {
    time: '4:00 PM',
    customer: 'Mike Wilson',
    type: 'Consultation',
    duration: '20 min'
  }
];

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800';
    case 'measurement':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4" />;
    case 'in-progress':
      return <Clock className="w-4 h-4" />;
    case 'measurement':
      return <Users className="w-4 h-4" />;
    case 'pending':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

export default function TailorDashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Fashion Creator!</h1>
              <p className="text-blue-100 text-lg">Ready to create something amazing today?</p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-blue-100 text-sm">Today</p>
              <p className="text-xl font-semibold">{currentTime.toLocaleDateString()}</p>
              <p className="text-blue-100">{currentTime.toLocaleTimeString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Scissors className="w-5 h-5" />
              <span>Professional Tailoring Service</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5" />
              <span>4.8 Rating • 150+ Reviews</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`${stat.borderColor} border-l-4 hover:shadow-lg transition-all duration-300`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        <div className="flex items-center mt-2 text-sm">
                          {stat.trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                          )}
                          <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <div className={`${stat.bgColor} ${stat.color} p-3 rounded-xl`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold">Recent Orders</CardTitle>
                  <CardDescription>Track your latest customer orders</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/tailor-dashboard/orders">
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={order.avatar} alt={order.customer} />
                          <AvatarFallback>{order.customer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{order.customer}</p>
                          <p className="text-sm text-gray-500">{order.item}</p>
                          <p className="text-xs text-gray-400">Due: {order.dueDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(order.status)} mb-2`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status.replace('-', ' ')}</span>
                        </Badge>
                        <p className="font-semibold text-gray-900">{order.amount}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Schedule & Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.customer}</p>
                        <p className="text-sm text-gray-600">{appointment.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">{appointment.time}</p>
                        <p className="text-xs text-gray-500">{appointment.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="default">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Order
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Measurement
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/tailor-dashboard/portfolio">
                      <Eye className="w-4 h-4 mr-2" />
                      Manage Portfolio
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Monthly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Orders Completed</span>
                      <span>24/30</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Revenue Goal</span>
                      <span>$8,400/$10,000</span>
                    </div>
                    <Progress value={84} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
