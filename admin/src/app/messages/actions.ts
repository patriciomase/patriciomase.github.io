"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";

export async function deleteMessage(id: string) {
  await db.delete(messages).where(eq(messages.id, id));
  revalidatePath("/messages");
}
