import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from "@/lib/utils";
import VoiceMessage from '@/components/shared/VoiceMessage';
import { Mic, Play, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

const JobDescriptionStep = ({ input, setInput, nextStep, prevStep }) => {
  const [description, setDescription] = useState(input.description || '');
  const [confidential, setConfidential] = useState(input.confidential || '');
  const [voiceNotes, setVoiceNotes] = useState(input.voiceNotes || []);

  useEffect(() => {
    setDescription(input.description || '');
  }, [input.description]);

  useEffect(() => {
    setConfidential(input.confidential || '');
  }, [input.confidential]);

  useEffect(() => {
    setVoiceNotes(input.voiceNotes || []);
  }, [input.voiceNotes]);

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

  const handleVoiceNoteAdd = (audioBlob, duration) => {
    const newVoiceNote = {
      id: Date.now(),
      audioBlob,
      duration,
      timestamp: new Date().toISOString(),
      size: (audioBlob.size / 1024 / 1024).toFixed(2)
    };
    
    const updatedVoiceNotes = [...voiceNotes, newVoiceNote];
    setVoiceNotes(updatedVoiceNotes);
    setInput({ ...input, voiceNotes: updatedVoiceNotes });
    
    toast.success(`Voice note added (${duration}s)`);
  };

  const handleVoiceNoteDelete = (noteId) => {
    const updatedVoiceNotes = voiceNotes.filter(note => note.id !== noteId);
    setVoiceNotes(updatedVoiceNotes);
    setInput({ ...input, voiceNotes: updatedVoiceNotes });
    
    toast.success("Voice note removed");
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

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

      {/* Voice Notes Section */}
      <div className="space-y-4 mb-8">
        <Label className="text-md font-semibold text-gray-700">
          Voice Notes <span className="text-gray-400 font-normal italic">(Optional)</span>
        </Label>
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-5 h-5 text-blue-600" />
              <p className="text-sm font-medium text-blue-800">
                Record additional details, clarifications, or specific instructions about this job
              </p>
            </div>
            <p className="text-xs text-blue-600">
              Perfect for when you want to add personal context, tone, or detailed explanations that are easier to speak than type.
            </p>
          </div>
          
          {/* Voice Note Recorder */}
          <VoiceMessage 
            onSendMessage={handleVoiceNoteAdd}
            placeholder="Record additional job details, clarifications, or specific instructions..."
            className="text-sm"
          />

          {/* Display Existing Voice Notes */}
          {voiceNotes.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Recorded Voice Notes ({voiceNotes.length})
              </h4>
              
              {voiceNotes.map((note) => (
                <div key={note.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-2 flex-1">
                    <Mic className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Voice Note ({formatDuration(note.duration)})
                    </span>
                    <span className="text-xs text-gray-500">
                      {note.size} MB • {new Date(note.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const audio = new Audio(URL.createObjectURL(note.audioBlob));
                        audio.play();
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Play voice note"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVoiceNoteDelete(note.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete voice note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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