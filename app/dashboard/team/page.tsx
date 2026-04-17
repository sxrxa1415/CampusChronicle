"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";
import type { ApiDepartment } from "@/lib/api-client";
import { 
  ShieldCheck, Users, Search, Filter, ShieldAlert
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";

interface StudentItem {
  id: string;
  name: string;
  rollNo: string;
  departmentId: string;
}

export default function TeamAccessPage() {
  const { currentUser, updateUserAccessControls } = useAppStore();
  const [departments, setDepartments] = useState<ApiDepartment[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const [deptRes, userRes] = await Promise.all([
        api.getDepartments(),
        api.getUsers()
      ]);
      if (deptRes.success && deptRes.data) setDepartments(deptRes.data);
      if (userRes.success && userRes.data) setUsers(userRes.data);

      if (currentUser?.role === "DEPARTMENT_HEAD" && currentUser.departmentId) {
        const detailRes = await api.getDepartment(currentUser.departmentId);
        if (detailRes.success && (detailRes.data as any)?.students) {
          setStudents((detailRes.data as any).students);
        }
      }
    } catch {
      toast.error("Failed to load access map data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchData();
  }, [currentUser?.role, currentUser?.departmentId]);

  const isAdmin = currentUser?.role === "ADMIN";
  const isHOD = currentUser?.role === "DEPARTMENT_HEAD";

  const targetUsers = users.filter(u => {
    const matchesRole = isAdmin ? u.role === "REVIEWER" : (isHOD && u.role === "FACULTY" && u.departmentId === currentUser?.departmentId);
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const toggleDept = async (userId: string, currentDepts: string[] = [], deptId: string) => {
    const dept = departments.find(d => d.id === deptId);
    const targetUser = users.find(u => u.id === userId);
    const newDepts = currentDepts.includes(deptId) 
      ? currentDepts.filter(id => id !== deptId)
      : [...currentDepts, deptId];
    
    // Update local state for live UI feedback
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, attachedDepartmentIds: newDepts } : u));
    updateUserAccessControls(userId, { attachedDepartmentIds: newDepts });
    
    try {
      const res = await api.updateUser(userId, { attachedDepartmentIds: newDepts });
      if (!res.success) {
        toast.error("Persistence error", { description: "Department mapping update failed on server." });
        // Rollback on failure
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, attachedDepartmentIds: currentDepts } : u));
      } else {
        toast.success(`Access Updated`, {
          description: `${dept?.code || 'Department'} ${currentDepts.includes(deptId) ? 'removed from' : 'assigned to'} ${targetUser?.name.split(' ')[0]}.`
        });
      }
    } catch {
      toast.error("Network error during mapping.");
    }
  };

  const toggleMentee = async (userId: string, currentMentees: string[] = [], studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const targetUser = users.find(u => u.id === userId);
    const newMentees = currentMentees.includes(studentId)
      ? currentMentees.filter(id => id !== studentId)
      : [...currentMentees, studentId];
    
    // Update local state for live UI feedback
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, menteeIds: newMentees } : u));
    updateUserAccessControls(userId, { menteeIds: newMentees });

    try {
      const res = await api.updateUser(userId, { menteeIds: newMentees });
      if (!res.success) {
        toast.error("Persistence error", { description: "Mentee mapping update failed on server." });
        // Rollback on failure
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, menteeIds: currentMentees } : u));
      } else {
        toast.success(`Mentee Mapping`, {
          description: `Student ${student?.rollNo || 'Record'} ${currentMentees.includes(studentId) ? 'unlinked from' : 'assigned to'} ${targetUser?.name.split(' ')[0]}.`
        });
      }
    } catch {
      toast.error("Network error during mapping.");
    }
  };

  const pageSize = 6;
  const totalPages = Math.ceil(targetUsers.length / pageSize);
  const paginatedUsers = targetUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "DEPARTMENT_HEAD")) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border text-center">
        <ShieldAlert className="w-16 h-16 text-destructive/40 mb-4" />
        <h3 className="text-xl font-black text-foreground">Access Restricted</h3>
        <p className="text-sm text-muted-foreground mt-2">Only Academic Administrators or HODs can modify these identity mappings.</p>
      </div>
    );
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Identity Mapping</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAdmin ? "Govern cross-department audit access for assigned reviewers." : "Align faculty members with their specific student mentee portfolios."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search personnel..." 
              className="pl-9 w-64 h-10 rounded-xl bg-card border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {paginatedUsers.map((user) => (
          <div key={user.id} className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm group hover:border-primary/30 transition-all duration-300">
            <div className="flex flex-col lg:flex-row">
              {/* User Info Section */}
              <div className="p-6 lg:w-1/3 border-b lg:border-b-0 lg:border-r border-border bg-muted/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-lg text-primary shadow-sm uppercase">
                    {user.avatar || user.name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-foreground leading-none">{user.name}</h3>
                    <p className="text-xs text-muted-foreground mt-2 font-medium">{user.email}</p>
                    <Badge variant="secondary" className="mt-3 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white border border-border">
                      {user.role.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Current Mapping Display */}
              <div className="p-6 lg:w-1/3 bg-white">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-4">Active Portfolio</span>
                <div className="flex flex-wrap gap-2">
                  {isAdmin ? (
                    (user.attachedDepartmentIds || []).length > 0 ? (
                      (user.attachedDepartmentIds || []).map((id: string) => {
                        const d = departments.find(dept => dept.id === id);
                        return d ? <Badge key={id} className="bg-indigo-600/10 text-indigo-700 border-indigo-200/50 hover:bg-indigo-600/20 text-[10px] h-7 px-3">{d.code}</Badge> : null;
                      })
                    ) : <span className="text-xs text-muted-foreground italic font-medium px-1">No departments mapped.</span>
                  ) : (
                    (user.menteeIds || []).length > 0 ? (
                      (user.menteeIds || []).map((id: string) => {
                        const s = students.find(st => st.id === id);
                        return s ? <Badge key={id} className="bg-green-600/10 text-green-700 border-green-200/50 hover:bg-green-600/20 text-[10px] h-7 px-3">{s.rollNo}</Badge> : null;
                      })
                    ) : <span className="text-xs text-muted-foreground italic font-medium px-1">No mentees assigned.</span>
                  )}
                </div>
              </div>

              {/* Control Pool Section */}
              <div className="p-6 lg:w-1/3 bg-muted/5 border-l border-border/40">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Mapping Pool</span>
                   <Filter className="w-3 h-3 text-muted-foreground/40" />
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                  {isAdmin ? (
                    departments.map(dept => {
                      const isAttached = (user.attachedDepartmentIds || []).includes(dept.id);
                      return (
                        <button 
                          key={dept.id} 
                          onClick={() => toggleDept(user.id, user.attachedDepartmentIds, dept.id)}
                          className={cn(
                            "text-[10px] font-black px-3 py-1.5 rounded-xl transition-all border",
                            isAttached 
                              ? "bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-200" 
                              : "bg-white border-border text-muted-foreground hover:border-indigo-400 hover:text-indigo-600"
                          )}
                        >
                          {dept.code}
                        </button>
                      );
                    })
                  ) : (
                    students.map(student => {
                      const isMentee = (user.menteeIds || []).includes(student.id);
                      return (
                        <button 
                          key={student.id} 
                          onClick={() => toggleMentee(user.id, user.menteeIds, student.id)}
                          className={cn(
                            "text-[10px] font-black px-3 py-1.5 rounded-xl transition-all border",
                            isMentee 
                              ? "bg-green-600 border-green-700 text-white shadow-md shadow-green-200" 
                              : "bg-white border-border text-muted-foreground hover:border-green-400 hover:text-green-600"
                          )}
                        >
                          {student.rollNo}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {paginatedUsers.length === 0 && (
          <div className="text-center py-20 bg-card border-2 border-dashed border-border rounded-3xl">
            <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">No matching personnel found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-8 border-t border-border mt-8">
          <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
            Cluster <span className="text-foreground">{currentPage}</span> / {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" size="sm" className="h-10 font-black text-xs uppercase tracking-wider rounded-xl border border-transparent hover:border-border"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button 
                  key={i} 
                  variant={currentPage === i + 1 ? "default" : "ghost"} 
                  size="sm" 
                  className={cn(
                    "h-10 w-10 p-0 text-xs font-black rounded-xl",
                    currentPage === i + 1 ? "shadow-lg shadow-primary/20" : "border border-transparent hover:border-border"
                  )}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
            </div>
            <Button 
              variant="ghost" size="sm" className="h-10 font-black text-xs uppercase tracking-wider rounded-xl border border-transparent hover:border-border"
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
