import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  FolderOpen, 
  Server, 
  CreditCard, 
  Shield, 
  Settings, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Download,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

function AdminDashboard() {
  const { user, isMasterAdmin, hasPermission, getAllUsers, getAllProjects, updateUserSubscription } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock data for admin dashboard
  const [systemStats, setSystemStats] = useState({
    totalUsers: 1247,
    activeUsers: 892,
    totalProjects: 3456,
    activeProjects: 2134,
    totalServers: 45,
    runningServers: 38,
    monthlyRevenue: 24567,
    supportTickets: 23
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'user_signup', user: 'john@example.com', timestamp: '2 minutes ago', status: 'success' },
    { id: 2, type: 'project_created', user: 'sarah@example.com', project: 'E-commerce Store', timestamp: '5 minutes ago', status: 'success' },
    { id: 3, type: 'server_deployed', user: 'mike@example.com', server: 'web-app-prod', timestamp: '12 minutes ago', status: 'success' },
    { id: 4, type: 'payment_failed', user: 'anna@example.com', timestamp: '18 minutes ago', status: 'error' },
    { id: 5, type: 'support_ticket', user: 'david@example.com', ticket: 'Deployment Issue', timestamp: '25 minutes ago', status: 'pending' }
  ]);

  const [mockUsers, setMockUsers] = useState([
    { id: '1', email: 'john@example.com', name: 'John Doe', subscription: 'pro', role: 'user', permissions: ['basic_access'], lastActive: '2 hours ago' },
    { id: '2', email: 'sarah@example.com', name: 'Sarah Smith', subscription: 'enterprise', role: 'user', permissions: ['basic_access'], lastActive: '1 day ago' },
    { id: '3', email: 'mike@example.com', name: 'Mike Johnson', subscription: 'free', role: 'user', permissions: ['basic_access'], lastActive: '3 days ago' },
  ]);

  const [mockProjects, setMockProjects] = useState([
    { id: '1', name: 'E-commerce Platform', type: 'web', owner: 'john@example.com', status: 'deployed', createdAt: '2024-01-15', lastModified: '2024-01-20' },
    { id: '2', name: 'Mobile Game', type: 'game', owner: 'sarah@example.com', status: 'development', createdAt: '2024-01-18', lastModified: '2024-01-22' },
    { id: '3', name: 'Social Media App', type: 'social', owner: 'mike@example.com', status: 'testing', createdAt: '2024-01-20', lastModified: '2024-01-21' },
  ]);

  // Check if user has admin access
  if (!isMasterAdmin()) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access the admin dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_signup': return <Users className="h-4 w-4" />;
      case 'project_created': return <FolderOpen className="h-4 w-4" />;
      case 'server_deployed': return <Server className="h-4 w-4" />;
      case 'payment_failed': return <CreditCard className="h-4 w-4" />;
      case 'support_ticket': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'error': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      case 'pending': return <Badge variant="outline"><Activity className="h-3 w-3 mr-1" />Pending</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleUserSubscriptionUpdate = (userId: string, newSubscription: 'free' | 'pro' | 'enterprise') => {
    setMockUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, subscription: newSubscription } : user
    ));
    updateUserSubscription(userId, newSubscription);
  };

  const exportData = (type: string) => {
    const data = type === 'users' ? mockUsers : mockProjects;
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and management tools</p>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <Shield className="h-4 w-4 mr-1" />
          Master Admin
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStats.activeUsers} active this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalProjects.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStats.activeProjects} active projects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Servers</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats.totalServers}</div>
                <p className="text-xs text-muted-foreground">
                  {systemStats.runningServers} running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${systemStats.monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  This month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="font-medium">{activity.user}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.type.replace('_', ' ')} 
                          {activity.project && ` - ${activity.project}`}
                          {activity.server && ` - ${activity.server}`}
                          {activity.ticket && ` - ${activity.ticket}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(activity.status)}
                      <span className="text-sm text-muted-foreground">{activity.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and subscriptions</CardDescription>
                </div>
                <Button onClick={() => exportData('users')} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Users
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers
                    .filter(user => 
                      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      user.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.subscription}
                          onValueChange={(value: 'free' | 'pro' | 'enterprise') => 
                            handleUserSubscriptionUpdate(user.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.lastActive}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Management</CardTitle>
                  <CardDescription>Monitor and manage all user projects</CardDescription>
                </div>
                <Button onClick={() => exportData('projects')} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Projects
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.type}</Badge>
                      </TableCell>
                      <TableCell>{project.owner}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={project.status === 'deployed' ? 'default' : 'secondary'}
                        >
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{project.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Monitor system performance and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>API Response Time</span>
                  <Badge variant="default">125ms</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Database Status</span>
                  <Badge variant="default">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Server Uptime</span>
                  <Badge variant="default">99.9%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Connections</span>
                  <Badge variant="default">1,247</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Actions</CardTitle>
                <CardDescription>Administrative system controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Backup Database
                </Button>
                <Button className="w-full" variant="outline">
                  <Activity className="h-4 w-4 mr-2" />
                  View Logs
                </Button>
                <Button className="w-full" variant="destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency Shutdown
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support Dashboard</CardTitle>
              <CardDescription>Manage support tickets and user assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-red-600">23</div>
                    <p className="text-sm text-muted-foreground">Open Tickets</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-yellow-600">12</div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-600">156</div>
                    <p className="text-sm text-muted-foreground">Resolved Today</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Support Tickets</h3>
                {[
                  { id: 1, user: 'john@example.com', subject: 'Deployment Issue', priority: 'high', status: 'open' },
                  { id: 2, user: 'sarah@example.com', subject: 'Billing Question', priority: 'medium', status: 'in_progress' },
                  { id: 3, user: 'mike@example.com', subject: 'Feature Request', priority: 'low', status: 'open' },
                ].map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">{ticket.user}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={ticket.priority === 'high' ? 'destructive' : ticket.priority === 'medium' ? 'default' : 'secondary'}
                      >
                        {ticket.priority}
                      </Badge>
                      <Badge variant="outline">{ticket.status.replace('_', ' ')}</Badge>
                      <Button size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminDashboard;