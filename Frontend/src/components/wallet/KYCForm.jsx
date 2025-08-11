import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { WALLET_API_END_POINT } from '@/components/utils/constant';

const KYCForm = () => {
  const [form, setForm] = useState({
    fullname: '',
    fatherName: '',
    cnicNumber: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
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
  const [status, setStatus] = useState(null);
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [utilityBillFile, setUtilityBillFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const fetchKyc = async () => {
    try {
      const res = await axios.get(`${WALLET_API_END_POINT}/kyc`, { withCredentials: true });
      if (res.data?.success) {
        const { kyc, user } = res.data;
        setStatus(kyc?.kycStatus || 'unverified');
        setForm(f => ({
          ...f,
          fullname: user?.fullname || '',
          phoneNumber: user?.phoneNumber || '',
          email: user?.email || '',
          fatherName: kyc?.fatherName || '',
          cnicNumber: kyc?.cnicNumber || '',
          dateOfBirth: kyc?.dateOfBirth ? new Date(kyc.dateOfBirth).toISOString().substring(0, 10) : '',
          address: kyc?.address || '',
          city: kyc?.city || '',
          postalCode: kyc?.postalCode || '',
          occupation: kyc?.occupation || '',
          employer: kyc?.employer || '',
          monthlyIncome: kyc?.monthlyIncome || '',
          sourceOfFunds: kyc?.sourceOfFunds || '',
          purposeOfAccount: kyc?.purposeOfAccount || '',
          emergencyContact: kyc?.emergencyContact || { name: '', relationship: '', phone: '' }
        }));
      }
    } catch {}
  };

  useEffect(() => { fetchKyc(); }, []);

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
      if (!frontFile) newErrors.frontFile = 'CNIC front image is required';
      if (!backFile) newErrors.backFile = 'CNIC back image is required';
      if (!selfieFile) newErrors.selfieFile = 'Selfie is required';
      if (!utilityBillFile) newErrors.utilityBillFile = 'Utility bill is required';
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
      if (frontFile) data.append('cnicFront', frontFile);
      if (backFile) data.append('cnicBack', backFile);
      if (selfieFile) data.append('selfie', selfieFile);
      if (utilityBillFile) data.append('utilityBill', utilityBillFile);
      
      const res = await axios.post(`${WALLET_API_END_POINT}/kyc`, data, { withCredentials: true });
      if (res.data?.success) {
        setStatus(res.data.kyc?.kycStatus || 'pending');
        alert('KYC submitted successfully! We will verify your details within 24-48 hours.');
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-6">
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= stepNumber 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {stepNumber}
            </div>
            {stepNumber < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-2 text-sm text-gray-600">
        {step === 1 && 'Personal Information'}
        {step === 2 && 'Financial Information'}
        {step === 3 && 'Documents & Verification'}
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input 
            value={form.fullname} 
            disabled 
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input 
            value={form.phoneNumber} 
            disabled 
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name *</label>
          <input 
            value={form.fatherName} 
            onChange={e => setForm({ ...form, fatherName: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.fatherName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter father's full name"
          />
          {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Number *</label>
          <input 
            value={form.cnicNumber} 
            onChange={e => setForm({ ...form, cnicNumber: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.cnicNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="00000-0000000-0"
          />
          {errors.cnicNumber && <p className="text-red-500 text-xs mt-1">{errors.cnicNumber}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
          <input 
            type="date" 
            value={form.dateOfBirth} 
            onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input 
            value={form.email} 
            disabled 
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
          <input 
            value={form.address} 
            onChange={e => setForm({ ...form, address: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.address ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Street address, apartment, suite, etc."
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
          <input 
            value={form.city} 
            onChange={e => setForm({ ...form, city: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.city ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="City"
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
          <input 
            value={form.postalCode} 
            onChange={e => setForm({ ...form, postalCode: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.postalCode ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Postal code"
          />
          {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
        </div>
      </div>
    </div>
  );

  const renderFinancialInfo = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Occupation *</label>
          <input 
            value={form.occupation} 
            onChange={e => setForm({ ...form, occupation: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.occupation ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Software Engineer, Teacher, etc."
          />
          {errors.occupation && <p className="text-red-500 text-xs mt-1">{errors.occupation}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Employer/Company *</label>
          <input 
            value={form.employer} 
            onChange={e => setForm({ ...form, employer: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.employer ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Company or organization name"
          />
          {errors.employer && <p className="text-red-500 text-xs mt-1">{errors.employer}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Income *</label>
          <select 
            value={form.monthlyIncome} 
            onChange={e => setForm({ ...form, monthlyIncome: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.monthlyIncome ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select income range</option>
            <option value="0-25000">$0 - $25,000</option>
            <option value="25001-50000">$25,001 - $50,000</option>
            <option value="50001-75000">$50,001 - $75,000</option>
            <option value="75001-100000">$75,001 - $100,000</option>
            <option value="100001+">$100,001+</option>
          </select>
          {errors.monthlyIncome && <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Source of Funds *</label>
          <select 
            value={form.sourceOfFunds} 
            onChange={e => setForm({ ...form, sourceOfFunds: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.sourceOfFunds ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select source</option>
            <option value="employment">Employment/Salary</option>
            <option value="business">Business Income</option>
            <option value="investments">Investments</option>
            <option value="inheritance">Inheritance</option>
            <option value="other">Other</option>
          </select>
          {errors.sourceOfFunds && <p className="text-red-500 text-xs mt-1">{errors.sourceOfFunds}</p>}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Purpose of Account *</label>
        <textarea 
          value={form.purposeOfAccount} 
          onChange={e => setForm({ ...form, purposeOfAccount: e.target.value })}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.purposeOfAccount ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Please describe why you need this wallet account..."
        />
        {errors.purposeOfAccount && <p className="text-red-500 text-xs mt-1">{errors.purposeOfAccount}</p>}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents & Verification</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name *</label>
          <input 
            value={form.emergencyContact.name} 
            onChange={e => setForm({ 
              ...form, 
              emergencyContact: { ...form.emergencyContact, name: e.target.value }
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.emergencyName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Full name of emergency contact"
          />
          {errors.emergencyName && <p className="text-red-500 text-xs mt-1">{errors.emergencyName}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Relationship *</label>
          <select 
            value={form.emergencyContact.relationship} 
            onChange={e => setForm({ 
              ...form, 
              emergencyContact: { ...form.emergencyContact, relationship: e.target.value }
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.emergencyRelationship ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select relationship</option>
            <option value="spouse">Spouse</option>
            <option value="parent">Parent</option>
            <option value="sibling">Sibling</option>
            <option value="friend">Friend</option>
            <option value="other">Other</option>
          </select>
          {errors.emergencyRelationship && <p className="text-red-500 text-xs mt-1">{errors.emergencyRelationship}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Phone *</label>
          <input 
            value={form.emergencyContact.phone} 
            onChange={e => setForm({ 
              ...form, 
              emergencyContact: { ...form.emergencyContact, phone: e.target.value }
            })}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Phone number"
          />
          {errors.emergencyPhone && <p className="text-red-500 text-xs mt-1">{errors.emergencyPhone}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Front Image *</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={e => setFrontFile(e.target.files?.[0] || null)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.frontFile ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.frontFile && <p className="text-red-500 text-xs mt-1">{errors.frontFile}</p>}
          <p className="text-xs text-gray-500 mt-1">Upload clear image of CNIC front side</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">CNIC Back Image *</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={e => setBackFile(e.target.files?.[0] || null)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.backFile ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.backFile && <p className="text-red-500 text-xs mt-1">{errors.backFile}</p>}
          <p className="text-xs text-gray-500 mt-1">Upload clear image of CNIC back side</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Selfie Photo *</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={e => setSelfieFile(e.target.files?.[0] || null)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.selfieFile ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.selfieFile && <p className="text-red-500 text-xs mt-1">{errors.selfieFile}</p>}
          <p className="text-xs text-gray-500 mt-1">Upload a clear selfie photo</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Utility Bill *</label>
          <input 
            type="file" 
            accept="image/*,.pdf" 
            onChange={e => setUtilityBillFile(e.target.files?.[0] || null)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.utilityBillFile ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.utilityBillFile && <p className="text-red-500 text-xs mt-1">{errors.utilityBillFile}</p>}
          <p className="text-xs text-gray-500 mt-1">Upload recent utility bill for address verification</p>
        </div>
      </div>
    </div>
  );

  if (status === 'verified') {
    return (
      <div className="p-6 border border-green-200 rounded-lg bg-green-50">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-800">KYC Verification Complete</h3>
            <p className="text-sm text-green-700 mt-1">Your account has been verified. You now have access to your wallet.</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="p-6 border border-yellow-200 rounded-lg bg-yellow-50">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-yellow-800">KYC Under Review</h3>
            <p className="text-sm text-yellow-700 mt-1">Your KYC application is currently being reviewed. This process typically takes 24-48 hours. You will be notified once verification is complete.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900">Account Verification (KYC)</h3>
        <p className="text-gray-600 mt-2">
          Complete your Know Your Customer (KYC) verification to access your wallet. 
          This process helps us ensure security and compliance with financial regulations.
        </p>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit} className="space-y-6">
        {step === 1 && renderPersonalInfo()}
        {step === 2 && renderFinancialInfo()}
        {step === 3 && renderDocuments()}

        <div className="flex justify-between pt-6 border-t">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Previous
            </button>
          )}
          
          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="ml-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default KYCForm;


