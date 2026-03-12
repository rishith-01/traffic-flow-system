import { IntersectionPanel } from "../intersection/IntersectionPanel.jsx";

export function MultiIntersectionGrid({
  intersections,
  generatedAt,
  tickIntervalMs,
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {intersections.map((intersection) => (
        <IntersectionPanel
          key={intersection.id}
          intersection={intersection}
          generatedAt={generatedAt}
          tickIntervalMs={tickIntervalMs}
          compact
        />
      ))}
    </div>
  );
}

