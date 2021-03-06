import axios from "axios";

export const createDishRequest = ({ name, price }) => {
  return axios
    .post(`${process.env.API_URL}/api/dishes/new`, {
      name,
      price,
    })
    .then((res) => {
      return { status: true, message: "Add success", newDish: res.data };
    })
    .catch((err) => {
      if (err.response.status == 401) {
        window.location.replace(process.env.FRONT_END_URL);
      }
      return {
        status: false,
        errCode: err.response.status,
        message: err.response.data.message,
      };
    });
};

export const deleteDishRequest = (dishId, token) => {
  return axios
    .delete(`${process.env.API_URL}/api/dishes/${dishId}`, {
      headers: {
        Authorization: token,
      },
    })
    .then(() => {
      return { status: true, message: "Successfully deleted" };
    })
    .catch((err) => {
      if (err.response.status == 401) {
        window.location.replace(process.env.FRONT_END_URL);
      }
      return {
        status: false,
        errCode: err.response.status,
        message: err.response.data.message,
      };
    });
};
export const getDishOfUserRequest = () => {
  return axios
    .get(`${process.env.API_URL}/api/dishes/user`, {})
    .then((res) => {
      return { status: true, dishData: res.data };
    })
    .catch((err) => {
      if (err.response.status == 401) {
        window.location.replace(process.env.FRONT_END_URL);
      }
      return {
        status: false,
        errCode: err.response.status,
        message: err.response.data.message,
      };
    });
};
