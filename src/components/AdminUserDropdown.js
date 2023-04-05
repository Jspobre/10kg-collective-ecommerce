import React from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { FaUser } from 'react-icons/fa';


const AdminUserDropdown = ({setAdminUser}) => {
    const navigate = useNavigate();

    const handleLogout = () => {
      const url = "http://localhost/10kg-collective/userModule/updateSession.php";
  
      const logData = new FormData();
      logData.append("logout", 1);
  
      axios.post(url, logData).then((response) => {
        if (response.data === 1) {
          alert("Signing Out");
          setAdminUser(null);
          navigate("/admin/login");
        } else {
          alert(response.data);
        }
      });
    };
  
    return (
      <>
          <div className="dropdown-center align-items-center">
              <button className="btn dropdown-toggle user-icon" type="button" data-bs-toggle="dropdown" aria-expanded="false">
              <FaUser size="1.5rem"  />
              </button>
              <ul class="dropdown-menu">
                  {/* <li><NavLink className="dropdown-item" to="/UserDashboard">My Profile</NavLink></li> */}
                  <li><button className="dropdown-item" onClick={()=>handleLogout()}>Sign Out</button></li>
              </ul>
          </div>
      </>
    );
  };
  
export default AdminUserDropdown