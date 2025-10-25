import axios from "axios";

// API cho Spring Boot Backend (Submit for Grading)
const BACKEND_API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để tự động thêm JWT token
BACKEND_API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Submit code để chấm điểm chính thức
 * @param {number} assignmentId - ID của assignment
 * @param {string} code - Source code
 * @param {string} language - Ngôn ngữ lập trình
 * @returns {Promise} - Kết quả chấm điểm
 */
export const submitCodeForGrading = async (assignmentId, code, language) => {
  const enrollmentId = 1; // Mặc định enrollmentId = 1
  
  const response = await BACKEND_API.post(
    `/api/code-submissions/submit`,
    {
      enrollmentId,
      assignmentId,
      code,
      language,
    }
  );
  return response.data;
};

/**
 * Lấy lịch sử submit của user cho assignment
 * @param {number} assignmentId - ID của assignment
 * @returns {Promise} - Danh sách lịch sử submit
 */
export const getSubmissionHistory = async (assignmentId) => {
  const enrollmentId = 1; // Mặc định enrollmentId = 1
  
  const response = await BACKEND_API.get(
    `/api/code-submissions/history`,
    {
      params: {
        enrollmentId,
        assignmentId,
      },
    }
  );
  return response.data;
};

/**
 * Lấy thông tin chi tiết 1 submission
 * @param {number} submissionId - ID của submission
 * @returns {Promise} - Chi tiết submission
 */
export const getSubmissionDetail = async (submissionId) => {
  const response = await BACKEND_API.get(
    `/api/code-submissions/${submissionId}`
  );
  return response.data;
};

/**
 * Đánh dấu submission là final
 * @param {number} submissionId - ID của submission
 * @returns {Promise} - Kết quả
 */
export const markSubmissionAsFinal = async (submissionId) => {
  const response = await BACKEND_API.put(
    `/api/code-submissions/${submissionId}/mark-final`
  );
  return response.data;
};
