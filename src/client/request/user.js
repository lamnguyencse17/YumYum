import axios from "axios";

export const getUserRequest = (token) => {
  return axios
    .get(`${process.env.API_URL}/api/users`, {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => {
      return { status: true, userData: res.data };
    })
    .catch((err) => {
      return {
        status: false,
        errCode: err.response.status,
        message: err.response.data.message,
      };
    });
};
