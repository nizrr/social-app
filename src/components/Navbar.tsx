import Link from "next/link";
import * as React from "react";
import ModeToggle from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";

function Navbar() {
	return (
		<nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<div className="flex items-center">
						<Link
							href="/"
							className="text-xl font-bold text-primary font-mono tracking-wider">
							Socially
						</Link>
					</div>
					{/* <div className="flex items-center gap-3">
						

						<SignedOut>
							<SignInButton mode="modal">
								<Button>Sign in</Button>
							</SignInButton>
						</SignedOut>
						<SignedIn>
							<UserButton />
						</SignedIn>
						<Button variant={"secondary"}>Click Me</Button>
					</div> */}
					<DesktopNavbar />
					<MobileNavbar />
				</div>
			</div>
		</nav>
	);
}

export default Navbar;
