"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import { clerkClient } from "@clerk/nextjs";

// get the getCurrentUser
export async function getCurrentUser() {
  await connectToDatabase();

  const { userId } = auth();
  if (!userId) return null;

  // 1️⃣ Try by clerkId
  let user = await User.findOne({ clerkId: userId });
  if (user) return user;

  // 2️⃣ Fetch Clerk user
  const clerkUser = await clerkClient.users.getUser(userId);
  const email = clerkUser.emailAddresses[0]?.emailAddress;

  // 3️⃣ Try by email (legacy user)
  if (email) {
    user = await User.findOne({ email });
    if (user) {
      user.clerkId = userId;
      await user.save();
      return user;
    }
  }

  // 4️⃣ Create new user
  user = await User.create({
    clerkId: userId,
    email,
    username:
      clerkUser.username ||
      clerkUser.firstName ||
      email?.split("@")[0],
    photo: clerkUser.imageUrl,
    credits: 10,
  });

  return user;
}

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();

    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

// READ - FIXED VERSION: Now accepts clerkId as parameter
export async function getUserById(clerkId?: string) {
  await connectToDatabase();

  // If clerkId is provided, use it; otherwise get from auth context
  let userId = clerkId;
  
  if (!userId) {
    const authResult = auth();
    userId = authResult.userId;
  }
  
  if (!userId) return null;

  const clerkUser = await clerkClient.users.getUser(userId);
  const email = clerkUser.emailAddresses[0]?.emailAddress;

  // 1️⃣ Try to find by clerkId
  let user = await User.findOne({ clerkId: userId });
  if (user) return user;

  // 2️⃣ Try to find by email (legacy user)
  if (email) {
    user = await User.findOne({ email });

    if (user) {
      // 🔗 Link legacy user to Clerk
      user.clerkId = userId;
      await user.save();
      return user;
    }
  }

  // 3️⃣ Create brand-new user
  user = await User.create({
    clerkId: userId,
    email,
    username:
      clerkUser.username ||
      clerkUser.firstName ||
      email?.split("@")[0],
    photo: clerkUser.imageUrl,
    credits: 10,
  });

  return user;
}

// UPDATE
export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

// DELETE
export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDatabase();

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee } },
      { new: true }
    );

    if (!updatedUserCredits) throw new Error("User credits update failed");

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}
