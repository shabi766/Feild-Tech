import React, { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import axios from 'axios';
import { API_ENDPOINTS } from '@/config/environment';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { 
    Loader2, User, Phone, MapPin, Upload, X, AlertCircle, CreditCard, 
    Building2, Calendar, FileText, Shield, Briefcase, GraduationCap, 
    Heart, Camera, FileImage, ArrowRight, CheckCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WalletOnboarding = ({ onComplete }) => {
    const { user } = useSelector((s) => s.auth);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [kycStatus, setKycStatus] = useState('unverified');
    const [form, setForm] = useState({
        fatherName: '',
        cnicNumber: '',
        dateOfBirth: '',
        address: '',
        city: '',
        postalCode: '',
        occupation: '',
        employer: '',
        monthlyIncome: '',
        sourceOfFunds: '',
        purposeOfAccount: '',
        emergencyContact: {
            name: '',
            relationship: '',
            phone: ''
        }
    });
    const [files, setFiles] = useState({
        cnicFront: null,
        cnicBack: null,
        selfie: null,
        utilityBill: null
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        checkKYCStatus();
    }, []);

    const checkKYCStatus = async () => {
        try {
            const res = await axios.get(`${API_ENDPOINTS.WALLET}/kyc/status`, { withCredentials: true });
            if (res.data?.success) {
                const status = res.data.kyc?.kycStatus || 'unverified';
                setKycStatus(status);
                
                if (status === 'verified') {
                    onComplete('kyc_approved');
                } else if (status === 'pending') {
                    setStep(4); // Show pending status
                }
            }
        } catch (err) {
            console.error('Failed to fetch KYC status:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setForm(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (field, file) => {
        setFiles(prev => ({ ...prev, [field]: file }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateStep = (currentStep) => {
        const newErrors = {};
        
        if (currentStep === 1) {
            if (!form.fatherName.trim()) newErrors.fatherName = 'Father name is required';
            if (!form.cnicNumber.trim()) newErrors.cnicNumber = 'CNIC number is required';
            if (!form.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
            if (!form.address.trim()) newErrors.address = 'Address is required';
            if (!form.city.trim()) newErrors.city = 'City is required';
            if (!form.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        }
        
        if (currentStep === 2) {
            if (!form.occupation.trim()) newErrors.occupation = 'Occupation is required';
            if (!form.employer.trim()) newErrors.employer = 'Employer is required';
            if (!form.monthlyIncome.trim()) newErrors.monthlyIncome = 'Monthly income is required';
            if (!form.sourceOfFunds.trim()) newErrors.sourceOfFunds = 'Source of funds is required';
            if (!form.purposeOfAccount.trim()) newErrors.purposeOfAccount = 'Purpose of account is required';
        }
        
        if (currentStep === 3) {
            if (!form.emergencyContact.name.trim()) newErrors.emergencyName = 'Emergency contact name is required';
            if (!form.emergencyContact.relationship.trim()) newErrors.emergencyRelationship = 'Relationship is required';
            if (!form.emergencyContact.phone.trim()) newErrors.emergencyPhone = 'Emergency contact phone is required';
            if (!files.cnicFront) newErrors.cnicFront = 'CNIC front image is required';
            if (!files.cnicBack) newErrors.cnicBack = 'CNIC back image is required';
            if (!files.selfie) newErrors.selfie = 'Selfie is required';
            if (!files.utilityBill) newErrors.utilityBill = 'Utility bill is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(3)) return;
        
        try {
            setLoading(true);
            const data = new FormData();
            
            // Personal Information
            data.append('fatherName', form.fatherName);
            data.append('cnicNumber', form.cnicNumber);
            data.append('dateOfBirth', form.dateOfBirth);
            data.append('address', form.address);
            data.append('city', form.city);
            data.append('postalCode', form.postalCode);
            
            // Financial Information
            data.append('occupation', form.occupation);
            data.append('employer', form.employer);
            data.append('monthlyIncome', form.monthlyIncome);
            data.append('sourceOfFunds', form.sourceOfFunds);
            data.append('purposeOfAccount', form.purposeOfAccount);
            
            // Emergency Contact
            data.append('emergencyContact', JSON.stringify(form.emergencyContact));
            
            // Documents
            if (files.cnicFront) data.append('cnicFront', files.cnicFront);
            if (files.cnicBack) data.append('cnicBack', files.cnicBack);
            if (files.selfie) data.append('selfie', files.selfie);
            if (files.utilityBill) data.append('utilityBill', files.utilityBill);
            
            const res = await axios.post(`${API_ENDPOINTS.WALLET}/kyc/submit`, data, { withCredentials: true });
            if (res.data?.success) {
                setKycStatus('pending');
                setStep(4);
                toast.success('KYC submitted successfully! We will verify your details within 24-48 hours.');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || err.message || 'Failed to submit KYC');
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                            step >= stepNumber 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'bg-gray-200 text-gray-600'
                        }`}>
                            {stepNumber}
                        </div>
                        {stepNumber < 3 && (
                            <div className={`w-20 h-1 mx-2 transition-all duration-300 ${
                                step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                            }`} />
                        )}
                    </div>
                ))}
            </div>
            <div className="text-center mt-3 text-sm text-gray-600">
                {step === 1 && 'Personal Information'}
                {step === 2 && 'Financial Information'}
                {step === 3 && 'Documents & Verification'}
            </div>
        </div>
    );

    const renderPersonalInfo = () => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input 
                            value={user?.fullname || ''} 
                            disabled 
                            className="pl-10 h-12 border-gray-200 bg-gray-50 text-gray-500" 
                        />
                    </div>
                </div>
                
                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Phone Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input 
                            value={user?.phoneNumber || ''} 
                            disabled 
                            className="pl-10 h-12 border-gray-200 bg-gray-50 text-gray-500" 
                        />
                    </div>
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Father's Name *</Label>
                    <Input 
                        name="fatherName"
                        value={form.fatherName}
                        onChange={handleInputChange}
                        placeholder="Enter father's full name"
                        className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.fatherName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.fatherName && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.fatherName}
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">CNIC Number *</Label>
                    <Input 
                        name="cnicNumber"
                        value={form.cnicNumber}
                        onChange={handleInputChange}
                        placeholder="12345-1234567-1"
                        className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.cnicNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.cnicNumber && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.cnicNumber}
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Date of Birth *</Label>
                    <Input 
                        type="date"
                        name="dateOfBirth"
                        value={form.dateOfBirth}
                        onChange={handleInputChange}
                        className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.dateOfBirth ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.dateOfBirth && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.dateOfBirth}
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">City *</Label>
                    <Input 
                        name="city"
                        value={form.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city"
                        className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.city ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.city && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.city}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Full Address *</Label>
                <Textarea 
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    rows={3}
                    className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.address ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.address && (
                    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.address}
                    </div>
                )}
            </div>

            <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Postal Code *</Label>
                <Input 
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleInputChange}
                    placeholder="Enter postal code"
                    className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.postalCode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.postalCode && (
                    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.postalCode}
                    </div>
                )}
            </div>
        </motion.div>
    );

    const renderFinancialInfo = () => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Financial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Occupation *</Label>
                    <Input 
                        name="occupation"
                        value={form.occupation}
                        onChange={handleInputChange}
                        placeholder="e.g., Software Engineer, Teacher"
                        className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.occupation ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.occupation && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.occupation}
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Employer/Company *</Label>
                    <Input 
                        name="employer"
                        value={form.employer}
                        onChange={handleInputChange}
                        placeholder="Enter employer or company name"
                        className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.employer ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.employer && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.employer}
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Monthly Income *</Label>
                    <Input 
                        name="monthlyIncome"
                        value={form.monthlyIncome}
                        onChange={handleInputChange}
                        placeholder="e.g., 50,000 PKR"
                        className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.monthlyIncome ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.monthlyIncome && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.monthlyIncome}
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Source of Funds *</Label>
                    <Input 
                        name="sourceOfFunds"
                        value={form.sourceOfFunds}
                        onChange={handleInputChange}
                        placeholder="e.g., Salary, Business, Investment"
                        className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.sourceOfFunds ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.sourceOfFunds && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.sourceOfFunds}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Purpose of Account *</Label>
                <Textarea 
                    name="purposeOfAccount"
                    value={form.purposeOfAccount}
                    onChange={handleInputChange}
                    placeholder="Describe why you need this wallet account"
                    rows={3}
                    className={`border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.purposeOfAccount ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.purposeOfAccount && (
                    <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.purposeOfAccount}
                    </div>
                )}
            </div>
        </motion.div>
    );

    const renderDocuments = () => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Documents & Verification</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Emergency Contact Name *</Label>
                    <Input 
                        name="emergencyContact.name"
                        value={form.emergencyContact.name}
                        onChange={handleInputChange}
                        placeholder="Enter emergency contact name"
                        className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.emergencyName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.emergencyName && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.emergencyName}
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Relationship *</Label>
                    <Input 
                        name="emergencyContact.relationship"
                        value={form.emergencyContact.relationship}
                        onChange={handleInputChange}
                        placeholder="e.g., Father, Spouse, Sibling"
                        className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.emergencyRelationship ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.emergencyRelationship && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.emergencyRelationship}
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone *</Label>
                    <Input 
                        name="emergencyContact.phone"
                        value={form.emergencyContact.phone}
                        onChange={handleInputChange}
                        placeholder="Enter emergency contact phone"
                        className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${errors.emergencyPhone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.emergencyPhone && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.emergencyPhone}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">CNIC Front Image *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        {files.cnicFront ? (
                            <div className="space-y-2">
                                <FileImage className="w-12 h-12 text-blue-500 mx-auto" />
                                <p className="text-sm text-gray-600">{files.cnicFront.name}</p>
                                <button
                                    type="button"
                                    onClick={() => setFiles(prev => ({ ...prev, cnicFront: null }))}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <CreditCard className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-sm text-gray-600">Upload CNIC Front</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('cnicFront', e.target.files[0])}
                                    className="hidden"
                                    id="cnicFront"
                                />
                                <label htmlFor="cnicFront" className="cursor-pointer text-blue-500 hover:text-blue-700 text-sm">
                                    Choose File
                                </label>
                            </div>
                        )}
                    </div>
                    {errors.cnicFront && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.cnicFront}
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">CNIC Back Image *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        {files.cnicBack ? (
                            <div className="space-y-2">
                                <FileImage className="w-12 h-12 text-blue-500 mx-auto" />
                                <p className="text-sm text-gray-600">{files.cnicBack.name}</p>
                                <button
                                    type="button"
                                    onClick={() => setFiles(prev => ({ ...prev, cnicBack: null }))}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <CreditCard className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-sm text-gray-600">Upload CNIC Back</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('cnicBack', e.target.files[0])}
                                    className="hidden"
                                    id="cnicBack"
                                />
                                <label htmlFor="cnicBack" className="cursor-pointer text-blue-500 hover:text-blue-700 text-sm">
                                    Choose File
                                </label>
                            </div>
                        )}
                    </div>
                    {errors.cnicBack && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.cnicBack}
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Selfie Photo *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        {files.selfie ? (
                            <div className="space-y-2">
                                <FileImage className="w-12 h-12 text-blue-500 mx-auto" />
                                <p className="text-sm text-gray-600">{files.selfie.name}</p>
                                <button
                                    type="button"
                                    onClick={() => setFiles(prev => ({ ...prev, selfie: null }))}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Camera className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-sm text-gray-600">Upload Selfie</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('selfie', e.target.files[0])}
                                    className="hidden"
                                    id="selfie"
                                />
                                <label htmlFor="selfie" className="cursor-pointer text-blue-500 hover:text-blue-700 text-sm">
                                    Choose File
                                </label>
                            </div>
                        )}
                    </div>
                    {errors.selfie && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.selfie}
                        </div>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2">Utility Bill *</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        {files.utilityBill ? (
                            <div className="space-y-2">
                                <FileImage className="w-12 h-12 text-blue-500 mx-auto" />
                                <p className="text-sm text-gray-600">{files.utilityBill.name}</p>
                                <button
                                    type="button"
                                    onClick={() => setFiles(prev => ({ ...prev, utilityBill: null }))}
                                    className="text-red-500 hover:text-red-700 text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto" />
                                <p className="text-sm text-gray-600">Upload Utility Bill</p>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleFileChange('utilityBill', e.target.files[0])}
                                    className="hidden"
                                    id="utilityBill"
                                />
                                <label htmlFor="utilityBill" className="cursor-pointer text-blue-500 hover:text-blue-700 text-sm">
                                    Choose File
                                </label>
                            </div>
                        )}
                    </div>
                    {errors.utilityBill && (
                        <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.utilityBill}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );

    const renderPendingStatus = () => (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
        >
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">KYC Under Review</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We've received your KYC application and our team is currently reviewing your documents. 
                This process typically takes 24-48 hours.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                    <strong>What happens next?</strong><br />
                    • Document verification<br />
                    • Background checks<br />
                    • Approval notification<br />
                    • Wallet access setup
                </p>
            </div>
        </motion.div>
    );

    if (step === 4) {
        return renderPendingStatus();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet Onboarding</h1>
                    <p className="text-gray-600">Complete KYC verification to access your wallet</p>
                </div>

                {/* Main Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {renderStepIndicator()}
                    
                    <form onSubmit={handleSubmit}>
                        {step === 1 && renderPersonalInfo()}
                        {step === 2 && renderFinancialInfo()}
                        {step === 3 && renderDocuments()}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    className="px-6 py-3"
                                >
                                    Previous
                                </Button>
                            )}
                            
                            <div className="ml-auto">
                                {step < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700"
                                    >
                                        Next Step
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3 bg-green-600 hover:bg-green-700"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit KYC
                                                <CheckCircle className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WalletOnboarding;
