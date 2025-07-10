import React, { useState, useContext } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { VaccinationContext } from '../../../../../context/NurseContext/VaccinationContext';

const CreateRecordModal = ({ show, handleClose, student, plan }) => {
    const { handleCreateRecord, vaccineForRecord } = useContext(VaccinationContext);
    const [formData, setFormData] = useState({
        nurseId: '',
        vaccinationDate: new Date().toISOString(),
        administeredAt: '',
        notes: '',
    });
    const [validated, setValidated] = useState(false);

    const handleSubmit = (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity() === false) {
            setValidated(true);
            return;
        }

        handleCreateRecord(formData);
        // Reset form for next time, though the modal will close anyway
        setFormData({
            nurseId: '',
            vaccinationDate: new Date().toISOString(),
            administeredAt: '',
            notes: '',
        });
        setValidated(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (!student || !plan || !vaccineForRecord) return null;

    const acceptedParticipants = plan.students?.filter(s => s.vaccineResponses?.some(vr => vr.response === 'ACCEPTED')).length || 0;
    const totalStudents = plan.students?.length || 0;

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Tạo Hồ sơ Tiêm chủng</Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body>
                    <h6>Học sinh: <span className="fw-normal">{student.fullName} (Lớp: {student.className})</span></h6>
                    <h6>Kế hoạch: <span className="fw-normal">{plan.name}</span></h6>
                    <h6>Vaccine đang tạo: <span className="fw-normal text-primary">{vaccineForRecord.vaccineName}</span></h6>
                    <hr />

                    <Form.Group className="mb-3" controlId="formNurseId">
                        <FloatingLabel label="ID Y tá">
                            <Form.Control
                                type="text"
                                name="nurseId"
                                placeholder="Nhập ID của y tá"
                                value={formData.nurseId}
                                onChange={handleChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng nhập ID của y tá.
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Form.Group>

                     <Form.Group className="mb-3" controlId="formAdministeredAt">
                        <FloatingLabel label="Nơi tiêm">
                            <Form.Control
                                type="text"
                                name="administeredAt"
                                placeholder="Nhập nơi tiêm"
                                value={formData.administeredAt}
                                onChange={handleChange}
                                required
                            />
                             <Form.Control.Feedback type="invalid">
                                Vui lòng nhập nơi tiêm.
                            </Form.Control.Feedback>
                        </FloatingLabel>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formNotes">
                        <FloatingLabel label="Ghi chú">
                            <Form.Control
                                as="textarea"
                                name="notes"
                                placeholder="Nhập ghi chú (nếu có)"
                                style={{ height: '100px' }}
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </FloatingLabel>
                    </Form.Group>

                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>Hủy</Button>
                    <Button variant="primary" type="submit">Lưu Hồ sơ</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CreateRecordModal; 