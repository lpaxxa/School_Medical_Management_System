import React, { useContext, useState, useMemo, useEffect } from 'react';
import { Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { VaccinationContext } from '../../../../../context/NurseContext/VaccinationContext';
import { 
    calculateStudentsMonitoringStatus, 
    canCreateVaccinationRecord, 
    getVaccinationRecordStatusText, 
    getVaccinationRecordStatusColor 
} from './monitoringStatusUtils';

const VaccinationPlanDetailsModal = ({ show, handleClose, planDetails, loading, error }) => {
    const { handleShowCreateRecordModal } = useContext(VaccinationContext);
    
    // Filter states
    const [filterName, setFilterName] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterResponse, setFilterResponse] = useState('');

    // Monitoring status states
    const [monitoringStatuses, setMonitoringStatuses] = useState({});
    const [monitoringStatusLoading, setMonitoringStatusLoading] = useState(false);

    const getResponseBadge = (response) => {
        switch (response) {
            case 'ACCEPTED':
                return <Badge bg="success">Đồng ý</Badge>;
            case 'REJECTED':
                return <Badge bg="danger">Từ chối</Badge>;
            case 'PENDING':
                return <Badge bg="secondary">Chờ phản hồi</Badge>;
            default:
                return <Badge bg="light" text="dark">{response || 'Chưa có'}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    // Load monitoring statuses for all students when planDetails change
    useEffect(() => {
        const loadMonitoringStatuses = async () => {
            if (!planDetails?.students || !planDetails?.vaccinationDate) return;
            
            setMonitoringStatusLoading(true);
            try {
                const statuses = await calculateStudentsMonitoringStatus(
                    planDetails.students, 
                    planDetails.vaccinationDate
                );
                setMonitoringStatuses(statuses);
            } catch (error) {
                console.error('Error loading monitoring statuses:', error);
            } finally {
                setMonitoringStatusLoading(false);
            }
        };

        loadMonitoringStatuses();
    }, [planDetails?.students, planDetails?.vaccinationDate]);

    // Filtered students based on filter criteria
    const filteredStudents = useMemo(() => {
        if (!planDetails?.students) return [];
        
        return planDetails.students.filter(student => {
            // Filter by name
            const nameMatch = filterName === '' || 
                student.fullName?.toLowerCase().includes(filterName.toLowerCase());
            
            // Filter by class
            const classMatch = filterClass === '' || 
                student.className?.toLowerCase().includes(filterClass.toLowerCase());
            
            // Filter by response status
            const responseMatch = filterResponse === '' || 
                student.vaccineResponses?.some(response => 
                    response.response === filterResponse
                );
            
            return nameMatch && classMatch && responseMatch;
        });
    }, [planDetails?.students, filterName, filterClass, filterResponse]);

    // Reset filters
    const resetFilters = () => {
        setFilterName('');
        setFilterClass('');
        setFilterResponse('');
    };

    // Không hiển thị gì nếu show = false
    if (!show) return null;

    return (
        <div 
            style={{
                marginTop: '20px',
                marginBottom: '20px',
                padding: '20px',
                backgroundColor: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                animation: 'slideDown 0.3s ease-out'
            }}
            className="details-section"
        >
            <style>
                {`
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    .filter-row {
                        display: flex;
                        align-items: flex-end;
                        gap: 12px;
                        flex-wrap: nowrap;
                    }
                    
                    .filter-col {
                        flex: 1;
                        min-width: 0;
                    }
                    
                    .filter-col:last-child {
                        flex-shrink: 0;
                        width: auto;
                        min-width: 120px;
                    }
                    
                    @media (max-width: 768px) {
                        .details-section {
                            margin: 10px 0;
                            padding: 15px;
                        }
                        
                        .filter-row {
                            gap: 8px;
                        }
                        
                        .filter-col input,
                        .filter-col select {
                            padding: 8px !important;
                            font-size: 14px !important;
                        }
                        
                        .filter-col button {
                            height: 40px !important;
                            font-size: 12px !important;
                            padding: 8px 12px !important;
                        }
                        
                        .filter-col label {
                            font-size: 11px !important;
                            margin-bottom: 4px !important;
                        }
                    }
                    
                    @media (max-width: 576px) {
                        .filter-row {
                            gap: 6px;
                        }
                        
                        .filter-col input,
                        .filter-col select {
                            padding: 6px 8px !important;
                            font-size: 12px !important;
                        }
                        
                        .filter-col button {
                            height: 36px !important;
                            font-size: 11px !important;
                            padding: 6px 10px !important;
                        }
                        
                        .filter-col label {
                            font-size: 10px !important;
                            margin-bottom: 2px !important;
                        }
                        
                        .filter-col:last-child {
                            min-width: 80px;
                        }
                    }
                `}
            </style>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center pb-3 mb-4" style={{
                borderBottom: '1px solid #e5e7eb'
            }}>
                <h2 className="mb-0" style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#000'
                }}>
                    Chi tiết: {planDetails ? planDetails.name : 'Đang tải...'}
                </h2>
                <button 
                    onClick={handleClose}
                    style={{
                        background: 'linear-gradient(to right, #ef4444, #dc2626)',
                        border: 'none',
                        fontSize: '14px',
                        cursor: 'pointer',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    ✖ Đóng chi tiết
                </button>
            </div>

            {/* Body */}
            <div style={{
                fontSize: '14px',
                color: '#374151'
            }}>
                    {loading && (
                        <div className="text-center p-5">
                            <Spinner animation="border" />
                            <p className="mt-2">Đang tải chi tiết...</p>
                        </div>
                    )}
                    {error && <Alert variant="danger">{error}</Alert>}
                    {planDetails && !loading && (
                        <>
                            {/* General Info */}
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{
                                    fontSize: '14px',
                                    marginBottom: '8px'
                                }}>
                                    {planDetails.description}
                                </p>
                                <p style={{
                                    fontSize: '14px',
                                    marginBottom: '8px'
                                }}>
                                    📅 Ngày tiêm: <span style={{
                                        fontWeight: 'bold',
                                        color: '#2563eb'
                                    }}>{formatDate(planDetails.vaccinationDate)}</span>
                                </p>
                            </div>

                            {/* Vaccine Details */}
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{
                                    fontWeight: 'bold',
                                    marginBottom: '10px',
                                    fontSize: '16px'
                                }}>
                                    Vaccine sử dụng:
                                </h3>
                                <p>
                                    {planDetails.vaccines?.map((vaccine, index) => (
                                        <span key={vaccine.id}>
                                            {index > 0 && ', '}
                                            {vaccine.name}
                                            {vaccine.description && `: ${vaccine.description}`}
                                        </span>
                                    ))}
                                </p>
                            </div>

                            {/* Student List */}
                            <div style={{ marginBottom: '20px' }}>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h3 style={{
                                        fontWeight: 'bold',
                                        marginBottom: '0',
                                        fontSize: '16px'
                                    }}>
                                        Danh sách học sinh:
                                    </h3>
                                    <small style={{ color: '#6b7280' }}>
                                        Hiển thị {filteredStudents.length} / {planDetails.students?.length || 0} học sinh
                                    </small>
                                </div>
                                
                                {/* Filter Section */}
                                <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    marginBottom: '20px',
                                    border: '1px solid #e2e8f0',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <h4 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#1f2937',
                                        marginBottom: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        🔍 Bộ lọc tìm kiếm
                                    </h4>
                                    <div className="filter-row">
                                        <div className="filter-col">
                                            <label style={{
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '8px',
                                                display: 'block'
                                            }}>
                                                👤 Tên:
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Nhập tên học sinh..."
                                                value={filterName}
                                                onChange={(e) => setFilterName(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    transition: 'all 0.2s ease',
                                                    backgroundColor: 'white',
                                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#3b82f6';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#d1d5db';
                                                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                                }}
                                            />
                                        </div>
                                        <div className="filter-col">
                                            <label style={{
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '8px',
                                                display: 'block'
                                            }}>
                                                🏫 Lớp:
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Nhập tên lớp..."
                                                value={filterClass}
                                                onChange={(e) => setFilterClass(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    transition: 'all 0.2s ease',
                                                    backgroundColor: 'white',
                                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#3b82f6';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#d1d5db';
                                                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                                }}
                                            />
                                        </div>
                                        <div className="filter-col">
                                            <label style={{
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: '#374151',
                                                marginBottom: '8px',
                                                display: 'block'
                                            }}>
                                                👨‍👩‍👧‍👦 Phản hồi:
                                            </label>
                                            <select
                                                value={filterResponse}
                                                onChange={(e) => setFilterResponse(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    backgroundColor: 'white',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#3b82f6';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = '#d1d5db';
                                                    e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
                                                }}
                                            >
                                                <option value="">Tất cả</option>
                                                <option value="ACCEPTED">✅ Đồng ý</option>
                                                <option value="REJECTED">❌ Từ chối</option>
                                                <option value="PENDING">⏳ Chờ phản hồi</option>
                                            </select>
                                        </div>
                                        <div className="filter-col">
                                            <button
                                                onClick={resetFilters}
                                                style={{
                                                    padding: '10px 20px',
                                                    background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    fontSize: '14px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s ease',
                                                    width: '100%',
                                                    height: '42px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, #4b5563, #374151)';
                                                    e.target.style.transform = 'translateY(-2px)';
                                                    e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
                                                    e.target.style.transform = 'translateY(0)';
                                                    e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                                                }}
                                            >
                                                🔄 Đặt lại
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ overflowX: 'auto' }}>
                                    {filteredStudents.length === 0 ? (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '40px 20px',
                                            color: '#6b7280',
                                            backgroundColor: '#f9fafb',
                                            borderRadius: '8px',
                                            border: '1px dashed #d1d5db'
                                        }}>
                                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                                            <p style={{ margin: '0', fontSize: '16px', fontWeight: '500' }}>
                                                Không tìm thấy học sinh nào
                                            </p>
                                            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                                                Thử thay đổi bộ lọc để xem thêm kết quả
                                            </p>
                                        </div>
                                    ) : (
                                    <Table 
                                        bordered 
                                        className="mb-0" 
                                        style={{
                                            borderCollapse: 'collapse',
                                            width: '100%',
                                            marginTop: '10px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <thead>
                                            <tr style={{
                                                backgroundColor: '#f3f4f6'
                                            }}>
                                                <th style={{
                                                    border: '1px solid #e5e7eb',
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    fontWeight: 'bold',
                                                    width: '50px'
                                                }}>#</th>
                                                <th style={{
                                                    border: '1px solid #e5e7eb',
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    fontWeight: 'bold',
                                                    width: '120px'
                                                }}>Họ và tên</th>
                                                <th style={{
                                                    border: '1px solid #e5e7eb',
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    fontWeight: 'bold',
                                                    width: '60px'
                                                }}>Lớp</th>
                                                <th style={{
                                                    border: '1px solid #e5e7eb',
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    fontWeight: 'bold',
                                                    width: '120px'
                                                }}>Tên Vaccine</th>
                                                <th style={{
                                                    border: '1px solid #e5e7eb',
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    fontWeight: 'bold',
                                                    width: '80px'
                                                }}>Phản hồi PH</th>
                                                <th style={{
                                                    border: '1px solid #e5e7eb',
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    fontWeight: 'bold',
                                                    width: '100px'
                                                }}>Ghi chú PH</th>
                                                <th style={{
                                                    border: '1px solid #e5e7eb',
                                                    padding: '8px',
                                                    textAlign: 'left',
                                                    fontWeight: 'bold',
                                                    width: '180px'
                                                }}>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map((student, index) => (
                                                <tr key={student.id}>
                                                    <td style={{
                                                        border: '1px solid #e5e7eb',
                                                        padding: '8px',
                                                        textAlign: 'left'
                                                    }}>{index + 1}</td>
                                                    <td style={{
                                                        border: '1px solid #e5e7eb',
                                                        padding: '8px',
                                                        textAlign: 'left'
                                                    }}>{student.fullName}</td>
                                                    <td style={{
                                                        border: '1px solid #e5e7eb',
                                                        padding: '8px',
                                                        textAlign: 'left'
                                                    }}>{student.className}</td>
                                                    <td style={{
                                                        border: '1px solid #e5e7eb',
                                                        padding: '8px',
                                                        textAlign: 'left'
                                                    }}>
                                                        {student.vaccineResponses?.map(response => (
                                                            <div key={response.vaccineId} className="mb-1">
                                                                {response.vaccineName}
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td style={{
                                                        border: '1px solid #e5e7eb',
                                                        padding: '8px',
                                                        textAlign: 'left'
                                                    }}>
                                                        {student.vaccineResponses?.map(response => (
                                                            <div key={response.vaccineId} className="mb-1">
                                                                <span style={{
                                                                    color: response.response === 'ACCEPTED' ? '#059669' : '#dc2626',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    {response.response === 'ACCEPTED' ? 'Đồng ý' : 'Từ chối'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td style={{
                                                        border: '1px solid #e5e7eb',
                                                        padding: '8px',
                                                        textAlign: 'left'
                                                    }}>{student.parentNotes || 'Không có'}</td>
                                                    <td style={{
                                                        border: '1px solid #e5e7eb',
                                                        padding: '8px',
                                                        textAlign: 'left'
                                                    }}>
                                                        {monitoringStatusLoading ? (
                                                            <Spinner animation="border" size="sm" />
                                                        ) : (
                                                            student.vaccineResponses?.map(response => (
                                                                <div key={response.vaccineId} className="mb-1">
                                                                    {response.response === 'ACCEPTED' ? (
                                                                        (() => {
                                                                            const monitoringStatus = monitoringStatuses[student.healthProfileId];
                                                                            const canCreate = canCreateVaccinationRecord(monitoringStatus);
                                                                            
                                                                            return canCreate ? (
                                                                                <button
                                                                                    onClick={() => handleShowCreateRecordModal(student, response)}
                                                                                    style={{
                                                                                        background: 'none',
                                                                                        border: '1px solid #059669',
                                                                                        color: '#059669',
                                                                                        padding: '4px 8px',
                                                                                        borderRadius: '4px',
                                                                                        cursor: 'pointer',
                                                                                        fontSize: '12px',
                                                                                        marginBottom: '2px'
                                                                                    }}
                                                                                    onMouseEnter={(e) => {
                                                                                        e.target.style.backgroundColor = '#059669';
                                                                                        e.target.style.color = 'white';
                                                                                    }}
                                                                                    onMouseLeave={(e) => {
                                                                                        e.target.style.backgroundColor = 'transparent';
                                                                                        e.target.style.color = '#059669';
                                                                                    }}
                                                                                >
                                                                                    Tạo HS
                                                                                </button>
                                                                            ) : (
                                                                                <span style={{
                                                                                    color: '#059669',
                                                                                    fontWeight: 'bold',
                                                                                    fontSize: '11px',
                                                                                    padding: '3px 6px',
                                                                                    borderRadius: '4px',
                                                                                    backgroundColor: '#f0f9ff',
                                                                                    border: '1px solid #059669',
                                                                                    display: 'inline-block',
                                                                                    lineHeight: '1.2',
                                                                                    whiteSpace: 'nowrap'
                                                                                }}>
                                                                                    {getVaccinationRecordStatusText(monitoringStatus)}
                                                                                </span>
                                                                            );
                                                                        })()
                                                                    ) : (
                                                                        <span style={{ color: '#6b7280' }}>—</span>
                                                                    )}
                                                                </div>
                                                            ))
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
            </div>
        </div>
    );
};

export default VaccinationPlanDetailsModal;