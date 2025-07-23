"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
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
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  // 🧮 Sum up totals for numeric columns (volume, total, and levels)
  const columnSums = {};
  columns.forEach((col) => {
    const key = col.accessorKey;
    const id = col.id;

    if (key === "total" || key === "volume") {
      columnSums[key] = data.reduce((acc, row) => acc + (row[key] || 0), 0);
    }

    if (!key && id?.startsWith("level-")) {
      const levelKey = id.replace("level-", "");
      columnSums[id] = data.reduce((acc, row) => {
        const levelData = row.levels?.[levelKey];
        return acc + (levelData?.count || 0);
      }, 0);
    }
  });

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <div className="rounded-md border w-full">
        <Table className="table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  const getColumnConfig = (index) => {
                    const fixedColumns = {
                      0: { width: "w-[300px]", align: "text-left" },
                      1: { width: "w-[180px]", align: "text-left" },
                      2: { width: "w-[100px]", align: "text-center" },
                      3: { width: "w-[140px]", align: "text-center" },
                    };
                    return (
                      fixedColumns[index] || {
                        width: "w-[100px]",
                        align: "text-center",
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
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {row.getVisibleCells().map((cell, index) => {
                      const getColumnConfig = (index) => {
                        const fixedColumns = {
                          0: "text-left",
                          1: "text-left",
                          2: "text-center",
                          3: "text-center",
                        };
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
                ))}

                {/* 🧾 Summary Row */}
                <TableRow className="bg-gray-100 font-semibold">
                  {columns.map((col, index) => {
                    const key = col.accessorKey;
                    const id = col.id;
                    const getColumnConfig = (index) => {
                      const fixedColumns = {
                        0: "text-left",
                        1: "text-left",
                        2: "text-center",
                        3: "text-center",
                      };
                      return fixedColumns[index] || "text-center";
                    };
                    const align = getColumnConfig(index);

                    let value = "";
                    if (index === 0) value = "Total:";
                    else if (key === "volume")
                      value = `${(columnSums[key] || 0).toFixed(2)} m³`;
                    else if (key === "total")
                      value = (columnSums[key] || 0).toFixed(0);
                    else if (id?.startsWith("level-"))
                      value = columnSums[id] || 0;

                    return (
                      <TableCell key={id || key || index} className={align}>
                        {value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </>
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
