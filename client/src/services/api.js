console.log('API URL:', import.meta.env.VITE_API_URL);
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiRequest = async (endpoint, method = "GET", body = null) => {
  try {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    // Check if response has content before parsing
    const contentType = res.headers.get("content-type");
    let data = null;
    
    if (contentType && contentType.includes("application/json")) {
      const text = await res.text();
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          throw new Error("Invalid JSON response from server");
        }
      }
    }

    if (!res.ok) {
      throw new Error(data?.message || `Error ${res.status}: ${res.statusText}`);
    }

    return data;
  } catch (error) {
    console.error("API ERROR:", error);
    throw error;
  }
};