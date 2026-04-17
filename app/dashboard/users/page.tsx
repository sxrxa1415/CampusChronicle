"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { ApiUser, ApiDepartment } from "@/lib/api-client";
import { 
  Users, Search, Trash2, Edit, Plus, Mail, Building2, UserCog
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

export default function UserManagementPage() {
  const { currentUser } = useAppStore();
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New user form state
  const [newU, setNewU] = useState({ name: "", email: "", password: "", role: "FACULTY", departmentId: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        api.getUsers(),
        api.getDepartments(),
      ]);
      if (usersRes.success && usersRes.data) setUsers(usersRes.data);
      if (deptsRes.success && deptsRes.data) setDepartments(deptsRes.data);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => { setCurrentPage(1); }, [search, roleFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchSearch = !search || user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (!currentUser || currentUser.role !== "ADMIN") {
    return <div className="p-8 text-center text-muted-foreground">Access Denied. Admins only.</div>;
  }

  if (loading) return <DashboardSkeleton />;

  const handleAddUser = async () => {
    if (!newU.name || !newU.email || !newU.password) {
      toast.error("Name, email, and password are required.");
      return;
    }

    try {
      const result = await api.createUser({
        name: newU.name,
        email: newU.email,
        password: newU.password,
        role: newU.role,
        departmentId: newU.departmentId || undefined,
      });

      if (result.success) {
        toast.success(result.message || `User ${newU.name} created.`);
        setIsAddOpen(false);
        setNewU({ name: "", email: "", password: "", role: "FACULTY", departmentId: "" });
        fetchUsers();
      } else {
        toast.error(result.message || "Failed to create user.");
      }
    } catch {
      toast.error("Failed to create user.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Global User Management</h2>
          <p className="text-sm text-muted-foreground">Add, remove, or change roles of institute personnel.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 gap-2"><Plus className="w-4 h-4" /> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User Entity</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={newU.name} onChange={e => setNewU(f => ({...f, name: e.target.value}))} placeholder="Dr. John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={newU.email} onChange={e => setNewU(f => ({...f, email: e.target.value}))} placeholder="john@institute.edu" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={newU.password} onChange={e => setNewU(f => ({...f, password: e.target.value}))} placeholder="Min 6 characters" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={newU.role} onValueChange={r => setNewU(f => ({...f, role: r}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="REVIEWER">Reviewer (Office)</SelectItem>
                      <SelectItem value="DEPARTMENT_HEAD">HOD</SelectItem>
                      <SelectItem value="FACULTY">Faculty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {["DEPARTMENT_HEAD", "FACULTY"].includes(newU.role) && (
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={newU.departmentId} onValueChange={d => setNewU(f => ({...f, departmentId: d}))}>
                      <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                      <SelectContent>
                        {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.code}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <Button onClick={handleAddUser} className="w-full mt-4">Confirm Creation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <UserCog className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Filter Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="REVIEWER">Reviewer</SelectItem>
            <SelectItem value="DEPARTMENT_HEAD">HOD</SelectItem>
            <SelectItem value="FACULTY">Faculty</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3">
        {paginatedUsers.map(user => (
          <div 
            key={user.id} 
            className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                {user.avatar}
              </div>
              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  {user.name}
                  {user.id === currentUser.id && <Badge variant="secondary" className="text-[10px] h-4">You</Badge>}
                </h3>
                <div className="flex items-center text-xs text-muted-foreground gap-3 mt-1">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                  {user.departmentId && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> 
                      {departments.find(d => d.id === user.departmentId)?.code || "Unknown"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={user.role} onValueChange={async (r) => { 
                try {
                  const res = await api.updateUser(user.id, { role: r });
                  if (res.success) {
                    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: r } : u));
                    toast.success(`Role updated to ${r.replace("_", " ")}`);
                  } else {
                    toast.error(res.message || "Failed to update role.");
                  }
                } catch {
                  toast.error("Failed to update role.");
                }
              }}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="REVIEWER">Reviewer</SelectItem>
                  <SelectItem value="DEPARTMENT_HEAD">HOD</SelectItem>
                  <SelectItem value="FACULTY">Faculty</SelectItem>
                </SelectContent>
              </Select>

              {user.id !== currentUser.id && (
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={async () => {
                  try {
                    const result = await api.deleteUser(user.id);
                    if (result.success) {
                      toast.success(`User ${user.name} deleted.`);
                      fetchUsers();
                    } else {
                      toast.error(result.message || "Delete failed.");
                    }
                  } catch {
                    toast.error("Delete failed.");
                  }
                }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center p-8 text-muted-foreground border border-border rounded-xl">
            No users found matching your filters.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 pb-8">
          <p className="text-xs font-medium text-muted-foreground">
            Showing <span className="text-foreground">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-foreground">{Math.min(currentPage * pageSize, filteredUsers.length)}</span> of <span className="text-foreground">{filteredUsers.length} users</span>
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" size="sm" className="h-8 font-bold uppercase text-[10px] tracking-wider"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button 
                  key={i} 
                  variant={currentPage === i + 1 ? "default" : "outline"} 
                  size="sm" 
                  className="h-8 w-8 p-0 text-xs font-bold"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
            </div>
            <Button 
              variant="outline" size="sm" className="h-8 font-bold uppercase text-[10px] tracking-wider"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
