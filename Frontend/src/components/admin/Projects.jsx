import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import useGetAllProjects from '../Hooks/useGetAllProjects'
import { setSearchProjectsByText } from '@/redux/projectSlice'
import ProjectTable from './ProjectTable'
import Footer from '../shared/Footer'

const Projects = () => {
  useGetAllProjects();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(()=>{
dispatch(setSearchProjectsByText(input));
  },[input]);
  return (
    <div>
      <Navbar/>
      <div className='  max-w-6xl mx-auto my-10'>
        <div className='flex items-center justify-between my-5'>
        <Input
        className="w-fit"
        placeholder="Filter By Name"
        onChange={(e)=> setInput(e.target.value)}
        />
        <Button onClick={() => navigate("/admin/projects/create")}>New Project</Button>

        </div>
        <ProjectTable/>
        


      </div>
      <div className='mt-60'><Footer/></div>
      
    </div>
  )
}

export default Projects