import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserEdit, FaCalendarPlus, FaTrashAlt, FaSpinner, FaEnvelope, FaLock } from 'react-icons/fa';

function Settings({ user, setUser, userRole }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(''); // State for the Base64 string
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState(null);

  useEffect(() => {
    if (user?.id) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword('');
      setProfileImage(user.profileImage || '');
      if (userRole === 'COUNSELOR') {
        setSlots(user.availableSlots || []);
      }
    }
  }, [user, userRole]);

  if (!user?.id) {
    return (
      <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow-lg">
        <p className="text-lg">Please log in to view settings.</p>
      </div>
    );
  }

  // Decide endpoint based on role
  const getUpdateEndpoint = () => {
    switch (userRole?.toUpperCase()) {
      case 'COUNSELOR':
        return `http://localhost:8080/api/counselors/update/${user.id}`;
      case 'HOD':
        return `http://localhost:8080/api/hod/update-profile/${user.id}`;
      default:
        return `http://localhost:8080/api/staff/update-profile/${user.id}`;
    }
  };

  const updateProfile = async () => {
    setIsSavingProfile(true);
    try {
      const endpoint = getUpdateEndpoint();
      const updatedData = {
        ...user,
        name,
        email,
        profileImage, // Send the Base64 string
        ...(password && { password }),
      };

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to update profile. Status: ${response.status}`);
      }

      const data = await response.json();
      const updatedUser = { ...data, role: userRole.toUpperCase() };

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      if (userRole === 'COUNSELOR') {
        setSlots(data.availableSlots || []);
      }
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const addSlot = async () => {
    if (!selectedDate || !selectedTime) {
      return toast.warn('Please select both a date and a time.');
    }

    const newSlotDate = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':');
    newSlotDate.setHours(hours, minutes, 0, 0);

    if (newSlotDate < new Date()) {
      return toast.error('You cannot add a slot in the past.');
    }

    const newSlotISO = newSlotDate.toISOString();

    if (slots.includes(newSlotISO)) {
      return toast.warn('This slot already exists.');
    }

    setIsAddingSlot(true);
    try {
      const response = await fetch(`http://localhost:8080/api/counselors/${user.id}/slots/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify([newSlotISO]),
      });

      if (!response.ok) {
        throw new Error('Failed to add slot.');
      }

      const updatedSlots = [...slots, newSlotISO];
      setSlots(updatedSlots);
      const updatedUser = { ...user, availableSlots: updatedSlots };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSelectedDate(null);
      setSelectedTime('');
      toast.success('Slot added successfully!');
    } catch (err) {
      console.error('Add slot error:', err);
      toast.error('Failed to add slot.');
    } finally {
      setIsAddingSlot(false);
    }
  };

  const removeSlot = async (slotToRemove) => {
    if (!window.confirm('Are you sure you want to remove this slot?')) return;

    setDeletingSlotId(slotToRemove);
    try {
      const response = await fetch(`http://localhost:8080/api/counselors/${user.id}/slots/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'text/plain' },
        credentials: 'include',
        body: slotToRemove,
      });

      if (!response.ok) {
        throw new Error('Failed to remove slot.');
      }

      const updatedSlots = slots.filter((slot) => slot !== slotToRemove);
      setSlots(updatedSlots);
      const updatedUser = { ...user, availableSlots: updatedSlots };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Slot removed successfully!');
    } catch (err) {
      console.error('Remove slot error:', err);
      toast.error('Failed to remove slot.');
    } finally {
      setDeletingSlotId(null);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result); 
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="max-w-4xl mx-auto p-6 font-sans">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b-2 pb-2">Account Settings</h2>

      {/* Profile Section */}
      <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
        <h3 className="text-2xl font-semibold mb-4 flex items-center text-indigo-700">
          <FaUserEdit className="mr-3" /> Profile Information
        </h3>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-6">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
          </div>
          <div className="flex-grow w-full space-y-4">
            <div>
              <label htmlFor="name-input" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label htmlFor="email-input" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-1">
                Password (leave blank to keep unchanged)
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
            <div>
              <label htmlFor="profile-image-upload" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Image
              </label>
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>
        </div>

        <button
          onClick={updateProfile}
          disabled={isSavingProfile}
          className="mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSavingProfile ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : (
            <FaUserEdit className="mr-2" />
          )}
          <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
        </button>
      </div>

      {/* Available Slots Section (Only for Counselors) */}
      {userRole === 'COUNSELOR' && (
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-semibold mb-4 flex items-center text-indigo-700">
            <FaCalendarPlus className="mr-3" /> Available Slots
          </h3>

          {/* Add New Slot Form */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => {
                setSelectedDate(date);
                setSelectedTime('');
              }}
              dateFormat="PPP"
              placeholderText="Pick a date"
              minDate={new Date()}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              disabled={!selectedDate}
            />
            <button
              onClick={addSlot}
              disabled={!selectedDate || !selectedTime || isAddingSlot}
              className="w-full md:w-auto px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isAddingSlot ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaCalendarPlus className="mr-2" />
              )}
              <span>{isAddingSlot ? 'Adding...' : 'Add Slot'}</span>
            </button>
          </div>

          {/* List of Existing Slots */}
          {slots.length === 0 ? (
            <p className="text-gray-500 italic mt-6">No slots have been added yet.</p>
          ) : (
            <ul className="space-y-4 mt-6">
              {slots.map((slot, index) => (
                <li
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                >
                  <span className="font-medium text-gray-700 mb-2 sm:mb-0">
                    {new Date(slot).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button
                    onClick={() => removeSlot(slot)}
                    disabled={deletingSlotId === slot}
                    className="px-4 py-2 text-sm text-red-600 rounded-lg border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {deletingSlotId === slot ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaTrashAlt className="mr-2" />
                    )}
                    <span>Remove</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

export default Settings;