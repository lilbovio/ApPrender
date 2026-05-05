import { apiRequest } from "./api";

export const getProgress = (userId) => {
  return apiRequest(`/progress/${userId}`);
};

export const updateProgress = (userId, progress) => {
  return apiRequest(`/progress/${userId}`, "PUT", { progress });
};