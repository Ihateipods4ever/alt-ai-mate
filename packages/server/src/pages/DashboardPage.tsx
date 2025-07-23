import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * The main dashboard page.
 * Displays a welcome message and a summary of recent projects.
 */
function DashboardPage() {
  // Mock data for recent projects
  const recentProjects = [
    { id: 'proj_1', name: 'E-commerce Platform', type: 'Web App', status: 'Live' },
    { id: 'proj_2', name: 'IoT Smart Thermostat', type: 'Hardware/IoT', status: 'Not Deployed' },
    { id: 'proj_3', name: 'Social Media Aggregator', type: 'Mobile App', status: 'Error' },
    { id: 'proj_4', name: 'Desktop Photo Editor', type: 'Desktop App', status: 'Live' },
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Live':
        return 'text-green-400';
      case 'Error':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome Back, Developer!</h1>
          <p className="text-muted-foreground">Here's a snapshot of your development ecosystem.</p>
        </div>
        <Link to="/new-project">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4"/>
                New Project
            </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>A quick look at your most recent creations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.type}</TableCell>
                  <TableCell>
                    <span className={cn("flex items-center gap-2", getStatusClass(project.status))}>
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {project.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link to="/editor"><Button variant="outline" size="sm">Open Editor</Button></Link>
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

export default DashboardPage;