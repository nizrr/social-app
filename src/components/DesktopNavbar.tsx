import React from "react";
import ModeToggle from "./ModeToggle";

function DesktopNavbar() {
	return (
		<div className="hidden md:block">
			<ModeToggle />
			{/* <div className="">DesktopNavbar</div> */}
		</div>
	);
}

export default DesktopNavbar;
