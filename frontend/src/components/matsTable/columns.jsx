"use client";

export const columns = [
  {
    accessorKey: "elementType",
    header: () => <div className="text-left w-32">Element Type</div>,
    cell: ({ row }) => (
      <div className="text-left font-medium">{row.getValue("elementType")}</div>
    ),
  },
  {
    accessorKey: "size",
    header: () => <div className="text-left w-48">Size</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("size")}</div>,
  },
  {
    accessorKey: "unit",
    header: () => <div className="text-left w-16">Unit</div>,
    cell: ({ row }) => <div className="text-left">{row.getValue("unit")}</div>,
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right w-20">Total</div>,
    cell: ({ row }) => (
      <div className="text-right font-bold">{row.getValue("total")}</div>
    ),
  },
  // Dynamic level columns - these will be rendered for each level in the data
  ...getLevelColumns(),
];

// Helper function to generate level columns dynamically
function getLevelColumns() {
  // Common levels in building projects
  const commonLevels = ["Level 1", "Level 2", "Level 3"];

  return commonLevels.map((level) => ({
    id: `level-${level}`,
    accessorFn: (row) =>
      row.levels && row.levels[level] ? row.levels[level] : 0,
    header: () => <div className="text-right w-20">{level}</div>,
    cell: ({ row }) => {
      // Access the original row data to get the levels object
      const value =
        row.original.levels && row.original.levels[level]
          ? row.original.levels[level]
          : 0;
      return <div className="text-right">{value}</div>;
    },
  }));
}
