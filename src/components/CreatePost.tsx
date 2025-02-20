"use client";
import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useUser } from "@clerk/nextjs";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { ImageIcon, Loader2Icon, SendIcon } from "lucide-react";
import { createPost } from "@/actions/post.action";
import toast from "react-hot-toast";

function CreatePost() {
	const { user } = useUser();
	const [content, setContent] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [isPosting, setIsPosting] = useState(false);
	const [showImageUpload, setShowImageUpload] = useState(false);

	const handleSubmit = async () => {
		if (!content.trim() && !imageUrl) return;
		setIsPosting(true);
		try {
			const result = await createPost(content, imageUrl);
			if (result.success) {
				setContent("");
				setImageUrl("");
				setShowImageUpload(false);
				toast.success("Post created successfully");
			}
		} catch (error) {
			console.error("Error creating post", error);
			toast.error("Error creating post");
		} finally {
			setIsPosting(false);
		}
	};

	return (
		<Card className="mb-6">
			<CardContent className="pt-6">
				<div className="space-y-4 flex space-x-4">
					<Avatar className="w-10 h-10">
						<AvatarImage src={`${user?.imageUrl}`}></AvatarImage>
					</Avatar>
					<Textarea
						className="border-none min-h-[100px] resize-none focus-visible:ring-0 p-0 text-base"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						placeholder="What's on your mind?"
						disabled={isPosting}
					/>
				</div>
				{/* Image upload */}
				<div className="flex items-center justify-between border-t pt-2">
					<div className="flex space-x-2">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setShowImageUpload(!showImageUpload)}
							className="text-muted-foreground"
							disabled={isPosting}>
							<ImageIcon className="size-4 mr-1" />
							Photo
						</Button>
					</div>
					<Button
						className="flex items-center"
						onClick={handleSubmit}
						disabled={(!content.trim() && !imageUrl) || isPosting}>
						{isPosting ? (
							<>
								<Loader2Icon className="size-4 animate-spin mr-1" />
								Posting...
							</>
						) : (
							<>
								<SendIcon className="size-4 mr-1" />
								Post
							</>
						)}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export default CreatePost;
