import { Bookmark } from 'lucide-react';
import React from 'react';
;
import { Avatar, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';

const Workorder = ({ job }) => {
  const navigate = useNavigate(); // Call useNavigate as a function

  const daysAgoFunction = (mongodbTime) => {
    const createdAt = new Date(mongodbTime);
    const currentTime = new Date();
    const timeDifference = currentTime - createdAt;
    return Math.floor(timeDifference / (1000 * 24 * 60 * 60));
  };

  // Destructure location fields for better readability
  const { street, city, state, postalCode, country } = job?.location || {};

  return (
    <div className='p-5 rounded-md shadow-xl bg-white border border-gray-200'>
      <div className='flex items-center justify-between'> {/* Fixed typo here */}
        <p className='text-sm text-gray-600'>
          {daysAgoFunction(job?.createdAt) === 0 ? 'Today' : `${daysAgoFunction(job?.createdAt)} days ago`}
        </p>
        <Button variant="outline" className="rounded-full" size="icon" aria-label="Bookmark">
          <Bookmark />
        </Button>
      </div>
      <div className='flex items-center gap-2 my-2'>
        <Button className="p-6" variant="outline" size="icon" aria-label="Company Logo">
          <Avatar>
            <AvatarImage src={job?.Company?.logo} />
          </Avatar>
        </Button>
        <div>
          <h1 className='font-medium text-lg'>{job?.title}</h1>
          {/* Display the full address */}
          <p className='text-sm text-gray-500'>
            {street}, {city}, {state}, {postalCode}, {country}
          </p>
        </div>
      </div>
      <div className='text-sm text-gray-700'>
        <h1 className='font-bold text-lg my-2'>{job?.company?.name}</h1>
        <p>{job?.description}</p>
      </div>
      <div className='flex items-center gap-2 mt-4'>
        <Badge className={'text-blue-400 font-bold'} variant="ghost">{job?.requirements}</Badge>
        <Badge className={'text-red-400 font-bold'} variant="ghost">{job?.jobType}</Badge>
        <Badge className={'text-green-400 font-bold'} variant="ghost">{job?.salary}</Badge>
      </div>
      <div className='flex items-center gap-2 mt-4'>
        <Button onClick={() => navigate(`/description/${job._id}`)} variant="outline" aria-label="View Details">Details</Button>
        <Button className="bg-purple-600" aria-label="Save for Later">Save for Later</Button>
      </div>
    </div>
  );
};

export default Workorder;
