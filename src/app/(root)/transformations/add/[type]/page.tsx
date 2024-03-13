import Header from "@/components/shared/Header";
import React from "react";
import { transformationTypes } from "@/constants/SidebarLinks";
import TransformationForm from "@/components/shared/TransformationForm";
import { auth } from "@clerk/nextjs";
import { getUserById } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const AddTransformationTypePage = async ({
	params: { type },
}: SearchParamProps) => {
	const { userId } = auth();
	if (!userId) redirect("/sign-in");
	const user = await getUserById(userId);
	return (
		<>
			<Header
				title={transformationTypes[type].title}
				subtitle={transformationTypes[type].subTitle}
			/>
			<section className="mt-10">
				<TransformationForm
					action={"Add"}
					userId={user._id}
					type={
						transformationTypes[type].type as TransformationTypeKey
					}
					creditBalance={0}
				/>
			</section>
		</>
	);
};

export default AddTransformationTypePage;
