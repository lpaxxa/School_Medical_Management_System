import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { VaccinationContext } from '../../../../../context/NurseContext/VaccinationContext';

const CreateRecordModal = ({ show, handleClose, student, plan }) => {
    const { handleCreateRecord, vaccineForRecord } = useContext(VaccinationContext);
    const [formData, setFormData] = useState({
        nurseId: '1', // Default nurse ID to 1
        vaccinationDate: new Date().toISOString(),
        administeredAt: '',
        notes: '',
    });
    const [validated, setValidated] = useState(false);

    // Set vaccination date from student when modal opens
    useEffect(() => {
        if (student && student.vaccinationDate) {
            setFormData(prev => ({
                ...prev,
                vaccinationDate: new Date(student.vaccinationDate).toISOString(),
                nurseId: '1' // Ensure nurse ID remains 1
            }));
        }
    }, [student]);

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
            nurseId: '1', // Keep nurse ID as 1
            vaccinationDate: student?.vaccinationDate ? new Date(student.vaccinationDate).toISOString() : new Date().toISOString(),
            administeredAt: '',
            notes: '',
        });
        setValidated(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'vaccinationDate') {
            // Convert datetime-local value to ISO string
            const date = new Date(value);
            setFormData(prev => ({ ...prev, [name]: date.toISOString() }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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

                    <Form.Group className="mb-3" controlId="formVaccinationDate">
                        <FloatingLabel label="Ngày tiêm">
                            <Form.Control
                                type="datetime-local"
                                name="vaccinationDate"
                                value={formData.vaccinationDate ? new Date(formData.vaccinationDate).toISOString().slice(0, 16) : ''}
                                onChange={handleChange}
                                required
                            />
                            <Form.Control.Feedback type="invalid">
                                Vui lòng chọn ngày tiêm.
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