import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getStats,
  getRecentActivity,
  getStatusDistribution,
} from '@/lib/data';
import {
  Activity,
  BookOpen,
  Clapperboard,
  Film,
  List,
  Target,
} from 'lucide-react';
import DashboardCharts from '@/components/dashboard-charts';

export default function DashboardPage() {
  const stats = getStats();
  const recentActivity = getRecentActivity();
  const statusDistribution = getStatusDistribution();

  const iconMap = {
    'Anime Watched': <Film className="h-6 w-6 text-muted-foreground" />,
    'Manga Read': <BookOpen className="h-6 w-6 text-muted-foreground" />,
    'Episodes Watched': <Clapperboard className="h-6 w-6 text-muted-foreground" />,
    'In Progress': <Activity className="h-6 w-6 text-muted-foreground" />,
    'Total Entries': <List className="h-6 w-6 text-muted-foreground" />,
    'Avg. Score': <Target className="h-6 w-6 text-muted-foreground" />,
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              {iconMap[stat.label as keyof typeof iconMap]}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} vs last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <DashboardCharts
              activityData={recentActivity}
              distributionData={statusDistribution}
            />
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>List Distribution</CardTitle>
            <CardDescription>
              Your collection by status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardCharts
              activityData={recentActivity}
              distributionData={statusDistribution}
              chartType="pie"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
