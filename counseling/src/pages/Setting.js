import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Settings({ counselor, setCounselor }) {
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!counselor?.id) {
      setError('No logged-in counselor ID found');
      return;
    }

    setName(counselor.name || '');
    setProfileImage(counselor.profileImage || '');
    setSlots(counselor.availableSlots || []);
  }, [counselor]);

  if (!counselor?.id) {
    return <p className="text-red-600">{error}</p>;
  }

  const updateProfile = () => {
    fetch(`http://localhost:8080/api/counselors/update/${counselor.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...counselor, name, profileImage }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Update failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCounselor(data);
        setSlots(data.availableSlots || []);
        alert('Profile updated successfully!');
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to update profile.');
      });
  };

  const addSlot = () => {
    const trimmed = newSlot.trim();
    if (!trimmed) return alert('Please select date and time.');
    if (slots.includes(trimmed)) return alert('This slot already exists.');

    fetch(`http://localhost:8080/api/counselors/${counselor.id}/slots/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([trimmed]),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to add slot');
        return res.text();
      })
      .then(() => {
        const updatedSlots = [...slots, trimmed];
        setSlots(updatedSlots);
        setNewSlot('');
        setSelectedDate(null);
        setSelectedTime('');
        setCounselor({ ...counselor, availableSlots: updatedSlots });
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to add slot.');
      });
  };

  const removeSlot = (slotToRemove) => {
  fetch(`http://localhost:8080/api/counselors/${counselor.id}/slots/remove`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'text/plain' },
    body: slotToRemove,
  })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to remove slot');
      return res.text();
    })
    .then(() => {
      const updatedSlots = slots.filter((slot) => slot !== slotToRemove);
      setSlots(updatedSlots);
      setCounselor({ ...counselor, availableSlots: updatedSlots });
    })
    .catch((err) => {
      console.error(err);
      alert('Failed to remove slot.');
    });
};


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setSelectedTime(time);

    if (selectedDate && time) {
      const dateTime = new Date(
        selectedDate.toDateString() + ' ' + time
      ).toISOString();
      setNewSlot(dateTime);
    }
  };

  return (
    <section className="max-w-3xl text-indigo-900">
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      {error && <p className="text-red-600">{error}</p>}

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Profile</h3>

        <label className="block mb-1 font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md mb-4"
        />

        <label className="block mb-1 font-medium">Profile Image</label>
        <input type="file" onChange={handleImageUpload} className="mb-4" />
        {profileImage && (
          <img
            src={profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border mb-4"
          />
        )}

        <button
          onClick={updateProfile}
          className="px-4 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-800 transition"
        >
          Save Profile
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-2">Available Slots</h3>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            setSelectedTime('');
            setNewSlot('');
          }}
          dateFormat="yyyy-MM-dd"
          placeholderText="Pick a date"
          className="p-2 border rounded-md"
        />

        <select
          value={selectedTime}
          onChange={handleTimeChange}
          className="p-2 border rounded-md"
          disabled={!selectedDate}
        >
          <option value="">Select time</option>
          <option value="09:00">09:00</option>
          <option value="10:00">10:00</option>
          <option value="11:00">11:00</option>
          <option value="12:00">12:00</option>
          <option value="14:00">14:00</option>
          <option value="15:00">15:00</option>
          <option value="16:00">16:00</option>
        </select>

        <button
          onClick={addSlot}
          disabled={!newSlot}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
        >
          Add
        </button>
      </div>

      {slots.length === 0 ? (
        <p className="text-gray-500 italic">No slots added yet.</p>
      ) : (
        <ul className="space-y-2">
          {slots.map((slot, index) => (
            <li key={index} className="flex justify-between p-2 bg-indigo-100 rounded-md">
              <span>{new Date(slot).toLocaleString()}</span>
              <button
                onClick={() => removeSlot(slot)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Settings;
