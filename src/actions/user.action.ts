"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function syncUser() {
	try {
		const { userId } = await auth();
		const user = await currentUser();

		if (!userId || !user) return;

		//check if user already exists
		const existingUser = await prisma.user.findFirst({
			where: {
				clerkId: userId,
			},
		});
		if (existingUser) return existingUser;

		const dbUser = await prisma.user.create({
			data: {
				clerkId: userId,
				name: `${user.firstName || ""} ${user.lastName || ""}`,
				username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
				email: user.emailAddresses[0].emailAddress,
				image: user.imageUrl,
			},
		});
		return dbUser;
	} catch (error) {
		console.error("Error in Syncerror,", error);
	}
}

export async function getUserByClerkId(clerkId: string) {
	return await prisma.user.findFirst({
		where: {
			clerkId,
		},
		include: {
			_count: {
				select: {
					followers: true,
					following: true,
					posts: true,
				},
			},
		},
	});
}

export async function getDbUserId() {
	const { userId: clerkId } = await auth();
	if (!clerkId) return null;
	const user = await getUserByClerkId(clerkId);
	if (!user) throw new Error("User not found");
	return user.id;
}

export async function getRandomUsers() {
	try {
		const userId = await getDbUserId();
		if (!userId) return [];
		const randomUsers = await prisma.user.findMany({
			// get 3 random users except the current user & users the current user is not following
			where: {
				AND: [
					{
						NOT: { id: userId },
					},
					{
						NOT: {
							followers: {
								some: {
									followingId: userId,
								},
							},
						},
					},
				],
			},
			select: {
				id: true,
				name: true,
				username: true,
				image: true,
				_count: {
					select: {
						followers: true,
					},
				},
			},
			take: 3,
		});
		return randomUsers;
	} catch (error) {
		console.error("Error fetching random users,", error);
		return [];
	}
}

export async function toggleFollow(targetUserId: string) {
	try {
		const userId = await getDbUserId();
		if (!userId) return;
		if (userId === targetUserId) throw new Error("You can't follow yourself");
		const existingFollow = await prisma.follows.findUnique({
			where: {
				followerId_followingId: {
					followerId: targetUserId,
					followingId: userId,
				},
			},
		});

		if (existingFollow) {
			// unfollow
			await prisma.follows.delete({
				where: {
					followerId_followingId: {
						followerId: targetUserId,
						followingId: userId,
					},
				},
			});
		} else {
			// follow
			await prisma.$transaction([
				prisma.follows.create({
					data: {
						followerId: targetUserId,
						followingId: userId,
					},
				}),
				prisma.notification.create({
					data: {
						type: "FOLLOW",
						userId: targetUserId,
						creatorId: userId,
					},
				}),
			]);
		}
		revalidatePath("/");
		return { success: true };
	} catch (error) {
		return { success: false, error: error || "error" };
	}
}
