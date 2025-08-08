import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, Trash2, Eye, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useApp } from '@/contexts/AppContext';

/**
 * The main dashboard page.
 * Displays a welcome message and a summary of recent projects.
 */
function DashboardPage() {
  const navigate = useNavigate();
  const { user, projects, deleteProject, setCurrentProject } = useApp();
  const [deletingProjects, setDeletingProjects] = useState<Set<string>>(new Set());

  const handleDeleteProject = async (projectId: string) => {
    setDeletingProjects(prev => new Set(prev).add(projectId));
    
    setTimeout(() => {
      deleteProject(projectId);
      setDeletingProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }, 1000);
  };

  const handleOpenProject = (project: any) => {
    setCurrentProject(project);
    navigate('/app/editor', {
      state: {
        projectType: project.type,
        generatedCode: project.files['src/App.tsx']?.content
      }
    });
  };

  const getProjectTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'web': 'Web Application',
      'mobile': 'Mobile App',
      'desktop': 'Desktop App',
      'hardware': 'Hardware/IoT',
      'game': 'Game',
      'social': 'Social Media',
      'ecommerce': 'E-commerce',
      'api': 'API/Backend',
      'blockchain': 'Blockchain',
      'ai': 'AI/ML',
      'chrome-extension': 'Chrome Extension',
      'chatbot': 'Chatbot',
      'dashboard': 'Dashboard',
      'cms': 'CMS',
      'portfolio': 'Portfolio',
      'blog': 'Blog',
      'landing': 'Landing Page',
      'saas': 'SaaS'
    };
    return typeMap[type] || type;
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome Back, {user?.name || 'Developer'}!</h1>
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
          <CardTitle>Your Projects</CardTitle>
          <CardDescription>
            {projects.length === 0 
              ? "No projects yet. Create your first project to get started!" 
              : `You have ${projects.length} project${projects.length === 1 ? '' : 's'}.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first project</p>
              <Link to="/new-project">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {project.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getProjectTypeDisplay(project.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(project.lastModified).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenProject(project)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          disabled={deletingProjects.has(project.id)}
                          onClick={() => handleDeleteProject(project.id)}
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

export default DashboardPage;