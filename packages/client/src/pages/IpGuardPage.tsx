import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Trash2, Eye, Loader2, FileText, Shield } from 'lucide-react';

// Mock data for IP applications
const mockApplications = [
  { id: 'ip_1', idea: 'AI-Powered Coloring Book', type: 'Copyright', status: 'Filed' },
  { id: 'ip_2', idea: 'Decentralized Social Network', type: 'Patent', status: 'Drafting' },
  { id: 'ip_3', idea: 'IoT Pet Feeder', type: 'Patent', status: 'Under Review' },
];

function IpGuardPage() {
  const [applications, setApplications] = useState(mockApplications);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingApps, setDeletingApps] = useState<Set<string>>(new Set());
  const [newApplication, setNewApplication] = useState({
    idea: '',
    description: '',
    type: 'Copyright' as 'Copyright' | 'Patent' | 'Trademark'
  });

  const handleSubmitApplication = async () => {
    if (!newApplication.idea.trim() || !newApplication.description.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newApp = {
        id: `ip_${Date.now()}`,
        idea: newApplication.idea,
        type: newApplication.type,
        status: 'Drafting'
      };
      
      setApplications(prev => [...prev, newApp]);
      setNewApplication({ idea: '', description: '', type: 'Copyright' });
      setIsDialogOpen(false);
      setIsSubmitting(false);
    }, 2000);
  };

  const handleDeleteApplication = async (appId: string) => {
    setDeletingApps(prev => new Set(prev).add(appId));
    
    setTimeout(() => {
      setApplications(prev => prev.filter(app => app.id !== appId));
      setDeletingApps(prev => {
        const newSet = new Set(prev);
        newSet.delete(appId);
        return newSet;
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">IP Guard</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Start New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New IP Application</DialogTitle>
              <DialogDescription>
                Protect your intellectual property by filing a new application.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="idea">Idea/Invention Name</Label>
                <Input
                  id="idea"
                  value={newApplication.idea}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, idea: e.target.value }))}
                  placeholder="e.g., AI-Powered Task Manager"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Application Type</Label>
                <Select 
                  value={newApplication.type} 
                  onValueChange={(value: 'Copyright' | 'Patent' | 'Trademark') => 
                    setNewApplication(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Copyright">Copyright</SelectItem>
                    <SelectItem value="Patent">Patent</SelectItem>
                    <SelectItem value="Trademark">Trademark</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newApplication.description}
                  onChange={(e) => setNewApplication(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your idea in detail..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSubmitApplication} 
                disabled={isSubmitting || !newApplication.idea.trim() || !newApplication.description.trim()}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Filing...' : 'File Application'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Protect Your Ideas</CardTitle>
          <CardDescription>Draft and track your copyright and patent applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Idea / Invention</TableHead>
                <TableHead>Application Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {app.idea}
                  </TableCell>
                  <TableCell>{app.type}</TableCell>
                  <TableCell>
                    <Badge variant={app.status === 'Filed' ? 'default' : app.status === 'Under Review' ? 'secondary' : 'outline'}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        disabled={deletingApps.has(app.id)}
                        onClick={() => handleDeleteApplication(app.id)}
                      >
                        {deletingApps.has(app.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default IpGuardPage;