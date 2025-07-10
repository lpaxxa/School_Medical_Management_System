/**
 * namespace-manager.js
 * 
 * Quản lý không gian tên CSS cho các module khác nhau để tránh xung đột
 * Sử dụng tiền tố cho các class CSS để đảm bảo không có xung đột giữa các module
 */

// Các không gian tên cho từng module
const namespaces = {
  parent: 'parent',
  admin: 'admin',
  nurse: 'nurse',
  shared: 'shared'
};

/**
 * Tạo class với tiền tố không gian tên
 * @param {string} namespace - Không gian tên (parent, admin, nurse, shared)
 * @param {string} className - Tên class cần thêm tiền tố
 * @returns {string} - Class có tiền tố
 */
const createNamespacedClass = (namespace, className) => {
  if (!namespaces[namespace]) {
    console.warn(`Namespace "${namespace}" không tồn tại. Sử dụng các namespace: ${Object.keys(namespaces).join(', ')}`);
    return className;
  }
  return `${namespaces[namespace]}-${className}`;
};

/**
 * Tạo nhiều class với tiền tố không gian tên
 * @param {string} namespace - Không gian tên (parent, admin, nurse, shared)
 * @param {Array<string>} classNames - Danh sách các tên class cần thêm tiền tố
 * @returns {string} - Chuỗi các class có tiền tố
 */
const createNamespacedClasses = (namespace, classNames) => {
  if (!Array.isArray(classNames)) {
    console.warn('classNames phải là một mảng');
    return '';
  }
  return classNames.map(className => createNamespacedClass(namespace, className)).join(' ');
};

/**
 * Đối tượng chứa các hàm tiện ích cho từng không gian tên
 */
export const parentNS = {
  cls: (className) => createNamespacedClass('parent', className),
  clsList: (classNames) => createNamespacedClasses('parent', classNames)
};

export const adminNS = {
  cls: (className) => createNamespacedClass('admin', className),
  clsList: (classNames) => createNamespacedClasses('admin', classNames)
};

export const nurseNS = {
  cls: (className) => createNamespacedClass('nurse', className),
  clsList: (classNames) => createNamespacedClasses('nurse', classNames)
};

export const sharedNS = {
  cls: (className) => createNamespacedClass('shared', className),
  clsList: (classNames) => createNamespacedClasses('shared', classNames)
};

export default {
  parentNS,
  adminNS,
  nurseNS,
  sharedNS,
  namespaces
}; 