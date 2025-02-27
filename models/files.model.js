const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
    cloudinaryUrl: {
        type: String,
        required: [true, "Cloudinary URL is required"],
    },
    publicId: {
        type: String,
        required: [true, "Cloudinary Public ID is required"],
    },
    originalname: {
        type: String,
        required: [true, "Original name is required"],
    },
    localpath:{
      type:String,
      required:[true, "path is  required"]
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: [true, "User is required"],
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

const File = mongoose.model("File", fileSchema);
module.exports = File;
