import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, Trash2, ExternalLink, Loader2 } from 'lucide-react';

function DeployPage() {
  const { projects, deployProject, deleteProject } = useApp();
  const [deletingProjects, setDeletingProjects] = useState<Set<string>>(new Set());

  const handleDeploy = async (projectId: string) => {
    await deployProject(projectId);
  };

  const handleDelete = async (projectId: string) => {
    setDeletingProjects(prev => new Set(prev).add(projectId));
    
    // Simulate deletion process
    setTimeout(() => {
      deleteProject(projectId);
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
          {projects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No projects found. Create a project first to deploy it.</p>
            </div>
          ) : (
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
                      <Badge variant={
                        project.deploymentStatus === 'Deployed' ? 'default' : 
                        project.deploymentStatus === 'Error' ? 'destructive' : 
                        project.deploymentStatus === 'Deploying' ? 'secondary' :
                        'outline'
                      }>
                        {project.deploymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {project.deploymentUrl ? (
                        <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => handleVisitSite(project.deploymentUrl!)}
                          className="p-0 h-auto text-blue-600 hover:text-blue-800"
                        >
                          {project.deploymentUrl}
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
                          disabled={project.deploymentStatus === 'Deployed' || project.deploymentStatus === 'Deploying'}
                          onClick={() => handleDeploy(project.id)}
                        >
                          {project.deploymentStatus === 'Deploying' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CloudUpload className="mr-2 h-4 w-4" />
                          )}
                          {project.deploymentStatus === 'Deploying' ? 'Deploying...' : 'Deploy'}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DeployPage;