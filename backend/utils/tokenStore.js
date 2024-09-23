const tokenStore = new Map();

module.exports = {
  setToken: (userId, token) => tokenStore.set(userId, token),
  getToken: (userId) => tokenStore.get(userId),
  removeToken: (userId) => tokenStore.delete(userId),
};