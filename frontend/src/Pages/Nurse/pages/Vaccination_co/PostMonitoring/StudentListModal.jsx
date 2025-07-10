import React from 'react';
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
              {plan?.students?.map((student, index) => (
                <tr key={student.healthProfileId}>
                  <td>{index + 1}</td>
                  <td>{student.fullName}</td>
                  <td>{student.parentNotes || 'Không có'}</td>
                  <td>{getStatusBadge(studentStatuses[student.healthProfileId])}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleShowHistoryModal(student)}
                      disabled={!studentStatuses[student.healthProfileId] || studentStatuses[student.healthProfileId] === 'Lỗi'}
                    >
                      Xem lịch sử
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseStudentListModal}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StudentListModal; 