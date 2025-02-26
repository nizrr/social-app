"use server";

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, image: string) {
	try {
		const userId = await getDbUserId();
		if (!userId) return;
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

export async function getPosts() {
	try {
		const posts = await prisma.post.findMany({
			orderBy: {
				createdAt: "desc",
			},
			include: {
				author: {
					select: {
						id: true,
						name: true,
						image: true,
						username: true,
					},
				},
				comments: {
					include: {
						author: {
							select: {
								id: true,
								image: true,
								username: true,
								name: true,
							},
						},
					},
				},
				likes: {
					select: {
						userId: true,
					},
				},
				_count: {
					select: {
						comments: true,
						likes: true,
					},
				},
			},
		});
		return posts;
	} catch (error) {
		console.error("Error getting posts", error);
		throw new Error("Error getting posts");
	}
}

export async function toggleLike(postId: string) {
	try {
		const userId = await getDbUserId();
		if (!userId) return;

		// Check if the user has already liked the post
		const existingLike = await prisma.like.findUnique({
			where: {
				userId_postId: {
					userId,
					postId,
				},
			},
		});

		const post = await prisma.post.findUnique({
			where: {
				id: postId,
			},
			select: {
				authorId: true,
			},
		});
		if (!post) throw new Error("Post not found");

		if (existingLike) {
			//unlike
			await prisma.like.delete({
				where: {
					userId_postId: {
						userId,
						postId,
					},
				},
			});
		} else {
			//like and create notification (only if liking someone else's post)
			await prisma.$transaction([
				prisma.like.create({
					data: {
						userId,
						postId,
					},
				}),
				...(post.authorId !== userId
					? [
							prisma.notification.create({
								data: {
									type: "LIKE",
									userId: post.authorId, // recipient of the notification
									creatorId: userId, // creator of the notification
									postId,
								},
							}),
					  ]
					: []),
			]);
		}
		revalidatePath("/");
		return { success: true };
	} catch (error) {
		console.error("Error toggling like", error);
		return { success: false, error: "Error toggling like" };
	}
}

export async function createComment(postId: string, content: string) {
	try {
		const userId = await getDbUserId();
		if (!userId) return;
		if (!content) throw new Error("Comment cannot be empty");

		const post = await prisma.post.findUnique({
			where: {
				id: postId,
			},
			select: {
				authorId: true,
			},
		});
		if (!post) throw new Error("Post not found");

		// create comment and notification (only if commenting on someone else's post)
		const [comment] = await prisma.$transaction(async (tx) => {
			// create comment first
			const newComment = await tx.comment.create({
				data: {
					authorId: userId,
					content,
					postId,
				},
			});

			// create notification (only if commenting on someone else's post)
			if (post.authorId !== userId) {
				await tx.notification.create({
					data: {
						type: "COMMENT",
						userId: post.authorId, // recipient of the notification
						creatorId: userId, // creator of the notification
						postId,
						commentId: newComment.id,
					},
				});
			}

			return [newComment];
		});

		revalidatePath(`/`);
		return { success: true, comment };
	} catch (error) {
		console.error("Error creating comment", error);
		return { success: false, error: "Error creating comment" };
	}
}

export async function deletePost(postId: string) {
	try {
		const userId = await getDbUserId();
		const post = await prisma.post.findUnique({
			where: {
				id: postId,
			},
			select: {
				authorId: true,
			},
		});
		if (!post) throw new Error("Post not found");
		if (post.authorId !== userId) throw new Error("You can only delete your own comments");

		await prisma.post.delete({
			where: {
				id: postId,
			},
		});

		revalidatePath(`/`);
		return { success: true };
	} catch (error) {
		console.error("Error deleting comment", error);
		return { success: false, error: "Error deleting comment" };
	}
}
