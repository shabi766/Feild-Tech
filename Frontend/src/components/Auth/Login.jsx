import React, { useEffect, useState } from 'react';

import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '../utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setloading, setuser } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';
import { RadioGroup } from '../ui/radio-group';
import Footer from '../shared/Footer';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role:"",
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { Loading, user } = useSelector((store) => store.auth);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (!input.email || !input.password || !input.role) {
            toast.error("Please fill in all fields.");
            return;
        }

        try {
            dispatch(setloading(true));
            const res = await axios.post(`${USER_API_END_POINT}/Login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setuser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "An unexpected error occurred.");
        } finally {
            dispatch(setloading(false));
        }
    };
    
    useEffect(()=>{
        if(user){
            navigate("/");
        }

    },[])

    return (
        <div>
            
           
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-1/2 border border-gray-500 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Login</h1>

                    <div className='my-2'>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="john-smith@gmail.com"
                            required
                        />
                    </div>

                    <div className='my-2'>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            required
                        />
                    </div>
                    <div className='flex items-center justify-between'>
                        <RadioGroup className="flex items-center gap-4 my-5">
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="Technician"
                                    checked={input.role === 'Technician'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="r1">Technician</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="Recruiter"
                                    checked={input.role === 'Recruiter'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="r2">Recruiter</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Button type="submit" className="w-full my-4" disabled={Loading}>
                        {Loading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null} 
                        {Loading ? 'Loading...' : 'Login'}
                    </Button>

                    <span className='text-sm'>
                        Don't have an account? <Link to="/Signup" className='text-blue-500'>Signup</Link>
                    </span>
                </form>
            </div>
            
        </div>
        
    );
     
}
export default Login;