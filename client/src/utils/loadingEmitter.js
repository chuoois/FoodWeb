// src/utils/loadingEmitter.js
let activeRequests = 0;
const listeners = new Set();

export const loadingEmitter = {
  subscribe: (callback) => {
    listeners.add(callback);
    // Gọi callback ngay lập tức với state hiện tại
    callback(activeRequests > 0);
    return () => listeners.delete(callback);
  },
  
  emit: (isLoading) => {
    listeners.forEach(cb => cb(isLoading));
  },
  
  start: () => {
    activeRequests++;
    console.log('🚀 Loading START - Active requests:', activeRequests);
    loadingEmitter.emit(true);
  },
  
  stop: () => {
    activeRequests = Math.max(0, activeRequests - 1);
    console.log('✅ Loading STOP - Active requests:', activeRequests);
    if (activeRequests === 0) {
      loadingEmitter.emit(false);
    }
  },
  
  // Reset về 0 (dùng khi cần thiết)
  reset: () => {
    activeRequests = 0;
    loadingEmitter.emit(false);
  }
};