import './App.css';
import  { useState, useEffect, Fragment, PureComponent } from 'react';


function App() {
  const setBranches = useState([]);
  const selected = useState(null);
  const setData = useState([]);
  
  useEffect(() => {
    fetch('https://decatest.redhawks.us/api/branches')
      .then((res) => res.json())
      .then((data) => {
        setBranches(data);
      })
      .catch((error) => console.error('Error fetching branches:', error));
  }, []);

  useEffect(() => {
    if (selected && selected.value) {
      fetchPIs(selected.value);
    }
  }, [selected]);

  const fetchPIs = (branchNum) => {
    fetch('https://decatest.redhawks.us/api/PIs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ branch: branchNum })
    })
    .then((res) => res.json())
    .then((data) => {
      setData(data);
    })
    .catch((error) => console.error('Error fetching data:', error));
  };
}
export default App;