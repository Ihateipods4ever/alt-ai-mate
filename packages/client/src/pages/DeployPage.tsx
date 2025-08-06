import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CloudUpload } from 'lucide-react';

// Mock data for projects to simulate a real-world scenario
const mockProjects = [
  { id: 'proj_1', name: 'AI Coloring Book', type: 'Web Application', status: 'Deployed', url: 'ai-coloring-book.netlify.app' },
  { id: 'proj_2', name: 'Mobile Task Manager', type: 'Mobile Application', status: 'Ready to Deploy' },
  { id: 'proj_3', name: 'Desktop Data Analyzer', type: 'Desktop Application', status: 'Error' },
  { id: 'proj_4', name: 'IoT Pet Feeder', type: 'Hardware/IoT', status: 'Ready to Deploy' },
];

function DeployPage() {
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
              {mockProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.type}</TableCell>
                  <TableCell>
                    <Badge variant={project.status === 'Deployed' ? 'success' : project.status === 'Error' ? 'destructive' : 'default'}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{project.url || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" disabled={project.status === 'Deployed'}>
                      <CloudUpload className="mr-2 h-4 w-4" />
                      Deploy
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