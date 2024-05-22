// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './UserDetailsPage.css'; // Import the CSS file for styling

// const UserDetailsPage = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const isAuthenticated = localStorage.getItem('isAuthenticated');
//     if (!isAuthenticated) {
//       navigate('/login');
//     }
//   }, [navigate]);

//   const handleLogout = () => {
//     localStorage.removeItem('isAuthenticated');
//     navigate('/');
//   };

//   const username = 'abc';
//   const currentBalance = 1000;

//   return (
//     <div className="user-details-page">
//       <header className="header">
//         <h1>User Details</h1>
//         <button className="logout-button" onClick={handleLogout}>
//           Logout
//         </button>
//       </header>
//       <div className="content">
//         <div className="user-details">
//           <p>User Name: {username}</p>
//           <p>Current Balance: ${currentBalance}</p>
//           <footer>
//             <button className="user-action-button">Send Money</button>
//             <button className="user-action-button">Withdraw Money</button>
//             <button className="user-action-button">Add Money</button>
//           </footer>
//         </div>
//         <div className="user-image">
//           <img src="/image.jpg" alt="User" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserDetailsPage;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDetailsPage.css'; // Import the CSS file for styling

const UserDetailsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/');
  };

  const username = 'abc';
  const currentBalance = 1000;

  return (
    <div className="user-details-page">
      <header className="header">
        <h1>User Details</h1>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <div className="content">
        <div className="user-details">
          <p>User Name: {username}</p>
          <p>Current Balance: ${currentBalance}</p>
          <footer>
            <div className="action-box">
              <h2>Send Money</h2>
              <input type="text" placeholder="Receiver Username" />
              <input type="number" placeholder="Amount" />
              <button className="user-action-button">Send Money</button>
            </div>
            <div className="action-box">
              <h2>Withdraw Money</h2>
              <input type="number" placeholder="Amount" />
              <button className="user-action-button">Withdraw Money</button>
            </div>
            <div className="action-box">
              <h2>Add Money</h2>
              <input type="number" placeholder="Amount" />
              <button className="user-action-button">Add Money</button>
            </div>
          </footer>
        </div>
        <div className="user-image">
          <img src="/image.jpg" alt="User" />
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
