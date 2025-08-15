// JobDetails.jsx
import React from 'react';
import VoiceNotePlayer from '@/components/shared/VoiceNotePlayer';

const sanitizeHtml = (html) => {
  if (!html) return '';
  let safe = html
    .replace(/<\/(script|style)>/gi, '')
    .replace(/<\s*(script|style)[\s\S]*?>[\s\S]*?<\s*\/\s*(script|style)\s*>/gi, '')
    .replace(/ on\w+="[^"]*"/gi, '')
    .replace(/ on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
  return safe;
};

const Section = ({ title, children }) => (
  <section className="my-6">
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <div className="text-gray-800">{children}</div>
  </section>
);

const JobDetails = ({ job, clientName, projectName, jobType, formatDate }) => {
    return (
    <div className="bg-white p-8 shadow-lg rounded-2xl border border-gray-100 transition-all duration-300 hover:shadow-xl">
            {job ? (
                <>
          <Section title="Title">
            <p>{job?.title || '---'}</p>
          </Section>

          <Section title="Job Description">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(job?.description || '') }} />
          </Section>

          {/* Voice Notes Section */}
          {job?.voiceNotes && job.voiceNotes.length > 0 && (
            <Section title="Voice Notes">
              <VoiceNotePlayer 
                voiceNotes={job.voiceNotes}
                showTitle={false}
                className="mt-4"
              />
            </Section>
          )}

          <Section title="Client">
            <p>{clientName}</p>
          </Section>

          <Section title="Project">
            <p>{projectName}</p>
          </Section>

          <Section title="Job Type">
            <p className="capitalize">{jobType}</p>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="ETA Start Time"><p>{formatDate(job?.startTime)}</p></Section>
            <Section title="ETA End Time"><p>{formatDate(job?.endTime)}</p></Section>
          </div>

          <Section title="Address">
            <div className="text-gray-700">
              <p>{job?.location?.street || '---'}</p>
              <p>{[job?.location?.city, job?.location?.state, job?.location?.postalCode].filter(Boolean).join(', ')}</p>
              <p>{job?.location?.country}</p>
            </div>
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {(job?.skills || []).map((s, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-sm border border-blue-100">{s}</span>
                ))}
                {(!job?.skills || job.skills.length === 0) && <span>---</span>}
              </div>
            </Section>
            <Section title="Required Tools">
              <div className="flex flex-wrap gap-2">
                {(job?.requiredTools || []).map((t, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-green-50 text-green-700 text-sm border border-green-100">{t}</span>
                ))}
                {(!job?.requiredTools || job.requiredTools.length === 0) && <span>---</span>}
              </div>
            </Section>
          </div>

          {job?.selectionRules && (
            <Section title="Selection Criteria">
              <div className="space-y-1 text-sm text-gray-700">
                {job.selectionRules.requiredDegrees?.length > 0 && (
                  <p><strong>Degrees:</strong> {job.selectionRules.requiredDegrees.join(', ')}</p>
                )}
                {job.selectionRules.requiredCertifications?.length > 0 && (
                  <p><strong>Certifications:</strong> {job.selectionRules.requiredCertifications.join(', ')}</p>
                )}
                {job.selectionRules.requiredTools?.length > 0 && (
                  <p><strong>Tools:</strong> {job.selectionRules.requiredTools.join(', ')}</p>
                )}
                {job.selectionRules.minimumExperience && (
                  <p><strong>Min Experience:</strong> {job.selectionRules.minimumExperience} years</p>
                )}
                {job.selectionRules.mustHavePortfolio && (
                  <p><strong>Portfolio Required:</strong> Yes</p>
                )}
              </div>
            </Section>
          )}

          {Array.isArray(job?.tasks) && job.tasks.length > 0 && (
            <Section title="Tasks">
              <div className="space-y-2">
                {job.tasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-4 h-4 rounded-full border-2 ${task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}></div>
                    <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{task.description}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {job?.workOrderNotes && (
            <Section title="Work Order Notes">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.workOrderNotes) }} />
              </div>
            </Section>
          )}

          {Array.isArray(job?.workOrderImages) && job.workOrderImages.length > 0 && (
            <Section title="Deliverables">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {job.workOrderImages.map((img, i) => (
                  <img key={i} src={img} className="w-full h-28 object-cover rounded border cursor-pointer hover:opacity-90" onClick={() => window.open(img, '_blank')} />
                ))}
              </div>
            </Section>
          )}

          {Array.isArray(job?.shipments) && job.shipments.length > 0 && (
            <Section title="Shipments">
              <div className="space-y-2 text-sm">
                {job.shipments.map((s, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium">Shipment #{s.shipmentNumber}</span>
                      <span className="text-gray-600">{s.status}</span>
                    </div>
                    {s.trackingId && <p>Tracking: {s.trackingId}</p>}
                    {s.picture && <img src={s.picture} className="mt-2 w-20 h-20 object-cover rounded" />}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {job?.completionRequirements && (
            <Section title="Completion Requirements">
              <ul className="list-disc ml-6 text-sm text-gray-700">
                <li>Notes Required: {job.completionRequirements.notesRequired ? 'Yes' : 'No'}</li>
                <li>Images Required: {job.completionRequirements.imagesRequired ? 'Yes' : 'No'}</li>
                <li>Deliverables Required: {job.completionRequirements.deliverablesRequired ? 'Yes' : 'No'}</li>
              </ul>
            </Section>
          )}
                </>
            ) : (
                <p className="text-center text-gray-600">No job details available.</p>
            )}
        </div>
    );
};

export default JobDetails;