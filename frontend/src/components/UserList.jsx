import { useState, useEffect } from 'react';

// This is a sample component to demonstrate connecting to the FastAPI backend
export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // We fetch from the FastAPI backend running on port 8000
    // In production, this URL would be typically managed by an environment variable
    fetch('http://localhost:8000/api/users/')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Loading users from backend...</div>;
  
  if (error) return (
    <div className="p-4 text-red-500">
      <p>Error connecting to backend: {error}</p>
      <p className="text-sm mt-2">Make sure your FastAPI server is running on port 8000.</p>
    </div>
  );

  return (
    <div className="p-4 border rounded shadow-sm mt-6">
      <h2 className="text-xl font-bold mb-4">Users from PostgreSQL</h2>
      {users.length === 0 ? (
        <p className="text-gray-500">No users found in the database. Try adding some via the API docs!</p>
      ) : (
        <ul className="list-disc pl-5">
          {users.map(user => (
            <li key={user.id} className="mb-2">
              <span className="font-semibold">{user.full_name || 'No Name'}</span> 
              <span className="text-gray-600 ml-2">({user.email})</span>
              <span className={`ml-3 text-xs px-2 py-1 rounded ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
