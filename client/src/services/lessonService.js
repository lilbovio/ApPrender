import { apiRequest } from "./api";

export const getLessons = (subject, vak) => {
  return apiRequest(`/lessons?subject=${subject}&vak=${vak}`);
};

export const getLessonById = (id) => {
  return apiRequest(`/lessons/${id}`);
};