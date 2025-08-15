import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  FileText, 
  Users,
  Clock,
  Star,
  Plus,
  X,
  Zap,
  Target,
  Award,
  Globe,
  Building,
  Phone,
  Mail,
  Link,
  Eye,
  EyeOff,
  TrendingUp,
  Shield,
  Sparkles,
  Mic,
  Play,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VoiceMessage from '@/components/shared/VoiceMessage';
import { toast } from 'sonner';

const SimplePostJob = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    skills: [],
    jobType: 'full-time',
    attachments: [],
    // Enhanced fields similar to admin PostJob and backend workorder model
    requiredTools: [], // Changed to array to match backend
    startTime: new Date(),
    endTime: new Date(),
    // Backend-compatible structure
    partTimeOptions: {
      type: {
        base: '',
        hourlyHours: 0,
        dailyDays: 0,
        contractMonths: 0,
        weeklyDays: 0
      }
    },
    fullTimeOptions: {
      type: {
        base: 'contract',
        contractMonths: 0
      }
    },
    // Salary structure matching backend
    salary: {
      type: {
        partTime: {
          hourlyRate: 0,
          dailyRate: 0,
          contractRate: 0,
          weeklyRate: 0
        },
        fixed: 0
      }
    },
    // Address fields matching backend addressSchema structure
    location: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    // ETA fields
    totalJobTime: 'hours',
    totalJobDuration: '',
    // Additional fields from backend
    siteContact: '',
    SecondaryContact: '', // Capital S to match backend
    contacts: [],
    customFields: [],
    tasks: [],
    // Backend-specific fields
    isIndividual: true,
    status: 'Draft',
    // Voice notes for job description
    voiceNotes: []
  });

  const [newSkill, setNewSkill] = useState('');
  const [newContact, setNewContact] = useState({ name: '', email: '', phone: '', role: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const jobTypes = [
    'full-time', 'part-time'
  ];

  const budgetTypes = [
    'fixed', 'hourly', 'daily', 'weekly', 'monthly'
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  const handleInputChange = (field, value) => {
    setJobData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parentField, childField, value) => {
    setJobData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  };

  const handleSalaryChange = (rateType, value) => {
    setJobData(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        type: {
          ...prev.salary.type,
          [rateType]: value
        }
      }
    }));
  };

  const handleAddressChange = (field, value) => {
    setJobData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const addRequiredTool = () => {
    if (newSkill.trim() && !jobData.requiredTools.includes(newSkill.trim())) {
      setJobData(prev => ({
        ...prev,
        requiredTools: [...prev.requiredTools, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeRequiredTool = (toolToRemove) => {
    setJobData(prev => ({
      ...prev,
      requiredTools: prev.requiredTools.filter(tool => tool !== toolToRemove)
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !jobData.skills.includes(newSkill.trim())) {
      setJobData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setJobData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addContact = () => {
    if (newContact.name && newContact.email) {
      setJobData(prev => ({
        ...prev,
        contacts: [...prev.contacts, { ...newContact, id: Date.now() }]
      }));
      setNewContact({ name: '', email: '', phone: '', role: '' });
    }
  };

  const removeContact = (contactId) => {
    setJobData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== contactId)
    }));
  };

  const addTask = () => {
    if (newTask.title && newTask.description) {
      setJobData(prev => ({
        ...prev,
        tasks: [...prev.tasks, { ...newTask, id: Date.now() }]
      }));
      setNewTask({ title: '', description: '', priority: 'medium' });
    }
  };

  const removeTask = (taskId) => {
    setJobData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setJobData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    setJobData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Format data for backend compatibility
      const backendData = {
        ...jobData,
        // Ensure required fields are properly formatted
        requiredTools: jobData.requiredTools || [],
        skills: jobData.skills || [],
        contacts: jobData.contacts || [],
        tasks: jobData.tasks || [],
        customFields: jobData.customFields || [],
        // Ensure nested objects are properly structured
        partTimeOptions: {
          type: {
            base: jobData.partTimeOptions?.type?.base || '',
            hourlyHours: jobData.partTimeOptions?.type?.hourlyHours || 0,
            dailyDays: jobData.partTimeOptions?.type?.dailyDays || 0,
            contractMonths: jobData.partTimeOptions?.type?.contractMonths || 0,
            weeklyDays: jobData.partTimeOptions?.type?.weeklyDays || 0
          }
        },
        fullTimeOptions: {
          type: {
            base: jobData.fullTimeOptions?.type?.base || 'contract',
            contractMonths: jobData.fullTimeOptions?.type?.contractMonths || 0
          }
        },
                 // Ensure salary structure is correct
         salary: {
           type: {
             partTime: {
               hourlyRate: jobData.salary?.type?.partTime?.hourlyRate || 0,
               dailyRate: jobData.salary?.type?.partTime?.dailyRate || 0,
               contractRate: jobData.salary?.type?.partTime?.contractRate || 0,
               weeklyRate: jobData.salary?.type?.partTime?.weeklyRate || 0
             },
             fixed: jobData.salary?.type?.fixed || 0
           }
         },
         // Ensure voice notes are properly formatted for backend
         voiceNotes: jobData.voiceNotes?.map(note => ({
           id: note.id,
           audioBlob: note.audioBlob, // Already Base64 string
           duration: note.duration,
           timestamp: new Date(note.timestamp),
           size: note.size, // Already in bytes
           uploadedBy: null // Will be set by backend
         })) || []
      };

      console.log('Submitting job to backend:', backendData);
      
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to jobs page
      navigate('/app/recruiter/jobs');
    } catch (error) {
      console.error('Error posting job:', error);
    }
  };

  const getRateLabel = () => {
    switch (jobData.rateType) {
      case 'fixed':
        return 'Fixed Rate';
      case 'hourly':
        return 'Hourly Rate';
      case 'daily':
        return 'Daily Rate';
      case 'weekly':
        return 'Weekly Rate';
      case 'contract':
        return jobData.jobType === 'part-time' && jobData.partTimeOptions?.type?.base === 'monthly' ? 'Monthly Rate' : 'Contract Rate';
      default:
        return 'Rate';
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Creative Header */}
      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">Let's Create Something Amazing!</h3>
         <p className="text-gray-600">Start with the basics and let's build your perfect job posting</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Star className="inline w-4 h-4 text-yellow-500 mr-2" />
          Job Title *
        </label>
        <input
          type="text"
          value={jobData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
          placeholder="e.g., Frontend Developer, UI/UX Designer"
          required
        />
      </div>

             <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           <Target className="inline w-4 h-4 text-blue-500 mr-2" />
           Job Description *
         </label>
         <textarea
           value={jobData.description}
           onChange={(e) => handleInputChange('description', e.target.value)}
           rows="6"
           className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
           placeholder="Describe the job requirements, responsibilities, and what you're looking for..."
           required
         />
       </div>

       {/* Voice Notes Section */}
       <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           <Mic className="inline w-4 h-4 text-purple-500 mr-2" />
           Voice Notes <span className="text-gray-400 font-normal italic">(Optional)</span>
         </label>
         <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
           <div className="mb-3">
             <div className="flex items-center gap-2 mb-2">
               <Mic className="w-4 h-4 text-purple-600" />
               <p className="text-sm font-medium text-purple-800">
                 Record additional details, clarifications, or specific instructions about this job
               </p>
             </div>
             <p className="text-xs text-purple-600">
               Perfect for when you want to add personal context, tone, or detailed explanations that are easier to speak than type.
             </p>
           </div>
           
           {/* Voice Note Recorder */}
           <VoiceMessage 
             onSendMessage={async (audioBlob, duration) => {
               try {
                 // Convert audioBlob to Base64 string for backend compatibility
                 const arrayBuffer = await audioBlob.arrayBuffer();
                 const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
                 
                 const newVoiceNote = {
                   id: `vn_${Date.now()}`, // String ID for backend compatibility
                   audioBlob: base64String, // Base64 encoded string for backend
                   duration: duration,
                   timestamp: new Date().toISOString(),
                   size: audioBlob.size, // Size in bytes for backend compatibility
                   uploadedBy: null // Will be set by backend when user is authenticated
                 };
                 
                 const updatedVoiceNotes = [...jobData.voiceNotes, newVoiceNote];
                 handleInputChange('voiceNotes', updatedVoiceNotes);
                 
                 toast.success(`Voice note added (${duration}s)`);
               } catch (error) {
                 console.error('Error processing voice note:', error);
                 toast.error('Failed to process voice note');
               }
             }}
             placeholder="Record additional job details, clarifications, or specific instructions..."
             className="text-sm"
           />

           {/* Display Existing Voice Notes */}
           {jobData.voiceNotes && jobData.voiceNotes.length > 0 && (
             <div className="mt-4 space-y-3">
               <h4 className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                 <FileText className="w-4 h-4" />
                 Recorded Voice Notes ({jobData.voiceNotes.length})
               </h4>
               
               {jobData.voiceNotes.map((note) => (
                 <div key={note.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-200 shadow-sm">
                   <div className="flex items-center gap-2 flex-1">
                     <Mic className="w-4 h-4 text-purple-600" />
                     <span className="text-sm font-medium text-gray-700">
                       Voice Note ({formatDuration(note.duration)})
                     </span>
                     <span className="text-xs text-gray-500">
                       {(note.size / 1024 / 1024).toFixed(2)} MB • {new Date(note.timestamp).toLocaleString()}
                     </span>
                   </div>
                   
                   <div className="flex gap-2">
                     <button
                       type="button"
                       onClick={() => {
                         try {
                           // Convert Base64 back to Blob for playback
                           const binaryString = atob(note.audioBlob);
                           const bytes = new Uint8Array(binaryString.length);
                           for (let i = 0; i < binaryString.length; i++) {
                             bytes[i] = binaryString.charCodeAt(i);
                           }
                           const audioBlob = new Blob([bytes], { type: 'audio/wav' });
                           const audio = new Audio(URL.createObjectURL(audioBlob));
                           audio.play();
                         } catch (error) {
                           console.error('Error playing voice note:', error);
                           toast.error('Failed to play voice note');
                         }
                       }}
                       className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                       title="Play voice note"
                     >
                       <Play className="h-4 w-4" />
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         const updatedVoiceNotes = jobData.voiceNotes.filter(n => n.id !== note.id);
                         handleInputChange('voiceNotes', updatedVoiceNotes);
                         toast.success("Voice note removed");
                       }}
                       className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                       title="Delete voice note"
                     >
                       <Trash2 className="h-4 w-4" />
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>

             <div>
         <label className="block text-sm font-medium text-gray-700 mb-2">
           <Zap className="inline w-4 h-4 text-orange-500 mr-2" />
           Required Tools & Technologies
         </label>
         <div className="space-y-3">
           <div className="flex space-x-2">
             <input
               type="text"
               value={newSkill}
               onChange={(e) => setNewSkill(e.target.value)}
               className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
               placeholder="e.g., React, Node.js, AWS, Docker, Git..."
               onKeyPress={(e) => e.key === 'Enter' && addRequiredTool()}
             />
             <button
               type="button"
               onClick={addRequiredTool}
               className="px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
             >
               <Plus className="h-5 w-5" />
             </button>
           </div>
           {jobData.requiredTools.length > 0 && (
             <div className="flex flex-wrap gap-2">
               {jobData.requiredTools.map((tool, index) => (
                 <span
                   key={index}
                   className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-full text-sm border border-orange-200"
                 >
                   <span>{tool}</span>
                   <button
                     type="button"
                     onClick={() => removeRequiredTool(tool)}
                     className="text-orange-600 hover:text-orange-800 transition-colors"
                   >
                     <X className="h-4 w-4" />
                   </button>
                 </span>
               ))}
             </div>
           )}
         </div>
       </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Zap className="inline w-4 h-4 text-orange-500 mr-2" />
          Required Tools & Technologies
        </label>
        <textarea
          value={jobData.requiredTools}
          onChange={(e) => handleInputChange('requiredTools', e.target.value)}
          rows="3"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
          placeholder="e.g., React, Node.js, AWS, Docker, Git..."
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Creative Header */}
      <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
          <TrendingUp className="h-8 w-8 text-white" />
        </div>
                 <h3 className="text-xl font-bold text-gray-800 mb-2">Job Setup & Compensation</h3>
         <p className="text-gray-600">Configure job type, duration, location, and compensation</p>
      </div>

      {/* Address Section */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MapPin className="w-5 h-5 text-blue-600 mr-2" />
          Address Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
            <input
              type="text"
              value={jobData.location.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Main Street"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              value={jobData.location.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="New York"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
            <input
              type="text"
              value={jobData.location.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="NY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
            <input
              type="text"
              value={jobData.location.postalCode}
              onChange={(e) => handleAddressChange('postalCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10001"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
          <input
            type="text"
            value={jobData.location.country}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="United States"
          />
        </div>
      </div>

      {/* ETA Section */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="w-5 h-5 text-orange-600 mr-2" />
          Estimated Time & Schedule
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={jobData.startTime.toISOString().split('T')[0]}
              onChange={(e) => handleInputChange('startTime', new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={jobData.endTime.toISOString().split('T')[0]}
              onChange={(e) => handleInputChange('endTime', new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={jobData.startTime.toISOString().split('T')[0]}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Contact</label>
            <input
              type="text"
              value={jobData.siteContact}
              onChange={(e) => handleInputChange('siteContact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Primary contact person"
            />
          </div>
                     <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Contact</label>
             <input
               type="text"
               value={jobData.SecondaryContact}
               onChange={(e) => handleInputChange('SecondaryContact', e.target.value)}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               placeholder="Backup contact person"
             />
           </div>
        </div>
      </div>

             {/* Job Type & Duration Section - Required for compensation setup */}
       <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200 mb-6">
         <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
           <Briefcase className="w-5 h-5 text-indigo-600 mr-2" />
           Job Type & Duration
         </h4>
         <p className="text-gray-600 mb-4">
           Set the job type and duration to configure the appropriate compensation options.
         </p>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               <Briefcase className="inline w-4 h-4 text-indigo-500 mr-2" />
               Job Type *
             </label>
             <select
               value={jobData.jobType}
               onChange={(e) => handleInputChange('jobType', e.target.value)}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-400"
             >
               {jobTypes.map(type => (
                 <option key={type} value={type}>
                   {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                 </option>
               ))}
             </select>
           </div>

           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               <Clock className="inline w-4 h-4 text-indigo-500 mr-2" />
               Total Job Time Unit *
             </label>
             <select
               value={jobData.totalJobTime}
               onChange={(e) => handleInputChange('totalJobTime', e.target.value)}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-400"
             >
               <option value="hours">Hours</option>
               <option value="days">Days</option>
               <option value="weeks">Weeks</option>
               <option value="months">Months</option>
             </select>
           </div>
         </div>

         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             <Clock className="inline w-4 h-4 text-indigo-500 mr-2" />
             Total Job Duration *
           </label>
           <input
             type="number"
             value={jobData.totalJobDuration}
             onChange={(e) => handleInputChange('totalJobDuration', e.target.value)}
             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 hover:border-indigo-400"
             placeholder="e.g., 40 hours, 5 days, 2 weeks..."
             min="1"
             required
           />
         </div>
       </div>

       {/* Enhanced Pay System - Exact same logic as admin PostJob */}
       <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
         <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
           <DollarSign className="w-5 h-5 text-green-600 mr-2" />
           Payment & Compensation
         </h4>
         <p className="text-gray-600 mb-4">
           Specify the rate type and compensation for the job. The options will adapt based on the job's duration and type.
         </p>
         
         <div className="space-y-4">
           {/* Rate Type Selection - Conditional based on jobType and partTime.base */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Rate Type
             </label>
             <select
               value={jobData.rateType}
               onChange={(e) => {
                 handleInputChange('rateType', e.target.value);
                 // Reset rate when type changes (same as admin PostJob)
                 handleInputChange('rate', '');
               }}
               className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
             >
               <option value="fixed">Fixed</option>
               {/* Only show hourly if part-time and base is hourly */}
               {jobData.jobType === 'part-time' && jobData.partTimeOptions?.type?.base === 'hourly' && (
                 <option value="hourly">Hourly</option>
               )}
               {/* Only show daily if part-time and base is daily */}
               {jobData.jobType === 'part-time' && jobData.partTimeOptions?.type?.base === 'daily' && (
                 <option value="daily">Daily</option>
               )}
               {/* Only show weekly if part-time and base is weekly */}
               {jobData.jobType === 'part-time' && jobData.partTimeOptions?.type?.base === 'weekly' && (
                 <option value="weekly">Weekly</option>
               )}
               {/* Only show monthly if part-time and base is monthly */}
               {jobData.jobType === 'part-time' && jobData.partTimeOptions?.type?.base === 'monthly' && (
                 <option value="contract">Monthly</option>
               )}
               {/* Only show contract for full-time */}
               {jobData.jobType === 'full-time' && (
                 <option value="contract">Contract (for Full-Time)</option>
               )}
             </select>
           </div>

           {/* Rate Input Field - Conditional display and dynamic label */}
           {jobData.rateType && (
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 {getRateLabel()}
               </label>
               <input
                 type="number"
                 value={jobData.salary.type[jobData.rateType] || ''}
                 onChange={(e) => handleSalaryChange(jobData.rateType, parseFloat(e.target.value) || 0)}
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
                 placeholder="Enter the rate"
                 min="0"
               />
             </div>
           )}
         </div>

                 {/* Job Type Specific Options - Same logic as admin PostJob */}
         {jobData.jobType === 'part-time' && (
           <div className="bg-white p-4 rounded-lg border border-gray-200">
             <h5 className="font-medium text-gray-800 mb-3">Part-Time Options</h5>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Base Schedule</label>
                 <select
                   value={jobData.partTimeOptions.type.base}
                   onChange={(e) => {
                     handleNestedChange('partTimeOptions', 'type.base', e.target.value);
                     // Reset rate type when base changes (same as admin PostJob)
                     handleInputChange('rateType', 'fixed');
                     handleInputChange('rate', '');
                   }}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="">Select base</option>
                   <option value="hourly">Hourly</option>
                   <option value="daily">Daily</option>
                   <option value="weekly">Weekly</option>
                   <option value="monthly">Monthly</option>
                 </select>
               </div>
               
               {/* Show additional options based on base selection */}
               {jobData.partTimeOptions.type.base === 'hourly' && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Hours per Week</label>
                   <input
                     type="number"
                     value={jobData.partTimeOptions.type.hourlyHours}
                     onChange={(e) => handleNestedChange('partTimeOptions', 'type.hourlyHours', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="e.g., 20"
                     min="1"
                     max="40"
                   />
                 </div>
               )}
               
               {jobData.partTime.base === 'daily' && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Days per Week</label>
                   <input
                     type="number"
                     value={jobData.partTime.dailyDays}
                     onChange={(e) => handleNestedChange('partTime', 'dailyDays', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="e.g., 3"
                     min="1"
                     max="7"
                   />
                 </div>
               )}
               
               {jobData.partTime.base === 'weekly' && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Weeks per Month</label>
                   <input
                     type="number"
                     value={jobData.partTime.weeklyDays}
                     onChange={(e) => handleNestedChange('partTime', 'weeklyDays', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="e.g., 4"
                     min="1"
                     max="5"
                   />
                 </div>
               )}
               
               {jobData.partTime.base === 'monthly' && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Contract Months</label>
                   <input
                     type="number"
                     value={jobData.partTime.contractMonths}
                     onChange={(e) => handleNestedChange('partTime', 'contractMonths', e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     placeholder="e.g., 6"
                     min="1"
                     max="24"
                   />
                 </div>
               )}
             </div>
           </div>
         )}

                 {jobData.jobType === 'full-time' && (
           <div className="bg-white p-4 rounded-lg border border-gray-200">
             <h5 className="font-medium text-gray-800 mb-3">Full-Time Options</h5>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Contract Duration (months)</label>
               <input
                 type="number"
                 value={jobData.fullTimeOptions.type.contractMonths}
                 onChange={(e) => handleNestedChange('fullTimeOptions', 'type.contractMonths', e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 placeholder="e.g., 12"
                 min="1"
               />
             </div>
           </div>
         )}
      </div>



      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Shield className="inline w-4 h-4 text-indigo-500 mr-2" />
          Required Skills
        </label>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-400"
              placeholder="e.g., React, JavaScript, UI/UX"
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          {jobData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {jobData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm border border-blue-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Creative Header */}
      <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-4">
          <Users className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Team & Collaboration</h3>
        <p className="text-gray-600">Set up contacts and tasks for smooth project execution</p>
      </div>

      {/* Contacts Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Phone className="w-5 h-5 text-blue-600 mr-2" />
          Contact Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={newContact.name}
            onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Contact Name"
          />
          <input
            type="email"
            value={newContact.email}
            onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Email"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="tel"
            value={newContact.phone}
            onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Phone"
          />
          <input
            type="text"
            value={newContact.role}
            onChange={(e) => setNewContact(prev => ({ ...prev, role: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Role/Position"
          />
        </div>
        
        <button
          type="button"
          onClick={addContact}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Contact
        </button>
        
        {jobData.contacts.length > 0 && (
          <div className="mt-4 space-y-2">
            {jobData.contacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{contact.name}</p>
                    <p className="text-sm text-gray-600">{contact.email} • {contact.phone}</p>
                    {contact.role && <p className="text-xs text-gray-500">{contact.role}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeContact(contact.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Target className="w-5 h-5 text-green-600 mr-2" />
          Project Tasks
        </h4>
        
        <div className="space-y-4 mb-4">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Task Title"
          />
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Task Description"
            rows="2"
          />
          <div className="flex items-center space-x-4">
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorityLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addTask}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Task
            </button>
          </div>
        </div>
        
        {jobData.tasks.length > 0 && (
          <div className="space-y-2">
            {jobData.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityLevels.find(p => p.value === task.priority)?.color}`}>
                    {priorityLevels.find(p => p.value === task.priority)?.label}
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Options Toggle */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <button
          type="button"
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          {showAdvancedOptions ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="font-medium">
            {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
          </span>
        </button>
        
        {showAdvancedOptions && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={jobData.startTime.toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('startTime', new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={jobData.endTime.toISOString().split('T')[0]}
                  onChange={(e) => handleInputChange('endTime', new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      {/* Creative Header */}
      <div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Final Review & Submission</h3>
        <p className="text-gray-600">Review your job posting and add any final touches</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="inline w-4 h-4 text-blue-500 mr-2" />
          Attachments (Optional)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <FileText className="h-6 w-6" />
            <span>Upload files</span>
          </label>
          <p className="text-sm text-gray-500 mt-2">
            PDF, DOC, DOCX, TXT, JPG, PNG up to 10MB each
          </p>
        </div>
        {jobData.attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            {jobData.attachments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Job Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          Job Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="space-y-2">
            <p><strong>Title:</strong> {jobData.title || 'Not specified'}</p>
            <p><strong>Job Type:</strong> {jobData.jobType ? jobData.jobType.charAt(0).toUpperCase() + jobData.jobType.slice(1).replace('-', ' ') : 'Not specified'}</p>
            <p><strong>Total Duration:</strong> {jobData.totalJobDuration ? `${jobData.totalJobDuration} ${jobData.totalJobTime}` : 'Not specified'}</p>
            <p><strong>Start Date:</strong> {jobData.startTime ? jobData.startTime.toLocaleDateString() : 'Not specified'}</p>
            <p><strong>End Date:</strong> {jobData.endTime ? jobData.endTime.toLocaleDateString() : 'Not specified'}</p>
            <p><strong>Skills:</strong> {jobData.skills.length > 0 ? jobData.skills.join(', ') : 'Not specified'}</p>
          </div>
                       <div className="space-y-2">
                               <p><strong>Rate:</strong> {jobData.salary.type[jobData.rateType] ? `$${jobData.salary.type[jobData.rateType]} (${jobData.rateType})` : 'Not specified'}</p>
                               <p><strong>Address:</strong> {jobData.location.street ? `${jobData.location.street}, ${jobData.location.city}, ${jobData.location.state} ${jobData.location.postalCode}` : 'Not specified'}</p>
                <p><strong>Site Contact:</strong> {jobData.siteContact || 'Not specified'}</p>
                <p><strong>Secondary Contact:</strong> {jobData.SecondaryContact || 'Not specified'}</p>
               <p><strong>Voice Notes:</strong> {jobData.voiceNotes && jobData.voiceNotes.length > 0 ? `${jobData.voiceNotes.length} recorded` : 'None'}</p>
               <p><strong>Contacts:</strong> {jobData.contacts.length} added</p>
               <p><strong>Tasks:</strong> {jobData.tasks.length} defined</p>
             </div>
        </div>
      </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
            step <= currentStep 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-110' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-20 h-1 mx-2 transition-all duration-300 ${
              step < currentStep 
                ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
             case 1: return 'Basic Information';
       case 2: return 'Job Setup & Compensation';
      case 3: return 'Team & Collaboration';
      case 4: return 'Review & Submit';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
            <Briefcase className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Post a New Job
          </h1>
          <p className="text-xl text-gray-600">Create an amazing job posting that attracts top talent</p>
        </div>

        {/* Enhanced Step Indicator */}
        {renderStepIndicator()}

        {/* Enhanced Form Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
            <p className="text-gray-600">
              Step {currentStep} of 4
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={(e) => e.preventDefault()}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Enhanced Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 border border-gray-300 rounded-lg font-medium transition-all duration-200 ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                Previous
              </button>

              <div className="flex space-x-3">
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <Sparkles className="inline w-5 h-5 mr-2" />
                    Post Job
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SimplePostJob;
