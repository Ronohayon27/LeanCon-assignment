"use client";

// Base columns that are always present
const baseColumns = [
  {
    accessorKey: "name",
    header: () => "Name",
    cell: ({ row }) => (
      <div className="truncate max-w-[280px]">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "type",
    header: () => "Element Type",
    cell: ({ row }) => (
      <div className="truncate max-w-[160px]">{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "total",
    header: () => "Total",
    cell: ({ row }) => <div className="font-bold">{row.getValue("total")}</div>,
  },
  {
    accessorKey: "volume",
    header: () => "Quantity",
    cell: ({ row }) => {
      const volume = row.getValue("volume") || 0;
      const length = row.original.length || 0;

      // If volume exists and is not zero, show volume with m³
      if (volume > 0) {
        return <div>{volume} m³</div>;
      }
      // Otherwise, show length with m if it exists
      else if (length > 0) {
        return <div>{length} m</div>;
      }
      // If both are zero, just show 0
      else {
        return <div>0</div>;
      }
    },
  },
];

// Function to create columns with dynamic levels
export const createColumns = (
  uniqueLevels = [],
  onLevelClick = null,
  selectedLevel = null
) => {
  const levelColumns = uniqueLevels.map((level) => ({
    id: `level-${level}`,
    accessorFn: (row) => {
      const levelData = row.levels && row.levels[level];
      return levelData ? levelData.count || 0 : 0;
    },
    header: () => {
      const isSelected = selectedLevel === level;
      return (
        <div
          className={`cursor-pointer p-1 rounded transition-colors ${
            isSelected
              ? "bg-blue-500 text-white font-semibold"
              : "hover:bg-blue-100 hover:text-blue-700"
          }`}
          onClick={() => onLevelClick && onLevelClick(level)}
          title={`Click to highlight all elements on ${level}`}
        >
          {level}
        </div>
      );
    },
    cell: ({ row }) => {
      const levelData = row.original.levels && row.original.levels[level];
      const count = levelData ? levelData.count || 0 : 0;
      return <div>{count}</div>;
    },
  }));

  return [...baseColumns, ...levelColumns];
};

// Default columns (fallback for when uniqueLevels is not available)
export const columns = createColumns();
