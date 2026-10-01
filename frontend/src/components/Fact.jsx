export const Fact = ({ icon: Icon, title, text, href, testid }) => (
  <div className="k-fact" data-testid={testid}>
    <span className="k-fact-icon"><Icon /></span>
    <div>
      <strong>{title}</strong>
      {href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{text}</a> : <span>{text}</span>}
    </div>
  </div>
);
