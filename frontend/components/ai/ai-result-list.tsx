interface AiResultListProps {
  title: string;
  items: string[];
}

export function AiResultList({ title, items }: AiResultListProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-3 rounded-[15px] border border-border bg-background p-4 text-sm text-muted-foreground">No items returned.</p>
      ) : (
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="rounded-[15px] border border-border bg-background p-4 leading-6">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
