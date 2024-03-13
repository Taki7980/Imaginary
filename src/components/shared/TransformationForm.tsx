"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
	aspectRatioOptions,
	creditFee,
	defaultValues,
	transformationTypes,
} from "@/constants/SidebarLinks";
import { CustomField } from "./CustomField";
import { useState, useTransition } from "react";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import { updateCredits } from "@/lib/actions/user.actions";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";

export const formSchema = z.object({
	title: z.string(),
	aspectRatio: z.string().optional(),
	color: z.string().optional(),
	prompt: z.string().optional(),
	publicId: z.string(),
});

const TransformationForm = ({
	action,
	data = null,
	userId,
	type,
	creditBalance,
	config = null,
}: TransformationFormProps) => {
	const transformationType = transformationTypes[type];
	const [image, setImage] = useState(data);
	const [newTransfromation, setnewTransfromation] =
		useState<Transformations | null>(null);
	const [isSubmitting, setisSubmitting] = useState<boolean>(false);
	const [isTransforming, setisTransforming] = useState<boolean>(false);
	const [transformationConfig, setTransformationConfig] =
		useState<Transformations | null>(config);

	const [isPending, startTransition] = useTransition();
	const initialValues =
		data && action === "Update"
			? {
					title: data?.title,
					aspectRatio: data?.aspectRatio,
					color: data?.color,
					prompt: data?.prompt,
					publicId: data?.publicId,
			  }
			: defaultValues;

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: initialValues,
	});
	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
	}

	const onSelectFieldHandler = (
		value: string,
		onChangeField: (value: string) => void
	) => {
		const imageSize = aspectRatioOptions[value as AspectRatioKey];
		setImage((prevState: any) => ({
			...prevState,
			aspectRatio: imageSize.aspectRatio,
			width: imageSize.width,
			height: imageSize.height,
		}));
		setnewTransfromation(transformationType.config);
		return onChangeField(value);
	};

	const onInputChangeHandler = (
		fieldName: string,
		value: string,
		type: string,
		onChangeField: (value: string) => void
	) => {
		debounce(() => {}, 1000);
		setnewTransfromation((prevStep: any) => ({
			...prevStep,
			[type]: {
				...prevStep?.[type],
				[fieldName === "prompt" ? "prompt" : "to"]: value,
			},
		}));
		return onChangeField(value);
	};

	const onTransfromHandler = async () => {
		setisTransforming(true);
		setTransformationConfig(
			deepMergeObjects(newTransfromation, transformationConfig)
		);
		setnewTransfromation(null);
		startTransition(async () => {
			await updateCredits(userId, creditFee);
		});
	};
	return (
		<>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8"
				>
					<CustomField
						control={form.control}
						name="title"
						formLabel="Image Title"
						className="w-full"
						render={({ field }) => (
							<Input {...field} className="input-field" />
						)}
					/>
					{type === "fill" && (
						<CustomField
							control={form.control}
							name="aspectRatio"
							formLabel="Aspect Ratio"
							className="w-full"
							render={({ field }) => (
								<Select
									onValueChange={(value) => {
										onSelectFieldHandler(
											value,
											field.onChange
										);
									}}
								>
									<SelectTrigger className="select-field">
										<SelectValue placeholder="Select Size" />
									</SelectTrigger>
									<SelectContent>
										{Object.keys(aspectRatioOptions).map(
											(key, index) => (
												<SelectItem
													key={index}
													value={key}
													className="select-item"
												>
													{
														aspectRatioOptions[
															key as AspectRatioKey
														].label
													}
												</SelectItem>
											)
										)}
									</SelectContent>
								</Select>
							)}
						/>
					)}

					{(type === "remove" || type === "recolor") && (
						<div className="prompt-field">
							<CustomField
								control={form.control}
								name="prompt"
								formLabel={
									type === "remove"
										? "Object to remove"
										: "Object to recolor"
								}
								className="w-full"
								render={({ field }) => (
									<Input
										{...field}
										value={field.value}
										className="input-field"
										onChange={(e) => {
											onInputChangeHandler(
												"prompt",
												e.target.value,
												type,
												field.onChange
											);
										}}
									/>
								)}
							/>
						</div>
					)}

					{type === "recolor" && (
						<CustomField
							control={form.control}
							name="color"
							formLabel="Color Replacement"
							className="w-full"
							render={({ field }) => (
								<Input
									{...field}
									value={field.value}
									className="input-field"
									onChange={(e) => {
										onInputChangeHandler(
											"color",
											e.target.value,
											"recolor",
											field.onChange
										);
									}}
								/>
							)}
						/>
					)}
					<div className="media-uploader-field">
						<CustomField
							control={form.control}
							name="publicId"
							
							className="flex size-full flex-col"
							render={({ field }) => (
								<MediaUploader
									onValueChange={field.onChange}
									setImage={setImage}
									publicId={field.value}
									image={image}
									type={type}
								/>
							)}
						/>
						<TransformedImage
						image={image}
						type={type}
						title={form.getValues().title}
						isTransforming={isTransforming}
						setIsTransforming={setisTransforming}
						transformationConfig={transformationConfig}
						/>
					</div>
					<div className="flex flex-col gap-4">
						<Button
							disabled={
								isTransforming || newTransfromation === null
							}
							type="button"
							className="submit-button capitalize"
							onClick={onTransfromHandler}
						>
							{isTransforming
								? "Transforming..."
								: "Apply Transformation"}
						</Button>
						<Button
							disabled={isSubmitting}
							type="submit"
							className="submit-button capitalize"
						>
							{isSubmitting ? "Submitting..." : "Save Image"}
						</Button>
					</div>
				</form>
			</Form>
		</>
	);
};

export default TransformationForm;