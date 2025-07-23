import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

// Mock data for servers
const initialServers = [
    { id: 'srv_1', provider: 'AWS', type: 'General Purpose', specs: 't3.micro', status: 'Running' },
    { id: 'srv_2', provider: 'Google Cloud', type: 'Database', specs: 'db-n1-standard-1', status: 'Running' },
    { id: 'srv_3', provider: 'Azure', type: 'Caching', specs: 'Standard C0', status: 'Stopped' },
];

/**
 * Phase 5: Infrastructure & Server Management Page
 * A dashboard to create and manage virtual servers.
 */
function ServersPage() {
    const [servers, setServers] = useState(initialServers);
    const [isCreating, setIsCreating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Simulate the server creation process
    const handleCreateServer = () => {
        setIsCreating(true);
        setTimeout(() => {
            const newServer = {
                id: `srv_${Date.now()}`,
                provider: 'AWS',
                type: 'General Purpose',
                specs: 't4g.nano',
                status: 'Provisioning',
            };
            setServers(prev => [...prev, newServer]);
            setIsCreating(false);
            setIsOpen(false);

            // Simulate provisioning completion
            setTimeout(() => {
                setServers(prev => prev.map(s => s.id === newServer.id ? { ...s, status: 'Running' } : s));
            }, 4000);
        }, 2000);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Running': return 'text-green-400';
            case 'Stopped': return 'text-muted-foreground';
            case 'Provisioning': return 'text-blue-400 animate-pulse';
            default: return 'text-yellow-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Server Infrastructure</h1>
                {/* New Server Creation Wizard Trigger */}
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" />New Server</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a New Server</DialogTitle>
                            <DialogDescription>Provision a new virtual server in a few clicks.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                            {/* Step 1: Choose Provider */}
                            <div className="space-y-2">
                                <Label>Cloud Provider</Label>
                                <RadioGroup defaultValue="aws" className="flex gap-4">
                                    <Label className="border p-4 rounded-md has-[input:checked]:border-primary flex-1 cursor-pointer">
                                        <RadioGroupItem value="aws" id="aws" className="sr-only"/> AWS
                                    </Label>
                                    <Label className="border p-4 rounded-md has-[input:checked]:border-primary flex-1 cursor-pointer">
                                        <RadioGroupItem value="gcp" id="gcp" className="sr-only"/> Google Cloud
                                    </Label>
                                    <Label className="border p-4 rounded-md has-[input:checked]:border-primary flex-1 cursor-pointer">
                                        <RadioGroupItem value="azure" id="azure" className="sr-only"/> Azure
                                    </Label>
                                </RadioGroup>
                            </div>
                             {/* Step 2: Choose Server Type */}
                            <div className="space-y-2">
                                <Label>Server Type</Label>
                                <RadioGroup defaultValue="general" className="grid grid-cols-2 gap-4">
                                     <Label className="border p-4 rounded-md has-[input:checked]:border-primary cursor-pointer">
                                        <RadioGroupItem value="general" id="general" className="sr-only"/> General Purpose
                                    </Label>
                                    <Label className="border p-4 rounded-md has-[input:checked]:border-primary cursor-pointer">
                                        <RadioGroupItem value="database" id="database" className="sr-only"/> Database
                                    </Label>
                                    <Label className="border p-4 rounded-md has-[input:checked]:border-primary cursor-pointer">
                                        <RadioGroupItem value="caching" id="caching" className="sr-only"/> Caching
                                    </Label>
                                </RadioGroup>
                            </div>
                        </div>
                        <Button onClick={handleCreateServer} disabled={isCreating}>
                            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Deploy Server
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Server Dashboard Table */}
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Provider</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Specs</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {servers.map((server) => (
                                <TableRow key={server.id}>
                                    <TableCell className="font-medium">{server.provider}</TableCell>
                                    <TableCell>{server.type}</TableCell>
                                    <TableCell>{server.specs}</TableCell>
                                    <TableCell>
                                        <span className={cn("flex items-center gap-2", getStatusClass(server.status))}>
                                            <span className="h-2 w-2 rounded-full bg-current" />
                                            {server.status}
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

export default ServersPage;