"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { YEARLY_TREND_DATA, RESEARCH_OUTPUT_DATA, BUDGET_DATA, PLACEMENT_DATA, DEPT_PERFORMANCE_DATA, MOCK_KPIS, MOCK_DEPARTMENTS } from "@/lib/mock-data";
import { useAppStore } from "@/lib/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/stat-card";
import { BarChart3, TrendingUp, Award, Users, BookOpen, GraduationCap } from "lucide-react";

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

const PIE_COLORS = ["#6366f1","#06b6d4","#f59e0b","#10b981","#f43f5e"];

const STUDENT_DATA = [
  { year: "2020-21", enrolled: 720, passed: 590, placed: 380 },
  { year: "2021-22", enrolled: 740, passed: 635, placed: 415 },
  { year: "2022-23", enrolled: 760, passed: 668, placed: 470 },
  { year: "2023-24", enrolled: 780, passed: 720, placed: 530 },
];

const GATE_DATA = [
  { dept: "CSE", qualified: 18 },
  { dept: "ECE", qualified: 12 },
  { dept: "MECH", qualified: 6 },
  { dept: "CIVIL", qualified: 4 },
  { dept: "IT", qualified: 9 },
];

export default function AnalyticsPage() {
  const { currentUser } = useAppStore();
  const [deptFilter, setDeptFilter] = useState("ALL");

  const filteredKpis = MOCK_KPIS.filter((k) =>
    deptFilter === "ALL" ? true : k.departmentId === deptFilter
  );

  const radarData = filteredKpis.slice(0, 6).map((k) => ({
    subject: k.kpiName.split(" ").slice(0, 2).join(" "),
    value: k.kpiValue,
    fullMark: 100,
  }));

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground">Analytics & Insights</h2>
          <p className="text-sm text-muted-foreground">Sri Ramakrishna Engineering College · 2023-24</p>
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by dept" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Departments</SelectItem>
            {MOCK_DEPARTMENTS.map((d) => <SelectItem key={d.id} value={d.id}>{d.code}</SelectItem>)}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Overall Pass %" value="94.5%" icon={GraduationCap} color="green" trend={{ value: 3, label: "vs last year" }} />
        <StatCard title="Total Placed" value="530" icon={Users} color="blue" trend={{ value: 12, label: "vs last year" }} />
        <StatCard title="Publications" value="78" icon={BookOpen} color="purple" trend={{ value: 20, label: "vs last year" }} />
        <StatCard title="GATE Qualified" value="49" icon={Award} color="orange" trend={{ value: 8, label: "vs last year" }} />
      </div>

      <Tabs defaultValue="academic">
        <motion.div variants={item}>
          <TabsList className="mb-4">
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="placement">Placement</TabsTrigger>
            <TabsTrigger value="kpi">KPI Radar</TabsTrigger>
          </TabsList>
        </motion.div>

        <TabsContent value="academic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Department Pass % (4-Year Trend)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={YEARLY_TREND_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[65, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="cse" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} name="CSE" />
                  <Line type="monotone" dataKey="ece" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} name="ECE" />
                  <Line type="monotone" dataKey="mech" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="MECH" />
                  <Line type="monotone" dataKey="civil" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="CIVIL" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Student Enrollment & Outcomes</h3>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={STUDENT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="enrolled" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} name="Enrolled" />
                  <Area type="monotone" dataKey="passed" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Passed" />
                  <Area type="monotone" dataKey="placed" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} name="Placed" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-foreground mb-4">Dept. Performance vs Target</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={DEPT_PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[60,100]} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="performance" fill="#6366f1" radius={[3,3,0,0]} name="Actual %" />
                <Bar dataKey="target" fill="#e2e8f0" radius={[3,3,0,0]} name="Target %" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Research Output by Year</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={RESEARCH_OUTPUT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="journals" fill="#6366f1" radius={[3,3,0,0]} name="Journals" />
                  <Bar dataKey="conferences" fill="#06b6d4" radius={[3,3,0,0]} name="Conferences" />
                  <Bar dataKey="patents" fill="#f59e0b" radius={[3,3,0,0]} name="Patents" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Budget Allocation</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={BUDGET_DATA} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`} labelLine={true}>
                    {BUDGET_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="placement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Placements by Company</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={PLACEMENT_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="company" type="category" tick={{ fontSize: 11 }} width={70} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="count" fill="#10b981" radius={[0,3,3,0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">GATE Qualified by Dept</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={GATE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="qualified" fill="#6366f1" radius={[3,3,0,0]} name="Qualified" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="kpi">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">KPI Radar Chart</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="KPI" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div variants={item} className="bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">KPI Summary Table</h3>
              <div className="space-y-2">
                {filteredKpis.map((kpi) => {
                  const pct = Math.min((kpi.kpiValue / 100) * 100, 100);
                  return (
                    <div key={kpi.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-foreground font-medium truncate mr-2">{kpi.kpiName}</span>
                        <span className="text-muted-foreground shrink-0">{kpi.kpiValue} {kpi.unit}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
