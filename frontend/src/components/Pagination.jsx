import { Fragment } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const pageList = (page, pages) => [...new Set([1, page - 1, page, page + 1, pages])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);

export const Pagination = ({ page, pages, onChange, testid = "pagination" }) => {
  if (!pages || pages <= 1) return null;
  const list = pageList(page, pages);
  return (
    <nav className="k-pagination" aria-label="Paginación" data-testid={testid}>
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Página anterior" data-testid={`${testid}-prev`}><ChevronLeft /></button>
      {list.map((p, i) => (
        <Fragment key={p}>
          {i > 0 && p - list[i - 1] > 1 && <span className="k-dots">…</span>}
          <button type="button" className={p === page ? "is-current" : ""} aria-current={p === page ? "page" : undefined} onClick={() => onChange(p)} data-testid={`${testid}-page-${p}`}>{p.toLocaleString("es-ES")}</button>
        </Fragment>
      ))}
      <button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Página siguiente" data-testid={`${testid}-next`}><ChevronRight /></button>
    </nav>
  );
};
