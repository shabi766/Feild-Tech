import React from 'react'
import { Badge } from '../ui/badge'
import { useNavigate } from 'react-router-dom';


const LatestJobCards = ({job}) => {
  const navigate = useNavigate();
  return (
    <div onClick={()=>navigate(`/description/${job._id}`)} className='p-5 rounded-md shadow-xl bg-white border border-gray-300 cursor-pointer'>
        <div>
        <h1 className='font-medium text-lg'>{job?.title} </h1>
        <p className='text-sm text-gray-500'>{job?.address}</p>
        </div>
        <div>
            <h1 className='font-bold text-lg my-2'>{job?.Company?.name}</h1>
            <p className='text-sm text-gray-600'>{job?.description}</p>
        </div>
        <div className='flex items-center gap-2 mt-4'>
            <Badge className={'text-blue-400 font-bold' } variant="ghost">{job?.requirments}</Badge>
            <Badge className={'text-red-400 font-bold' } variant="ghost">{job?.jobType}</Badge>
            <Badge className={'text-green-400 font-bold' } variant="ghost">{job?.Salary}</Badge>

        </div>
        
    </div>
  )
}

export default LatestJobCards