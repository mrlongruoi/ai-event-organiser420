"use server";

import { auth } from "@clerk/nextjs/server";

export async function checkUserPlan() {
  const { has } = await auth();

  const hasPro = has({ plan: "pro" });

  return { hasPro };
}
