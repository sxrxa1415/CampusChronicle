"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { MOCK_DEPARTMENTS, MOCK_STUDENTS } from "@/lib/mock-data";
import { 
  Building2, Users, ShieldCheck, Mail, UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TeamAccessPage() {
  const { currentUser, users, updateUserAccessControls } = useAppStore();

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "DEPARTMENT_HEAD")) {
    return <div className="p-8 text-center text-muted-foreground">Access Denied</div>;
  }

  const isAdmin = currentUser.role === "ADMIN";
  const isHOD = currentUser.role === "DEPARTMENT_HEAD";

  const targetUsers = isAdmin 
    ? users.filter(u => u.role === "REVIEWER")
    : users.filter(u => u.role === "FACULTY" && u.departmentId === currentUser.departmentId);

  const toggleDept = (userId: string, currentDepts: string[] = [], deptId: string) => {
    const newDepts = currentDepts.includes(deptId) 
      ? currentDepts.filter(id => id !== deptId)
      : [...currentDepts, deptId];
    updateUserAccessControls(userId, { attachedDepartmentIds: newDepts });
  };

  const toggleMentee = (userId: string, currentMentees: string[] = [], studentId: string) => {
    const newMentees = currentMentees.includes(studentId)
      ? currentMentees.filter(id => id !== studentId)
      : [...currentMentees, studentId];
    updateUserAccessControls(userId, { menteeIds: newMentees });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Access & Mapping Controls</h2>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "Assign specific verified departments to Reviewers for targeted analytics." : "Assign dedicated student mentees to your Faculty."}
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="grid gap-4">
        {targetUsers.map(user => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            key={user.id} 
            className="bg-card border border-border rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  {user.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{user.name}</h3>
                  <div className="flex items-center text-xs text-muted-foreground gap-2">
                    <Mail className="w-3 h-3" /> {user.email}
                    <Badge variant="outline" className="ml-2 bg-background mx-0 px-1.5 rounded-sm">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
                {isAdmin ? <Building2 className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                {isAdmin ? "Department Access Pool" : "Mentorship Pool (Students)"}
              </h4>
              
              <div className="flex flex-wrap gap-2">
                {isAdmin ? (
                  MOCK_DEPARTMENTS.map(dept => {
                    const isAttached = (user.attachedDepartmentIds || []).includes(dept.id);
                    return (
                      <Badge 
                        key={dept.id} 
                        variant={isAttached ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${isAttached ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "text-muted-foreground hover:bg-indigo-50"}`}
                        onClick={() => toggleDept(user.id, user.attachedDepartmentIds, dept.id)}
                      >
                        {isAttached && <UserCheck className="w-3 h-3 mr-1" />}
                        {dept.name} ({dept.code})
                      </Badge>
                    );
                  })
                ) : (
                  MOCK_STUDENTS.filter(s => s.departmentId === currentUser.departmentId).map(student => {
                    const isMentee = (user.menteeIds || []).includes(student.id);
                    return (
                      <Badge 
                        key={student.id} 
                        variant={isMentee ? "default" : "outline"}
                        className={`cursor-pointer transition-all ${isMentee ? "bg-green-600 hover:bg-green-700 text-white" : "text-muted-foreground hover:bg-green-50"}`}
                        onClick={() => toggleMentee(user.id, user.menteeIds, student.id)}
                      >
                        {isMentee && <UserCheck className="w-3 h-3 mr-1" />}
                        {student.name} ({student.rollNo})
                      </Badge>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {targetUsers.length === 0 && (
          <div className="text-center p-8 bg-card border border-border rounded-xl text-muted-foreground">
            No mappable users found in your security scope.
          </div>
        )}
      </div>
    </div>
  );
}
