import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Mock data for IP applications
const initialApplications = [
  { id: 'ip_1', name: 'AI-Powered E-commerce Recommendation Engine', type: 'Patent', status: 'Filed' },
  { id: 'ip_2', name: 'Smart Thermostat UI/UX', type: 'Copyright', status: 'Approved' },
];

/**
 * Phase 6: Intellectual Property Protection Page
 * A dashboard and wizard for managing IP applications.
 */
function IpGuardPage() {
    const [applications, setApplications] = useState(initialApplications);
    const [isOpen, setIsOpen] = useState(false);

    // Simulate submitting a new application
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const newApp = {
            id: `ip_${Date.now()}`,
            name: formData.get('idea_name') as string,
            type: formData.get('app_type') as string,
            status: 'Drafting',
        };
        setApplications(prev => [...prev, newApp]);
        setIsOpen(false);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Approved': return 'text-green-400';
            case 'Filed': return 'text-blue-400';
            case 'Drafting': return 'text-yellow-400';
            default: return 'text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">IP Guard</h1>
                 {/* New Application Wizard Trigger */}
                 <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" />New Application</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New IP Application</DialogTitle>
                            <DialogDescription>Gather information for your Copyright or Patent filing.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="idea_name">Idea / Project Name</Label>
                                <Input id="idea_name" name="idea_name" required/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="idea_description">Idea Description</Label>
                                <Textarea id="idea_description" name="idea_description" required/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="creator_details">Creator Details</Label>
                                <Input id="creator_details" name="creator_details" required/>
                            </div>
                            <div className="space-y-2">
                                <Label>Application Type</Label>
                                <select name="app_type" className="w-full p-2 border rounded-md bg-background">
                                    <option>Patent</option>
                                    <option>Copyright</option>
                                    <option>Trademark</option>
                                </select>
                            </div>
                            <Button type="submit">Save Draft</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* IP Dashboard Table */}
            <Card>
                <CardHeader>
                  <CardTitle>Your Intellectual Property Assets</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Application Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.map((app) => (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium">{app.name}</TableCell>
                                    <TableCell>{app.type}</TableCell>
                                    <TableCell>
                                         <span className={cn("flex items-center gap-2", getStatusClass(app.status))}>
                                            <span className="h-2 w-2 rounded-full bg-current" />
                                            {app.status}
                                        </span>
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