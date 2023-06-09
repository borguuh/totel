const Roomate = require("../../models/Roomate");
const helper = require("../../helper/helper");
const catchAsyncFunc = require("../../middlewares/catchAsyncFunc");
const cloudinary = require("cloudinary").v2;
const Review = require("../../models/Review");
const User = require("../../models/User");
const Wishlist = require("../../models/Wishlist");

exports.getAllRoomates = catchAsyncFunc(async (req, res, next) => {
  const result = await Roomate.find();
  return helper.sendSuccess(res, result, req, "Success");
});

exports.getRoomates = catchAsyncFunc(async (req, res, next) => {
  const { room_id } = req.query;
  const result = await Roomate.find({ user: room_id });
  return helper.sendSuccess(res, result, req, "Success");
});

exports.searchByRoomatesCount = catchAsyncFunc(async (req, res, next) => {
  const userId = req.query.userId;

  try {
    const roommates = await Roomate.find({ user: userId });

    const roommateArray = roommates.map((roommate) => {
      return {
        id: roommate._id,
        first_name: roommate.first_name,
        last_name: roommate.last_name,
      };
    });

    const roommateCount = roommateArray.length;

    console.log("Number of roommates:", roommateCount);
    console.log("Roommate array:", roommateArray);

    res.json(roommateArray);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

exports.searchRoomates = catchAsyncFunc(async (req, res, next) => {
  const occupation = req.query.occupation
    ? req.query.occupation.toString()
    : "";
  const interests = req.query.interests ? req.query.interests.toString() : "";
  const language = req.query.language ? req.query.language.toString() : "";
  const bio = req.query.bio ? req.query.bio.toString() : "";

  const results = await Roomate.find({
    $or: [
      { bio: { $regex: bio, $options: "i" } },
      { occupation: { $regex: occupation, $options: "i" } },
      { language: { $regex: language, $options: "i" } },
      { interests: { $regex: interests, $options: "i" } },
    ],
  });

  res.status(200).json({ results });
});

exports.addRoomate = catchAsyncFunc(async (req, res, next) => {
  const roomateData = req.body;
  roomateData.user = req.query.user_id;
  roomateData.room = req.query.room_id;

  let image = req.files.image;
  const imageLinks = [];

  for (let i = 0; i < image.length; i++) {
    const result = await cloudinary.uploader.upload(image[i].tempFilePath, {
      folder: "Reviews",
    });

    imageLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }
  const wishlist = await Wishlist.find({ user: roomateData.user });
  const user = await User.findOne({ _id: roomateData.user });
  const reviews = await Review.find({ user: roomateData.user });

  roomateData.wishlist = wishlist;
  roomateData.reviews = reviews;

  const is_exist = await Roomate.findOne({ user: roomateData.user });
  if (is_exist)
    return helper.sendError(
      403,
      res,
      { errors: "Roomate already exists" },
      req
    );
  roomateData.image = imageLinks;
  roomateData.memberSince = user?.createdAt;

  const result = await Roomate.create(roomateData);
  return helper.sendSuccess(res, result, req, "Success");
});

exports.updateRoomateProfile = catchAsyncFunc(async (req, res, next) => {
  const roomateData = req.body;
  roomateData.user = req.query.user_id;
  let image = req.files.image;
  const imageLinks = [];

  for (let i = 0; i < image.length; i++) {
    const result = await cloudinary.uploader.upload(image[i].tempFilePath, {
      folder: "Reviews",
    });

    imageLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }
  console.log(roomateData.user);
  const wishlist = await Wishlist.find({ user: roomateData.user });
  const user = await User.findOne({ _id: roomateData.user });
  const reviews = await Review.find({ user: roomateData.user });

  roomateData.wishlist = wishlist;
  roomateData.reviews = reviews;
  roomateData.image = imageLinks;
  roomateData.memberSince = user?.createdAt;
  const result = await Roomate.findOneAndUpdate(
    { email: roomateData.email },
    roomateData,
    {
      new: true,
      runValidators: true,
      userFindANdModify: false,
    }
  );
  roomateData.image = imageLinks;
  roomateData.memberSince = user?.createdAt;

  return helper.sendSuccess(res, result, req, "Success");
});

exports.deleteRoomate = catchAsyncFunc(async (req, res, next) => {
  const { roomate_id } = req.query;
  const result = await Roomate.findByIdAndDelete(roomate_id);
  helper.sendSuccess(
    res,
    { msg: "Roomate deleted successfully." },
    req,
    "Success"
  );
});
