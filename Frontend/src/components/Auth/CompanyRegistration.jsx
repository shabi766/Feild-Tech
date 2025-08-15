import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  ArrowLeft, 
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [companyData, setCompanyData] = useState({
    // Basic Company Info
    companyName: '',
    companyType: '',
    industry: '',
    description: '',
    
    // Contact Information
    email: '',
    phone: '',
    website: '',
    
    // Address
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    },
    
    // Company Details
    foundedYear: '',
    employeeCount: '',
    annualRevenue: '',
    
    // Recruiter Info
    recruiterName: '',
    recruiterEmail: '',
    recruiterPhone: '',
    recruiterPosition: '',
    
    // Business Verification
    businessLicense: '',
    taxId: '',
    companyRegistration: ''
  });

  const [errors, setErrors] = useState({});

  const companyTypes = [
    'Technology',
    'Healthcare',
    'Finance',
    'Manufacturing',
    'Retail',
    'Construction',
    'Education',
    'Consulting',
    'Real Estate',
    'Other'
  ];

  const industries = [
    'Software Development',
    'IT Services',
    'Healthcare Services',
    'Financial Services',
    'Manufacturing',
    'E-commerce',
    'Construction',
    'Education',
    'Consulting',
    'Real Estate',
    'Marketing',
    'Legal Services',
    'Other'
  ];

  const employeeRanges = [
    '1-10',
    '11-50',
    '51-200',
    '201-500',
    '501-1000',
    '1000+'
  ];

  const revenueRanges = [
    'Under $100K',
    '$100K - $500K',
    '$500K - $1M',
    '$1M - $5M',
    '$5M - $10M',
    '$10M+'
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCompanyData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCompanyData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!companyData.companyName.trim()) {
          newErrors.companyName = 'Company name is required';
        }
        if (!companyData.companyType) {
          newErrors.companyType = 'Company type is required';
        }
        if (!companyData.industry) {
          newErrors.industry = 'Industry is required';
        }
        break;

      case 2:
        if (!companyData.email.trim()) {
          newErrors.email = 'Company email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!companyData.phone.trim()) {
          newErrors.phone = 'Company phone is required';
        }
        if (!companyData.address.street.trim()) {
          newErrors['address.street'] = 'Street address is required';
        }
        if (!companyData.address.city.trim()) {
          newErrors['address.city'] = 'City is required';
        }
        if (!companyData.address.country.trim()) {
          newErrors['address.country'] = 'Country is required';
        }
        break;

             case 3:
         if (!companyData.recruiterName.trim()) {
           newErrors.recruiterName = 'Recruiter name is required';
         }
         if (!companyData.recruiterEmail.trim()) {
           newErrors.recruiterEmail = 'Recruiter email is required';
         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(companyData.recruiterEmail)) {
           newErrors.recruiterEmail = 'Please enter a valid email address';
         }
         if (!companyData.recruiterPhone.trim()) {
           newErrors.recruiterPhone = 'Recruiter phone is required';
         }
         if (!companyData.password || companyData.password.length < 6) {
           newErrors.password = 'Password must be at least 6 characters long';
         }
         break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      return;
    }

    setLoading(true);
    try {
             // Prepare data for backend
       const registrationData = {
         companyName: companyData.companyName,
         companyType: companyData.companyType,
         industry: companyData.industry,
         description: companyData.description,
         foundedYear: companyData.foundedYear,
         employeeCount: companyData.employeeCount,
         annualRevenue: companyData.annualRevenue,
         companyEmail: companyData.email, // Map from email field
         companyPhone: companyData.phone, // Map from phone field
         website: companyData.website,
         address: {
           street: companyData.address.street,
           city: companyData.address.city,
           state: companyData.address.state,
           postalCode: companyData.address.postalCode,
           country: companyData.address.country
         },
         recruiterName: companyData.recruiterName,
         recruiterEmail: companyData.recruiterEmail,
         recruiterPhone: companyData.recruiterPhone,
         recruiterPosition: companyData.recruiterPosition,
         password: companyData.password
       };

             // Debug: Log the payload being sent
       console.log('Sending registration data:', registrationData);
       
       // Make API call to backend
       const response = await fetch('http://localhost:8000/api/v1/company-registration/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
        credentials: 'include'
      });

             const result = await response.json();
       console.log('Backend response:', result);

       if (!response.ok) {
         console.error('Backend error details:', result);
         throw new Error(result.message || 'Registration failed');
       }

      toast.success('Company registration successful!');
      
      // Store the token and user data
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('userData', JSON.stringify(result.data.user));
      localStorage.setItem('companyData', JSON.stringify(result.data.company));
      
             // Navigate to company dashboard
       navigate('/app/recruiter/dashboard', { 
         state: { 
           companyData: result.data.company,
           userData: result.data.user
         } 
       });
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          id="companyName"
          value={companyData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          placeholder="Enter your company name"
          className="mt-2"
        />
        <ErrorMessage error={errors.companyName} />
      </div>

      <div>
        <Label htmlFor="companyType">Company Type *</Label>
        <Select value={companyData.companyType} onValueChange={(value) => handleInputChange('companyType', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select company type" />
          </SelectTrigger>
          <SelectContent>
            {companyTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ErrorMessage error={errors.companyType} />
      </div>

      <div>
        <Label htmlFor="industry">Industry *</Label>
        <Select value={companyData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map(industry => (
              <SelectItem key={industry} value={industry}>{industry}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ErrorMessage error={errors.industry} />
      </div>

      <div>
        <Label htmlFor="description">Company Description</Label>
        <Textarea
          id="description"
          value={companyData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of your company and what you do..."
          className="mt-2"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="foundedYear">Founded Year</Label>
          <Input
            id="foundedYear"
            type="number"
            value={companyData.foundedYear}
            onChange={(e) => handleInputChange('foundedYear', e.target.value)}
            placeholder="e.g., 2020"
            className="mt-2"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
        <div>
          <Label htmlFor="employeeCount">Employee Count</Label>
          <Select value={companyData.employeeCount} onValueChange={(value) => handleInputChange('employeeCount', value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {employeeRanges.map(range => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="annualRevenue">Annual Revenue</Label>
        <Select value={companyData.annualRevenue} onValueChange={(value) => handleInputChange('annualRevenue', value)}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select revenue range" />
          </SelectTrigger>
          <SelectContent>
            {revenueRanges.map(range => (
              <SelectItem key={range} value={range}>{range}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
         <h3 className="font-semibold text-blue-900 mb-2">Company Contact Information</h3>
         <p className="text-blue-700 text-sm">
           This is the main contact information for your company (different from the recruiter's personal contact).
         </p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div>
           <Label htmlFor="email">Company Email *</Label>
           <Input
             id="email"
             type="email"
             value={companyData.email}
             onChange={(e) => handleInputChange('email', e.target.value)}
             placeholder="info@company.com"
             className="mt-2"
           />
           <p className="text-xs text-gray-500 mt-1">Main company email address</p>
           <ErrorMessage error={errors.email} />
         </div>
         <div>
           <Label htmlFor="phone">Company Phone *</Label>
           <Input
             id="phone"
             type="tel"
             value={companyData.phone}
             onChange={(e) => handleInputChange('phone', e.target.value)}
             placeholder="+1 (555) 123-4567"
             className="mt-2"
           />
           <p className="text-xs text-gray-500 mt-1">Main company phone number</p>
           <ErrorMessage error={errors.phone} />
         </div>
       </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={companyData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          placeholder="https://www.example.com"
          className="mt-2"
        />
      </div>

      <div className="space-y-4">
        <Label>Company Address *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Input
              value={companyData.address.street}
              onChange={(e) => handleInputChange('address.street', e.target.value)}
              placeholder="Street Address"
              className="mt-2"
            />
            <ErrorMessage error={errors['address.street']} />
          </div>
          <div>
            <Input
              value={companyData.address.city}
              onChange={(e) => handleInputChange('address.city', e.target.value)}
              placeholder="City"
              className="mt-2"
            />
            <ErrorMessage error={errors['address.city']} />
          </div>
          <div>
            <Input
              value={companyData.address.state}
              onChange={(e) => handleInputChange('address.state', e.target.value)}
              placeholder="State/Province"
              className="mt-2"
            />
          </div>
          <div>
            <Input
              value={companyData.address.postalCode}
              onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
              placeholder="Postal Code"
              className="mt-2"
            />
          </div>
          <div className="md:col-span-2">
            <Input
              value={companyData.address.country}
              onChange={(e) => handleInputChange('address.country', e.target.value)}
              placeholder="Country"
              className="mt-2"
            />
            <ErrorMessage error={errors['address.country']} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">Primary Recruiter Information</h3>
        <p className="text-blue-700 text-sm">
          This will be the main account holder who can manage the company profile and hiring process.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="recruiterName">Full Name *</Label>
          <Input
            id="recruiterName"
            value={companyData.recruiterName}
            onChange={(e) => handleInputChange('recruiterName', e.target.value)}
            placeholder="Enter your full name"
            className="mt-2"
          />
          <ErrorMessage error={errors.recruiterName} />
        </div>
        <div>
          <Label htmlFor="recruiterPosition">Position/Title</Label>
          <Input
            id="recruiterPosition"
            value={companyData.recruiterPosition}
            onChange={(e) => handleInputChange('recruiterPosition', e.target.value)}
            placeholder="e.g., HR Manager, Recruiter"
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="recruiterEmail">Email Address *</Label>
          <Input
            id="recruiterEmail"
            type="email"
            value={companyData.recruiterEmail}
            onChange={(e) => handleInputChange('recruiterEmail', e.target.value)}
            placeholder="your.email@company.com"
            className="mt-2"
          />
          <ErrorMessage error={errors.recruiterEmail} />
        </div>
        <div>
          <Label htmlFor="recruiterPhone">Phone Number *</Label>
          <Input
            id="recruiterPhone"
            type="tel"
            value={companyData.recruiterPhone}
            onChange={(e) => handleInputChange('recruiterPhone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="mt-2"
          />
          <ErrorMessage error={errors.recruiterPhone} />
        </div>
      </div>

             <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
         <h3 className="font-semibold text-yellow-900 mb-2">Next Steps</h3>
         <p className="text-yellow-700 text-sm">
           After registration, you'll be able to set up your company profile, create job postings, and start hiring technicians.
         </p>
       </div>

       <div className="space-y-4">
         <Label htmlFor="password">Account Password *</Label>
         <Input
           id="password"
           type="password"
           value={companyData.password || ''}
           onChange={(e) => handleInputChange('password', e.target.value)}
           placeholder="Create a strong password for your company account"
           className="mt-2"
           required
         />
         <p className="text-sm text-gray-600">
           This password will be used to log into your company account
         </p>
         <ErrorMessage error={errors.password} />
       </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
            stepNumber <= step 
              ? 'bg-blue-600 border-blue-600 text-white' 
              : 'bg-white border-gray-300 text-gray-400'
          }`}>
            {stepNumber < step ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              stepNumber
            )}
          </div>
          {stepNumber < 3 && (
            <div className={`w-16 h-1 ${
              stepNumber < step ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const getStepTitle = () => {
    switch (step) {
      case 1: return 'Company Information';
      case 2: return 'Contact & Address';
      case 3: return 'Recruiter Details';
      default: return '';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1: return 'Tell us about your company and what you do';
      case 2: return 'Provide your company contact information and address';
      case 3: return 'Set up the primary recruiter account';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            to="/role-selection" 
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Role Selection
          </Link>
          <div className="flex items-center justify-center mb-4">
            <Building className="w-12 h-12 text-blue-600 mr-4" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Company Registration</h1>
              <p className="text-gray-600">Join as a Company Recruiter</p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Main Content */}
        <Card className="shadow-xl">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-2xl text-gray-900">{getStepTitle()}</CardTitle>
            <p className="text-gray-600">{getStepDescription()}</p>
          </CardHeader>
          <CardContent className="p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={step === 1}
                className="px-6"
              >
                Previous
              </Button>

              {step < 3 ? (
                <Button onClick={nextStep} className="px-6">
                  Next Step
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyRegistration;
