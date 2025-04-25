import React, { useState } from 'react';

import { Avatar, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Contact, Mail, Pen } from 'lucide-react';
import { Badge } from '../ui/badge';
import JobTable from '../user/JobTable';
import UpdateProfileDialog from '../user/UpdateProfileDialog';
import { useSelector } from 'react-redux';
import useGetAppliedJobs from '../Hooks/useGetAppliedJobs';

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const { user, loading, error } = useSelector(store => store.auth);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading profile.</div>;

    const isResumeAvailable = user?.profile?.resume;

    return (
        <div>
            
            <div className='max-w-4xl mx-auto bg-white border border-gray-200 rounded-s-2xl my-5 p-8'>
                <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-4'>
                        <Avatar className="h-24 w-24">
                            <AvatarImage 
                                src={user?.profile?.profilePhoto || 'path/to/placeholder.jpg'} 
                                alt="Profile" 
                            />
                        </Avatar>
                        <div>
                            <h1 className='font-medium text-xl'>{user?.fullname || 'N/A'}</h1>
                            <p>{user?.profile?.bio || 'No bio available.'}</p>
                        </div>
                    </div>
                    <Button onClick={() => setOpen(true)} variant="outline"><Pen /></Button>
                </div>

                <div className='my-5'>
                    <div className='flex items-center gap-4 my-2'>
                        <Mail />
                        <span>{user?.email || 'N/A'}</span>
                    </div>
                    <div className='flex items-center gap-4 my-2'>
                        <Contact />
                        <span>{user?.phoneNumber || 'N/A'}</span>
                    </div>
                </div>

                <div className='my-5'>
                    <h1>Skills</h1>
                    <div className='flex items-center gap-3'>
                        {
                            user?.profile?.skills?.length 
                            ? user.profile.skills.map((item, index) => <Badge key={index}>{item}</Badge>) 
                            : <span>N/A</span>
                        }
                    </div>
                </div>

                <div className='grid w-full max-w-sm items-center gap-2'>
                    <label className='text-md font-bold'>Resume</label>
                    {
                        isResumeAvailable 
                            ? <a 
                                target='_blank' 
                                rel='noopener noreferrer' 
                                href={user.profile.resume} 
                                download 
                                className='text-blue-500 w-full hover:underline'
                            >
                                {user.profile.resumeOriginalName}
                            </a> 
                            : <span>N/A</span>
                    }
                </div>
            </div>

            <div className='max-w-4xl mx-auto bg-white rounded-2xl'>
                <h1 className='text-lg font-bold my-5'>Applied Jobs</h1>
                <JobTable />
            </div>

            <UpdateProfileDialog open={open} setOpen={setOpen} />
        </div>
    );
}

export default Profile;