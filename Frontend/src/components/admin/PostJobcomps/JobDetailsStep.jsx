import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSelector } from 'react-redux';
import { useFetchProjectsByClient } from '@/components/Hooks/useFetchProjectsByClient';
import useGetAllClients from '@/components/Hooks/useGetAllClients';
import { cn } from '@/lib/utils'; // Assuming this utility is available

const JobDetailsStep = ({ input, setInput }) => {
  const { clients, loading: clientsLoading, error: clientsError } = useSelector((store) => store.client);
  const { projects, loading: projectLoading, error: projectError } = useFetchProjectsByClient(input.client);
  const [focusedInput, setFocusedInput] = useState(null);

  useGetAllClients();

  const handleInputChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value, name) => {
    // If the client changes, reset the project to avoid mismatched data
    if (name === 'client') {
      setInput({ ...input, client: value, projectId: '' });
    } else {
      setInput({ ...input, [name]: value });
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">
        Job Details
      </h2>
      <p className="text-gray-500 mb-8">
        Provide essential information about the job, including the client and project details.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Title Field */}
        <div>
          <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
            Title
          </Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={input.title}
            onChange={handleInputChange}
            placeholder="e.g., HVAC Maintenance"
            className="mt-2 w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Template Field */}
        <div>
          <Label htmlFor="template" className="text-sm font-semibold text-gray-700">
            Template <span className="text-gray-400 font-normal italic">(optional)</span>
          </Label>
          <Select onValueChange={(value) => handleSelectChange(value, 'template')}>
            <SelectTrigger className="mt-2 w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectGroup>
                <SelectItem value="Template1">Template 1</SelectItem>
                <SelectItem value="Template2">Template 2</SelectItem>
                <SelectItem value="Template3">Template 3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Client Selection */}
        <div>
          <Label htmlFor="client" className="text-sm font-semibold text-gray-700">
            Select Client <span className="text-red-500">*</span>
          </Label>
          {clientsLoading ? (
            <p className="mt-2 text-sm text-gray-500">Loading clients...</p>
          ) : clientsError ? (
            <p className="mt-2 text-sm text-red-500">{clientsError}</p>
          ) : (
            <select
              id="client"
              name="client"
              value={input.client}
              onChange={handleInputChange}
              required
              className="mt-2 block w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a client</option>
              {Array.isArray(clients) &&
                clients.map((client) => (
                  <option key={client._id} value={client._id}>
                    {client.name}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Project Selection (Conditional) */}
        {input.client && (
          <div>
            <Label htmlFor="projectId" className="text-sm font-semibold text-gray-700">
              Select Project <span className="text-red-500">*</span>
            </Label>
            {projectLoading ? (
              <p className="mt-2 text-sm text-gray-500">Loading projects...</p>
            ) : projectError ? (
              <p className="mt-2 text-sm text-red-500">{projectError}</p>
            ) : projects.length > 0 ? (
              <select
                id="projectId"
                name="projectId"
                value={input.projectId}
                onChange={handleInputChange}
                required
                className="mt-2 block w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No projects found for this client.</p>
            )}
          </div>
        )}
        
        {/* Incident ID */}
        <div>
          <Label htmlFor="incidentId" className="text-sm font-semibold text-gray-700">
            Incident/Site ID <span className="text-gray-400 font-normal italic">(optional)</span>
          </Label>
          <Input
            type="text"
            id="incidentId"
            name="incidentId" // Corrected name to be consistent
            value={input.incidentId} // Corrected name to be consistent
            onChange={handleInputChange}
            placeholder="Enter Incident/Site ID"
            className="mt-2 w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Teams Field */}
        <div>
          <Label htmlFor="teams" className="text-sm font-semibold text-gray-700">
            Teams <span className="text-gray-400 font-normal italic">(optional)</span>
          </Label>
          <Select onValueChange={(value) => handleSelectChange(value, 'teams')}>
            <SelectTrigger className="mt-2 w-full rounded-lg bg-white border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
              <SelectValue placeholder="Select a team" />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectGroup>
                <SelectItem value="Team1">Team 1</SelectItem>
                <SelectItem value="Team2">Team 2</SelectItem>
                <SelectItem value="Team3">Team 3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsStep;