import { ExternalLink, Target } from "lucide-react";
import { formatUsd } from "@/lib/constants";
import type { Project } from "@/types/claro";

interface Props {
  project: Project;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-50 border-green-200", text: "text-green-700", label: "Active" },
  completed: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", label: "Completed" },
  on_hold: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", label: "On Hold" },
  cancelled: { bg: "bg-gray-100 border-gray-200", text: "text-gray-500", label: "Cancelled" },
};

export default function ProjectCard({ project }: Props) {
  const s = statusStyles[project.status] ?? statusStyles.active;
  const category = project.category
    ? project.category.charAt(0).toUpperCase() + project.category.slice(1)
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-gray-900">{project.name}</p>
        <span className={`border ${s.bg} ${s.text} text-xs px-2 py-0.5 rounded-full whitespace-nowrap`}>
          {s.label}
        </span>
      </div>

      {project.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {category && (
            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded">{category}</span>
          )}
          {project.website_url && (
            <a
              href={project.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#1A56DB] flex items-center gap-1 hover:underline"
            >
              View Project <ExternalLink style={{ width: 10, height: 10 }} />
            </a>
          )}
        </div>
        {project.target_usd && project.target_usd > 0 && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Target style={{ width: 12, height: 12 }} />
            {formatUsd(project.target_usd)} goal
          </span>
        )}
      </div>
    </div>
  );
}
