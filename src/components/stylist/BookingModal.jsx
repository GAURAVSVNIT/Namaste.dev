'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Video, MessageCircle, X, User, DollarSign } from 'lucide-react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, collection, addDoc, serverTimestamp } from '../../lib/firebase';

const BookingModal = ({ isOpen, onClose, stylist }) => {
  const [user] = useAuthState(auth);
  const [bookingType, setBookingType] = useState('chat'); // 'chat' or 'call'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Get today's date for minimum date selection
  const today = new Date().toISOString().split('T')[0];

  // Generate time slots (9 AM to 6 PM)
  const timeSlots = [];
  for (let hour = 9; hour <= 18; hour++) {
    const time24 = `${hour.toString().padStart(2, '0')}:00`;
    const time12 = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
    timeSlots.push({ value: time24, label: hour === 12 ? '12:00 PM' : time12 });
  }

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      const bookingData = {
        clientId: user.uid,
        clientName: user.displayName || user.email?.split('@')[0] || 'Client',
        stylistId: stylist.id,
        stylistName: stylist.name,
        type: bookingType,
        date: selectedDate,
        time: selectedTime,
        message: message.trim(),
        price: bookingType === 'call' ? stylist.callRate : stylist.chatRate,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'appointments'), bookingData);
      
      // Reset form and close modal
      setSelectedDate('');
      setSelectedTime('');
      setMessage('');
      onClose();
      
      // Show success message (you can implement toast notifications)
      alert('Appointment booked successfully! The stylist will confirm your booking.');
      
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                {stylist?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Book Consultation</h2>
                <p className="text-sm text-gray-600">with {stylist?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleBooking} className="p-6 space-y-6">
            {/* Consultation Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Consultation Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBookingType('chat')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    bookingType === 'chat'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MessageCircle size={24} />
                  <div>
                    <div className="font-medium">Text Chat</div>
                    <div className="text-sm opacity-75">${stylist?.chatRate || 50}/session</div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setBookingType('call')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    bookingType === 'call'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Video size={24} />
                  <div>
                    <div className="font-medium">Video Call</div>
                    <div className="text-sm opacity-75">${stylist?.callRate || 100}/hour</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                >
                  <option value="">Choose a time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the stylist about your needs, preferences, or specific questions..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Price Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-gray-600" />
                  <span className="font-medium text-gray-900">Total Cost</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    ${bookingType === 'call' ? stylist?.callRate || 100 : stylist?.chatRate || 50}
                  </div>
                  <div className="text-sm text-gray-600">
                    {bookingType === 'call' ? 'per hour' : 'per session'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedDate || !selectedTime}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;
