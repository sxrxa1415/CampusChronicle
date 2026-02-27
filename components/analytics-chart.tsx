'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

const chartData = [
  { month: 'Jan', submissions: 40, approved: 24, pending: 16 },
  { month: 'Feb', submissions: 65, approved: 42, pending: 23 },
  { month: 'Mar', submissions: 45, approved: 30, pending: 15 },
  { month: 'Apr', submissions: 85, approved: 65, pending: 20 },
  { month: 'May', submissions: 72, approved: 58, pending: 14 },
  { month: 'Jun', submissions: 95, approved: 78, pending: 17 },
];

export function AnalyticsChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Submissions Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="submissions" stroke="var(--color-primary)" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Report Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="approved" fill="var(--color-primary)" />
            <Bar dataKey="pending" fill="var(--color-muted)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
