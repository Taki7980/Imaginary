// types/index.d.ts

declare type CreateUserParams = {
  clerkId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  photo: string;
};

declare type UpdateUserParams = {
  firstName?: string;
  lastName?: string;
  username?: string;
  photo?: string;
};

// Image Types
declare type ImageDocument = {
  _id: string;
  title: string;
  transformationType: string;
  publicId: string;
  secureURL: string;
  width?: number;
  height?: number;
  config?: object;
  transformationUrl?: string;
  aspectRatio?: string;
  color?: string;
  prompt?: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    clerkId?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
};

declare type AddImageParams = {
  image: {
    title: string;
    publicId: string;
    transformationType: string;
    width: number;
    height: number;
    config: object;
    secureURL: string;
    transformationURL?: string;
    aspectRatio?: string;
    prompt?: string;
    color?: string;
  };
  userId: string;
  path: string;
};

declare type UpdateImageParams = {
  image: {
    _id: string;
    title: string;
    publicId: string;
    transformationType: string;
    width: number;
    height: number;
    config: object;
    secureURL: string;
    transformationURL?: string;
    aspectRatio?: string;
    prompt?: string;
    color?: string;
  };
  userId: string;
  path: string;
};

declare type Transformations = {
  restore?: boolean;
  fillBackground?: boolean;
  remove?: {
    prompt: string;
    removeShadow?: boolean;
    multiple?: boolean;
  };
  recolor?: {
    prompt?: string;
    to: string;
    multiple?: boolean;
  };
  removeBackground?: boolean;
};

declare type TransformationFormProps = {
  action: "Add" | "Update";
  userId: string;
  type: TransformationTypeKey;
  creditBalance: number;
  data?: ImageDocument | null;
  config?: Transformations | null;
};

declare type TransformedImageProps = {
  image: any;
  type: string;
  title: string;
  transformationConfig: Transformations | null;
  isTransforming: boolean;
  setIsTransforming?: React.Dispatch<React.SetStateAction<boolean>>;
  hasDownload?: boolean;
};

declare type TransformationTypeKey =
  | "restore"
  | "fill"
  | "remove"
  | "recolor"
  | "removeBackground";

// Transaction Types
declare type CheckoutTransactionParams = {
  plan: string;
  credits: number;
  amount: number;
  buyerId: string;
};

declare type CreateTransactionParams = {
  stripeId: string;
  amount: number;
  credits: number;
  plan: string;
  buyerId: string;
  createdAt: Date;
};

// Search Params
declare type SearchParamProps = {
  params: { id: string; type: TransformationTypeKey };
  searchParams: { [key: string]: string | string[] | undefined };
};
