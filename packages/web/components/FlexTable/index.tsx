import {
  ColumnDef,
  createSolidTable,
  flexRender,
  getCoreRowModel,
  RowData,
} from "@tanstack/solid-table";
import { For } from "solid-js";

import "./style.css";

export function FlexTable<TData extends RowData>({
  columns,
  data,
}: {
  columns: ColumnDef<TData, string>[];
  data: () => TData[] | undefined;
}) {
  const table = createSolidTable({
    get data() {
      return data() || [];
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table class="FlexTable__table">
      <thead>
        <For each={table.getHeaderGroups()}>
          {(headerGroup) => (
            <tr class="FlexTable__headerRow">
              <For each={headerGroup.headers}>
                {(header) => (
                  <th class="FlexTable__headerCell">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                )}
              </For>
            </tr>
          )}
        </For>
      </thead>
      <tbody>
        <For each={table.getRowModel().rows}>
          {(row) => (
            <tr class="FlexTable__row">
              <For each={row.getVisibleCells()}>
                {(cell) => {
                  const classList = {
                    FlexTable__rowCell: true,
                    ...(
                      cell.column.columnDef.meta as {
                        classList: Record<string, boolean>;
                      }
                    ).classList,
                  };
                  return (
                    <td classList={classList}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                }}
              </For>
            </tr>
          )}
        </For>
      </tbody>
      <tfoot>
        <For each={table.getFooterGroups()}>
          {(footerGroup) => (
            <tr>
              <For each={footerGroup.headers}>
                {(header) => (
                  <th>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext(),
                        )}
                  </th>
                )}
              </For>
            </tr>
          )}
        </For>
      </tfoot>
    </table>
  );
}
