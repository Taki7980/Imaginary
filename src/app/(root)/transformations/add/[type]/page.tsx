import Header from "@/components/shared/Header";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { transformationTypes } from "@/constants/SidebarLinks";
import TransformationForm from "@/components/shared/TransformationForm";
import { currentUser } from '@clerk/nextjs/server'
import { getUserById } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";

const AddTransformationTypePage = async ({
  params: { type },
}: { params: { type: string } }) => {
  const userId = (await currentUser())?.id;
  if (!userId) redirect("/sign-in");
  const user = await getUserById();
  if (!user) redirect("/sign-in");

  const transformation = transformationTypes[type as TransformationTypeKey];
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
          action={"Add"}
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  );
};

export default AddTransformationTypePage;
