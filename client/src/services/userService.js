import { apiRequest } from "./api";

export const getUserProfile = (userId) => {
  return apiRequest(`/user/${userId}`);
};

export const updateProfile = (userId, data) => {
  return apiRequest(`/user/${userId}`, "PUT", data);
};

export const changePassword = (userId, password) => {
  return apiRequest(`/user/${userId}/password`, "PUT", { password });
};