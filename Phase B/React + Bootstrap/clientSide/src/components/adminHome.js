import React, { useEffect, useState } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AdminHome = ({ userData }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getAllUser();
  }, []);

  const getAllUser = () => {
    fetch("http://localhost:5000/getAllUser", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  };

  const logOut = () => {
    window.localStorage.clear();
    window.location.href = "./sign-in";
  };

  const deleteUser = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}`)) {
      fetch(`http://localhost:5000/deleteUser/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          alert(data.data);
          getAllUser();
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
        });
    }
  };

  const tableStyles = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  };

  const thStyles = {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
    backgroundColor: "#f2f2f2",
  };

  const tdStyles = {
    border: "1px solid #ddd",
    padding: "8px",
    backgroundColor: "#f2f2f2",
  };

  const buttonStyles = {
    marginTop: "10px",
    padding: "10px",
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-inner" style={{ width: "auto" }}>
        <br></br>
      <h3 style={{ color: "#f2f2f2" }}>Welcome Admin</h3>
        <table style={tableStyles}>
          <thead>
            <tr>
              <th style={thStyles}>Name</th>
              <th style={thStyles}>Email</th>
              <th style={thStyles}>User Type</th>
              <th style={thStyles}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {data.map((user) => (
              <tr key={user._id}>
                <td style={tdStyles}>{user.fname}</td>
                <td style={tdStyles}>{user.email}</td>
                <td style={tdStyles}>{user.userType}</td>
                <td style={tdStyles}>
                  <FontAwesomeIcon
                    icon={faTrash}
                    onClick={() => deleteUser(user._id, user.fname)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={logOut} className="btn btn-primary" style={buttonStyles}>
          Log Out
        </button>
      </div>
    </div>
  );
};

export default AdminHome;
