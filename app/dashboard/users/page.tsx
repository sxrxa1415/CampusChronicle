"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
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
import { MOCK_DEPARTMENTS } from "@/lib/mock-data";
import type { InstituteUser, InstituteRole } from "@/lib/types";

export default function UserManagementPage() {
  const { currentUser, users, addUser, deleteUser, updateUserAccessControls } = useAppStore();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // New user form state
  const [newU, setNewU] = useState({ name: "", email: "", role: "FACULTY", departmentId: "" });

  if (!currentUser || currentUser.role !== "ADMIN") {
    return <div className="p-8 text-center text-muted-foreground">Access Denied. Admins only.</div>;
  }

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleAddUser = () => {
    if (!newU.name || !newU.email) return;

    const userObj: InstituteUser = {
      id: `u_${Date.now()}`,
      name: newU.name,
      email: newU.email,
      role: newU.role as InstituteRole,
      departmentId: newU.departmentId || undefined,
      avatar: newU.name.substring(0,2).toUpperCase(),
      theme: "light",
      emailNotificationsEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addUser(userObj);
    setIsAddOpen(false);
    setNewU({ name: "", email: "", role: "FACULTY", departmentId: "" });
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
                        {MOCK_DEPARTMENTS.map(d => <SelectItem key={d.id} value={d.id}>{d.code}</SelectItem>)}
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
        {filteredUsers.map(user => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
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
                      {MOCK_DEPARTMENTS.find(d => d.id === user.departmentId)?.code || "Unknown"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select value={user.role} onValueChange={(r) => updateUserAccessControls(user.id, { role: r as InstituteRole })}>
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
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => deleteUser(user.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}
        {filteredUsers.length === 0 && (
          <div className="text-center p-8 text-muted-foreground border border-border rounded-xl">
            No users found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
