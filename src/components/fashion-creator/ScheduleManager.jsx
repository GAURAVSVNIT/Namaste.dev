'use client';

import { useState, useEffect, memo } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { updateAvailability } from '../../lib/consultation-firebase';
import { useAuth } from '../../hooks/useAuth';

// Inline CSS styles
const styles = {
  container: {
    maxWidth: '896px',
    margin: '0 auto',
    padding: '24px'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '24px'
  },
  header: {
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '8px',
    margin: 0
  },
  subtitle: {
    color: '#6b7280',
    margin: 0
  },
  messageContainer: {
    marginBottom: '24px',
    padding: '16px',
    borderRadius: '6px'
  },
  successMessage: {
    backgroundColor: '#f0fdf4',
    color: '#15803d',
    border: '1px solid #bbf7d0'
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  fieldContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '8px'
  },
  select: {
    display: 'block',
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    lineHeight: '20px',
    color: '#111827',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    outline: 'none',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
  },
  selectFocus: {
    borderColor: '#3b82f6',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  },
  errorText: {
    marginTop: '4px',
    fontSize: '14px',
    color: '#dc2626'
  },
  daysGrid: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
  },
  dayCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  dayHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dayTitle: {
    fontWeight: '500',
    textTransform: 'capitalize',
    color: '#111827',
    margin: 0,
    fontSize: '16px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    accentColor: '#3b82f6',
    cursor: 'pointer'
  },
  checkboxText: {
    fontSize: '14px',
    color: '#6b7280'
  },
  timeSlotsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  timeSlotRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  timeSlotField: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  timeSlotSelect: {
    display: 'block',
    width: '100%',
    padding: '6px 8px',
    fontSize: '14px',
    lineHeight: '20px',
    color: '#111827',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    outline: 'none',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out'
  },
  toText: {
    color: '#6b7280',
    fontSize: '14px'
  },
  removeButton: {
    color: '#dc2626',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '4px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s ease-in-out'
  },
  removeButtonHover: {
    color: '#991b1b'
  },
  removeButtonDisabled: {
    opacity: '0.5',
    cursor: 'not-allowed'
  },
  addTimeSlotButton: {
    color: '#3b82f6',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
    transition: 'color 0.15s ease-in-out',
    padding: '4px 0'
  },
  addTimeSlotButtonHover: {
    color: '#1d4ed8'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb'
  },
  resetButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease-in-out',
    outline: 'none'
  },
  resetButtonHover: {
    backgroundColor: '#f9fafb'
  },
  resetButtonFocus: {
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  },
  submitButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
    backgroundColor: '#3b82f6',
    border: '1px solid transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease-in-out',
    outline: 'none'
  },
  submitButtonHover: {
    backgroundColor: '#2563eb'
  },
  submitButtonFocus: {
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
  },
  submitButtonDisabled: {
    opacity: '0.5',
    cursor: 'not-allowed'
  },
  icon: {
    width: '16px',
    height: '16px'
  }
};

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
      <div style={styles.dayCard}>
        <div style={styles.dayHeader}>
          <h3 style={styles.dayTitle}>{day}</h3>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={dayData?.isAvailable || false}
              onChange={(e) => toggleDay(e.target.checked)}
              style={styles.checkbox}
            />
            <span style={styles.checkboxText}>Available</span>
          </label>
        </div>

        {dayData?.isAvailable && (
          <div style={styles.timeSlotsContainer}>
            {fields.map((field, index) => (
              <div key={field.id} style={styles.timeSlotRow}>
                <div style={styles.timeSlotField}>
                  <select
                    {...form.register(`${day}.timeSlots.${index}.startTime`)}
                    style={styles.timeSlotSelect}
                  >
                    {TIME_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {errors[day]?.timeSlots?.[index]?.startTime && (
                    <p style={styles.errorText}>
                      {errors[day].timeSlots[index].startTime.message}
                    </p>
                  )}
                </div>
                <span style={styles.toText}>to</span>
                <div style={styles.timeSlotField}>
                  <select
                    {...form.register(`${day}.timeSlots.${index}.endTime`)}
                    style={styles.timeSlotSelect}
                  >
                    {TIME_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  {errors[day]?.timeSlots?.[index]?.endTime && (
                    <p style={styles.errorText}>
                      {errors[day].timeSlots[index].endTime.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  style={{
                    ...styles.removeButton,
                    ...(fields.length === 1 ? styles.removeButtonDisabled : {})
                  }}
                  disabled={fields.length === 1}
                  onMouseEnter={(e) => {
                    if (fields.length > 1) {
                      Object.assign(e.target.style, styles.removeButtonHover);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (fields.length > 1) {
                      Object.assign(e.target.style, styles.removeButton);
                    }
                  }}
                >
                  <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addTimeSlot}
              style={styles.addTimeSlotButton}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.addTimeSlotButtonHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, styles.addTimeSlotButton)}
            >
              <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <>
        <div style={styles.header}>
          <h2 style={styles.title}>Schedule Manager</h2>
          <p style={styles.subtitle}>Set your availability for client consultations</p>
        </div>

        {message.text && (
          <div style={{
            ...styles.messageContainer,
            ...(message.type === 'success' ? styles.successMessage : styles.errorMessage)
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          {/* Timezone Selection */}
          <div style={styles.fieldContainer}>
            <label style={styles.label}>
              Timezone
            </label>
            <select
              {...form.register('timezone')}
              style={styles.select}
              onFocus={(e) => Object.assign(e.target.style, styles.selectFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.select)}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace('_', ' ').replace('/', ' - ')}
                </option>
              ))}
            </select>
            {errors.timezone && (
              <p style={styles.errorText}>{errors.timezone.message}</p>
            )}
          </div>

          {/* Days of Week */}
          <div style={styles.daysGrid}>
            {DAYS_OF_WEEK.map((day) => (
              <DaySchedule key={day} day={day} />
            ))}
          </div>

          {/* Submit Button */}
          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={() => form.reset()}
              style={styles.resetButton}
              onMouseEnter={(e) => Object.assign(e.target.style, styles.resetButtonHover)}
              onMouseLeave={(e) => Object.assign(e.target.style, styles.resetButton)}
              onFocus={(e) => Object.assign(e.target.style, styles.resetButtonFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.resetButton)}
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitButton,
                ...(loading ? styles.submitButtonDisabled : {})
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  Object.assign(e.target.style, styles.submitButtonHover);
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  Object.assign(e.target.style, styles.submitButton);
                }
              }}
              onFocus={(e) => {
                if (!loading) {
                  Object.assign(e.target.style, styles.submitButtonFocus);
                }
              }}
              onBlur={(e) => {
                if (!loading) {
                  Object.assign(e.target.style, styles.submitButton);
                }
              }}
            >
              {loading ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </form>
    </>
  );
}
