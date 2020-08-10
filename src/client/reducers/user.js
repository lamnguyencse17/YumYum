import { SET_USER } from "../actions/types";
import jwt from "jsonwebtoken";

const initialState = {
  _id: "",
  name: "",
  email: "",
  phone: "",
  token: localStorage.getItem("token") || "",
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_USER: {
      localStorage.setItem("token", action.payload.token);
      action.payload.groups = action.payload.groups.reverse()
      return { ...state, ...action.payload };
    }
    default: {
      let token = state.token;
      token = token.replace(/^Bearer\s/, "");
      if (state.token != "") {
        jwt.verify(token, "1234567890", (err, decoded) => {
          if (err) {
            token = "";
            localStorage.removeItem("token");
          }
        });
      }
      return { ...state, token: token == "" ? "" : state.token };
    }
  }
};
