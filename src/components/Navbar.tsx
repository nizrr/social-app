import Link from "next/link";
import * as React from "react";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import { syncUser } from "@/actions/user.action";
import { currentUser } from "@clerk/nextjs/server";

async function Navbar() {
	const user = await currentUser();
	console.log("🚀 ~ Navbar ~ user:", user);
	if (user) await syncUser();
	return (
		<nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<Link
							href="/"
							className="text-xl font-bold text-primary font-mono tracking-wider">
							Socially
						</Link>
					</div>

					<DesktopNavbar />
					<MobileNavbar />
				</div>
			</div>
		</nav>
	);
}

export default Navbar;
