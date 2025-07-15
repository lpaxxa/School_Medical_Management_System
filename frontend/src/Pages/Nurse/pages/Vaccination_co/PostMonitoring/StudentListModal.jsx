import React, { useState, useMemo } from 'react';
import { Modal, Button, Table, Spinner, Badge } from 'react-bootstrap';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';

const StudentListModal = () => {
  const {
    showStudentListModal,
    handleCloseStudentListModal,
    selectedPlanForMonitoring: plan,
    studentStatuses,
    statusLoading,
    handleShowHistoryModal,
  } = useVaccination();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination logic
  const students = plan?.students || [];
  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = students.slice(startIndex, endIndex);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return <Badge bg="success">Hoàn thành</Badge>;
      case 'Cần theo dõi':
        return <Badge bg="warning">Cần theo dõi</Badge>;
      case 'Lỗi':
        return <Badge bg="danger">Lỗi</Badge>;
      default:
        return <Spinner animation="border" size="sm" />;
    }
  };

  return (
    <Modal show={showStudentListModal} onHide={handleCloseStudentListModal} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Danh sách học sinh - {plan?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {statusLoading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Đang tải trạng thái theo dõi...</p>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Tên học sinh</th>
                <th>Ghi chú từ phụ huynh</th>
                <th>Trạng thái theo dõi</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student, index) => (
                <tr key={student.healthProfileId}>
                  <td>{startIndex + index + 1}</td>
                  <td>{student.fullName}</td>
                  <td>{student.parentNotes || 'Không có'}</td>
                  <td>{getStatusBadge(studentStatuses[student.healthProfileId])}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => handleShowHistoryModal(student)}
                      disabled={!studentStatuses[student.healthProfileId] || studentStatuses[student.healthProfileId] === 'Lỗi'}
                      style={{
                        background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 12px',
                        fontSize: '12px'
                      }}
                    >
                      Xem lịch sử
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Simple Pagination with "1 / 3" style */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-4 px-3">
            {/* Showing entries info */}
            <div className="text-muted">
              <small>
                Showing {startIndex + 1} to {Math.min(endIndex, students.length)} of {students.length} students
              </small>
            </div>

            {/* Pagination controls */}
            <div className="d-flex align-items-center gap-2">
              {/* First page button */}
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                title="Trang đầu"
                style={{ minWidth: '40px' }}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>

              {/* Previous page button */}
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                title="Trang trước"
                style={{ minWidth: '40px' }}
              >
                <i className="fas fa-angle-left"></i>
              </button>

              {/* Current page indicator */}
              <div
                className="px-3 py-1 text-white rounded"
                style={{
                  minWidth: '60px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: 'linear-gradient(135deg, #015C92 0%, #2D82B5 100%)'
                }}
              >
                {currentPage} / {totalPages}
              </div>

              {/* Next page button */}
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                title="Trang tiếp"
                style={{ minWidth: '40px' }}
              >
                <i className="fas fa-angle-right"></i>
              </button>

              {/* Last page button */}
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
                title="Trang cuối"
                style={{ minWidth: '40px' }}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <button
          className="btn"
          onClick={handleCloseStudentListModal}
          style={{
            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '14px'
          }}
        >
          Đóng
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default StudentListModal; 