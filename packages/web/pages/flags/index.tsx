import { For } from "solid-js";
import { FlagRow } from "../../components/flag";

export default function FlagsPage() {
  const flags = [
    {
      appId: "some-app-id",
      createdAt: "2023-08-12T22:07:37.783Z",
      description:
        "Enable maintenance mode for the application, routing all affected traffic to a static page",
      flagId: "maintenance",
      name: "Maintenance",
      updatedAt: "2023-08-12T22:08:02.709Z",
      value: false,
    },
    {
      appId: "some-app-id",
      createdAt: "2023-08-12T22:07:37.783Z",
      description:
        "Overrides default theme of the website to an orange one in celebration of the national holiday",
      flagId: "holiday-nl-1",
      name: "Kings Day",
      updatedAt: new Date().toISOString(),
      value: false,
    },
    {
      appId: "some-app-id",
      createdAt: new Date().toISOString(),
      description: "Another iteration of introductory pricing experiment",
      flagId: "pricing-experiment-44",
      name: "Pricing experiment #44",
      updatedAt: new Date().toISOString(),
      value: 12.99,
    },
  ];

  return (
    <div class="Page">
      <For each={flags}>{(item) => <FlagRow flag={item} />}</For>
    </div>
  );
}
