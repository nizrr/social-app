import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { getUserByClerkId } from "@/actions/user.action";
import Link from "next/link";
import { LinkIcon, MapPinIcon } from "lucide-react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Separator } from "./ui/separator";

async function Sidebar() {
	const authUser = await currentUser();
	if (!authUser) return <UnAuthenticatedSidebar />;
	const user = await getUserByClerkId(authUser.id);
	if (!user) return null;

	return (
		<div className="sticky top-20">
			<Card>
				<CardContent className="pt-6">
					<div className="flex flex-col items-center text-center">
						<Link
							href={`/profile/${user.username}`}
							className="flex flex-col items-center justify-center">
							<Avatar className="w-20 h-20 border-2 ">
								<AvatarImage src={user.image || "/avatar.png"} />
							</Avatar>

							<div className="mt-4 space-y-1">
								<h3 className="font-semibold">{user.name}</h3>
								<p className="text-sm text-muted-foreground">{user.username}</p>
							</div>
						</Link>

						{user.bio && <p className="mt-3 text-sm text-muted-foreground">{user.bio}</p>}

						<div className="w-full">
							<Separator className="my-4" />
							<div className="flex justify-between">
								<div>
									<p className="font-medium">{user._count.following}</p>
									<p className="text-xs text-muted-foreground">Following</p>
								</div>
								<Separator orientation="vertical" />
								<div>
									<p className="font-medium">{user._count.followers}</p>
									<p className="text-xs text-muted-foreground">Followers</p>
								</div>
							</div>
							<Separator className="my-4" />
						</div>

						<div className="w-full space-y-2 text-sm">
							<div className="flex items-center text-muted-foreground">
								<MapPinIcon className="w-4 h-4 mr-2" />
								{user.location || "No location"}
							</div>
							<div className="flex items-center text-muted-foreground">
								<LinkIcon className="w-4 h-4 mr-2 shrink-0" />
								{user.website ? (
									<Link
										href={`${user.website}`}
										className="hover:underline truncate"
										target="_blank">
										{user.website}
									</Link>
								) : (
									"No website"
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
export default Sidebar;

const UnAuthenticatedSidebar = () => {
	return (
		<div className="sticky top-20">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl text-center">Welcome Back!</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="mb-4 text-center text-muted-foreground">Login to access your profile and connect with others.</p>
					<SignInButton mode="modal">
						<Button
							variant="outline"
							className="w-full">
							Login
						</Button>
					</SignInButton>
					<SignUpButton mode="modal">
						<Button
							variant="default"
							className="w-full mt-2">
							Sign Up
						</Button>
					</SignUpButton>
				</CardContent>
			</Card>
		</div>
	);
};
