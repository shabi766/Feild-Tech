import React, { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSelector, useDispatch } from 'react-redux';
import { useFetchProjectsByClient } from '@/components/Hooks/useFetchProjectsByClient';
import useGetAllClients from '@/components/Hooks/useGetAllClients'; // Assuming this is the correct path

const JobDetailsStep = ({ input, setInput, nextStep }) => {
  const dispatch = useDispatch();
  const { clients, loading: clientsLoading, error: clientsError } = useSelector(store => store.client);
  const { projects, loading: projectLoading, error: projectError } = useFetchProjectsByClient(input.client);

  // Call the hook to fetch all clients when the component mounts
  useGetAllClients();

  return (
    <div>
      
      <div className="mb-4">
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={input.title}
          onChange={(e) => setInput({ ...input, title: e.target.value })}
          className="mt-1 w-full"
          placeholder="Enter job title"
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="template">Template (optional)</Label>
        <Select onValueChange={(value) => setInput({ ...input, template: value })}>
          <SelectTrigger className="w-full">
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
      </div>
      <div className="mb-4">
        <Label htmlFor="client" className="block text-sm font-medium text-gray-700">
          Select Client <span className="text-red-500">*</span>
        </Label>
        {clientsLoading ? (
          <p className="text-sm text-gray-500">Loading clients...</p>
        ) : clientsError ? (
          <p className="text-red-500">{clientsError}</p>
        ) : (
          <select
            id="client"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            name="clientName"
            value={input.client}
            onChange={(e) => setInput({ ...input, client: e.target.value })}
            required
          >
            <option value="">Select a client</option>
            {Array.isArray(clients) && clients.map((client) => (
              <option key={client._id} value={client._id}>{client.name}</option>
            ))}
          </select>
        )}
      </div>

      {input.client && (
        <div className="mb-4">
          <Label htmlFor="project" className="block text-sm font-medium text-gray-700">
            Select Project <span className="text-red-500">*</span>
          </Label>
          {projectLoading ? (
            <p className="text-sm text-gray-500">Loading projects...</p>
          ) : projectError ? (
            <p className="text-red-500">{projectError}</p>
          ) : (
            projects.length > 0 ? (
              <select
                id="project"
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                name="projectName"
                value={input.projectId}
                onChange={(e) => setInput({ ...input, projectId: e.target.value })}
                required
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>{project.name}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500">No projects registered under this client.</p>
            )
          )}
        </div>
      )}

      <div className="mb-4">
        <Label htmlFor="incidentId">Incident/SiteID (optional)</Label>
        <Input
          type="text"
          id="incidentId"
          name="incidentId"
          value={input.IncidentID}
          onChange={(e) => setInput({ ...input, IncidentID: e.target.value })}
          className="mt-1 w-full"
          placeholder="Enter Incident/SiteID"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="teams">Teams (optional)</Label>
        <Select onValueChange={(value) => setInput({ ...input, Teams: value })} className="w-full">
          <SelectTrigger className="w-full">
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
      </div>

     
    </div>
  );
};

export default JobDetailsStep;