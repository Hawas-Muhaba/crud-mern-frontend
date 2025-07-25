// mern-frontend/src/App.js (Replace entire content from Day 5)

import React, { useState, useEffect } from "react";
import "./App.css"; // Basic CSS (optional)

// Define the backend API base URL
// IMPORTANT: This should match the port your Node.js backend is running on.
const API_BASE_URL = "http://localhost:5000/api/items"; // Items endpoint

function App() {
  const [items, setItems] = useState([]); // State to store the list of items
  const [newItemName, setNewItemName] = useState(""); // State for new item name input
  const [newItemDescription, setNewItemDescription] = useState(""); // State for new item description input
  const [editItemId, setEditItemId] = useState(null); // State for the ID of the item being edited
  const [editItemName, setEditItemName] = useState(""); // State for edit form name input
  const [editItemDescription, setEditItemDescription] = useState(""); // State for edit form description input
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error messages

  // --- 1. FETCH all items (Read Operation - GET) ---
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        // Check if the HTTP response status is OK (200-299 range)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json(); // Parse the JSON response
        setItems(data); // Update the state with the fetched items
      } catch (err) {
        setError(err); // Catch network or parsing errors
      } finally {
        setLoading(false); // Set loading to false after fetch attempt
      }
    };
    fetchItems(); // Call the fetch function when the component mounts
  }, []); // Empty dependency array: runs only once on component mount

  // --- 2. CREATE new item (Create Operation - POST) ---
  const handleCreate = async (e) => {
    e.preventDefault(); // Prevent default form submission (page reload)
    if (!newItemName.trim() || !newItemDescription.trim()) {
      // Basic client-side validation
      alert("Name and description cannot be empty.");
      return;
    }
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST", // Specify POST method
        headers: {
          "Content-Type": "application/json", // Tell server we're sending JSON
        },
        body: JSON.stringify({
          name: newItemName,
          description: newItemDescription,
        }), // Convert JS object to JSON string
      });
      if (!response.ok) {
        // Parse error message from backend if available
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || response.statusText
          }`
        );
      }
      const newItem = await response.json(); // Get the newly created item (with _id from MongoDB)
      setItems([...items, newItem]); // Add the new item to the existing items array in state
      setNewItemName(""); // Clear the input fields
      setNewItemDescription("");
    } catch (err) {
      setError(err); // Set error state if creation fails
    }
  };

  // --- 3. DELETE an item (Delete Operation - DELETE) ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      // Confirmation dialog
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE", // Specify DELETE method
      });
      // For DELETE, 204 No Content is common for success
      if (response.status !== 204 && response.ok) {
        // Check if not 204 but still successful (e.g., 200)
        // If the server sends a body with 200, you might want to parse it.
        // For 204, there's no body.
      } else if (!response.ok) {
        // Handle specific error messages if backend sends them
        const errorData = await response.json(); // Try to parse error body
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || response.statusText
          }`
        );
      }
      setItems(items.filter((item) => item._id !== id)); // Remove the item from state
    } catch (err) {
      setError(err); // Set error state if deletion fails
    }
  };

  // --- 4. UPDATE an item (Update Operation - PUT) ---
  // Step 4a: Enter edit mode
  const handleEdit = (item) => {
    setEditItemId(item._id); // Store the ID of the item being edited
    setEditItemName(item.name); // Populate edit form with current name
    setEditItemDescription(item.description); // Populate edit form with current description
  };

  // Step 4b: Submit updated item
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editItemName.trim() || !editItemDescription.trim()) {
      alert("Name and description are required for update.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/${editItemId}`, {
        method: "PUT", // Specify PUT method
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editItemName,
          description: editItemDescription,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || response.statusText
          }`
        );
      }
      const updatedItem = await response.json(); // Get the updated item from the backend
      // Update the item in the state array
      setItems(
        items.map(
          (item) => (item._id === editItemId ? updatedItem : item) // Find and replace the updated item
        )
      );
      setEditItemId(null); // Exit edit mode
      setEditItemName(""); // Clear edit form inputs
      setEditItemDescription("");
    } catch (err) {
      setError(err); // Set error state if update fails
    }
  };

  // --- Conditional Rendering for Loading/Error states ---
  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: "50px" }}>Loading items...</p>
    );
  if (error)
    return (
      <p style={{ textAlign: "center", marginTop: "50px", color: "red" }}>
        Error: {error.message}
      </p>
    );

  return (
    <div
      className="App"
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "auto",
        padding: "20px",
        border: "1px solid #eee",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <header
        style={{
          backgroundColor: "#4a90e2",
          padding: "15px",
          color: "white",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <h1>MERN Stack Item Manager</h1>
        <p>Full CRUD operations with MongoDB, Express, React, Node.js</p>
      </header>

      {/* --- Create New Item Form --- */}
      <section style={{ padding: "20px", borderBottom: "1px solid #eee" }}>
        <h2>Create New Item</h2>
        <form
          onSubmit={handleCreate}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            type="text"
            placeholder="Item Name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          />
          <textarea
            placeholder="Description"
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
            rows="3"
            style={{
              padding: "10px",
              borderRadius: "4px",
              border: "1px solid #ddd",
            }}
          ></textarea>
          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#5cb85c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Item
          </button>
        </form>
      </section>

      {/* --- Item List --- */}
      <section style={{ padding: "20px" }}>
        <h2>Current Items</h2>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {items.length === 0 && !loading && !error ? (
            <p>No items found. Create one!</p>
          ) : (
            items.map((item) => (
              <li
                key={item._id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                  padding: "15px",
                  border: "1px solid #eee",
                  marginBottom: "10px",
                  borderRadius: "4px",
                  backgroundColor: "#f9f9f9",
                }}
              >
                {editItemId === item._id ? ( // Show edit form if in edit mode for this item
                  <form
                    onSubmit={handleUpdate}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="text"
                      value={editItemName}
                      onChange={(e) => setEditItemName(e.target.value)}
                      style={{
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                      required
                    />
                    <textarea
                      value={editItemDescription}
                      onChange={(e) => setEditItemDescription(e.target.value)}
                      rows="2"
                      style={{
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                      }}
                      required
                    ></textarea>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        type="submit"
                        style={{
                          flex: 1,
                          backgroundColor: "#f0ad4e",
                          color: "white",
                        }}
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditItemId(null)}
                        style={{
                          flex: 1,
                          backgroundColor: "#ddd",
                          color: "#333",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // Display item details if not in edit mode
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "1.1em", color: "#333" }}>
                        {item.name}
                      </strong>
                      <p style={{ margin: "5px 0 0", color: "#666" }}>
                        {item.description}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button
                        onClick={() => handleEdit(item)}
                        style={{
                          backgroundColor: "#0275d8",
                          color: "white",
                          padding: "5px 10px",
                          fontSize: "0.9em",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        style={{
                          backgroundColor: "#d9534f",
                          color: "white",
                          padding: "5px 10px",
                          fontSize: "0.9em",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </section>

      <footer
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f0f0f0",
          borderRadius: "0 0 8px 8px",
        }}
      >
        <p>© 2023 MERN Stack App. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
