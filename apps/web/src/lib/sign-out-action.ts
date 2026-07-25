"use server";

import { redirect } from "next/navigation";
import { getAuthContext } from "./auth-context";

/** packages/auth.signOut() → redirect("/") — per this sprint's USER MENU spec. */
export async function signOutAction(): Promise<void> {
  const { authService } = await getAuthContext();
  await authService.signOut();
  redirect("/");
}
