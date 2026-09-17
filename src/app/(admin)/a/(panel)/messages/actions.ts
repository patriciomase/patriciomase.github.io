"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";

export async function deleteMessage(id: string) {
  await requireAdmin();

  await db.delete(messages).where(eq(messages.id, id));
  revalidatePath("/a/messages");
}
