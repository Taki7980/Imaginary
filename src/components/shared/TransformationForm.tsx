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
import { useEffect, useState, useTransition } from "react";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import { updateCredits } from "@/lib/actions/user.actions";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { getCldImageUrl } from "next-cloudinary";
import { addImage, updateImage } from "@/lib/actions/image.actions";
import { useRouter } from "next/navigation";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";

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
	const router = useRouter();
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

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		// console.log(values);
		if (data || image) {
			const transformationUrl = getCldImageUrl({
				width: image?.width,
				height: image?.height,
				src: image?.publicId,
				...transformationConfig,
			});
			const imageData = {
				title: values.title,
				publicId: image?.publicId,
				transformationType: type,
				width: image?.width,
				height: image?.height,
				config: transformationConfig,
				secureURL: image?.secureURL,
				transformationURL: transformationUrl,
				aspectRatio: values.aspectRatio,
				prompt: values.prompt,
				color: values.color,
			};
			if (action === "Add") {
				try {
					const newImage = await addImage({
						image: imageData,
						userId,
						path: "/",
					});
					if (newImage) {
						form.reset();
						setImage(data);
						router.push(`/transformations/${newImage._id}`);
					}
				} catch (error) {
					console.log(error);
				}
			}
			if (action === "Update") {
				try {
					const updatedImage = await updateImage({
						image: {
							...imageData,
							_id: data?._id,
						},
						userId,
						path: `/transformations/${data._id}`,
					});
					if (updatedImage) {
						router.push(`/transformations/${updatedImage._id}`);
					}
				} catch (error) {
					console.log(error);
				}
			}
		}
		setisSubmitting(false);
	};

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

	useEffect(() => {
		if (image && (type === "restore" || type === "removeBackground")) {
			setnewTransfromation(transformationType.config);
		}
	}, [image, transformationType.config, type]);

	return (
		<>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8"
				>
					 {creditBalance > Math.abs(creditFee) && <InsufficientCreditsModal />}
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
									value={field.value}
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
