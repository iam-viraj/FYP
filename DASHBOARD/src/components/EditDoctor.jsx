const EditDoctor = ({ doctor }) => {
  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      {/* ... other fields ... */}
      
      {doctor.avatar && (
        <div className="current-image">
          <img 
            src={`http://localhost:4001/uploads/${doctor.avatar}`}
            alt="Current profile"
            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
          />
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="avatar">Update Profile Photo</label>
        <input
          type="file"
          id="avatar"
          name="avatar"
          accept="image/*"
          onChange={handleFileChange}
          className="form-control"
        />
      </div>
      
      {/* ... rest of form ... */}
    </form>
  );
}; 