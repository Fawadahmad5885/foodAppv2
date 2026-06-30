"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";

export function AuthModalLauncher() {
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuth();
  const openedRef = useRef(false);

  useEffect(() => {
    if (openedRef.current) return;

    const auth = searchParams.get("auth");
    if (auth === "signin" || auth === "signup") {
      openedRef.current = true;
      openAuthModal(auth);
    }
  }, [searchParams, openAuthModal]);

  return null;
}
