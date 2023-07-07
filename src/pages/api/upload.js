import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  
})
export default async function handler(req, res) {
  try {
    console.log('Request body:', req.body);
    const { images } = JSON.parse(req.body);

    const uploads = [];

    const maxImages = 10; // Set the maximum number of images to upload
    const imagesToUpload = images.slice(0, maxImages); // Get a subset of images within the limit

    for (const image of imagesToUpload) {
      try {
        const results = await cloudinary.uploader.upload(image.src, {
          folder: 'img-carbon-checker',
          resource_type: 'auto'
        });
        uploads.push(results);
      } catch (error) {
        console.log(`Error uploading image: ${image.src}`);
        console.log(error);
        // Continue to the next image upload without throwing an exception
        continue;
      }
    }

    res.status(200).json({
      data: uploads
    });
  } catch (error) {
    console.log(error);
    // Handle any other unexpected errors here
    res.status(500).json({
      error: 'Internal server error'
    });
  }
}
