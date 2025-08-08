import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, Trash2, ExternalLink, Loader2 } from 'lucide-react';

// Mock data for projects to simulate a real-world scenario
const mockProjects = [
  { id: 'proj_1', name: 'AI Coloring Book', type: 'Web Application', status: 'Deployed', url: 'ai-coloring-book.netlify.app' },
  { id: 'proj_2', name: 'Mobile Task Manager', type: 'Mobile Application', status: 'Ready to Deploy' },
  { id: 'proj_3', name: 'Desktop Data Analyzer', type: 'Desktop Application', status: 'Error' },
  { id: 'proj_4', name: 'IoT Pet Feeder', type: 'Hardware/IoT', status: 'Ready to Deploy' },
];

function DeployPage() {
  const [projects, setProjects] = useState(mockProjects);
  const [deployingProjects, setDeployingProjects] = useState<Set<string>>(new Set());
  const [deletingProjects, setDeletingProjects] = useState<Set<string>>(new Set());

  const handleDeploy = async (projectId: string) => {
    setDeployingProjects(prev => new Set(prev).add(projectId));
    
    // Simulate deployment process
    setTimeout(() => {
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, status: 'Deployed', url: `${project.name.toLowerCase().replace(/\s+/g, '-')}.netlify.app` }
          : project
      ));
      setDeployingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }, 3000);
  };

  const handleDelete = async (projectId: string) => {
    setDeletingProjects(prev => new Set(prev).add(projectId));
    
    // Simulate deletion process
    setTimeout(() => {
      setProjects(prev => prev.filter(project => project.id !== projectId));
      setDeletingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }, 1000);
  };

  const handleVisitSite = (url: string) => {
    window.open(`https://${url}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Deployments</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Your Projects</CardTitle>
          <CardDescription>Deploy your generated applications to the cloud with a single click.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.type}</TableCell>
                  <TableCell>
                    <Badge variant={project.status === 'Deployed' ? 'default' : project.status === 'Error' ? 'destructive' : 'secondary'}>
                      {deployingProjects.has(project.id) ? 'Deploying...' : project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.url ? (
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => handleVisitSite(project.url!)}
                        className="p-0 h-auto text-blue-600 hover:text-blue-800"
                      >
                        {project.url}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button 
                        size="sm" 
                        disabled={project.status === 'Deployed' || deployingProjects.has(project.id)}
                        onClick={() => handleDeploy(project.id)}
                      >
                        {deployingProjects.has(project.id) ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CloudUpload className="mr-2 h-4 w-4" />
                        )}
                        {deployingProjects.has(project.id) ? 'Deploying...' : 'Deploy'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        disabled={deletingProjects.has(project.id)}
                        onClick={() => handleDelete(project.id)}
                      >
                        {deletingProjects.has(project.id) ? (
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

export default DeployPage;