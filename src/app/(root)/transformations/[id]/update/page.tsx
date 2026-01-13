import { currentUser } from '@clerk/nextjs/server'
import { redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants/SidebarLinks";
import { getUserById } from "@/lib/actions/user.actions";
import { getImageById } from "@/lib/actions/image.actions";

const Page = async ({ params: { id } }: { params: { id: string } }) => {
	const userId = (await currentUser())?.id;
	if (!userId) redirect("/sign-in");

	const user = await getUserById(userId);
	const image = await getImageById(id);

	if (!user || !image) {
		redirect("/");
	}

	if (image.author?.clerkId !== userId) {
		redirect("/");
	}

	const transformation =
		transformationTypes[image.transformationType as TransformationTypeKey];

	if (!transformation) {
		redirect("/");
	}

	return (
		<>
			<Header
				title={transformation.title}
				subtitle={transformation.subTitle}
			/>

			<section className="mt-10">
				<TransformationForm
					action="Update"
					userId={user._id}
					type={image.transformationType as TransformationTypeKey}
					creditBalance={user.creditBalance}
					config={image.config}
					data={image}
				/>
			</section>
		</>
	);
};

export default Page;
