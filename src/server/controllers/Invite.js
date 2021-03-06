import jwt from "jsonwebtoken";
import { getUserById, addGroupToUser } from "../services/userService";
import {
  inviteMemberToGroup,
  isAllowedToEditGroup,
} from "../services/groupService";
import { storeToken, findToken } from "../services/redisService";
import { nanoid } from "nanoid";
import { OK_RESPONSE, HANDLED_ERROR_RESPONSE } from "../constants/http";

export const getInviteController = async (req, res) => {
  let inviteHash = req.params.inviteHash;
  let userId = req._id;
  let inviteToken = await findToken(inviteHash);
  if (!inviteToken) {
    return res
      .status(HANDLED_ERROR_RESPONSE)
      .json({ message: "Invite hash is not valid or expired" });
  }
  jwt.verify(inviteToken, process.env.SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res
        .status(HANDLED_ERROR_RESPONSE)
        .json({ message: "Invite token is invalid or expired" });
    }
    let groupId = decoded.groupId;
    let user = await getUserById(userId);
    if (!user.status) {
      return res.status(HANDLED_ERROR_RESPONSE).json({ message: "Email does not exist" });
    }
    user = user.result;
    if (user.groups.find((group) => group.groupId == groupId)) {
      return res.status(HANDLED_ERROR_RESPONSE).json({ message: "Already in group" });
    }
    let inviteToGroupResult = await inviteMemberToGroup(user, groupId);
    if (!inviteToGroupResult.status) {
      return res.status(HANDLED_ERROR_RESPONSE).json({ message: inviteToGroupResult.message });
    }

    let addGroupToUserResult = await addGroupToUser(
      userId,
      inviteToGroupResult.result._id,
      inviteToGroupResult.result.name,
      false
    );
    if (!addGroupToUserResult.status) {
      return res.status(HANDLED_ERROR_RESPONSE).json({ message: addGroupToUserResult.message });
    }
    return res.status(OK_RESPONSE).json({ groupId });
  });
};

export const createInviteController = async (req, res) => {
  let ownerId = req._id;
  let groupId = req.params.groupId;
  let isAllowedResult = isAllowedToEditGroup(groupId, ownerId);
  if (!isAllowedResult) {
    return res.status(HANDLED_ERROR_RESPONSE).json({
      message: "not allowed to create invite link or group does not exist",
    });
  }
  let payload = JSON.stringify({ groupId, exp: Date.now() / 1000 + 3600 });
  jwt.sign(payload, process.env.SECRET_KEY, async (err, token) => {
    let hash = await nanoid(10);
    await storeToken(hash, token);
    return res.status(OK_RESPONSE).json({ hash });
  });
};
