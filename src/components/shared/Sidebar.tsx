"use client";
import { navLinks } from "@/constants/SidebarLinks";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Sidebar = () => {
	const pathname = usePathname();
	return (
		<aside className="sidebar">
			<div className="flex size-full flex-col gap-4">
				<Link href="/" className="sidebar-logo">
					<Image src="/logo.png" alt="home" width={180} height={28} />
				</Link>

				<nav className="sidebar-nav">
					<SignedIn>
						<ul className="sidebar-nav_elements">
							{navLinks.map((link, index) => {
								const isActive = link.route === pathname;
								return (
									<li
										className={`sidebar-nav_element group ${
											isActive
												? "bg-purple-gradient text-white"
												: "text-gray-700"
										}`}
										key={index}
									>
										<Link
											className="sidebar-link"
											href={link.route}
										>
											<Image
												src={link.icon}
												alt="logo"
												width={24}
												height={24}
                                                className={`${isActive && 'brightness-200'}`}
											/>
                                            {link.label}
										</Link>
									</li>
								);
							})}
						</ul>
					</SignedIn>

                    <SignedOut>
                        
                    </SignedOut>
				</nav>
			</div>
		</aside>
	);
};

export default Sidebar;
