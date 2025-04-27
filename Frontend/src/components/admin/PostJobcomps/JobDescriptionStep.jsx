import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label'; // Assuming this path is correct
import { Input } from '@/components/ui/input'; // Assuming this path is correct
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from "@/lib/utils"; // Assuming this path is correct

const JobDescriptionStep = ({ input, setInput, nextStep, prevStep }) => {
  const [description, setDescription] = useState(input.description);
  const [confidential, setConfidential] = useState(input.confidential);

  useEffect(() => {
    setDescription(input.description);
  }, [input.description]);

  useEffect(() => {
    setConfidential(input.confidential);
  }, [input.confidential]);

  const handleDescriptionChange = (value) => {
    setDescription(value);
    setInput({ ...input, description: value });
  };

  const handleConfidentialChange = (value) => {
    setConfidential(value);
    setInput({ ...input, confidential: value });
  };

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'header',
    'list', 'script', 'indent', 'direction',
    'size', 'color', 'background', 'font', 'align',
    'link', 'image', 'video'
  ];

  return (
    <div>
      
      <div style={{ display: 'grid', gridTemplateRows: 'repeat(5, minmax(0, 1fr))', marginBottom: '1rem' }}>
        <Label style={{ gridRow: '1' }}>Description</Label>
        <div style={{ gridRow: '2 / span 4', overflowY: 'auto' }}>
          <ReactQuill
            value={description}
            onChange={handleDescriptionChange}
            modules={modules}
            formats={formats}
            className="my-2"
            style={{ minHeight: '100%', boxSizing: 'border-box' }} // Ensure it fills the grid area
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateRows: 'repeat(5, minmax(0, 1fr))', marginBottom: '1rem' }}>
        <Label style={{ gridRow: '1' }}>Confidential information (optional)</Label>
        <div style={{ gridRow: '2 / span 4', overflowY: 'auto' }}>
          <ReactQuill
            value={confidential}
            onChange={handleConfidentialChange}
            modules={modules}
            formats={formats}
            className="my-2"
            style={{ minHeight: '100%', boxSizing: 'border-box' }} // Ensure it fills the grid area
          />
        </div>
      </div>

      <div>
        <Label>Required Tools</Label>
        <Input
          type="text"
          name="requiredTools"
          value={input.requiredTools}
          onChange={(e) => setInput({ ...input, requiredTools: e.target.value })}
          placeholder="add multiple tools by separating using commas"
          className="my-2 w-[400px]"
        />
      </div>
      <div>
        <Label>Skills</Label>
        <Input
          type="text"
          name="skills"
          value={input.skills}
          onChange={(e) => setInput({ ...input, skills: e.target.value })}
          placeholder="add multiple tools by separating using commas"
          className="my-2 w-[400px]"
        />
      </div>
    </div>
  );
};

export default JobDescriptionStep;