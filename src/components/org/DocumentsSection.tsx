import { FileText, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { OrgDocument } from "@/types/claro";

interface Props {
  orgContract: string;
}

export default function DocumentsSection({ orgContract }: Props) {
  const { data: docs, isLoading } = useQuery({
    queryKey: ["org-documents", orgContract],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claro_documents")
        .select("id, doc_type, title, description, file_url, created_at")
        .eq("org_contract", orgContract)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as OrgDocument[];
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Documents & Evidence</h2>
        <div className="space-y-2">
          {[0, 1].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!docs || docs.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Documents & Evidence</h2>
      <div className="space-y-2">
        {docs.map(doc => {
          const typeLabel = doc.doc_type
            ? doc.doc_type.charAt(0).toUpperCase() + doc.doc_type.slice(1).replace(/_/g, " ")
            : null;
          return (
            <div key={doc.id} className="flex items-center gap-2 sm:gap-3 min-w-0">
              <FileText className="text-gray-400 shrink-0" style={{ width: 16, height: 16 }} />
              {typeLabel && (
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded shrink-0">{typeLabel}</span>
              )}
              <span className="text-sm text-gray-700 flex-1 truncate">{doc.title}</span>
              <a href={doc.file_url} target="_blank" rel="noopener noreferrer" title="Open document">
                <ExternalLink className="text-[#1A56DB] shrink-0" style={{ width: 14, height: 14 }} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
