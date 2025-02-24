import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import { useSelector } from 'react-redux'; // To get the logged-in user
import { JOB_API_END_POINT } from '../utils/constant';
import { toast } from 'sonner';

const localizer = momentLocalizer(moment);

const JobCalendarPage = () => {
    const [events, setEvents] = useState([]);
    const { user } = useSelector(store => store.auth); // Get logged-in user

    useEffect(() => {
        const fetchUserJobs = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/user/jobs`, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true,
                });

                if (res.data.success) {
                    const jobEvents = res.data.jobs.map((job) => ({
                        title: job.title,
                        start: new Date(job.startTime),
                        end: new Date(job.endTime),
                        location: job.location,
                        project: job.project?.name || '',
                        createdAt: job.createdAt,
                    }));
                    setEvents(jobEvents);
                }
            } catch (error) {
                toast.error('Failed to load jobs');
            }
        };

        if (user) {
            fetchUserJobs(); // Fetch jobs created by the logged-in user
        }
    }, [user]);

    const handleEventClick = (event) => {
        alert(
            `Job: ${event.title}\nCreated At: ${moment(event.createdAt).format('LL')}\nLocation: ${event.location?.city}, ${event.location?.country}\nProject: ${event.project}`
        );
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Job Scheduler</h2>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                selectable
                onSelectEvent={handleEventClick}
                eventPropGetter={(event) => ({
                    style: { backgroundColor: getRandomColor(event.title) }, // Set random colors for each event
                })}
            />
        </div>
    );
};

// Function to assign random colors to each job event
const getRandomColor = (key) => {
    const colors = ['#FFA500', '#FF4500', '#1E90FF', '#32CD32', '#9370DB', '#FF6347', '#4682B4'];
    const hash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

export default JobCalendarPage;
