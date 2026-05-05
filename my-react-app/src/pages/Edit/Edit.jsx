import React, { useState } from 'react';
import "./Edit.css";

const Edit = () => {
  const [expandedBox, setExpandedBox] = useState(null);
  const [mode, setMode] = useState(null);
  const [newPIs, setNewPIs] = useState([{ pi: '', meaning: '' }]);
  const [editPIs, setEditPIs] = useState([]);
  const [showPasswordEditor, setShowPasswordEditor] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successAnim, setSuccessAnim] = useState(false);
  


  const handleClick = (boxType) => {
    setExpandedBox(expandedBox === boxType ? null : boxType);
    setMode(null);
    setNewPIs([{ pi: '', meaning: '' }]);
    setEditPIs([]);
  };

  const fetchPassword = async () => {
    try {
      const res = await fetch("https://decatest.redhawks.us/api/password");
      const data = await res.json();
      setCurrentPassword(data.password);
    } catch (err) {
      console.error("Failed to fetch password:", err);
    }
  };
  


  const togglePasswordEditor = async () => {
    if (!showPasswordEditor) {
      try {
        const res = await fetch("https://decatest.redhawks.us/api/password");
        const data = await res.json();
        setCurrentPassword(data.password);
      } catch (err) {
        console.error("Failed to fetch password:", err);
      }
    }
    setShowPasswordEditor(!showPasswordEditor);
  };
  
  const handlePasswordUpdate = async () => {
    if (!newPassword.trim()) return alert("New password cannot be empty.");
    try {
      const res = await fetch("https://decatest.redhawks.us/api/password", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });
      if (res.ok) {
        setSuccessAnim(true);
        setNewPassword('');
        setTimeout(() => setSuccessAnim(false), 700);
        await fetchPassword();
        //setShowPasswordEditor(false);
      } else {
        alert("Failed to update password.");
      }
    } catch (err) {
      console.error("Password update error:", err);
      alert("Server error.");
    }
  };

  const handleAddRow = () => setNewPIs([...newPIs, { pi: '', meaning: '' }]);

  const handleDeleteRow = (index) => {
    const updated = [...newPIs];
    updated.splice(index, 1);
    setNewPIs(updated);
  };

  const handleInputChange = (index, field, value, listSetter) => {
    const updated = listSetter === setNewPIs ? [...newPIs] : [...editPIs];
    updated[index][field] = value;
    listSetter(updated);
  };

  const autoResize = (el) => {
    if (el) {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const raw = e.clipboardData.getData('text');
    const lines = raw.split(/\r?\n/).reduce((acc, line) => {
      if (line.includes('\t')) acc.push(line);
      else if (acc.length) acc[acc.length - 1] += ' ' + line;
      return acc;
    }, []);
    const parsed = lines
      .map(line => line.split('\t'))
      .filter(cells => cells.length >= 2 && (cells[0].trim() || cells[1].trim()))
      .map(([pi, meaning]) => ({
        pi: pi.trim().replace(/^"|"$|^'|'$/g, ''),
        meaning: meaning.trim().replace(/^"|"$|^'|'$/g, '')
      }));
    setNewPIs(parsed);
  };

  const handleSubmitNew = async () => {
    const filtered = newPIs.filter(({ pi, meaning }) => pi.trim() && meaning.trim());
    if (!filtered.length) return alert("Please enter at least one valid performance indicator.");
    const formattedCluster = expandedBox.charAt(0).toUpperCase() + expandedBox.slice(1);
    try {
      const res = await fetch('https://decatest.redhawks.us/api/PIs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pis: filtered, careerCluster: formattedCluster })
      });
      if (res.ok) {
        alert("Performance Indicators added!");
        setNewPIs([{ pi: '', meaning: '' }]);
        setMode(null);
      } else alert("Error submitting indicators.");
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };

  const handleFetchEditPIs = async () => {
    try {
      const formattedCluster = expandedBox.charAt(0).toUpperCase() + expandedBox.slice(1);
      const response = await fetch(`https://decatest.redhawks.us/api/PIs?event=${encodeURIComponent(formattedCluster)}`);
      const data = await response.json();
  
      const formatted = data.map(({ PerformanceIndicator, Meaning }) => ({
        pi: PerformanceIndicator,
        meaning: Meaning,
        originalPi: PerformanceIndicator,
        originalMeaning: Meaning
      }));
  
      setEditPIs(formatted);
    } catch (err) {
      console.error(err);
      alert("Failed to load PIs for editing.");
    }
  };
  

  const handleSubmitEdit = async () => {
    const formattedCluster = expandedBox.charAt(0).toUpperCase() + expandedBox.slice(1);
  
    const changed = editPIs.filter(pi =>
      pi.originalPi !== pi.pi || pi.originalMeaning !== pi.meaning
    );
  
    if (!changed.length) return alert("No changes made.");
  
    try {
      const res = await fetch('https://decatest.redhawks.us/api/PIs/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pis: changed, careerCluster: formattedCluster })
      });
      if (res.ok) {
        alert("Changes saved.");
        setMode(null);
        setEditPIs([]);
      } else {
        alert("Error saving changes.");
      }
    } catch (err) {
      console.error(err);
      alert("Server error.");
    }
  };
  

  const renderForm = (list, listSetter, onSubmit, isEditing) => (
    <div className="add-pi-box">
      <h3>{isEditing ? "Edit Performance Indicators" : "Add Performance Indicators"}</h3>
      <p style={{ color: "#000", fontSize: "14px" }}>
        📋 Tip: {isEditing ? "Edit below" : "You can paste directly from Google Sheets (2 columns)."}
      </p>
      <table className="pi-table">
        <thead>
          <tr>
            <th>Performance Indicator</th>
            <th>Meaning</th>
            {!isEditing && <th></th>}
          </tr>
        </thead>
        <tbody>
          {list.map((entry, index) => (
            <tr key={index}>
              <td>
                <textarea
                  value={entry.pi}
                  onChange={(e) => {
                    handleInputChange(index, 'pi', e.target.value, listSetter);
                    autoResize(e.target);
                  }}
                  onPaste={!isEditing ? (e) => {
                    handlePaste(e);
                    setTimeout(() => autoResize(e.target), 0);
                  } : undefined}
                  rows="1"
                  ref={(el) => el && autoResize(el)}
                />
              </td>
              <td>
                <textarea
                  value={entry.meaning}
                  onChange={(e) => {
                    handleInputChange(index, 'meaning', e.target.value, listSetter);
                    autoResize(e.target);
                  }}
                  rows="1"
                  ref={(el) => el && autoResize(el)}
                />
              </td>
              {!isEditing && (
                <td>
                  <button className="delete-row" onClick={() => handleDeleteRow(index)}>🗑️</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {!isEditing && <button onClick={handleAddRow}>Add Row</button>}
      <button onClick={onSubmit}>{isEditing ? "Save Changes" : "Submit"}</button>
    </div>
  );

  const renderExpandedContent = (boxType) => (
    <div className={`expanded-content ${boxType}`}>
      <h2>{boxType.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} Edit Options</h2>
      <div onClick={() => { setMode("add"); }}>Add Performance Indicators</div>
      <div onClick={() => { setMode("edit"); handleFetchEditPIs(); }}>Edit Existing Performance Indicators</div>
      {mode === "add" && renderForm(newPIs, setNewPIs, handleSubmitNew, false)}
      {mode === "edit" && renderForm(editPIs, setEditPIs, handleSubmitEdit, true)}
    </div>
  );

  const categories = [
    { key: 'business', label: 'Business Management & Administration' },
    { key: 'entrepreneurship', label: 'Entrepreneurship' },
    { key: 'finance', label: 'Finance' },
    { key: 'hospitality', label: 'Hospitality and Tourism' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'personal-finance', label: 'Personal Financial Literacy' }
  ];

  return (
    <>
      <div className="Centered"><h1>EDIT</h1></div>
      
      <div className="edit-container">
      <div className={`change-password-container ${showPasswordEditor ? 'expanded' : ''}`}>
  <div className="change-password-button" onClick={togglePasswordEditor}>
    Change Password
  </div>

  <div className={`change-password-wrapper ${showPasswordEditor ? 'expanded' : ''}`}>
    <div className="change-password-form">
      <p>Current Password: <strong>{currentPassword}</strong></p>
      <input
        type="text"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New password"
      />
      <button onClick={handlePasswordUpdate} className={successAnim ? "update-button success" : "update-button"}>Update Password</button>
    </div>
  </div>
</div>
        <div className="selector-row">
          {categories.map(cat => (
            <button key={cat.key} className={`selector-box ${cat.key}`} onClick={() => handleClick(cat.key)}>
              <h3>{cat.label}</h3>
            </button>
          ))}
        </div>
        {expandedBox && renderExpandedContent(expandedBox)}
      </div>
    </>
  );
};

export default Edit;
