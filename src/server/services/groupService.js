import { isObjectID } from "../utils/validator";
import mongoose from "mongoose";
import groupModel from "../models/groups";
import { addGroupToUser } from "./userService";
// eslint-disable-next-line no-unused-vars
import dishesModel from "../models/dishes";

export const isAllowedToReadOrders = async (groupId, userId) => {
  return (
    (await isUserInGroup(userId, groupId)) ||
    (await isAllowedToEditGroup(groupId, userId))
  );
};

export const isAllowedToEditGroup = async (groupId, userId) => {
  if (!isObjectID(groupId)) {
    return { message: "invalid group, check your Id", status: false };
  }
  let result = await groupModel
    .findOne({
      _id: mongoose.Types.ObjectId(groupId),
      ownerId: mongoose.Types.ObjectId(userId),
    })
    .select("ownerId users")
    .lean();
  if (!result) {
    return false;
  }
  return result;
};

export const isUserInGroup = async (userId, groupId) => {
  let result = await groupModel
    .findOne({
      $and: [
        { "users.userId": mongoose.Types.ObjectId(userId) },
        { _id: mongoose.Types.ObjectId(groupId) },
      ],
    })
    .select("users ownerId")
    .lean();
  if (!result) {
    return false;
  }
  return result;
};

export const getGroupById = async (groupId) => {
  if (!isObjectID(groupId)) {
    return { message: "invalid group, check your Id", status: false };
  }
  let result = await groupModel
    .findOne({
      _id: mongoose.Types.ObjectId(groupId),
    })
    .populate("dishes");
  if (!result) {
    return { message: "group does not exist", status: false };
  }
  return { result, status: true };
};

export const inviteMemberToGroup = async (user, groupId) => {
  let result = await groupModel.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(groupId),
    },
    {
      $push: {
        users: {
          userId: mongoose.Types.ObjectId(user._id),
          name: user.name,
        },
      },
    }
  );
  if (!result) {
    return { status: false, message: "Something went wrong" };
  }
  return { status: true, result };
};

export const addMemberToGroup = async (ownerId, user, groupId) => {
  if (!isObjectID(ownerId)) {
    return { message: "you are not the owner of this group", status: false };
  }
  if (!isObjectID(groupId)) {
    return { message: "invalid group, check your Id", status: false };
  }

  let result = await groupModel.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(groupId),
      ownerId: mongoose.Types.ObjectId(ownerId),
    },
    {
      $push: {
        users: {
          userId: mongoose.Types.ObjectId(user._id),
          name: user.name,
        },
      },
    }
  );
  if (!result) {
    return { status: false, message: "Something went wrong" };
  }
  return { status: true, result };
};

export const createGroup = async (name, ownerId, description) => {
  if (!isObjectID(ownerId)) {
    return { message: "invalid owner, check your Id", status: false };
  }
  let createdGroup = await groupModel.create({
    name,
    ownerId,
    description,
  });
  let addGroupResult = await addGroupToUser(
    ownerId,
    createdGroup._id,
    name,
    true
  );
  if (!addGroupResult.status) {
    return { message: addGroupResult.message, status: false };
  }
  return { result: createdGroup, status: true };
};

export const pullDishFromGroup = async (dishId) => {
  let pullResult = await groupModel.updateMany(
    {
      dishes: mongoose.Types.ObjectId(dishId),
    },
    {
      $pull: {
        dishes: mongoose.Types.ObjectId(dishId),
      },
    }
  );
  return pullResult.nModified;
};

export const areDishesInGroup = async (groupId, dishDetails) => {
  let dishArray = dishDetails.map((detail) => detail.dishId);
  let groupFound = await groupModel
    .findOne({
      _id: mongoose.Types.ObjectId(groupId),
      dishes: { $all: dishArray },
    })
    .select("dishes")
    .lean();
  if (!groupFound) {
    return false;
  }
  return true;
};

export const editDishes = async (groupId, dishes) => {
  if (!isObjectID(groupId)) {
    return { message: "invalid group, check your Id", status: false };
  }
  let editDishes = await groupModel.findOneAndUpdate(
    {
      _id: groupId,
    },
    {
      dishes: dishes,
    },
    { new: true }
  );
  if (!editDishes) {
    return {
      message: "dish or group does not exist",
      status: false,
    };
  }
  return { status: true, dishes: editDishes };
};
