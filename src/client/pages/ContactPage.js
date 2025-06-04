import React, { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitted: false,
        error: 'Please fill out all required fields'
      });
      return;
    }
    
    // In a real application, you would send this data to your backend
    // For now, we'll just simulate a successful submission
    setFormStatus({
      submitted: true,
      error: null
    });
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-section">
      <h1>Contact Us</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <p style={{ marginBottom: '1.5rem' }}>
            Have questions, suggestions, or feedback? We'd love to hear from you! 
            Fill out the form and our team will get back to you as soon as possible.
          </p>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Our Information</h3>
            
            <p style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <i className="fas fa-map-marker-alt" style={{ marginRight: '1rem', color: '#4CAF50', width: '20px' }}></i>
              123 Eco Street, Green City, EC 12345
            </p>
            
            <p style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <i className="fas fa-phone" style={{ marginRight: '1rem', color: '#4CAF50', width: '20px' }}></i>
              (555) 123-4567
            </p>
            
            <p style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
              <i className="fas fa-envelope" style={{ marginRight: '1rem', color: '#4CAF50', width: '20px' }}></i>
              info@ecofinds.com
            </p>
            
            <p style={{ display: 'flex', alignItems: 'center' }}>
              <i className="fas fa-clock" style={{ marginRight: '1rem', color: '#4CAF50', width: '20px' }}></i>
              Monday - Friday: 9am - 5pm
            </p>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Connect With Us</h3>
            
            <div className="social-links" style={{ marginTop: '1rem' }}>
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-pinterest"></i></a>
            </div>
          </div>
        </div>
        
        <div>
          {formStatus.submitted ? (
            <div style={{ backgroundColor: '#e8f5e9', padding: '2rem', borderRadius: '8px', textAlign: 'center' }}>
              <i className="fas fa-check-circle" style={{ fontSize: '3rem', color: '#4CAF50', marginBottom: '1rem' }}></i>
              <h3 style={{ marginBottom: '1rem' }}>Thank You!</h3>
              <p>Your message has been sent successfully. We'll get back to you soon!</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              {formStatus.error && (
                <div style={{ backgroundColor: '#ffebee', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                  {formStatus.error}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  value={formData.subject} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea 
                  id="message" 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange} 
                  required 
                ></textarea>
              </div>
              
              <button type="submit" className="btn" style={{ width: '100%' }}>
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;