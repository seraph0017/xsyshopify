type FactStatusProps = {
  appliesTo: string;
  doesNotCover: string;
  market: string;
  unitSystem: string;
  lastReviewed: string;
  evidenceStatus: string;
  contentOwner: string;
  sourceStatus: string;
};

export function FactStatus(props: FactStatusProps) {
  const facts = [
    ["Applies to", props.appliesTo],
    ["Does not cover", props.doesNotCover],
    ["Market", props.market],
    ["Unit system", props.unitSystem],
    ["Last reviewed", props.lastReviewed],
    ["Evidence / review status", props.evidenceStatus],
    ["Content owner", props.contentOwner],
    ["Source status", props.sourceStatus],
  ];
  return (
    <aside className="fact-status" aria-label="Content applicability and evidence status">
      <dl>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    </aside>
  );
}
