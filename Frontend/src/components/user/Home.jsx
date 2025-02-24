import React, { useEffect } from 'react'
import Navbar from '../shared/Navbar'
import HeroSection from '../user/HeroSection'
import CategoryCarousel from '../user/CategoryCarousel'
import LatestJobs from '../user/LatestJobs'
import Footer from '../shared/Footer'
import useGetAllJobs from '../Hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const Home = () => {

  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();
  useEffect(() => {
    if (user?.role == 'Recruiter') {
      navigate("/admin/companies");
    }
  }, []);
  return (
    

    <div>
        <Navbar/>
        <HeroSection/>
        <CategoryCarousel/>
        <LatestJobs/>
        <Footer/>

       
    </div>
  )
}

export default Home