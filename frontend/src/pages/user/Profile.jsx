import React, { useState } from 'react';
import { User, Mail, Shield, Save } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '555-0199', // Mock data
    address: '123 RetailHub St, Commerce City, ST 12345'
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate save
    setIsEditing(false);
    alert('Profile updated successfully! (Frontend Simulation)');
  };

  return (
    <div className="page-container max-w-[800px]">
      <div className="page-header">
        <h2>My Profile</h2>
      </div>

      <div className="card mb-xl">
        <div className="card-body flex items-center gap-xl p-2xl border-b border-border">
          <div className="w-24 h-24 bg-primary-light text-primary rounded-full flex items-center justify-center text-4xl font-bold flex-shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-xs">{user?.name}</h3>
            <div className="flex items-center gap-sm text-muted mb-xs">
              <Mail size={16} /> {user?.email}
            </div>
            <div className="flex items-center gap-sm text-primary text-sm font-medium">
              <Shield size={16} /> Role: {user?.role}
            </div>
          </div>
        </div>
        
        <div className="card-body p-2xl">
          <div className="flex justify-between items-center mb-xl">
            <h3 className="text-lg font-semibold flex items-center gap-sm">
              <User size={20} className="text-primary" /> Personal Information
            </h3>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
            <div className="form-row">
              <Input 
                id="name" 
                label="Full Name" 
                value={formData.name} 
                onChange={handleChange}
                disabled={!isEditing} 
              />
              <Input 
                id="email" 
                type="email" 
                label="Email Address" 
                value={formData.email} 
                onChange={handleChange}
                disabled={!isEditing} 
              />
            </div>
            <Input 
              id="phone" 
              label="Phone Number" 
              value={formData.phone} 
              onChange={handleChange}
              disabled={!isEditing} 
            />
            <Input 
              id="address" 
              type="textarea"
              label="Default Delivery Address" 
              value={formData.address} 
              onChange={handleChange}
              disabled={!isEditing} 
            />
            
            {isEditing && (
              <div className="flex gap-md justify-end mt-md pt-md border-t border-border">
                <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" icon={<Save size={16} />}>
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="danger" onClick={logout}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default Profile;
