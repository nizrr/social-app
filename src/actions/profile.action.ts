"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";

export async function getProfileByUsername(username: string) {
	try {
		const user = await prisma.user.findUnique({
			where: {
				username,
			},
			select: {
				id: true,
				name: true,
				username: true,
				bio: true,
				image: true,
				location: true,
				website: true,
				createdAt: true,
				_count: {
					select: {
						followers: true,
						following: true,
						posts: true,
					},
				},
			},
		});
		return user;
	} catch (error) {
		console.error("Error fetching profile,", error);
		throw new Error("Failed to get profile");
	}
}

export async function getUserPosts(userId: string) {
	try {
		const posts = await prisma.post.findMany({
			where: {
				authorId: userId,
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
								name: true,
								image: true,
								username: true,
							},
						},
					},
					orderBy: {
						createdAt: "asc",
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
			orderBy: {
				createdAt: "desc",
			},
		});
		return posts;
	} catch (error) {
		console.error("Error fetching posts", error);
		throw new Error("Failed to get posts");
	}
}

export async function getUserLikePosts(userId: string) {
	try {
		const likedPosts = await prisma.post.findMany({
			where: {
				likes: {
					some: {
						userId,
					},
				},
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
								name: true,
								image: true,
								username: true,
							},
						},
					},
					orderBy: {
						createdAt: "asc",
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
			orderBy: {
				createdAt: "desc",
			},
		});
		return likedPosts;
	} catch (error) {
		console.error("Error fetching liked posts", error);
		throw new Error("Failed to get liked posts");
	}
}

export async function updateProfile(formData: FormData) {
	try {
		const { userId: clerkId } = await auth();
		if (!clerkId) throw new Error("User not found");

		const name = formData.get("name") as string;
		const bio = formData.get("bio") as string;
		const location = formData.get("location") as string;
		const website = formData.get("website") as string;

		const user = await prisma.user.update({
			where: { clerkId },
			data: {
				name,
				bio,
				location,
				website,
			},
		});
		revalidatePath("/profile");
		return { success: true, user };
	} catch (error) {
		console.error("Error updating profile", error);
		return { success: false, error: "Error updating profile" };
	}
}

export async function isFollowing(userId: string) {
	try {
		const currentUserId = await getDbUserId();
		if (!currentUserId) return false;
		const follow = await prisma.follows.findUnique({
			where: {
				followerId_followingId: {
					followerId: userId,
					followingId: currentUserId,
				},
			},
		});
		return !!follow;
	} catch (error) {
		console.error("Error checking if following", error);
		return false;
	}
}
