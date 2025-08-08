import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Server, ExternalLink, Trash2, Loader2, Play, Square } from 'lucide-react';

// Mock data for servers
const mockServers = [
  { id: 'srv_1', provider: 'AWS', type: 't2.micro', status: 'Running', region: 'us-east-1', url: 'ec2-123-456-789.compute-1.amazonaws.com' },
  { id: 'srv_2', provider: 'Google Cloud', type: 'e2-medium', status: 'Stopped', region: 'us-central1', url: 'gcp-instance-456.us-central1-a.c.project.internal' },
  { id: 'srv_3', provider: 'Azure', type: 'B1s', status: 'Provisioning', region: 'westus', url: 'azure-vm-789.westus.cloudapp.azure.com' },
];

function ServersPage() {
  const [servers, setServers] = useState(mockServers);
  const [loadingServers, setLoadingServers] = useState<Set<string>>(new Set());
  const [deletingServers, setDeletingServers] = useState<Set<string>>(new Set());

  const handleServerAction = async (serverId: string, action: 'start' | 'stop') => {
    setLoadingServers(prev => new Set(prev).add(serverId));
    
    // Simulate server action
    setTimeout(() => {
      setServers(prev => prev.map(server => 
        server.id === serverId 
          ? { ...server, status: action === 'start' ? 'Running' : 'Stopped' }
          : server
      ));
      setLoadingServers(prev => {
        const newSet = new Set(prev);
        newSet.delete(serverId);
        return newSet;
      });
    }, 2000);
  };

  const handleDeleteServer = async (serverId: string) => {
    setDeletingServers(prev => new Set(prev).add(serverId));
    
    // Simulate deletion process
    setTimeout(() => {
      setServers(prev => prev.filter(server => server.id !== serverId));
      setDeletingServers(prev => {
        const newSet = new Set(prev);
        newSet.delete(serverId);
        return newSet;
      });
    }, 1000);
  };

  const handleVisitServer = (url: string) => {
    window.open(`https://${url}`, '_blank');
  };

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
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.map((server) => (
                <TableRow key={server.id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <Server className="h-4 w-4" /> {server.provider}
                  </TableCell>
                  <TableCell>{server.type}</TableCell>
                  <TableCell>{server.region}</TableCell>
                  <TableCell>
                    <Badge variant={server.status === 'Running' ? 'default' : server.status === 'Stopped' ? 'secondary' : 'outline'}>
                      {loadingServers.has(server.id) ? 'Processing...' : server.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => handleVisitServer(server.url)}
                      className="p-0 h-auto text-blue-600 hover:text-blue-800"
                    >
                      Visit Server
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {server.status === 'Running' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={loadingServers.has(server.id)}
                          onClick={() => handleServerAction(server.id, 'stop')}
                        >
                          {loadingServers.has(server.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </Button>
                      ) : server.status === 'Stopped' ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={loadingServers.has(server.id)}
                          onClick={() => handleServerAction(server.id, 'start')}
                        >
                          {loadingServers.has(server.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                      ) : null}
                      <Button 
                        size="sm" 
                        variant="destructive"
                        disabled={deletingServers.has(server.id)}
                        onClick={() => handleDeleteServer(server.id)}
                      >
                        {deletingServers.has(server.id) ? (
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

export default ServersPage;