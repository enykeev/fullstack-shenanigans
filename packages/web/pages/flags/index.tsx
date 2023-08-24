import { Suspense, createResource } from "solid-js";
import { HiOutlineClock } from "solid-icons/hi";
import { Loader } from "../../components/loader";
import type { Flag } from "@feature-flag-service/common";
import { createColumnHelper } from "@tanstack/solid-table";
import { humanTime } from "@feature-flag-service/common/utils/date";
import { FlexTable } from "../../components/FlexTable";

import "./style.css";

export default function FlagsPage() {
  async function fetchData(): Promise<Flag[]> {
    const res = await fetch("/api/flags", {
      headers: {
        Authorization: "Bearer secret",
      },
    });

    return res.json();
  }

  const [flags] = createResource<Flag[]>(fetchData);

  const columnHelper = createColumnHelper<Flag>();

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => info.getValue(),
      meta: {
        classList: {
          FlagTable__name: true,
          FlexTable__fullRowCell: true,
        },
      },
    }),
    columnHelper.accessor("description", {
      cell: (props) => props.getValue(),
      meta: {
        classList: {
          FlagTable__description: true,
          FlexTable__fullRowCell: true,
        },
      },
    }),
    columnHelper.accessor("updatedAt", {
      cell: (props) => {
        const value = props.getValue();
        const seconds = Temporal.Now.zonedDateTimeISO()
          .since(Temporal.Instant.from(value).toZonedDateTimeISO("utc"))
          .total({ unit: "second" });
        const ht = humanTime(seconds);

        return (
          <>
            <div>
              <HiOutlineClock style={{ "margin-bottom": "-.2em" }} /> Last
              update
            </div>
            <div>
              {Math.round(ht.value)} {ht.units} ago
            </div>
          </>
        );
      },
      meta: {
        classList: {
          FlagTable__updatedAt: true,
        },
      },
    }),
    columnHelper.display({
      id: "actions",
      meta: {
        classList: {
          FlexTable__spacerCell: true,
        },
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: () => {
        return <>some more action</>;
      },
      meta: {
        classList: {
          FlagTable__actions: true,
        },
      },
    }),
  ];

  return (
    <div class="Page">
      <Suspense fallback={<Loader />}>
        <FlexTable columns={columns} data={flags} />
      </Suspense>
    </div>
  );
}
