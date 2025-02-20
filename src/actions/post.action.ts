"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, image: string) {
	try {
		const userId = await getDbUserId();
		// Create a new post in the database
		const post = await prisma.post.create({
			data: {
				authorId: userId,
				content,
				image,
			},
		});
		revalidatePath("/");
		return { success: true, post };
	} catch (error) {
		console.error("Error creating post", error);
		return { success: false, error: "Error creating post" };
	}
}
