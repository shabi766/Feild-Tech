import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from "@/lib/utils";

const JobDescriptionStep = ({ input, setInput, nextStep, prevStep }) => {
  const [description, setDescription] = useState(input.description || '');
  const [confidential, setConfidential] = useState(input.confidential || '');

  useEffect(() => {
    setDescription(input.description || '');
  }, [input.description]);

  useEffect(() => {
    setConfidential(input.confidential || '');
  }, [input.confidential]);

  const handleDescriptionChange = (value) => {
    setDescription(value);
    setInput({ ...input, description: value });
  };

  const handleConfidentialChange = (value) => {
    setConfidential(value);
    setInput({ ...input, confidential: value });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInput({ ...input, [name]: value });
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'header': [1, 2, 3, 4, false] }],
      [{ 'align': [] }],
      ['link'],
      ['clean'],
    ]
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'header', 'align', 'link',
    'clean'
  ];

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
        Job Details
      </h2>
      <p className="text-gray-500 mb-8">
        Craft a detailed description of the job and specify any required skills or tools.
      </p>

      {/* Job Description Section */}
      <div className="space-y-4 mb-8">
        <Label htmlFor="jobDescription" className="text-md font-semibold text-gray-700">
          Job Description
        </Label>
        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <ReactQuill
            id="jobDescription"
            value={description}
            onChange={handleDescriptionChange}
            modules={modules}
            formats={formats}
            theme="snow"
            className="h-64"
          />
        </div>
      </div>

      {/* Confidential Information Section */}
      <div className="space-y-4 mb-8">
        <Label htmlFor="confidentialInfo" className="text-md font-semibold text-gray-700">
          Confidential Information <span className="text-gray-400 font-normal italic">(Optional)</span>
        </Label>
        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <ReactQuill
            id="confidentialInfo"
            value={confidential}
            onChange={handleConfidentialChange}
            modules={modules}
            formats={formats}
            theme="snow"
            className="h-48"
          />
        </div>
      </div>

      {/* Required Tools Section */}
      <div className="space-y-4 mb-8">
        <Label htmlFor="requiredTools" className="text-md font-semibold text-gray-700">
          Required Tools
        </Label>
        <Input
          type="text"
          id="requiredTools"
          name="requiredTools"
          value={input.requiredTools}
          onChange={handleInputChange}
          placeholder="e.g., Jira, Trello, Figma"
          className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500">
          Separate multiple tools with a comma.
        </p>
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <Label htmlFor="skills" className="text-md font-semibold text-gray-700">
          Skills
        </Label>
        <Input
          type="text"
          id="skills"
          name="skills"
          value={input.skills}
          onChange={handleInputChange}
          placeholder="e.g., JavaScript, React, Node.js"
          className="w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500">
          Separate multiple skills with a comma.
        </p>
      </div>
    </div>
  );
};

export default JobDescriptionStep;