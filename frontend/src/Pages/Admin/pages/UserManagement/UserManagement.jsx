import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserMd,
  FaUserTie,
  FaUserCheck,
  FaUserClock,
  FaPlus,
  FaSearch,
  FaFilter,
  FaWifi,
  FaSignInAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import axios from "axios";
import UserTable from "./components/UserTable";
import UserModal from "./components/UserModal";
import SuccessModal from "../../components/SuccessModal";
import ErrorModal from "../../components/ErrorModal";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import { useSuccessModal } from "../../hooks/useSuccessModal";
import { useErrorModal } from "../../hooks/useErrorModal";
import { useConfirmModal } from "../../hooks/useConfirmModal";
import { useAuth } from "../../../../context/AuthContext";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  transformUserFromAPI,
  transformUserToAPI,
  testApiConnection,
} from "./services/userService";
import "./UserManagement.css";

const UserManagement = () => {
  const { currentUser } = useAuth(); // Lấy thông tin user hiện tại

  // Modal hooks
  const {
    isOpen: isSuccessOpen,
    modalData: successData,
    showSuccess,
    hideSuccess,
  } = useSuccessModal();

  const {
    isOpen: isErrorOpen,
    modalData: errorData,
    showError,
    hideError,
  } = useErrorModal();

  const {
    isOpen: isConfirmOpen,
    modalData: confirmData,
    showConfirm,
    hideConfirm,
  } = useConfirmModal();

  // State cho dữ liệu người dùng
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiConnectionStatus, setApiConnectionStatus] = useState("checking"); // checking, success, failed
  const [authRequired, setAuthRequired] = useState(false);

  // State cho filter và search
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // State cho modals
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // view, add, edit
  const [selectedUser, setSelectedUser] = useState(null);

  // State cho chức năng gửi email
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendingUserId, setSendingUserId] = useState(null);

  // State cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [paginatedUsers, setPaginatedUsers] = useState([]);

  // Thống kê
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    nurse: 0,
    parent: 0,
    active: 0,
    inactive: 0,
  });

  // Check authentication và test API connection
  useEffect(() => {
    checkAuthAndTestConnection();
  }, [currentUser]);

  const checkAuthAndTestConnection = async () => {
    // Check if user is logged in
    if (!currentUser) {
      console.warn("User not logged in, checking if API requires auth...");
      setAuthRequired(true);
    }

    // Check if user has admin role
    if (currentUser && currentUser.role !== "admin") {
      setError(
        "Bạn không có quyền truy cập trang quản lý người dùng. Chỉ Admin mới có thể truy cập."
      );
      setApiConnectionStatus("failed");
      setIsLoading(false);
      return;
    }

    testConnection();
  };

  const testConnection = async () => {
    try {
      console.log("Testing API connection...");
      setApiConnectionStatus("checking");

      // Add timeout for connection test (10 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Connection timeout after 10 seconds")),
          10000
        )
      );

      const result = await Promise.race([testApiConnection(), timeoutPromise]);

      if (result.success) {
        console.log("API connection successful!");
        setApiConnectionStatus("success");
        setAuthRequired(false);

        // Use data from connection test instead of calling API again
        if (result.data && result.data.length > 0) {
          console.log(
            "Using data from connection test:",
            result.data.length,
            "users"
          );
          const transformedUsers = result.data.map((user) =>
            transformUserFromAPI(user)
          );
          setUsers(transformedUsers);
          setFilteredUsers(transformedUsers);
          updateStats(transformedUsers);
          setIsLoading(false);
        } else {
          loadUsersDirectly();
        }
      } else {
        console.error("API connection failed:", result.error);
        setApiConnectionStatus("failed");

        // Check if it's an auth error
        if (
          result.error.includes("Unauthorized") ||
          result.error.includes("401")
        ) {
          setAuthRequired(true);
          setError("Bạn cần đăng nhập để truy cập tính năng này.");
        } else if (
          result.error.includes("Forbidden") ||
          result.error.includes("403")
        ) {
          setError(
            "Bạn không có quyền truy cập tính năng này. Chỉ Admin mới có thể quản lý người dùng."
          );
        } else {
          setError(`Không thể kết nối với API: ${result.error}`);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Connection test error:", error);
      setApiConnectionStatus("failed");

      if (error.message.includes("timeout")) {
        setError(
          "Kết nối API bị timeout. Vui lòng kiểm tra:\n• Backend server có đang chạy không?\n• Có kết nối mạng không?\n• URL API có chính xác không?"
        );
      } else {
        setError(`Lỗi kết nối: ${error.message}`);
      }
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    if (apiConnectionStatus !== "success") {
      console.log("Skipping loadUsers - API connection not established");
      return;
    }

    loadUsersDirectly();
  };

  const loadUsersDirectly = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Loading users from API...");

      // Add timeout for data loading (15 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Data loading timeout after 15 seconds")),
          15000
        )
      );

      const response = await Promise.race([getAllUsers(), timeoutPromise]);

      console.log("Raw API response:", response);

      const transformedUsers = response.map((user) =>
        transformUserFromAPI(user)
      );
      console.log("Transformed users:", transformedUsers);

      setUsers(transformedUsers);
      setFilteredUsers(transformedUsers);
      updateStats(transformedUsers);

      console.log(
        "Users loaded successfully:",
        transformedUsers.length,
        "users"
      );
    } catch (error) {
      console.error("Error loading users:", error);

      // Handle authentication errors
      if (
        error.message.includes("Unauthorized") ||
        error.message.includes("401")
      ) {
        setAuthRequired(true);
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (
        error.message.includes("Forbidden") ||
        error.message.includes("403")
      ) {
        setError("Bạn không có quyền truy cập dữ liệu người dùng.");
      } else if (error.message.includes("timeout")) {
        setError(
          "Tải dữ liệu bị timeout. Backend có thể đang chậm hoặc không phản hồi."
        );
      } else {
        setError(`Không thể tải danh sách người dùng: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cập nhật thống kê
  const updateStats = (usersList) => {
    const stats = {
      total: usersList.length,
      admin: usersList.filter((u) => u.role === "ADMIN").length,
      nurse: usersList.filter((u) => u.role === "NURSE").length,
      parent: usersList.filter((u) => u.role === "PARENT").length,
      active: usersList.filter((u) => u.isActive).length,
      inactive: usersList.filter((u) => !u.isActive).length,
    };
    setStats(stats);
  };

  // Xử lý tìm kiếm và lọc
  useEffect(() => {
    let result = [...users];

    console.log("=== FILTERING DEBUG ===");
    console.log("Total users:", users.length);
    console.log("statusFilter:", statusFilter);
    console.log("roleFilter:", roleFilter);
    console.log("searchTerm:", searchTerm);

    // Lọc theo trạng thái chỉ khi người dùng chọn lọc
    // Nếu không lọc (statusFilter === "all") thì hiển thị cả tài khoản active và inactive
    if (statusFilter !== "all") {
      const statusValue = statusFilter === "active";
      console.log("Filtering by status:", statusValue);

      // Debug: Show isActive values for first few users
      console.log(
        "Sample user isActive values:",
        users.slice(0, 3).map((u) => ({
          username: u.username,
          isActive: u.isActive,
          typeof: typeof u.isActive,
        }))
      );

      result = result.filter((user) => user.isActive === statusValue);
      console.log("After status filter:", result.length);
    }

    // Lọc theo vai trò
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter.toUpperCase());
      console.log("After role filter:", result.length);
    }

    // Tìm kiếm theo từ khóa
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          (user.username?.toLowerCase() || "").includes(searchLower) ||
          (user.email?.toLowerCase() || "").includes(searchLower) ||
          (user.phoneNumber?.toLowerCase() || "").includes(searchLower) ||
          (user.id?.toLowerCase() || "").includes(searchLower) ||
          (user.fullName?.toLowerCase() || "").includes(searchLower)
      );
      console.log("After search filter:", result.length);
    }

    setFilteredUsers(result);
    console.log("Final filtered users:", result.length);
    console.log("=== END FILTERING DEBUG ===");
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Handle pagination when filteredUsers changes
  useEffect(() => {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // Reset to page 1 if current page is out of bounds
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
      return;
    }

    // Calculate start and end indices for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Get users for current page
    const usersForCurrentPage = filteredUsers.slice(startIndex, endIndex);
    setPaginatedUsers(usersForCurrentPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Handlers
  const handleAddUser = () => {
    setModalMode("add");
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleViewUser = (user) => {
    setModalMode("view");
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    // Tìm user để hiển thị thông tin trong confirm dialog
    const user = users.find((u) => u.id === userId);
    const userName = user ? user.username : userId;

    showConfirm(
      "Xác nhận xóa người dùng",
      `Bạn có chắc chắn muốn xóa người dùng "${userName}" (ID: ${userId})?\n\nLưu ý: Hành động này không thể hoàn tác!`,
      async () => {
        try {
          console.log("Deleting user:", { userId, userName });
          await deleteUser(userId);
          await loadUsers(); // Reload data sau khi xóa
          showSuccess(
            "Xóa thành công!",
            `Người dùng "${userName}" đã được xóa khỏi hệ thống.`,
            "",
            true,
            3000
          );
        } catch (error) {
          console.error("Error deleting user:", error);
          if (error.message.includes("Unauthorized")) {
            setAuthRequired(true);
            showError(
              "Phiên đăng nhập hết hạn",
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
            );
          } else if (error.message.includes("Forbidden")) {
            showError(
              "Không có quyền",
              "Bạn không có quyền xóa người dùng này."
            );
          } else if (error.message.includes("không tồn tại")) {
            showError(
              "Người dùng không tồn tại",
              "Người dùng không tồn tại hoặc đã bị xóa."
            );
            await loadUsers(); // Reload để sync data
          } else {
            showError(
              "Lỗi xóa người dùng",
              `Có lỗi xảy ra khi xóa người dùng: ${error.message}`
            );
          }
        }
      },
      {
        confirmText: "Xóa",
        cancelText: "Hủy",
        type: "danger",
      }
    );
  };

  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) {
        showError(
          "Không tìm thấy người dùng",
          `Không tìm thấy người dùng với ID: ${userId}`
        );
        return;
      }

      const newStatus = !user.isActive;
      console.log(
        `Toggling status for user: ${userId}, current: ${user.isActive}, new: ${newStatus}`
      );

      // Hiển thị thông báo đang xử lý
      const statusMessage = newStatus ? "kích hoạt" : "vô hiệu hóa";
      console.log(`Đang ${statusMessage} tài khoản ${userId}...`);

      // Gọi API với userId CHÍNH XÁC (không thay đổi)
      await toggleUserStatus(userId, newStatus);

      // Reload dữ liệu sau khi toggle
      await loadUsers();

      // Hiển thị thông báo thành công
      showSuccess(
        `${newStatus ? "Kích hoạt" : "Vô hiệu hóa"} tài khoản thành công`,
        `Trạng thái của tài khoản đã được ${
          newStatus ? "kích hoạt" : "vô hiệu hóa"
        }.`,
        `Người dùng "${user.username}" hiện đang ${
          newStatus ? "hoạt động" : "tạm ngưng"
        }.`
      );
    } catch (error) {
      console.error("Error toggling user status:", error);

      // Detailed error handling
      if (error.message.includes("Unauthorized")) {
        setAuthRequired(true);
        showError(
          "Phiên đăng nhập hết hạn",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      } else if (
        error.message.includes("404") ||
        error.message.includes("không tìm thấy")
      ) {
        showError(
          "Không tìm thấy tài khoản",
          `Không tìm thấy tài khoản: ${error.message}`
        );
        // Reload để đồng bộ với server
        await loadUsers();
      } else if (error.message.includes("JSON")) {
        console.error("JSON Parse Error:", error);
        showError(
          "Lỗi xử lý dữ liệu",
          "Trạng thái có thể đã được thay đổi, nhưng có lỗi khi xử lý phản hồi. Đang tải lại dữ liệu..."
        );
        // Reload data to check if the status was actually changed
        await loadUsers();
      } else {
        showError(
          "Lỗi thay đổi trạng thái",
          `Có lỗi xảy ra khi thay đổi trạng thái: ${error.message}`
        );
        // Reload để đảm bảo UI hiển thị trạng thái chính xác
        await loadUsers();
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      // console.log("=== HANDLE SAVE USER DEBUG ===");
      // console.log("HandleSaveUser called with:", userData);
      // console.log("Current modal mode:", modalMode);
      // console.log("User role:", userData.role);
      // console.log("=== END SAVE DEBUG ===");

      if (modalMode === "add") {
        const apiData = transformUserToAPI(userData);
        console.log("Add mode - API data:", apiData);
        await createUser(apiData);
        showSuccess("Thêm người dùng thành công!");
      } else if (modalMode === "edit") {
        console.log("Edit mode - updating user with ID:", userData.id);
        // Prepare edit data with all fields from the form
        const editData = {
          email: userData.email,
          phoneNumber: userData.phoneNumber,
        };

        // Add role-specific fields based on user role
        if (userData.role === "PARENT") {
          editData.fullName = userData.fullName;
          editData.address = userData.address;
          editData.relationshipType = userData.relationshipType;
          editData.occupation = userData.occupation;
          // Include students data for parent updates
          if (userData.students) {
            editData.students = userData.students;
          }
        } else if (userData.role === "NURSE") {
          editData.fullName = userData.fullName;
          editData.qualification = userData.qualification;
        } else if (userData.role === "ADMIN") {
          editData.fullName = userData.fullName;
        }

        // Only include password if user wants to change it
        if (userData.password && userData.password.trim() !== "") {
          editData.password = userData.password;
        }

        console.log("Edit mode - sending data:", editData);
        await updateUser(userData.id, editData);
        showSuccess(
          "Cập nhật người dùng thành công!",

          `Tài khoản "${userData.username}" đã được cập nhật thông tin mới.`
        );
      }

      await loadUsers(); // Reload data sau khi save
      setShowModal(false);
    } catch (error) {
      console.error("Error saving user:", error);
      if (error.message.includes("Unauthorized")) {
        setAuthRequired(true);
        showError(
          "Phiên đăng nhập hết hạn",
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          "Bạn cần đăng nhập lại để tiếp tục sử dụng hệ thống."
        );
        setShowModal(false);
      } else {
        showError(
          "Lỗi cập nhật tài khoản",
          "Có lỗi xảy ra khi lưu thông tin người dùng.",
          `Chi tiết lỗi: ${error.message}`
        );
      }
    }
  };

  // Helper function để hiển thị tên vai trò
  const getRoleDisplayName = (role) => {
    switch (role) {
      case "ADMIN":
        return "Quản trị viên";
      case "NURSE":
        return "Y tá trường";
      case "PARENT":
        return "Phụ huynh";
      default:
        return role;
    }
  };

  // Handle send email
  const handleSendEmail = async (user) => {
    if (!user || !user.id) {
      showError(
        "Thông tin không hợp lệ",
        "Thông tin người dùng không hợp lệ hoặc bị thiếu.",
        "Vui lòng kiểm tra lại thông tin người dùng và thử lại."
      );
      return;
    }

    // Confirm trước khi gửi
    showConfirm(
      "Xác nhận gửi email",
      `Gửi email thông tin tài khoản cho:\n\n` +
        `- Tên: ${user.username}\n` +
        `- Email: ${user.email}\n` +
        `- Vai trò: ${getRoleDisplayName(user.role)}\n\n` +
        `Bạn có chắc chắn muốn gửi?`,
      async () => {
        // Callback khi xác nhận gửi email
        try {
          setIsSendingEmail(true);
          setSendingUserId(user.id);

          const token = localStorage.getItem("authToken");
          if (!token) {
            throw new Error("Không tìm thấy token xác thực");
          }

          // Gọi API gửi email
          const response = await axios.post(
            "http://localhost:8080/api/v1/email/sendAccountEmail",
            [user.id], // Gửi array chứa 1 user ID
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status === 200) {
            // Cập nhật state local để hiển thị trạng thái đã gửi
            setUsers((prevUsers) =>
              prevUsers.map((u) =>
                u.id === user.id ? { ...u, emailSent: true } : u
              )
            );
            setFilteredUsers((prevUsers) =>
              prevUsers.map((u) =>
                u.id === user.id ? { ...u, emailSent: true } : u
              )
            );

            showSuccess(
              "Gửi email thành công!",
              "Email thông tin tài khoản đã được gửi.",
              `Email đã được gửi đến ${user.email} cho tài khoản "${user.username}".`
            );
          }
        } catch (error) {
          console.error("Error sending email:", error);

          let errorMessage = "Có lỗi xảy ra khi gửi email. ";
          if (error.response?.status === 401) {
            errorMessage +=
              "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            setAuthRequired(true);
          } else if (error.response?.status === 403) {
            errorMessage += "Bạn không có quyền thực hiện thao tác này.";
          } else if (error.response?.status === 400) {
            errorMessage +=
              error.response?.data?.message || "Dữ liệu không hợp lệ.";
          } else if (error.response?.status === 500) {
            errorMessage += "Lỗi máy chủ. Vui lòng thử lại sau.";
          } else {
            errorMessage += "Vui lòng thử lại.";
          }

          showError(
            "Lỗi gửi email",
            "Không thể gửi email thông tin tài khoản.",
            errorMessage
          );
        } finally {
          setIsSendingEmail(false);
          setSendingUserId(null);
        }
      },
      {
        type: "default",
        confirmText: "Xác nhận",
        cancelText: "Hủy",
      }
    );
  };

  // Handle retry connection
  const handleRetry = () => {
    checkAuthAndTestConnection();
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    // Redirect to login page
    window.location.href = "/login";
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calculate pagination info
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredUsers.length);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  if (apiConnectionStatus === "checking") {
    return (
      <div className="admin-user-management-container">
        <div className="admin-connection-checking">
          <div className="admin-checking-spinner"></div>
          <h3>Đang kiểm tra kết nối API...</h3>
          <p>Vui lòng đợi trong giây lát (timeout sau 10 giây)</p>
          {currentUser && (
            <p className="admin-auth-info">
              Đăng nhập với tư cách: <strong>{currentUser.role}</strong>
            </p>
          )}
          <button
            onClick={() => {
              setApiConnectionStatus("failed");
              setError(
                "Bỏ qua kiểm tra kết nối. Kiểm tra console để xem lỗi chi tiết."
              );
              setIsLoading(false);
            }}
            className="admin-btn-retry"
          >
            Bỏ qua kiểm tra kết nối
          </button>
        </div>
      </div>
    );
  }

  if (
    authRequired ||
    (apiConnectionStatus === "failed" && error?.includes("đăng nhập"))
  ) {
    return (
      <div className="admin-user-management-container">
        <div className="admin-auth-required">
          <FaSignInAlt className="admin-auth-icon" />
          <h3>Yêu cầu đăng nhập</h3>
          <p>
            Bạn cần đăng nhập với tài khoản Admin để truy cập trang quản lý
            người dùng.
          </p>
          {currentUser ? (
            <div className="admin-current-user-info">
              <p>
                Hiện tại bạn đăng nhập với role:{" "}
                <strong>{currentUser.role}</strong>
              </p>
              <p>Chỉ có Admin mới có thể truy cập trang này.</p>
            </div>
          ) : (
            <p>Vui lòng đăng nhập để tiếp tục.</p>
          )}
          <button onClick={handleLoginRedirect} className="admin-btn-login">
            <FaSignInAlt /> Đến trang đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (apiConnectionStatus === "failed" || error) {
    return (
      <div className="admin-user-management-container">
        <div className="admin-error-message">
          <FaWifi className="admin-error-icon" />
          <h3>Không thể kết nối với API</h3>
          <p>{error}</p>
          <div className="admin-error-details">
            <p>
              <strong>API Endpoint:</strong>{" "}
              http://localhost:8080/api/v1/account-members/getAll
            </p>
            {currentUser ? (
              <p>
                <strong>Đăng nhập:</strong> {currentUser.role} - Token có sẵn
              </p>
            ) : (
              <p>
                <strong>Đăng nhập:</strong> Chưa đăng nhập
              </p>
            )}
            <p>
              <strong>Gợi ý khắc phục:</strong>
            </p>
            <ul>
              <li>Kiểm tra backend server có đang chạy không</li>
              <li>Kiểm tra CORS configuration trên backend</li>
              <li>Kiểm tra quyền truy cập (chỉ Admin mới được phép)</li>
              <li>Kiểm tra token đăng nhập còn hạn không</li>
            </ul>
          </div>
          <button onClick={handleRetry} className="admin-btn-retry">
            <FaWifi /> Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-management-container">
      <div className="admin-user-management-header">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>
            Quản lý thông tin và phân quyền người dùng trong hệ thống
            <span className="admin-connection-status success">
              {/* <FaWifi /> API Connected */}
            </span>
            {currentUser && (
              <span className="admin-user-info">
                {/* | Đăng nhập: <strong>{currentUser.role}</strong> */}
              </span>
            )}
          </p>
        </div>
        <button className="admin-btn-add" onClick={handleAddUser}>
          <FaPlus /> Thêm người dùng
        </button>
      </div>

      {/* Thống kê - Modern Stats Grid */}
      <div className="admin-user-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-card-content">
            <div className="admin-stat-icon total">
              <FaUsers />
            </div>
            <div className="admin-stat-info">
              <div className="admin-stat-label">Tổng số</div>
              <div className="admin-stat-value">{stats.total}</div>
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card-content">
            <div className="admin-stat-icon admin">
              <FaUserTie />
            </div>
            <div className="admin-stat-info">
              <div className="admin-stat-label">Quản trị</div>
              <div className="admin-stat-value">{stats.admin}</div>
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card-content">
            <div className="admin-stat-icon nurse">
              <FaUserMd />
            </div>
            <div className="admin-stat-info">
              <div className="admin-stat-label">Y tá</div>
              <div className="admin-stat-value">{stats.nurse}</div>
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card-content">
            <div className="admin-stat-icon parent">
              <FaUsers />
            </div>
            <div className="admin-stat-info">
              <div className="admin-stat-label">Ph. Huynh</div>
              <div className="admin-stat-value">{stats.parent}</div>
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card-content">
            <div className="admin-stat-icon active">
              <FaUserCheck />
            </div>
            <div className="admin-stat-info">
              <div className="admin-stat-label">Kích hoạt</div>
              <div className="admin-stat-value">{stats.active}</div>
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card-content">
            <div className="admin-stat-icon inactive">
              <FaUserClock />
            </div>
            <div className="admin-stat-info">
              <div className="admin-stat-label">Khóa</div>
              <div className="admin-stat-value">{stats.inactive}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Search & Filter Section */}
      <div className="admin-user-filters">
        <div className="admin-search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng (ID, tên, email, số điện thoại)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <div className="admin-filter">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="nurse">Y tá trường</option>
              <option value="parent">Phụ huynh</option>
            </select>
          </div>

          <div className="admin-filter">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Tạm ngưng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modern User Table */}
      <div className="admin-user-table-wrapper">
        <UserTable
          users={paginatedUsers}
          totalUsers={filteredUsers.length}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          startIndex={startIndex}
          endIndex={endIndex}
          isLoading={isLoading}
          onView={handleViewUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onToggleStatus={handleToggleStatus}
          onSendEmail={handleSendEmail}
          getRoleDisplayName={getRoleDisplayName}
          isSendingEmail={isSendingEmail}
          sendingUserId={sendingUserId}
        />

        {/* Pagination Controls */}
        {filteredUsers.length > itemsPerPage && (
          <div className="admin-pagination-container">
            <div className="admin-pagination-info">
              <span>
                Hiển thị {startIndex}-{endIndex} trong tổng số{" "}
                {filteredUsers.length} người dùng
              </span>
            </div>

            <div className="admin-pagination-controls">
              <button
                className={`admin-pagination-btn ${
                  !hasPreviousPage ? "disabled" : ""
                }`}
                onClick={handlePreviousPage}
                disabled={!hasPreviousPage}
                title="Trang trước"
              >
                <FaChevronLeft />
              </button>

              <div className="admin-pagination-pages">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === currentPage;

                  // Show first page, last page, current page, and pages around current page
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  if (!showPage) {
                    // Show ellipsis for gaps
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="admin-pagination-ellipsis">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      className={`admin-pagination-btn ${
                        isCurrentPage ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                className={`admin-pagination-btn ${
                  !hasNextPage ? "disabled" : ""
                }`}
                onClick={handleNextPage}
                disabled={!hasNextPage}
                title="Trang sau"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <UserModal
          mode={modalMode}
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSave={handleSaveUser}
          getRoleDisplayName={getRoleDisplayName}
        />
      )}

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={hideSuccess}
        title={successData.title}
        message={successData.message}
        details={successData.details}
        autoClose={successData.autoClose}
        autoCloseDelay={successData.autoCloseDelay}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={isErrorOpen}
        onClose={hideError}
        title={errorData.title}
        message={errorData.message}
        details={errorData.details}
        autoClose={errorData.autoClose}
        autoCloseDelay={errorData.autoCloseDelay}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={hideConfirm}
        onConfirm={confirmData.onConfirm}
        title={confirmData.title}
        message={confirmData.message}
        confirmText={confirmData.confirmText}
        cancelText={confirmData.cancelText}
        type={confirmData.type}
      />
    </div>
  );
};

export default UserManagement;
