export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
};
