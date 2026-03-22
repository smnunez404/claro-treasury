import { useMemo, useState } from "react";
import { Folder, AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/types/claro";

interface Props {
  projects: Project[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export default function ProjectsList({ projects, isLoading, isError, onRetry }: Props) {
  const activeProjects = useMemo(() => projects.filter(p => p.status === "active"), [projects]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{projects.length} total</span>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1].map(i => (
            <div key={i} className="h-32 bg-white rounded-xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="text-red-500 mx-auto" style={{ width: 24, height: 24 }} />
          <p className="text-sm text-gray-700 mt-2">Could not load projects. Please try again.</p>
          <button onClick={onRetry} className="mt-4 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-md px-4 py-2 text-xs font-medium active:scale-[0.97] transition-all">
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center py-12">
          <Folder className="text-gray-300" style={{ width: 32, height: 32 }} />
          <p className="text-sm font-semibold text-gray-900 mt-4">No projects yet</p>
          <p className="text-sm text-gray-500">This organization hasn't added projects</p>
        </div>
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({activeProjects.length})</TabsTrigger>
            <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <div className="grid grid-cols-1 gap-4 mt-4">
              {activeProjects.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No active projects</p>
              ) : (
                activeProjects.map(p => <ProjectCard key={p.id} project={p} />)
              )}
            </div>
          </TabsContent>
          <TabsContent value="all">
            <div className="grid grid-cols-1 gap-4 mt-4">
              {projects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
