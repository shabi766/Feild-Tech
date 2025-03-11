// JobDetailsStep.js
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSelector } from 'react-redux';
import { useFetchProjectsByClient } from '@/components/Hooks/useFetchProjectsByClient';

const JobDetailsStep = ({ input, setInput, nextStep }) => {
    const { clients } = useSelector(store => store.client);
    const { projects, loading: projectLoading, error: projectError } = useFetchProjectsByClient(input.client);

    return (
        <div>
            <h2 className="font-bold text-lg mb-2">Title</h2>
            <div>
                <Label>Title</Label>
                <Input type="text" name="title" value={input.title} onChange={(e) => setInput({ ...input, title: e.target.value })} className="my-2" />
            </div>
            <div>
                <Label>Template</Label>
                <Select onValueChange={(value) => setInput({ ...input, template: value })}>
                    <SelectTrigger><SelectValue placeholder="Select Template" /></SelectTrigger>
                    <SelectContent><SelectGroup>
                        <SelectItem value="Template1">Template 1</SelectItem>
                        <SelectItem value="Template2">Template 2</SelectItem>
                        <SelectItem value="Template3">Template 3</SelectItem>
                    </SelectGroup></SelectContent>
                </Select>
            </div>
            <div>
                <div className='mb-4'>
                    <label htmlFor='client' className='block text-sm font-medium text-gray-700'>
                        Select Client <span className='text-red-500'>*</span>
                    </label>
                    <select id='client' className='mt-1 block w-full border border-gray-300 rounded-md p-2' name='clientName'
                        value={input.client} onChange={(e) => setInput({ ...input, client: e.target.value })} required>
                        <option value=''>Select a client</option>
                        {clients.map((client) => (<option key={client._id} value={client._id}>{client.name}</option>))}
                    </select>
                </div>
                {projectLoading ? (<p>Loading projects...</p>) : projectError ? (
                    <p className="text-red-500">{projectError}</p>) : (
                    <div className='mb-4'>
                        <label htmlFor='project' className='block text-sm font-medium text-gray-700'>
                            Select Project <span className='text-red-500'>*</span>
                        </label>
                        {projects.length > 0 ? (
                            <select id='project' className='mt-1 block w-full border border-gray-300 rounded-md p-2' name='projectName'
                                value={input.projectId} onChange={(e) => setInput({ ...input, projectId: e.target.value })} required>
                                <option value=''>Select a project</option>
                                {projects.map((project) => (<option key={project._id} value={project._id}>{project.name}</option>))}
                            </select>
                        ) : (<p className="text-sm text-gray-500">No projects registered under this client.</p>)}
                    </div>
                )}
            </div>
            <button onClick={nextStep} className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-md">Continue</button>
        </div>
    );
};

export default JobDetailsStep;