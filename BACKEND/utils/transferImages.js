import User from '../models/userModel.js';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Created uploads directory');
}

const downloadImage = async (imageUrl, fileName) => {
  try {
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream'
    });

    const filePath = path.join(uploadsDir, fileName);
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading image: ${imageUrl}`, error);
    throw error;
  }
};

const transferImages = async () => {
  try {
    // Get all doctors from database
    const doctors = await User.find({ role: 'doctor' });
    console.log(`Found ${doctors.length} doctors`);

    for (const doctor of doctors) {
      if (doctor.avatar) {
        try {
          // Generate a unique filename
          const fileName = `${Date.now()}-${doctor._id}.jpg`;
          
          // Download and save the image
          await downloadImage(doctor.avatar, fileName);
          
          // Update the doctor's avatar field with new path
          doctor.avatar = fileName;
          await doctor.save();
          
          console.log(`Successfully transferred image for doctor: ${doctor._id}`);
        } catch (error) {
          console.error(`Failed to transfer image for doctor: ${doctor._id}`, error);
        }
      }
    }

    console.log('Image transfer completed');
  } catch (error) {
    console.error('Error during image transfer:', error);
  }
};

// Run the transfer
transferImages(); 