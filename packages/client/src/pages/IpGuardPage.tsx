import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from 'lucide-react';

// Mock data for IP applications
const mockApplications = [
  { id: 'ip_1', idea: 'AI-Powered Coloring Book', type: 'Copyright', status: 'Filed' },
  { id: 'ip_2', idea: 'Decentralized Social Network', type: 'Patent', status: 'Drafting' },
  { id: 'ip_3', idea: 'IoT Pet Feeder', type: 'Patent', status: 'Under Review' },
];

function IpGuardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">IP Guard</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Start New Application
        </Button>
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
              {mockApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.idea}</TableCell>
                  <TableCell>{app.type}</TableCell>
                  <TableCell>
                    <Badge variant={app.status === 'Filed' ? 'success' : 'default'}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">View</Button>
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