import React, { createContext, useState, useEffect, useContext } from 'react';
import medicalEventsService from '../../services/medicalEventsService';

// Create the Medical Events Context
export const MedicalEventsContext = createContext();

// Custom hook to use the Medical Events Context
export const useMedicalEvents = () => useContext(MedicalEventsContext);

export const MedicalEventsProvider = ({ children }) => {  // States
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Fetch all events
  const fetchEvents = async () => {
    // Only set loading if we don't already have events
    if (events.length === 0) {
      setLoading(true);
    }
    
    try {
      const data = await medicalEventsService.getAllEvents();
      // Handle different data formats (array or paginated object)
      if (data && Array.isArray(data)) {
        setEvents(data);
      } else if (data && typeof data === 'object' && data.content && Array.isArray(data.content)) {
        // Handle Spring Data pagination format
        setEvents(data.content);
      } else {
        console.warn('MedicalEventsContext: Unexpected data format:', data);
        // Don't reset to empty array if we already have data
        if (events.length === 0) {
          setEvents([]);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching medical events:', err);
      setError('Không thể tải danh sách sự kiện y tế');
    } finally {
      setLoading(false);
    }
  };

  // Fetch event by ID
  const fetchEventById = async (id) => {
    setLoading(true);
    try {
      const data = await medicalEventsService.getEventById(id);
      setSelectedEvent(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Error fetching event details:', err);
      setError('Không thể tải chi tiết sự kiện y tế');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add new event
  const addEvent = async (event) => {
    setLoading(true);
    try {
      const newEvent = await medicalEventsService.addEvent(event);
      setEvents(prevEvents => [...prevEvents, newEvent]);
      setError(null);
      return newEvent;
    } catch (err) {
      console.error('Error adding new event:', err);
      setError('Không thể thêm sự kiện y tế mới');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update event
  const updateEvent = async (id, event) => {
    if (!id) {
      const error = new Error('ID không được để trống khi cập nhật sự kiện y tế');
      setError(error.message);
      throw error;
    }
    
    setLoading(true);
    try {      // Make API call
      const updatedEvent = await medicalEventsService.updateEvent(id, event);
      
      // Check if the update was successful
      if (updatedEvent) {
        // Update events in state
        setEvents(prevEvents => {
          // Sử dụng id hoặc incidentId tùy theo dữ liệu API trả về
          const updatedEvents = prevEvents.map(e => 
            ((e.id === id || e.incidentId === id) ? updatedEvent : e)
          );
          return updatedEvents;
        });
        
        // Update selected event if it's the one being edited
        if ((selectedEvent?.id === id) || (selectedEvent?.incidentId === id)) {
          setSelectedEvent(updatedEvent);
        }
        
        setError(null);
        
        // Refresh the events data
        fetchEvents();
        
        return updatedEvent;
      } else {
        throw new Error('API returned empty response');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      
      // Provide detailed Vietnamese error messages
      let errorMessage = 'Không thể cập nhật sự kiện y tế';
      if (err.message) {
        if (err.message.includes('404')) {
          errorMessage = 'Không tìm thấy sự kiện với ID này. Vui lòng làm mới trang và thử lại.';
        } else if (err.message.includes('400')) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra định dạng ngày tháng và các trường bắt buộc.';
        } else {
          errorMessage += ': ' + err.message;
        }
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete event
  const deleteEvent = async (id) => {
    setLoading(true);    try {
      const result = await medicalEventsService.deleteEvent(id);
      if (result.success) {
        setEvents(prevEvents => prevEvents.filter(event => (event.id !== id && event.incidentId !== id)));
        if (selectedEvent?.id === id || selectedEvent?.incidentId === id) {
          setSelectedEvent(null);
        }
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Không thể xóa sự kiện y tế');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Search events with filters
  const searchEvents = async (filters) => {
    setLoading(true);
    try {
      const results = await medicalEventsService.searchEvents(filters);
      setEvents(results);
      setError(null);
      return results;
    } catch (err) {
      console.error('Error searching events:', err);
      setError('Không thể tìm kiếm sự kiện y tế');
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm mới để tìm kiếm theo loại (severity)
  const searchByType = async (typeValue) => {
    setLoading(true);
    try {
      const results = await medicalEventsService.searchByType(typeValue);
      setEvents(results);
      setError(null);
      return results;
    } catch (err) {
      console.error('Error searching events by type:', err);
      setError('Không thể tìm kiếm sự kiện y tế theo loại');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Reset error
  const resetError = () => {
    setError(null);
  };
  // Use a ref to track if we've already loaded data to prevent repeated fetches
  const initialDataLoaded = React.useRef(false);
  
  // Load events on context mount, but only once
  useEffect(() => {
    if (!initialDataLoaded.current) {
      initialDataLoaded.current = true;
      fetchEvents();
    }
  }, []);
  const value = {
    events,
    loading,
    error,
    selectedEvent,
    fetchEvents,
    fetchEventById,
    addEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    searchByType,
    resetError,
    setSelectedEvent
  };

  return (
    <MedicalEventsContext.Provider value={value}>
      {children}
    </MedicalEventsContext.Provider>
  );
};
