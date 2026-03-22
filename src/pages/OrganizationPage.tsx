import { Building, Folder, BarChart3, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabs = [
  { value: "profile", label: "Profile", icon: Building, title: "Complete your organization profile", desc: "Add details about your mission, team, and impact. Available in Sprint 5." },
  { value: "projects", label: "Projects", icon: Folder, title: "Manage your projects", desc: "Create and track funded projects. Available in Sprint 5." },
  { value: "impact", label: "Impact", icon: BarChart3, title: "Track your impact", desc: "Log milestones, metrics and evidence. Available in Sprint 5." },
  { value: "team", label: "Team", icon: Users, title: "Manage your team", desc: "Add team members visible to donors. Available in Sprint 5." },
];

export default function OrganizationPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">My Organization</h1>
      <Tabs defaultValue="profile" className="mt-6">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <div className="bg-card border border-border rounded-lg p-8 mt-2 flex flex-col items-center text-center">
              <t.icon className="text-muted-foreground" style={{ width: 48, height: 48 }} strokeWidth={1.5} />
              <p className="text-sm font-semibold text-foreground mt-4">{t.title}</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">{t.desc}</p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
