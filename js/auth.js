// js/auth.js
export function getToken() {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "login.html";
      return null;
    }
    return token;
  }
  
  export function getUser() {
    const user = localStorage.getItem("user");
    if (!user) {
      window.location.href = "login.html";
      return null;
    }
    return JSON.parse(user);
  }
  
  export function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  }
  