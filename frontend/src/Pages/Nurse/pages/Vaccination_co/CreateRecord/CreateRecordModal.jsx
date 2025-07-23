import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap';
import { VaccinationContext } from '../../../../../context/NurseContext/VaccinationContext';
import Swal from 'sweetalert2';
import './CreateRecord.css';

const CreateRecordModal = ({ show, handleClose, student, plan }) => {
    const { handleCreateRecord, vaccineForRecord } = useContext(VaccinationContext);

    // Helper function to convert datetime-local for backend
    const convertDateTimeForBackend = (datetimeLocal) => {
        if (!datetimeLocal) {
            // Return current time in local format
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        }

        // Add seconds if not present and return as local datetime string
        // Backend LocalDateTime should parse this as local time
        if (datetimeLocal.length === 16) { // Format: YYYY-MM-DDTHH:MM
            return `${datetimeLocal}:00`;
        }

        return datetimeLocal;
    };
    const [formData, setFormData] = useState({
        nurseId: '1', // Default nurse ID to 1
        vaccinationDate: new Date().toISOString(),
        administeredAt: '',
        notes: '',
    });
    const [validated, setValidated] = useState(false);

    // Helper function to format date from backend with timezone handling
    const formatDate = (dateInput) => {
        if (!dateInput) return null;

        try {
            let date;

            // Handle array format from backend [year, month, day, hour, minute, second, nanosecond]
            if (Array.isArray(dateInput)) {
                if (dateInput.length >= 3) {
                    // Create date in local timezone to avoid UTC conversion issues
                    const year = dateInput[0];
                    const month = dateInput[1] - 1; // Convert to 0-indexed
                    const day = dateInput[2];
                    const hour = dateInput[3] || 0;
                    const minute = dateInput[4] || 0;
                    const second = dateInput[5] || 0;

                    // Use local timezone constructor to avoid UTC offset issues
                    date = new Date(year, month, day, hour, minute, second);
                } else {
                    return null;
                }
            }
            // Handle string format
            else if (typeof dateInput === 'string') {
                // If it's an ISO string, parse it carefully
                if (dateInput.includes('T') || dateInput.includes('Z')) {
                    date = new Date(dateInput);
                } else {
                    // Assume it's a date string without timezone info
                    date = new Date(dateInput + 'T00:00:00');
                }
            }
            // Handle Date object
            else if (dateInput instanceof Date) {
                date = new Date(dateInput);
            }
            else {
                return null;
            }

            // Check if date is valid
            if (isNaN(date.getTime())) {
                return null;
            }

            return date;
        } catch (error) {
            console.error('Error formatting date:', error, dateInput);
            return null;
        }
    };

    // Convert date to datetime-local format without timezone issues
    const toDateTimeLocalString = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
            return '';
        }

        // Get local date components to avoid timezone conversion
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Get the vaccination date from plan
    const getVaccinationDateFromPlan = () => {
        if (!plan || !plan.vaccinationDate) return new Date();

        const planDate = formatDate(plan.vaccinationDate);
        if (planDate instanceof Date && !isNaN(planDate.getTime())) {
            return planDate;
        }
        return new Date();
    };

    // Set vaccination date from plan when modal opens
    useEffect(() => {
        if (plan && plan.vaccinationDate) {
            const planDate = getVaccinationDateFromPlan();
            setFormData(prev => ({
                ...prev,
                vaccinationDate: toDateTimeLocalString(planDate),
                nurseId: '1' // Ensure nurse ID remains 1
            }));
        }
    }, [plan]);

    const handleSubmit = async (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        event.stopPropagation();

        if (form.checkValidity() === false) {
            setValidated(true);
            return;
        }

        try {
            // Convert datetime-local for backend (send as local datetime string)
            const convertedDate = convertDateTimeForBackend(formData.vaccinationDate);

            const submitData = {
                ...formData,
                vaccinationDate: convertedDate
            };

            console.log('🔍 DETAILED DATE DEBUG:', {
                originalInput: formData.vaccinationDate,
                convertedForBackend: convertedDate,
                backendWillReceive: convertedDate,
                expectedBehavior: 'Backend LocalDateTime should parse as local time',
                currentTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                timezoneOffset: new Date().getTimezoneOffset()
            });

            await handleCreateRecord(submitData);

            // Show success message with SweetAlert2
            await Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: `Đã tạo hồ sơ tiêm chủng cho học sinh ${student.fullName}`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#667eea',
                timer: 3000,
                timerProgressBar: true
            });

            // Reset form for next time
            const planDate = getVaccinationDateFromPlan();
            setFormData({
                nurseId: '1', // Keep nurse ID as 1
                vaccinationDate: toDateTimeLocalString(planDate),
                administeredAt: '',
                notes: '',
            });
            setValidated(false);

            // Close modal
            handleClose();
        } catch (error) {
            console.error('Error creating vaccination record:', error);

            // Show error message with SweetAlert2
            await Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Có lỗi xảy ra khi tạo hồ sơ tiêm chủng. Vui lòng thử lại.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#dc3545'
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'vaccinationDate') {
            // Store the datetime-local value directly without timezone conversion
            setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    if (!student || !plan || !vaccineForRecord) return null;

    // Format plan vaccination date for display
    const formatDateForDisplay = (dateInput) => {
        const date = formatDate(dateInput);
        if (date instanceof Date && !isNaN(date.getTime())) {
            const options = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            };
            return date.toLocaleDateString('vi-VN', options);
        }
        return 'N/A';
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
            size="lg"
            className="create-vaccination-record-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>Tạo Hồ sơ Tiêm chủng</Modal.Title>
            </Modal.Header>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="student-info-section">
                        <h6>Học sinh: <span className="fw-normal">{student.fullName} (Lớp: {student.className})</span></h6>
                        <h6>Kế hoạch: <span className="fw-normal">{plan.name}</span></h6>
                        <h6>Ngày tiêm: <span className="fw-normal text-info">{formatDateForDisplay(plan.vaccinationDate)}</span></h6>
                        <h6>Vaccine đang tạo: <span className="fw-normal text-primary">{vaccineForRecord.vaccineName}</span></h6>
                        <hr />
                    </div>

                    <div className="form-section">
                        <Form.Group className="mb-3" controlId="formVaccinationDate">
                            <FloatingLabel label="Thời gian tiêm *">
                                <Form.Control
                                    type="datetime-local"
                                    name="vaccinationDate"
                                    value={formData.vaccinationDate || ''}
                                    onChange={handleChange}
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                    Vui lòng chọn thời gian tiêm.
                                </Form.Control.Feedback>
                            </FloatingLabel>
                            <small className="text-muted">
                                <i className="fas fa-info-circle me-1"></i>
                                Lưu ý: Ngày tiêm được lấy từ kế hoạch, bạn chỉ có thể thay đổi giờ tiêm.
                            </small>
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formAdministeredAt">
                            <FloatingLabel label="Nơi tiêm *">
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
                            <FloatingLabel label="Ghi chú (tùy chọn)">
                                <Form.Control
                                    as="textarea"
                                    name="notes"
                                    placeholder="Nhập ghi chú (nếu có)"
                                    style={{ height: '120px' }}
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </FloatingLabel>
                        </Form.Group>
                    </div>

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