import { Link } from "react-router-dom";

export const PageHero = ({ eyebrow, title, lead, image, imageAlt = "", crumbs, children, testid = "page-hero" }) => (
  <section className="k-page-hero" data-testid={testid}>
    {image && <div className="k-page-hero-media"><img src={image} alt={imageAlt} /></div>}
    <div className="k-container" style={{ position: "relative" }}>
      {crumbs && (
        <nav className="k-breadcrumb" aria-label="Migas de pan" data-testid="breadcrumb">
          <Link to="/">Inicio</Link>
          {crumbs.map((c) => <span key={c.label} style={{ display: "contents" }}><span aria-hidden="true">/</span>{c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}</span>)}
        </nav>
      )}
      {eyebrow && <p className="k-eyebrow" data-testid={`${testid}-eyebrow`}>{eyebrow}</p>}
      <h1 className="k-h1 k-h1--sm" data-testid={`${testid}-title`}>{title}</h1>
      {lead && <p className="k-lead" data-testid={`${testid}-lead`}>{lead}</p>}
      {children}
    </div>
  </section>
);
