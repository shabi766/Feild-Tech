import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  X
} from 'lucide-react';

const JobCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'interview',
    date: '',
    time: '',
    duration: 60,
    location: '',
    description: '',
    attendees: []
  });

  const eventTypes = [
    { id: 'interview', label: 'Interview', color: 'bg-blue-500' },
    { id: 'deadline', label: 'Deadline', color: 'bg-red-500' },
    { id: 'meeting', label: 'Meeting', color: 'bg-green-500' },
    { id: 'followup', label: 'Follow-up', color: 'bg-yellow-500' },
    { id: 'submission', label: 'Submission', color: 'bg-purple-500' }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    // Mock data - replace with actual API call
    const mockEvents = [
      {
        id: 1,
        title: 'Frontend Developer Interview',
        type: 'interview',
        date: '2024-02-15',
        time: '10:00',
        duration: 60,
        location: 'Zoom Meeting',
        description: 'Technical interview with John Smith',
        attendees: ['John Smith', 'Sarah Johnson']
      },
      {
        id: 2,
        title: 'UI/UX Project Deadline',
        type: 'deadline',
        date: '2024-02-20',
        time: '17:00',
        duration: 0,
        location: 'Remote',
        description: 'Final submission for DesignStudio project',
        attendees: ['DesignStudio Team']
      },
      {
        id: 3,
        title: 'Weekly Client Check-in',
        type: 'meeting',
        date: '2024-02-18',
        time: '14:00',
        duration: 30,
        location: 'Google Meet',
        description: 'Progress update with TechCorp',
        attendees: ['TechCorp PM', 'Development Team']
      }
    ];
    setEvents(mockEvents);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Add previous month's days
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowAddModal(true);
    setNewEvent(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0]
    }));
  };

  const handleAddEvent = async () => {
    try {
      const event = {
        ...newEvent,
        id: Date.now(),
        attendees: newEvent.attendees.filter(attendee => attendee.trim())
      };
      
      setEvents(prev => [...prev, event]);
      setShowAddModal(false);
      setNewEvent({
        title: '',
        type: 'interview',
        date: '',
        time: '',
        duration: 60,
        location: '',
        description: '',
        attendees: []
      });
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      type: event.type,
      date: event.date,
      time: event.time,
      duration: event.duration,
      location: event.location,
      description: event.description,
      attendees: event.attendees
    });
    setShowEditModal(true);
  };

  const handleUpdateEvent = async () => {
    try {
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id 
          ? { ...newEvent, id: event.id, attendees: newEvent.attendees.filter(attendee => attendee.trim()) }
          : event
      ));
      setShowEditModal(false);
      setEditingEvent(null);
      setNewEvent({
        title: '',
        type: 'interview',
        date: '',
        time: '',
        duration: 60,
        location: '',
        description: '',
        attendees: []
      });
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      setEvents(prev => prev.filter(event => event.id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const addAttendee = () => {
    if (newEvent.attendees.length < 5) {
      setNewEvent(prev => ({
        ...prev,
        attendees: [...prev.attendees, '']
      }));
    }
  };

  const removeAttendee = (index) => {
    setNewEvent(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }));
  };

  const updateAttendee = (index, value) => {
    setNewEvent(prev => ({
      ...prev,
      attendees: prev.attendees.map((attendee, i) => i === index ? value : attendee)
    }));
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            const isToday = day.date.toDateString() === new Date().toDateString();
            const isSelected = day.date.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={index}
                onClick={() => handleDateClick(day.date)}
                className={`min-h-[120px] p-2 border-r border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${isToday ? 'bg-blue-50' : ''} ${isSelected ? 'bg-blue-100' : ''}`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {day.date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer ${
                        eventTypes.find(t => t.id === event.type)?.color || 'bg-gray-500'
                      } text-white`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderEventModal = (isEdit = false) => {
    const handleSubmit = isEdit ? handleUpdateEvent : handleAddEvent;
    const title = isEdit ? 'Edit Event' : 'Add New Event';
    const submitText = isEdit ? 'Update Event' : 'Add Event';

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingEvent(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type *
                  </label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {eventTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    step="15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Zoom, Google Meet, Office, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Event description..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Attendees
                  </label>
                  <button
                    type="button"
                    onClick={addAttendee}
                    disabled={newEvent.attendees.length >= 5}
                    className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                  >
                    + Add Attendee
                  </button>
                </div>
                <div className="space-y-2">
                  {newEvent.attendees.map((attendee, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="text"
                        value={attendee}
                        onChange={(e) => updateAttendee(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Attendee name or email"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttendee(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setEditingEvent(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {submitText}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Job Calendar</h1>
          <p className="text-gray-600">Manage your job-related events, interviews, and deadlines</p>
        </div>

        {/* Calendar */}
        {renderCalendar()}

        {/* Event Details Sidebar */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Events for {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          {getEventsForDate(selectedDate).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events scheduled for this date</p>
          ) : (
            <div className="space-y-4">
              {getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${
                          eventTypes.find(t => t.id === event.type)?.color || 'bg-gray-500'
                        }`} />
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <span className="text-sm text-gray-500">
                          {event.time} ({event.duration}min)
                        </span>
                      </div>
                      {event.location && (
                        <p className="text-sm text-gray-600 mb-1">
                          <MapPin className="inline w-4 h-4 mr-1" />
                          {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                      {event.attendees.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {event.attendees.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        {showAddModal && renderEventModal(false)}
        {showEditModal && renderEventModal(true)}
      </div>
    </div>
  );
};

export default JobCalendar;

