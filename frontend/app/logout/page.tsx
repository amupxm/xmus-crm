"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

export default function LeavesPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await logout();
      router.push("/login");
    })();
  }, [logout]);

  return <h1 className="text-2xl">loading...</h1>;
}
