"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Loader2, Edit, Trash2 } from "lucide-react";

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit Modal State
  const [editingEmp, setEditingEmp] = useState<any | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/employees");
      const data = await res.json();
      if (res.ok) {
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      username: formData.get("username"),
      password: formData.get("password"),
      name: formData.get("name"),
      nip: formData.get("nip"),
      division: formData.get("division"),
    };

    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create employee");
      }

      setSuccess(`Employee ${payload.name} created successfully!`);
      (e.target as HTMLFormElement).reset();
      fetchEmployees();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (username: string) => {
    if (!window.confirm(`Are you sure you want to delete employee ${username}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/employees?username=${username}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");

      setSuccess(`Employee ${username} deleted.`);
      fetchEmployees();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingEdit(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      oldUsername: editingEmp.username,
      username: formData.get("username"),
      password: formData.get("password"), // only update if provided
      name: formData.get("name"),
      nip: formData.get("nip"),
      division: formData.get("division"),
    };

    try {
      const res = await fetch("/api/admin/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      setSuccess(`Employee ${payload.name} updated successfully!`);
      setEditingEmp(null);
      fetchEmployees();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Employees</h1>
        <p className="text-muted-foreground">
          Create and view employee accounts for your organization.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Create Employee Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Add Employee</CardTitle>
            <CardDescription>Generate a new employee account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nip">Nomor Induk Pegawai</Label>
                <Input id="nip" name="nip" placeholder="19901010..." required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="division">Divisi</Label>
                <Input id="division" name="division" placeholder="IT Development" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" placeholder="john.doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="text" required />
              </div>
              
              {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              {success && <p className="text-sm text-green-600 font-medium">{success}</p>}
              
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? "Creating..." : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Add Employee
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Employee List */}
        <Card className="md:col-span-3 overflow-x-auto">
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : employees.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No employees found. Create one to get started.
              </div>
            ) : (
              <div className="max-h-[500px] overflow-auto border rounded-md relative">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>NIP</TableHead>
                      <TableHead>Divisi</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.map((emp) => (
                      <TableRow key={emp.username}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>{emp.nip}</TableCell>
                        <TableCell>{emp.division}</TableCell>
                        <TableCell>{emp.username}</TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{emp.rawPassword}</TableCell>
                        <TableCell className="text-right space-x-2 whitespace-nowrap">
                          <Button variant="outline" size="icon" onClick={() => setEditingEmp(emp)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDelete(emp.username)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      {editingEmp && (
        <Dialog open={!!editingEmp} onOpenChange={() => setEditingEmp(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Employee: {editingEmp.name}</DialogTitle>
              <DialogDescription>Update employee details or change password.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama</Label>
                <Input id="edit-name" name="name" defaultValue={editingEmp.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nip">Nomor Induk Pegawai</Label>
                <Input id="edit-nip" name="nip" defaultValue={editingEmp.nip} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-division">Divisi</Label>
                <Input id="edit-division" name="division" defaultValue={editingEmp.division} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input id="edit-username" name="username" defaultValue={editingEmp.username} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (leave blank to keep current)</Label>
                <Input id="edit-password" name="password" type="text" placeholder="***" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingEmp(null)}>Cancel</Button>
                <Button type="submit" disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
