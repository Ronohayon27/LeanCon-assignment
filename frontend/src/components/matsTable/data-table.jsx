"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTable({ columns, data, onRowClick }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <div className="rounded-md border w-full">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  // Define column widths and alignment
                  const getColumnConfig = (index) => {
                    const fixedColumns = {
                      0: { width: "w-[300px]", align: "text-left" }, // Name
                      1: { width: "w-[180px]", align: "text-left" }, // Element Type
                      2: { width: "w-[100px]", align: "text-center" }, // Total
                      3: { width: "w-[140px]", align: "text-center" }, // Volume
                    };

                    // Return fixed column config if it exists, otherwise default for dynamic level columns
                    return (
                      fixedColumns[index] || {
                        width: "w-[100px]", // Default width for level columns
                        align: "text-center", // Default alignment for level columns
                      }
                    );
                  };

                  const config = getColumnConfig(index);

                  return (
                    <TableHead
                      key={header.id}
                      className={`${config.width} ${config.align} font-semibold`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {row.getVisibleCells().map((cell, index) => {
                    // Define column alignment
                    const getColumnConfig = (index) => {
                      const fixedColumns = {
                        0: "text-left", // Name
                        1: "text-left", // Element Type
                        2: "text-center", // Total
                        3: "text-center", // Volume
                      };

                      // Return fixed column config if it exists, otherwise default for dynamic level columns
                      return fixedColumns[index] || "text-center";
                    };

                    const align = getColumnConfig(index);

                    return (
                      <TableCell key={cell.id} className={align}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
