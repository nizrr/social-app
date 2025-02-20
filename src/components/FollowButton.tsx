"use client";

import { useState } from "react";
import { Button } from "./ui/button";

function FollowButton({ userId }: { userId: string }) {
	const [isLoading, setIsLoading] = useState(false);
	const handleFollow = async () => {};
	return (
		<Button
			size="sm"
			variant={"secondary"}
			onClick={handleFollow}
			disabled={isLoading}
			className="w-20">
			Follow
		</Button>
	);
}

export default FollowButton;
