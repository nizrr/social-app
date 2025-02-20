"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

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
	if (!clerkId) throw new Error("User not authenticated");
	const user = await getUserByClerkId(clerkId);
	if (!user) throw new Error("User not found");
	return user.id;
}

export async function getRandomUsers() {
	const userId = await getDbUserId();
	try {
		const randomUsers = await prisma.user.findMany({
			// get 3 random users except the current user & users the current user is not following
			where: {
				AND: [
					{
						// NOT: { id: userId },
					},
					{
						NOT: {
							followers: {
								some: {
									followerId: userId,
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
