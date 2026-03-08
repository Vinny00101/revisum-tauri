import { breadcrumbNameMap } from "@/types/breadcrumbNameMap";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

export function Breadcrumb() {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  
  useEffect(() => {
    const paths = location.pathname.split("/").filter(Boolean);
    const state = location.state as { breadcrumbName?: string };
    
    const breadcrumbItems: BreadcrumbItem[] = paths.map((path, index) => {
      const to = "/" + paths.slice(0, index + 1).join("/");
      const isLast = index === paths.length - 1;
      
      let label;
      
      // Prioridade 1: Se é o último item E tem breadcrumbName no state
      if (isLast && state?.breadcrumbName) {
        label = state.breadcrumbName;
      } 
      // Prioridade 2: Se tem mapeamento no breadcrumbNameMap
      else if (breadcrumbNameMap[path]) {
        label = breadcrumbNameMap[path];
      } 
      // Prioridade 3: Fallback - o próprio path capitalizado
      else {
        label = path.charAt(0).toUpperCase() + path.slice(1);
      }
      
      return { label, path: to, isLast };
    });
    
    setBreadcrumbs(breadcrumbItems);
  }, [location]);
  
  if (breadcrumbs.length === 0) {
    return null;
  }
  
  return (
    <nav className="flex items-center gap-2 text-sm mb-4 overflow-x-auto pb-1">
      {breadcrumbs.map((item) => (
        <div key={item.path} className="flex items-center gap-2">
          {!item.isLast ? (
            <>
              <Link
                to={item.path}
                className="text-gray-600 hover:text-blue-600 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
              <ChevronRight size={14} className="text-gray-400 shrink-0" />
            </>
          ) : (
            <span className="font-semibold text-gray-900 whitespace-nowrap">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}