let isLoggedIn = false;

function checkSession() {
  if (!isLoggedIn) {
    stopSessionCheck();
    return;
  }
  
  fetch('/api/check-session')
    .then(response => response.json())
    .then(data => {
      if (!data.isLoggedIn && isLoggedIn) {
        handleSessionExpiration();
      }
    })
    .catch(error => {
      console.error('Error checking session:', error);
    });
}

function handleSessionExpiration() {
  if (isLoggedIn) {  // Only show alert if user was logged in
    isLoggedIn = false;
    sessionStorage.removeItem('isLoggedIn');
    clearTimeout(sessionTimeout);
    stopSessionCheck();
    showLoginPage();
    alert('Your session has expired. Please log in again.');
  }
}


  
  // Call this function periodically
  let sessionCheckInterval;

function startSessionCheck() {
  sessionCheckInterval = setInterval(checkSession, 120000); // Check every 30 seconds
}

function stopSessionCheck() {
  clearInterval(sessionCheckInterval);
}


// Modify the login function:

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        isLoggedIn = true;
        sessionStorage.setItem('isLoggedIn', 'true');
        showAttendancePage();
        resetSessionTimeout();
        startSessionCheck(); // Start session checking after successful login
      } else {
        alert('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  }
// Add a new function to show the attendance page:
function showAttendancePage() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('attendance-container').style.display = 'block';
}

// Add a new function to show the login page:
function showLoginPage() {
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('attendance-container').style.display = 'none';
}

// Add a logout function:
async function logout() {
  try {
    // Immediately clear all client-side session data
    isLoggedIn = false;
    sessionStorage.removeItem('isLoggedIn');
    clearTimeout(sessionTimeout);
    stopSessionCheck();

    // Then, inform the server
    await fetch('/logout', { method: 'POST' });
    
    // Finally, redirect to login page
    showLoginPage();
  } catch (error) {
    console.error('Logout error:', error);
    alert('An error occurred during logout. Please try again.');
  }
}
// Add an init function to check login status on page load:
function init() {
  if (sessionStorage.getItem('isLoggedIn') === 'true') {
    isLoggedIn = true;
    showAttendancePage();
    resetSessionTimeout();
    startSessionCheck();
  } else {
    isLoggedIn = false;
    showLoginPage();
  }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', init);
document.getElementById('logout-btn').addEventListener('click', logout);

// Modify your existing event listeners to check login status:
document.getElementById('department-select').addEventListener('change', () => {
    if (isLoggedIn) populateVendorTable();
});
document.getElementById('date-picker').addEventListener('change', () => {
    if (isLoggedIn) fetchAttendance();
});


////
// Hard-coded admin credentials
// const adminCredentials = {
//     username: 'prince',
//     password: '12345'
// };

// Hard-coded vendor data
const vendors = [
  { id: 'V001', name: 'Prakash Gupta', department: 'FNB' },
  { id: 'V002', name: 'Rakesh Singh', department: 'FNB' },
  { id: 'V003', name: 'Stiti Bhardwaj', department: 'FNB' },
  { id: 'V004', name: 'Aarti kumari', department: 'FNB' },
  { id: 'V005', name: 'Ashish Shetty', department: 'FNB' },
  { id: 'V006', name: 'Amit Behera', department: 'FNB' },
  { id: 'V007', name: 'B. Sai Dhatri', department: 'FNB' },
  { id: 'V008', name: 'Ananya Mallick', department: 'FNB' },
  { id: 'V009', name: 'Arjun Mehta', department: 'FNB' },
  { id: 'V010', name: 'Aman Patel', department: 'FNB' },
  { id: 'V011', name: 'Vikram Singh', department: 'HK' },
  { id: 'V012', name: 'Ayush Kumar', department: 'HK' },
  { id: 'V013', name: 'Shalini Nair', department: 'HK' },
  { id: 'V014', name: 'Aditya Chatterjee', department: 'HK' },
  { id: 'V015', name: 'Shyam Lal', department: 'MT' },
  { id: 'V016', name: 'Sarita Kumari', department: 'MT' },
  { id: 'V017', name: 'Kishan Kumar', department: 'MT' },
  { id: 'V018', name: 'Ruby Parveen', department: 'SEC' },
  { id: 'V019', name: 'Vikash Singh', department: 'SEC' },
  { id: 'V020', name: 'Dinesh Sharma', department: 'SEC' },
  { id: 'V021', name: 'Karan Kumar', department: 'SEC' }
];

//session functionality

let sessionTimeout;

function resetSessionTimeout() {
  clearTimeout(sessionTimeout);
  sessionTimeout = setTimeout(logout, 60000); // 60 seconds (1 minute)
}



  document.addEventListener('mousemove', resetSessionTimeout);
  document.addEventListener('keypress', resetSessionTimeout);
  

function populateVendorTable() {
    resetSessionTimeout();
    const department = document.getElementById('department-select').value;
    const vendorList = document.getElementById('vendor-list');
    vendorList.innerHTML = '';

    const filteredVendors = vendors.filter(vendor => vendor.department === department);

    filteredVendors.forEach((vendor, index) => {
        const row = vendorList.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${vendor.id}</td>
            <td>${vendor.name}</td>
            <td>${vendor.department}</td>
            <td><input type="checkbox" name="attendance" value="${vendor.id}"></td>
        `;
    });
}

document.getElementById('department-select').addEventListener('change', populateVendorTable);
document.getElementById('date-picker').addEventListener('change', fetchAttendance);

async function fetchAttendance() {
    resetSessionTimeout();
    if (!isLoggedIn) return;
    const date = document.getElementById('date-picker').value;
    const department = document.getElementById('department-select').value;

    try {
        const response = await fetch(`/api/attendance/fetch?date=${date}&department=${department}`);
        const attendanceData = await response.json();

        const checkboxes = document.querySelectorAll('input[name="attendance"]');
        checkboxes.forEach(checkbox => {
            const record = attendanceData.find(r => r.vendorId === checkbox.value);
            checkbox.checked = record ? record.present : false;
        });

        document.getElementById('download-btn').style.display = 'block';
    } catch (error) {
        console.error('Error fetching attendance:', error);
        alert('Error fetching attendance data. Please try again.');
    }
}

async function submitAttendance() {
    resetSessionTimeout();
    if (!isLoggedIn) return;
    const date = document.getElementById('date-picker').value;
    const department = document.getElementById('department-select').value;
    const attendanceData = [];

    const checkboxes = document.querySelectorAll('input[name="attendance"]');
    checkboxes.forEach(checkbox => {
        attendanceData.push({
            vendorId: checkbox.value,
            present: checkbox.checked
        });
    });

    try {
        const response = await fetch('/api/attendance/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ date, department, attendanceData }),
        });

        if (response.ok) {
            alert('Attendance submitted successfully!');
            document.getElementById('download-btn').style.display = 'block';
        } else {
            throw new Error('Failed to submit attendance');
        }
    } catch (error) {
        console.error('Error submitting attendance:', error);
        alert('Error submitting attendance data. Please try again.');
    }
}

function downloadAttendance() {
    resetSessionTimeout();
    if (!isLoggedIn) return;
    const date = document.getElementById('date-picker').value;
    const department = document.getElementById('department-select').value;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Vendor ID,Vendor Name,Department,Present\n";

    const checkboxes = document.querySelectorAll('input[name="attendance"]');
    checkboxes.forEach(checkbox => {
        const vendor = vendors.find(v => v.id === checkbox.value);
        csvContent += `${vendor.id},${vendor.name},${vendor.department},${checkbox.checked}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${department}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
}



