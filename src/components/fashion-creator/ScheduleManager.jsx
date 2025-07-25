'use client';

import { useState, useEffect, memo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateAvailability } from '../../lib/consultation-firebase';
import { useAuth } from '../../hooks/useAuth';

// Zod schema for validation
const timeSlotSchema = z.object({
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
}).refine((data) => {
  const start = new Date(`2000-01-01T${data.startTime}`);
  const end = new Date(`2000-01-01T${data.endTime}`);
  return start < end;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

const dayAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  timeSlots: z.array(timeSlotSchema).min(0),
});

const scheduleSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  monday: dayAvailabilitySchema,
  tuesday: dayAvailabilitySchema,
  wednesday: dayAvailabilitySchema,
  thursday: dayAvailabilitySchema,
  friday: dayAvailabilitySchema,
  saturday: dayAvailabilitySchema,
  sunday: dayAvailabilitySchema,
});

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

const TIMEZONES = [
  'America/New_York',
  'America/Chicago', 
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Australia/Sydney',
];

// Generate time options in 15-minute intervals
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = formatTimeDisplay(hour, minute);
      times.push({ value: timeValue, label: displayTime });
    }
  }
  return times;
};

// Format time for display (12-hour format)
const formatTimeDisplay = (hour, minute) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
};

const TIME_OPTIONS = generateTimeOptions();

export default function ScheduleManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const form = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      timezone: 'Asia/Kolkata',
      monday: { isAvailable: false, timeSlots: [] },
      tuesday: { isAvailable: false, timeSlots: [] },
      wednesday: { isAvailable: false, timeSlots: [] },
      thursday: { isAvailable: false, timeSlots: [] },
      friday: { isAvailable: false, timeSlots: [] },
      saturday: { isAvailable: false, timeSlots: [] },
      sunday: { isAvailable: false, timeSlots: [] },
    },
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = form;

  // Load existing schedule data on component mount
  useEffect(() => {
    if (!user?.uid) return;

    let isMounted = true;

    const loadSchedule = async () => {
      try {
        // This would fetch existing schedule from Firebase
        // For now using default values
        if (isMounted) {
          console.log('Loading schedule for user:', user.uid);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading schedule:', error);
        }
      }
    };

    loadSchedule();

    return () => {
      isMounted = false; // cleanup flag
    };
  }, [user?.uid]);

  const onSubmit = async (data) => {
    if (!user?.uid) {
      setMessage({ type: 'error', text: 'Please login to save your schedule' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateAvailability(user.uid, data);
      setMessage({ type: 'success', text: 'Schedule updated successfully!' });
    } catch (error) {
      console.error('Error updating schedule:', error);
      setMessage({ type: 'error', text: 'Failed to update schedule. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

const DaySchedule = memo(({ day }) => {
    const dayData = useWatch({
      control,
      name: day,
      defaultValue: { isAvailable: false, timeSlots: [] }
    });
    
    const { fields, append, remove } = useFieldArray({
      control,
      name: `${day}.timeSlots`,
    });

    const addTimeSlot = () => {
      append({ startTime: '09:00', endTime: '17:00' });
    };

    const toggleDay = (checked) => {
      if (dayData.isAvailable !== checked) {
        setValue(`${day}.isAvailable`, checked);
        if (!checked) {
          setValue(`${day}.timeSlots`, []);
        } else if (fields.length === 0) {
          addTimeSlot();
        }
      }
    };

    return (
      <div className="border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium capitalize text-gray-900">{day}</h3>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={dayData?.isAvailable || false}
              onChange={(e) => toggleDay(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Available</span>
          </label>
        </div>

        {dayData?.isAvailable && (
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <div className="flex-1">
<select
  {...form.register(`${day}.timeSlots.${index}.startTime`)}
  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
>
  {TIME_OPTIONS.map(({ value, label }) => (
    <option key={value} value={value}>{label}</option>
  ))}
</select>
                  {errors[day]?.timeSlots?.[index]?.startTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[day].timeSlots[index].startTime.message}
                    </p>
                  )}
                </div>
                <span className="text-gray-500">to</span>
                <div className="flex-1">
<select
  {...form.register(`${day}.timeSlots.${index}.endTime`)}
  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
>
  {TIME_OPTIONS.map(({ value, label }) => (
    <option key={value} value={value}>{label}</option>
  ))}
</select>
                  {errors[day]?.timeSlots?.[index]?.endTime && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors[day].timeSlots[index].endTime.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                  disabled={fields.length === 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTimeSlot}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Time Slot</span>
            </button>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Schedule Manager</h2>
          <p className="text-gray-600">Set your availability for client consultations</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Timezone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              {...form.register('timezone')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace('_', ' ').replace('/', ' - ')}
                </option>
              ))}
            </select>
            {errors.timezone && (
              <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
            )}
          </div>

          {/* Days of Week */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DAYS_OF_WEEK.map((day) => (
              <DaySchedule key={day} day={day} />
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => form.reset()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
