import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Server } from 'lucide-react';

// Mock data for servers
const mockServers = [
  { id: 'srv_1', provider: 'AWS', type: 't2.micro', status: 'Running', region: 'us-east-1' },
  { id: 'srv_2', provider: 'Google Cloud', type: 'e2-medium', status: 'Stopped', region: 'us-central1' },
  { id: 'srv_3', provider: 'Azure', type: 'B1s', status: 'Provisioning', region: 'westus' },
];

function ServersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Servers</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Provision New Server
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Infrastructure</CardTitle>
          <CardDescription>Manage your virtual servers across different cloud providers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Instance Type</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockServers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Server className="h-4 w-4" /> {server.provider}
                  </TableCell>
                  <TableCell>{server.type}</TableCell>
                  <TableCell>{server.region}</TableCell>
                  <TableCell>
                    <Badge variant={server.status === 'Running' ? 'success' : server.status === 'Stopped' ? 'secondary' : 'default'}>
                      {server.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Manage</Button>
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

export default ServersPage;