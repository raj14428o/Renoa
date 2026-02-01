const User = require("../models/user");

const toggleFollow = async (currentUserId, targetUserId) => {
  if (currentUserId === targetUserId) {
    throw new Error("SELF_FOLLOW");
  }

  const [me, targetUser] = await Promise.all([
    User.findById(currentUserId),
    User.findById(targetUserId),
  ]);

  if (!targetUser) {
    throw new Error("USER_NOT_FOUND");
  }

  const isFollowing = me.following.some(
    id => id.toString() === targetUserId
  );

  if (isFollowing) {
    me.following.pull(targetUserId);
    me.followingCount = Math.max(0, me.followingCount - 1);

    targetUser.followers.pull(currentUserId);
    targetUser.followersCount = Math.max(
      0,
      targetUser.followersCount - 1
    );
  } else {
    me.following.addToSet(targetUserId);
    me.followingCount += 1;

    targetUser.followers.addToSet(currentUserId);
    targetUser.followersCount += 1;
  }

  await Promise.all([me.save(), targetUser.save()]);

  return {
    isFollowing: !isFollowing,
    followersCount: targetUser.followersCount,
    followingCount: me.followingCount,
  };
};

const getFollowers = async (profileUserId, currentUserId) => {
  const profileUser = await User.findById(profileUserId)
    .populate("followers", "fullName profileImageUrl");

  if (!profileUser) {
    throw new Error("USER_NOT_FOUND");
  }

  const currentUser = await User.findById(currentUserId);

  return profileUser.followers
    .filter(u => u._id.toString() !== currentUserId)
    .map(u => ({
      _id: u._id.toString(),
      fullName: u.fullName,
      profileImageUrl: u.profileImageUrl,
      isFollowing: currentUser.following.some(
        id => id.toString() === u._id.toString()
      )
    }));
};

const getFollowing = async (profileUserId, currentUserId) => {
  const profileUser = await User.findById(profileUserId)
    .populate("following", "fullName profileImageUrl");

  if (!profileUser) {
    throw new Error("USER_NOT_FOUND");
  }

  const currentUser = await User.findById(currentUserId);

  return profileUser.following
    .filter(u => u._id.toString() !== currentUserId)
    .map(u => ({
      _id: u._id.toString(),
      fullName: u.fullName,
      profileImageUrl: u.profileImageUrl,
      isFollowing: currentUser.following.some(
        id => id.toString() === u._id.toString()
      )
    }));
};

module.exports = {
  toggleFollow,
  getFollowers,
  getFollowing,
};
