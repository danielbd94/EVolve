// NavigationBar.js
import React from "react";

const NavigationBar = () => {
  return (
    <nav style={{ background: "#333", padding: "10px", color: "#fff" }}>
      <ul style={{ listStyle: "none", display: "flex", justifyContent: "space-around", margin: 0 }}>
      <li><a href="/userDetails">Home</a></li>
        <li><a href="/sign-in">Log Out</a></li>
        {/* Add more navigation items as needed */}
      </ul>
    </nav>
  );
};

export default NavigationBar;
