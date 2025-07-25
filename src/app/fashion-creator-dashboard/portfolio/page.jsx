'use client';

import { useState } from 'react';
import PortfolioManager from '@/components/consultation/PortfolioManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Scissors, TrendingUp, Users, Star, Calendar, Settings, Ruler, Clock } from 'lucide-react';

export default function TailorPortfolioPage() {
  const [activeTab, setActiveTab] = useState('portfolio');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tailor Portfolio</h1>
            <p className="text-indigo-100">
              Showcase your craftsmanship, manage appointments, and grow your tailoring business
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold">48</div>
              <div className="text-sm text-indigo-100">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">4.9</div>
              <div className="text-sm text-indigo-100">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm text-indigo-100">Active Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="portfolio" className="flex items-center space-x-2">
            <Scissors className="h-4 w-4" />
            <span>Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Orders</span>
          </TabsTrigger>
          <TabsTrigger value="consultations" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Consultations</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioManager />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Measurements</CardTitle>
                <Ruler className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">Awaiting customer</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Completed orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹24K</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Current Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Current Orders</CardTitle>
              <CardDescription>Orders currently in progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    id: 'ORD-001', 
                    customer: 'Rajesh Kumar', 
                    item: 'Wedding Suit', 
                    status: 'In Progress', 
                    deadline: '3 days',
                    price: '₹8,500'
                  },
                  { 
                    id: 'ORD-002', 
                    customer: 'Priya Singh', 
                    item: 'Saree Blouse', 
                    status: 'Measurement', 
                    deadline: '1 week',
                    price: '₹2,200'
                  },
                  { 
                    id: 'ORD-003', 
                    customer: 'Amit Sharma', 
                    item: 'Formal Blazer', 
                    status: 'Ready', 
                    deadline: 'Today',
                    price: '₹4,800'
                  },
                  { 
                    id: 'ORD-004', 
                    customer: 'Sneha Patel', 
                    item: 'Party Dress', 
                    status: 'Cutting', 
                    deadline: '5 days',
                    price: '₹3,500'
                  }
                ].map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-sm">{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.customer}</p>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{order.item}</p>
                          <p className="text-xs text-muted-foreground">Due: {order.deadline}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{order.price}</span>
                      <Badge variant={
                        order.status === 'Ready' ? 'default' :
                        order.status === 'In Progress' ? 'secondary' :
                        order.status === 'Measurement' ? 'outline' :
                        'secondary'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultations Tab */}
        <TabsContent value="consultations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Consultations</CardTitle>
                <CardDescription>5 consultations this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { client: 'Vikram Agarwal', type: 'Measurement Session', time: 'Today, 11:00 AM', status: 'confirmed' },
                    { client: 'Meera Joshi', type: 'Design Discussion', time: 'Tomorrow, 2:00 PM', status: 'pending' },
                    { client: 'Arjun Mehta', type: 'Fitting Session', time: 'Wed, 4:00 PM', status: 'confirmed' }
                  ].map((consultation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{consultation.client}</p>
                        <p className="text-xs text-muted-foreground">{consultation.type}</p>
                        <p className="text-xs text-muted-foreground">{consultation.time}</p>
                      </div>
                      <Badge variant={consultation.status === 'confirmed' ? 'default' : 'secondary'}>
                        {consultation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Sessions</CardTitle>
                <CardDescription>Recently completed consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { client: 'Ravi Gupta', type: 'Custom Suit Fitting', date: 'Yesterday', rating: 5 },
                    { client: 'Kavya Reddy', type: 'Lehenga Measurement', date: '2 days ago', rating: 5 },
                    { client: 'Sameer Khan', type: 'Shirt Alteration', date: '3 days ago', rating: 4 }
                  ].map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{session.client}</p>
                        <p className="text-xs text-muted-foreground">{session.type}</p>
                        <p className="text-xs text-muted-foreground">{session.date}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(session.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consultation Stats</CardTitle>
                <CardDescription>Your service performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Sessions</span>
                    <span className="font-bold">238</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Rating</span>
                    <span className="font-bold">4.9/5</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">On-time Delivery</span>
                    <span className="font-bold">96%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Repeat Customers</span>
                    <span className="font-bold">78%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Availability</CardTitle>
                <CardDescription>
                  Manage your working hours and service availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Accept New Orders</p>
                    <p className="text-sm text-muted-foreground">Allow new customer orders</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Online Consultations</p>
                    <p className="text-sm text-muted-foreground">Video/chat consultations</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Home Visits</p>
                    <p className="text-sm text-muted-foreground">Visit customers at home</p>
                  </div>
                  <Button variant="outline" size="sm">Limited</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Pricing</CardTitle>
                <CardDescription>
                  Set your consultation and service rates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Consultation Fee</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">₹</span>
                    <input type="number" className="flex-1 px-3 py-2 border rounded-md" defaultValue="200" />
                    <span className="text-sm text-muted-foreground">per session</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Home Visit Fee</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">₹</span>
                    <input type="number" className="flex-1 px-3 py-2 border rounded-md" defaultValue="500" />
                    <span className="text-sm text-muted-foreground">per visit</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alteration Base Rate</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">₹</span>
                    <input type="number" className="flex-1 px-3 py-2 border rounded-md" defaultValue="150" />
                    <span className="text-sm text-muted-foreground">starting price</span>
                  </div>
                </div>
                <Button className="w-full">Update Pricing</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Specializations</CardTitle>
                <CardDescription>
                  Set your areas of expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Suits', 'Shirts', 'Dresses', 'Sarees',
                    'Lehengas', 'Alterations', 'Formal Wear', 'Traditional Wear'
                  ].map((specialization) => (
                    <label key={specialization} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span className="text-sm">{specialization}</span>
                    </label>
                  ))}
                </div>
                <Button className="w-full">Update Specializations</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
                <CardDescription>
                  Set your available working hours
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { day: 'Monday', enabled: true, start: '09:00', end: '18:00' },
                  { day: 'Tuesday', enabled: true, start: '09:00', end: '18:00' },
                  { day: 'Wednesday', enabled: true, start: '09:00', end: '18:00' },
                  { day: 'Thursday', enabled: true, start: '09:00', end: '18:00' },
                  { day: 'Friday', enabled: true, start: '09:00', end: '18:00' },
                  { day: 'Saturday', enabled: true, start: '10:00', end: '16:00' },
                  { day: 'Sunday', enabled: false, start: '10:00', end: '16:00' }
                ].map((schedule) => (
                  <div key={schedule.day} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked={schedule.enabled} />
                      <span className="text-sm font-medium w-20">{schedule.day}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="time" 
                        defaultValue={schedule.start}
                        className="px-2 py-1 border rounded text-xs"
                        disabled={!schedule.enabled}
                      />
                      <span className="text-xs">to</span>
                      <input 
                        type="time" 
                        defaultValue={schedule.end}
                        className="px-2 py-1 border rounded text-xs"
                        disabled={!schedule.enabled}
                      />
                    </div>
                  </div>
                ))}
                <Button className="w-full">Update Schedule</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
