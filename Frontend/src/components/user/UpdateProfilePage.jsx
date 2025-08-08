import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { USER_API_END_POINT } from '@/components/utils/constant';
import { setuser } from '@/redux/authSlice';
import { Loader2, Plus, Trash2 } from 'lucide-react';

const UpdateProfilePage = () => {
  const { user } = useSelector(store => store.auth);
  const dispatch = useDispatch();

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    age: user?.age || '',
    gender: user?.gender || '',
    bio: user?.profile?.bio || '',
    skills: (user?.profile?.skills || []).join(', '),
    addressLine1: user?.address?.addressLine1 || '',
    addressLine2: user?.address?.addressLine2 || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    country: user?.address?.country || '',
    postalCode: user?.address?.postalCode || '',
    achievements: user?.achievements?.join('\n') || '',
  });

  const [files, setFiles] = useState({
    profilePhoto: null,
    resume: null,
    cnicImages: [],
  });

  const [certifications, setCertifications] = useState(
    (user?.certifications || []).map(c => ({ title: c.title || '', imageFile: null, preview: c.imageUrl || '' }))
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e, key, multiple = false) => {
    const selected = e.target.files;
    if (!selected) return;
    if (multiple) {
      setFiles(prev => ({ ...prev, [key]: [...prev[key], ...Array.from(selected)] }));
    } else {
      setFiles(prev => ({ ...prev, [key]: selected[0] }));
    }
  };

  const removeFromList = (key, index) => {
    setFiles(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
  };

  const addCertification = () => {
    setCertifications(prev => [...prev, { title: '', imageFile: null, preview: '' }]);
  };

  const updateCertification = (idx, patch) => {
    setCertifications(prev => prev.map((c, i) => i === idx ? { ...c, ...patch } : c));
  };

  const removeCertification = (idx) => {
    setCertifications(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      // basic fields
      Object.entries({ ...form, achievements: form.achievements }).forEach(([k, v]) => fd.append(k, v));

      if (files.profilePhoto) fd.append('profilePhoto', files.profilePhoto);
      if (files.resume) fd.append('resume', files.resume);
      files.cnicImages.forEach(f => fd.append('cnicImages', f));

      // Certifications: collect titles and images
      const titles = certifications.map(c => c.title);
      fd.append('certifications', JSON.stringify(titles));
      certifications.forEach(c => {
        if (c.imageFile) fd.append('certificationImages', c.imageFile);
      });

      const res = await axios.post(`${USER_API_END_POINT}/profile/update`, fd, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        dispatch(setuser(res.data.user));
        toast.success('Profile updated');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-6">Update Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input name="fullname" value={form.fullname} onChange={handleChange} />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
              </div>
              <div>
                <Label>Age</Label>
                <Input name="age" type="number" value={form.age} onChange={handleChange} />
              </div>
              <div>
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm(prev => ({ ...prev, gender: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label>Bio</Label>
                <Textarea name="bio" value={form.bio} onChange={handleChange} rows={3} />
              </div>
              <div className="md:col-span-2">
                <Label>Skills (comma separated)</Label>
                <Input name="skills" value={form.skills} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Address</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Address Line 1</Label>
                <Input name="addressLine1" value={form.addressLine1} onChange={handleChange} />
              </div>
              <div>
                <Label>Address Line 2</Label>
                <Input name="addressLine2" value={form.addressLine2} onChange={handleChange} />
              </div>
              <div>
                <Label>City</Label>
                <Input name="city" value={form.city} onChange={handleChange} />
              </div>
              <div>
                <Label>State</Label>
                <Input name="state" value={form.state} onChange={handleChange} />
              </div>
              <div>
                <Label>Country</Label>
                <Input name="country" value={form.country} onChange={handleChange} />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input name="postalCode" value={form.postalCode} onChange={handleChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Profile & Documents</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Profile Photo</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleFile(e, 'profilePhoto')} />
                <div className="mt-2">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user?.profile?.profilePhoto} />
                  </Avatar>
                </div>
              </div>
              <div>
                <Label>Resume (PDF)</Label>
                <Input type="file" accept="application/pdf" onChange={(e) => handleFile(e, 'resume')} />
              </div>
              <div className="md:col-span-2">
                <Label>CNIC Images</Label>
                <Input type="file" accept="image/*" multiple onChange={(e) => handleFile(e, 'cnicImages', true)} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {files.cnicImages.map((f, i) => (
                    <div key={i} className="relative w-20 h-20">
                      <img src={URL.createObjectURL(f)} className="w-20 h-20 object-cover rounded" />
                      <button type="button" className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6" onClick={() => removeFromList('cnicImages', i)}>x</button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Certifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {certifications.map((c, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 items-end gap-3 p-3 border rounded">
                  <div className="md:col-span-6">
                    <Label>Title</Label>
                    <Input value={c.title} onChange={(e) => updateCertification(idx, { title: e.target.value })} placeholder="e.g. OSHA 30, CompTIA A+" />
                  </div>
                  <div className="md:col-span-4">
                    <Label>Certificate Image</Label>
                    <Input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) updateCertification(idx, { imageFile: file, preview: URL.createObjectURL(file) });
                    }} />
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <Button type="button" variant="outline" onClick={() => removeCertification(idx)}>
                      <Trash2 className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  </div>
                  {c.preview && (
                    <div className="md:col-span-12">
                      <img src={c.preview} alt="preview" className="h-24 rounded" />
                    </div>
                  )}
                </div>
              ))}
              <Button type="button" variant="secondary" onClick={addCertification}>
                <Plus className="w-4 h-4 mr-1" /> Add Certification
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
            <CardContent>
              <Label>List your achievements (one per line)</Label>
              <Textarea name="achievements" value={form.achievements} onChange={handleChange} rows={6} placeholder={"Achievement 1\nAchievement 2"} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="min-w-36">
              {saving ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfilePage;
