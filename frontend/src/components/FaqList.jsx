export const FaqList = ({ items, testid = "faq" }) => (
  <div className="k-faq" data-testid={testid}>
    {items.map((f, i) => (
      <details key={f.q} data-testid={`${testid}-item-${i}`}>
        <summary>{f.q}</summary>
        <p>{f.a}</p>
      </details>
    ))}
  </div>
);
