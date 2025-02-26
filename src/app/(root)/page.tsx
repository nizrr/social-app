import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import RecommendedUsers from "@/components/RecommendedUsers";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
	const user = await currentUser();
	const posts = await getPosts();
	const dbUserId = await getDbUserId();
	return (
		<div className="grid grid-cols-10 gap-5">
			<div className="col-span-10 lg:col-span-6">
				{user ? <CreatePost /> : null}
				<div className="space-y-5">
					{posts.map((post) => (
						<PostCard
							key={post.id}
							post={post}
							dbUserId={dbUserId}></PostCard>
					))}
				</div>
			</div>
			<div className="hidden lg:block col-span-4 sticky top-20">{user ? <RecommendedUsers /> : ""}</div>
		</div>
	);
}
