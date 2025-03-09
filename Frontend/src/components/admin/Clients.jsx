import React, { useEffect, useState } from 'react'

import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import ClientsTable from './ClientsTable'

import useGetAllClients from '../Hooks/useGetAllClients'
import {setSearchClientsByText } from '@/redux/clientSlice'
import Footer from '../shared/Footer'

const Clients = () => {
  useGetAllClients();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(()=>{
dispatch(setSearchClientsByText(input));
  },[input]);
  return (
    <div>
     
      <div className='  max-w-6xl mx-auto my-10'>
        <div className='flex items-center justify-between my-5'>
        <Input
        className="w-fit"
        placeholder="Filter By Name"
        onChange={(e)=> setInput(e.target.value)}
        />
        <Button onClick={() => navigate("/admin/clients/create")}>New Client</Button>

        </div>
        <ClientsTable/>
        


      </div>
      
      
    </div>
  )
}

export default Clients