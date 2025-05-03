const registerDoctor = async (req, res) => {
  try {
    console.log('Request file:', req.file); // Debug log
    const doctorData = req.body;

    if (req.file) {
      // Save the filename in the database
      doctorData.avatar = req.file.filename;
      console.log('Saved avatar filename:', doctorData.avatar);
    }

    const doctor = new User({
      ...doctorData,
      role: 'doctor'
    });

    await doctor.save();
    console.log('Doctor saved:', doctor);
    res.status(201).json({ success: true, message: 'Doctor registered successfully', doctor });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
}; 