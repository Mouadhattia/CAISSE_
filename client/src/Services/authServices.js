import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_HOST +
  ":" +
  process.env.REACT_APP_API_PORT +
  "/api/";

// const register = (first_name, last_name, email, password) => {
//   return axios.post(API_URL + "register", {
//     first_name,
//     last_name,
//     email,
//     password,
//   });
// };

const login = (username, password) => {
  return axios
    .post(API_URL + "login", {
      username,
      password,
    })
    .then((response) => {
      if (response.data.token) {
        console.log(response.data);
        localStorage.setItem("user", JSON.stringify(response.data.token));
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("tva", response.data.tva);
        localStorage.setItem("address", response.data.address);
        localStorage.setItem("telephone", response.data.telephone);
      }

      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem("user");
};

const authService = {
  login,
  logout,
};

export default authService;
