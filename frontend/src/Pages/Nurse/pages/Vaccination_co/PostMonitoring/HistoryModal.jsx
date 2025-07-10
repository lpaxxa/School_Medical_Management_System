import React from 'react';
import { Modal, Button, Table, Spinner } from 'react-bootstrap';
import { useVaccination } from '../../../../../context/NurseContext/VaccinationContext';

const HistoryModal = () => {
  const {
    showHistoryModal,
    handleCloseHistoryModal,
    historyLoading,
    selectedStudentHistory,
    handleShowUpdateNoteModal,
  } = useVaccination();

  const { student, history } = selectedStudentHistory;

  return (
    <Modal show={showHistoryModal} onHide={handleCloseHistoryModal} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Lịch sử tiêm chủng - {student?.fullName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {historyLoading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Đang tải lịch sử...</p>
          </div>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Lần tiêm</th>
                <th>Ngày tiêm</th>
                <th>Ngày tiêm tiếp theo</th>
                <th>Nơi tiêm</th>
                <th>Ghi chú của y tá</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {history && history.length > 0 ? (
                history.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.doseNumber}</td>
                    <td>{new Date(record.vaccinationDate).toLocaleDateString('vi-VN')}</td>
                    <td>{record.nextDoseDate ? new Date(record.nextDoseDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td>{record.administeredAt}</td>
                    <td>{record.notes}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleShowUpdateNoteModal(record)}
                      >
                        <i className="fas fa-edit"></i> Cập nhật
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">Không có dữ liệu lịch sử.</td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCloseHistoryModal}>
          Quay lại
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HistoryModal; 