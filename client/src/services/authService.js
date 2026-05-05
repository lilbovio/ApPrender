import { apiRequest } from "./api";

export const loginUser = (email, password) => {
  return apiRequest("/auth/login", "POST", { email, password });
};

export const registerUser = (name, email, password) => {
  return apiRequest("/auth/register", "POST", {
    name,
    email,
    password,
  });
};

export const updateUser = (data) => {
  return apiRequest("/user/update", "PUT", data);
};