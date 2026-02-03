import { breadcrumbNameMap } from "@/types/breadcrumbNameMap";
import { Link, useLocation } from "react-router-dom";

export function Breadcrumb() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean);
  const state = location.state as { breadcrumbName?: string };

  return (
    <nav className="breadcrumb mb-4">
      {paths.map((path, index) => {
        const to = "/" + paths.slice(0, index + 1).join("/");
        const isLast = index === paths.length - 1;

        let label = breadcrumbNameMap[path] || path;

        if (isLast && state?.breadcrumbName) {
          label = state.breadcrumbName;
        }

        return (
          <span key={to}>
            {!isLast ? (
              <>
                <Link to={to}>{label}</Link>
                <span> / </span>
              </>
            ) : (
              <strong>{label}</strong>
            )}
          </span>
        );
      })}
    </nav>
  );
}
