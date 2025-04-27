import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSelector, useDispatch } from 'react-redux';
import { useFetchProjectsByClient } from '@/components/Hooks/useFetchProjectsByClient';
import useGetAllClients from '@/components/Hooks/useGetAllClients';

const JobDetailsStep = ({ input, setInput, nextStep }) => {
  const dispatch = useDispatch();
  const { clients, loading: clientsLoading, error: clientsError } = useSelector((store) => store.client);
  const { projects, loading: projectLoading, error: projectError } = useFetchProjectsByClient(input.client);
  const [focusedInput, setFocusedInput] = useState(null);

  useGetAllClients();

  const handleInputChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value, name) => {
    setInput({ ...input, [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-x-6 gap-y-6">
        <div className="relative">
          <Label htmlFor="title" className={`block text-sm font-medium text-gray-700 ${focusedInput === 'title' ? 'text-indigo-500' : ''}`}>
            Title
          </Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={input.title}
            onChange={handleInputChange}
            className={`mt-1 w-[400px] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${focusedInput === 'title' ? 'border-indigo-500' : ''}`}
            placeholder="Enter job title"
            onFocus={() => setFocusedInput('title')}
            onBlur={() => setFocusedInput(null)}
          />
          {focusedInput === 'title' && (
            <div className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"></div>
          )}
        </div>
        <div className="relative">
          <Label htmlFor="template" className={`block text-sm font-medium text-gray-700 ${focusedInput === 'template' ? 'text-indigo-500' : ''}`}>
            Template (optional)
          </Label>
          <Select onValueChange={(value) => handleSelectChange(value, 'template')}>
            <SelectTrigger
              className={`w-[400px] mt-1 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${focusedInput === 'template' ? 'border-indigo-500' : ''}`}
              onFocus={() => setFocusedInput('template')}
              onBlur={() => setFocusedInput(null)}
            >
              <SelectValue placeholder="Select Template" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Template1">Template 1</SelectItem>
                <SelectItem value="Template2">Template 2</SelectItem>
                <SelectItem value="Template3">Template 3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {focusedInput === 'template' && (
            <div className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"></div>
          )}
        </div>
        <div className="relative">
          <Label htmlFor="client" className={`block text-sm font-medium text-gray-700 ${focusedInput === 'client' ? 'text-indigo-500' : ''}`}>
            Select Client <span className="text-red-500">*</span>
          </Label>
          {clientsLoading ? (
            <p className="mt-1 text-sm text-gray-500">Loading clients...</p>
          ) : clientsError ? (
            <p className="mt-1 text-red-500">{clientsError}</p>
          ) : (
            <select
              id="client"
              className={`mt-1 block w-[400px] border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${focusedInput === 'client' ? 'border-indigo-500' : ''}`}
              name="client"
              value={input.client}
              onChange={handleInputChange}
              required
              onFocus={() => setFocusedInput('client')}
              onBlur={() => setFocusedInput(null)}
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
          {focusedInput === 'client' && (
            <div className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"></div>
          )}
        </div>
        <div className="relative">
          <Label htmlFor="incidentId" className={`block text-sm font-medium text-gray-700 ${focusedInput === 'incidentId' ? 'text-indigo-500' : ''}`}>
            Incident/SiteID (optional)
          </Label>
          <Input
            type="text"
            id="incidentId"
            name="IncidentID"
            value={input.IncidentID}
            onChange={handleInputChange}
            className={`mt-1 w-[400px] rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${focusedInput === 'incidentId' ? 'border-indigo-500' : ''}`}
            placeholder="Enter Incident/SiteID"
            onFocus={() => setFocusedInput('incidentId')}
            onBlur={() => setFocusedInput(null)}
          />
          {focusedInput === 'incidentId' && (
            <div className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"></div>
          )}
        </div>

        {input.client && (
          <div className="relative">
            <Label htmlFor="project" className={`block text-sm font-medium text-gray-700 ${focusedInput === 'project' ? 'text-indigo-500' : ''}`}>
              Select Project <span className="text-red-500">*</span>
            </Label>
            {projectLoading ? (
              <p className="mt-1 text-sm text-gray-500">Loading projects...</p>
            ) : projectError ? (
              <p className="mt-1 text-red-500">{projectError}</p>
            ) : projects.length > 0 ? (
              <select
                id="project"
                className={`mt-1 block w-[400px] border border-gray-300 rounded-md p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${focusedInput === 'project' ? 'border-indigo-500' : ''}`}
                name="projectId"
                value={input.projectId}
                onChange={handleInputChange}
                required
                onFocus={() => setFocusedInput('project')}
                onBlur={() => setFocusedInput(null)}
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-1 text-sm text-gray-500">No projects registered under this client.</p>
            )}
            {focusedInput === 'project' && (
              <div className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"></div>
            )}
          </div>
        )}

        <div className="relative">
          <Label htmlFor="teams" className={`block text-sm font-medium text-gray-700 ${focusedInput === 'teams' ? 'text-indigo-500' : ''}`}>
            Teams (optional)
          </Label>
          <Select onValueChange={(value) => handleSelectChange(value, 'Teams')}>
            <SelectTrigger
              className={`w-[400px] mt-1 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 ${focusedInput === 'teams' ? 'border-indigo-500' : ''}`}
              onFocus={() => setFocusedInput('teams')}
              onBlur={() => setFocusedInput(null)}
            >
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Team1">Team 1</SelectItem>
                <SelectItem value="Team2">Team 2</SelectItem>
                <SelectItem value="Team3">Team 3</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          {focusedInput === 'teams' && (
            <div className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsStep;