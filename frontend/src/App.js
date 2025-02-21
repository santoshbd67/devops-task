import React, { useState } from "react";
import axios from "axios";

function App() {
  const [fields, setFields] = useState("firstName,lastName,email");
  const [count, setCount] = useState(5);
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setError(""); // Clear previous errors
      const response = await axios.get(`http://54.224.164.126:3000/generate`, {  
        params: { fields, count },
      });
      setData(response.data.data);
    } catch (err) {
      setError("Error fetching data. Please check input values.");
      console.error(err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Dummy Data Generator</h1>

      <label>Fields (comma-separated): </label>
      <input
        type="text"
        value={fields}
        onChange={(e) => setFields(e.target.value)}
      />
      <br /><br />

      <label>Number of Records: </label>
      <input
        type="number"
        value={count}
        onChange={(e) => setCount(e.target.value)}
      />
      <br /><br />

      <button onClick={fetchData}>Generate Data</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data.length > 0 && (
        <table border="1" style={{ margin: "20px auto", width: "50%" }}>
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
