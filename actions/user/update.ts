"use server"

import { revalidatePath } from "next/cache"

export async function update(data: { name: string }) {
  revalidatePath("/dashboard")
  return data
}
