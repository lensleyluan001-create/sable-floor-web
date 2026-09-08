import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/lasts")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
