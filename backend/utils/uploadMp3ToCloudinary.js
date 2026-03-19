const cloudinary = require("../config/cloudinary");

function uploadMp3ToCloudinary(localPath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      localPath,
      {
        resource_type: "video", // for audio/video files
        folder: "video_summary_mp3",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        resolve(result.secure_url); // https://...
      }
    );
  });
}

module.exports = { uploadMp3ToCloudinary };
