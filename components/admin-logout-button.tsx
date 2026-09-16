"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

/**
 * Client-side logout trigger for the admin shell.
 *
 * Wraps `signOut` from `next-auth/react` so the server-rendered layout can
 * render a styled Button without becoming a client component itself.
 */
export function AdminLogoutButton({ locale }: { locale?: string }) {
  const target = locale && locale.length > 0 ? locale : "en";
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        void signOut({ callbackUrl: `/${target}/admin/login` });
      }}
    >
      Log out
    </Button>
  );
}
