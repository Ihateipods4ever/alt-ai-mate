import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Rocket, Link as LinkIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

// Mock data for projects
const initialProjects = [
  { id: 'proj_1', name: 'E-commerce Platform', status: 'Live', url: 'e-commerce-platform.codcraft.nexus' },
  { id: 'proj_2', name: 'IoT Smart Thermostat', status: 'Not Deployed', url: null },
  { id: 'proj_3', name: 'Social Media Aggregator', status: 'Error', url: null },
];

/**
 * Phase 4: Deployment & Hosting Page
 * Allows users to manage and "publish" their projects.
 */
function DeployPage() {
  const [projects, setProjects] = useState(initialProjects);
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  // Simulate the deployment process
  const handlePublish = (projectId: string) => {
    setDeployingId(projectId);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setProjects(projs => projs.map(p => 
            p.id === projectId ? { ...p, status: 'Live', url: `${p.name.toLowerCase().replace(/\s+/g, '-')}.codcraft.nexus` } : p
          ));
          setDeployingId(null);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };
  
  const getStatusComponent = (project: typeof initialProjects[0]) => {
     if(deployingId === project.id) {
         return <Progress value={progress} className="w-40 h-2" />;
     }
     
     const statusConfig = {
         'Live': { color: 'text-green-400', text: 'Live' },
         'Error': { color: 'text-red-400', text: 'Error' },
         'Not Deployed': { color: 'text-yellow-400', text: 'Not Deployed' },
     };
     const config = statusConfig[project.status as keyof typeof statusConfig];
     
     return (
        <span className={cn("flex items-center gap-2", config.color)}>
            <span className="h-2 w-2 rounded-full bg-current" />
            {config.text}
        </span>
     )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Deployments</h1>
      
      {/* Deployment Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle>Project Publishing</CardTitle>
          <CardDescription>Manage your project deployments and hosting settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{getStatusComponent(project)}</TableCell>
                  <TableCell>
                    {project.url ? (
                      <a href={`http://${project.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <LinkIcon className="h-4 w-4" />
                        {project.url}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                        size="sm" 
                        onClick={() => handlePublish(project.id)}
                        disabled={!!deployingId || project.status === 'Live'}
                    >
                      <Rocket className="mr-2 h-4 w-4" />
                      {deployingId === project.id ? 'Deploying...' : 'Publish'}
                    </Button>
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