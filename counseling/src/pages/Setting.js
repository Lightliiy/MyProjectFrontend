import React, { useState, useEffect } from 'react';

function Settings() {
  const [counselor, setCounselor] = useState(null);
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const counselorId = localStorage.getItem('counselorId');
    if (!counselorId) {
      setError('No logged-in counselor ID found');
      return;
    }

    fetch(`http://localhost:8080/api/counselors/${counselorId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch counselor: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCounselor(data);
        setName(data.name || '');
        setProfileImage(data.profileImage || '');
        setSlots(data.availableSlots || []);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load counselor data.');
      });
  }, []);

  if (!counselor) {
    return error ? <p className="text-red-600">{error}</p> : <p>Loading...</p>;
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
    if (!trimmed) return alert('Please enter a slot.');
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
        setSlots([...slots, trimmed]);
        setNewSlot('');
      })
      .catch((err) => {
        console.error(err);
        alert('Failed to add slot.');
      });
  };

  const removeSlot = (slotToRemove) => {
    fetch(`http://localhost:8080/api/counselors/${counselor.id}/slots/remove`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slotToRemove),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to remove slot');
        return res.text();
      })
      .then(() => {
        setSlots(slots.filter((slot) => slot !== slotToRemove));
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
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newSlot}
          onChange={(e) => setNewSlot(e.target.value)}
          placeholder="e.g., Mon 10-12"
          className="flex-1 p-2 border rounded-md"
        />
        <button
          onClick={addSlot}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Add
        </button>
      </div>

      {slots.length === 0 ? (
        <p className="text-gray-500 italic">No slots added yet.</p>
      ) : (
        <ul className="space-y-2">
          {slots.map((slot, index) => (
            <li
              key={index}
              className="flex justify-between p-2 bg-indigo-100 rounded-md"
            >
              <span>{slot}</span>
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
