import React, { useEffect, useState} from 'react'

import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios, { Axios } from 'axios'
import { USER_API_END_POINT } from '../utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import store from '@/redux/store'
import { setloading } from '@/redux/authSlice'
import Footer from '../shared/Footer'


const Signup = () => {
    const [input, setInput] = useState({
        fullname:"",
        email:"",
        phoneNumber:"",
        cnic:"",
        password:"",
        role:"",
        file:""
    });
    const {Loading , user} = useSelector(store=>store.auth);
    const disptch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) =>{
        setInput({...input, [e.target.name]:e.target.value});}

    const changeFileHandler = (e) =>{
        
        setInput({...input, file:e.target.files?.[0]});
    }    
    const submitHandler = async (e) =>{
        e.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("cnic", input.cnic);
        formData.append("password", input.password);
        formData.append("role", input.role);
        if(input.file){
            formData.append("file", input.file);
        }



        try {
            disptch(setloading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers:{
                    "content-Type":"multipart/form-data"
                },
                withCredentials:true,
            } );
            if (res.data.success) {
                navigate("/Login");
                toast.success(res.data.message);
                toast.error(error.response.data.message);   
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message)
            
        }
        finally{
            disptch(setloading(false));
        }
        
    }
    useEffect(()=>{
        if(user){
            navigate("/");
        }

    },[])
    
    return (
        <div>
            
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-1/2 border border-gray-500 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Signup</h1>
                    <div className='my-2'>
                        <Label>Full Name</Label>
                        <Input
                            type="text"
                            value={input.fullname}
                            name="fullname"
                            onChange={changeEventHandler}
                            placeholder="John Smith"
                        />

                    </div>
                   
                    <div className='my-2'>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="john-smith@gmail.com"
                        />

                    </div>
                    <div className='my-2'>
                        <Label>PhoneNumber</Label>
                        <Input
                            type="phoneNumber"
                            value={input.phoneNumber}
                            name="phoneNumber"
                            onChange={changeEventHandler}
                            placeholder="01000220011"
                        />

                    </div>

                    <div className='my-2'>
                        <Label>Cnic</Label>
                        <Input
                            type="cnic"
                            value={input.cnic}
                            name="cnic"
                            onChange={changeEventHandler}
                            placeholder="xxxxx-xxxxxxx-x"
                        />

                    </div>
                    <div className='flex items-center justify-between'>
                        <RadioGroup className="flex items-center gap-4 my-5">
                            <div className="flex items-center space-x-2">
                                <Input
                                type="radio"
                                name="role"
                                value="Recruiter"
                                checked={input.role == 'Recruiter'}
                                onChange={changeEventHandler}
                                className="cursor-pointer"

                                />
                                <Label htmlFor="r1">Recruiter</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                            <Input
                                type="radio"
                                name="role"
                                checked={input.role == 'Technician'}
                                onChange={changeEventHandler}
                                value="Technician"
                                className="cursor-pointer"

                                />
                                
                                <Label htmlFor="r2">Technician</Label>
                            </div>

                        </RadioGroup>
                        <div className='flex items-center gap-2'>
                            <label>Profile</label>
                            <input
                            accept="image/*"
                            type="file"
                            onChange={changeFileHandler}
                            className="cursor-pointer"
                            />

                        </div>

                    </div>
                    <div className='my-2'>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder=""
                        />

                    </div>
                    {
                        Loading ? <Button className='mr-2 h-4 w-4 animate-spin' ><Loader2 className='mr-2 h-4 w-4 animate-spin' />Loading...</Button> : <Button type="submit" className="w-full" my-4> Signup </Button>
                    }
                    <span className='text-sm'>Already have an account? <Link to="/Login" className='text-blue-500'>Login</Link></span>
                </form>
            </div>
           
        </div>

    )
}

export default Signup