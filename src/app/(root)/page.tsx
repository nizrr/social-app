import CreatePost from "@/components/CreatePost";
import RecommendedUsers from "@/components/RecommendedUsers";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
	const user = await currentUser();
	return (
		<div className="grid grid-cols-10 gap-5">
			<div className="col-span-10 lg:col-span-6">{user ? <CreatePost /> : null}</div>
			<div className="hidden lg:block col-span-4 sticky top-20">
				<RecommendedUsers />
			</div>
		</div>
	);
}
