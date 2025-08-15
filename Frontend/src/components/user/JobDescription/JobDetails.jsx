import React from "react";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Paperclip, Image as ImageIcon } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import VoiceMessage from "@/components/shared/VoiceMessage";
import VoiceNotePlayer from "@/components/shared/VoiceNotePlayer";
import { useTranslation } from '@/Hooks/useTranslation';

const sanitizeHtml = (html) => {
    if (!html) return '';
    // Remove script/style tags and inline event handlers
    let safe = html.replace(/<\/(script|style)>/gi, '')
                   .replace(/<\s*(script|style)[\s\S]*?>[\s\S]*?<\s*\/\s*(script|style)\s*>/gi, '')
                   .replace(/ on\w+="[^"]*"/gi, '')
                   .replace(/ on\w+='[^']*'/gi, '')
                   .replace(/javascript:/gi, '');
    return safe;
};

// Function to translate HTML content
const translateHtmlContent = (html, t) => {
    if (!html) return '';
    
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Function to recursively translate text nodes
    const translateTextNodes = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text) {
                // Try to translate the text, fallback to original if no translation found
                const translated = t(text) || text;
                node.textContent = translated;
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Recursively process child nodes
            Array.from(node.childNodes).forEach(translateTextNodes);
        }
    };
    
    // Process all text nodes in the HTML
    translateTextNodes(tempDiv);
    
    return tempDiv.innerHTML;
};

const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, 4, false] }],
      [{ align: [] }],
      ['link'],
      ['clean'],
    ],
};

const quillFormats = [
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'header', 'align', 'link', 'clean'
];

const JobDetails = ({
    singleJob,
    isAssignedTechnician,
    notes,
    deliverables,
    uploadLoading,
    onNotesChange,
    onFileUpload,
    onSaveNotes,
    fileInputRef
}) => {
    const { t, currentLanguage } = useTranslation();
    
    // Re-translate content when language changes
    const [translatedDescription, setTranslatedDescription] = React.useState('');
    const [translatedWorkOrderNotes, setTranslatedWorkOrderNotes] = React.useState('');
    
    React.useEffect(() => {
        if (singleJob?.description) {
            setTranslatedDescription(translateHtmlContent(sanitizeHtml(singleJob.description), t));
        }
        if (singleJob?.workOrderNotes) {
            setTranslatedWorkOrderNotes(translateHtmlContent(sanitizeHtml(singleJob.workOrderNotes), t));
        }
    }, [singleJob?.description, singleJob?.workOrderNotes, currentLanguage, t]);
    
    return (
        <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <span className="mr-2">📄</span>
                        {t('jobDescription')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Voice Notes Section */}
                    {singleJob?.voiceNotes && singleJob.voiceNotes.length > 0 && (
                        <div className="mb-4">
                            <VoiceNotePlayer 
                                voiceNotes={singleJob.voiceNotes}
                                title={t('voiceNote')}
                                className="mb-4"
                            />
                        </div>
                    )}
                    
                    {/* Voice Note Recording Section (for applicants to add notes) */}
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h4 className="text-sm font-semibold text-blue-900">{t('addVoiceNote')}</h4>
                                <p className="text-xs text-blue-700">{t('recordAdditionalJobDetails')}</p>
                            </div>
                        </div>
                        
                        <VoiceMessage 
                            onSendMessage={(audioBlob, duration) => {
                                console.log('Voice message received:', { audioBlob, duration });
                                // You can implement file upload or send to chat here
                            }}
                            placeholder={t('recordAdditionalJobDetails')}
                            className="text-sm"
                        />
                    </div>
                    
                    <div
                        className="prose max-w-none text-gray-800"
                        dangerouslySetInnerHTML={{ __html: translatedDescription }}
                    />
                </CardContent>
            </Card>

            {/* Skills & Requirements */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <span className="mr-2">🛠️</span>
                        {t('skillsAndRequirements')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {singleJob?.skills && singleJob.skills.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{t('requiredSkills')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {singleJob.skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {singleJob?.requiredTools && singleJob.requiredTools.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{t('requiredTools')}</h4>
                            <div className="flex flex-wrap gap-2">
                                {singleJob.requiredTools.map((tool, index) => (
                                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                                        {tool}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {singleJob?.experience && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{t('experienceRequired')}</h4>
                            <p className="text-gray-700">{singleJob.experience} {t('years')}</p>
                        </div>
                    )}

                    {singleJob?.selectionRules && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">{t('selectionCriteria')}</h4>
                            <div className="space-y-2">
                                {singleJob.selectionRules.requiredDegrees && singleJob.selectionRules.requiredDegrees.length > 0 && (
                                    <p className="text-sm text-gray-600">
                                        <strong>{t('requiredDegrees')}:</strong> {singleJob.selectionRules.requiredDegrees.join(', ')}
                                    </p>
                                )}
                                {singleJob.selectionRules.requiredCertifications && singleJob.selectionRules.requiredCertifications.length > 0 && (
                                    <p className="text-sm text-gray-600">
                                        <strong>{t('requiredCertifications')}:</strong> {singleJob.selectionRules.requiredCertifications.join(', ')}
                                    </p>
                                )}
                                {singleJob.selectionRules.minimumExperience && (
                                    <p className="text-sm text-gray-600">
                                        <strong>{t('minimumExperience')}:</strong> {singleJob.selectionRules.minimumExperience} {t('years')}
                                    </p>
                                )}
                                {singleJob.selectionRules.mustHavePortfolio && (
                                    <p className="text-sm text-gray-600">
                                        <strong>{t('portfolioRequired')}:</strong> {t('yes')}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tasks */}
            {singleJob?.tasks && singleJob.tasks.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📋</span>
                            {t('tasks')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {singleJob.tasks.map((task, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className={`w-4 h-4 rounded-full border-2 ${
                                        task.completed 
                                            ? 'bg-green-500 border-green-500' 
                                            : 'border-gray-300'
                                    }`}>
                                        {task.completed && (
                                            <svg className="w-2 h-2 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                        {task.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Work Order Notes */}
            {singleJob?.workOrderNotes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📝</span>
                            {t('workOrderNotes')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div
                                className="prose max-w-none text-gray-800"
                                dangerouslySetInnerHTML={{ __html: translatedWorkOrderNotes }}
                            />
                            {singleJob.doneTime && (
                                <p className="text-sm text-gray-500 mt-2">
                                    {t('completedOn')}: {new Date(singleJob.doneTime).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Work Order Deliverables */}
            {singleJob?.workOrderImages && singleJob.workOrderImages.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center">
                                <span className="mr-2">📸</span>
                                {t('workOrderDeliverables')}
                            </span>
                            {isAssignedTechnician && singleJob.status === 'Done' && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadLoading}
                                    className="flex items-center space-x-2"
                                >
                                    <Paperclip className="h-4 w-4" />
                                    <span>{uploadLoading ? t('uploading') : t('addMore')}</span>
                                </Button>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {singleJob.workOrderImages.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={image}
                                        alt={`Deliverable ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(image, '_blank')}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                                        <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {singleJob.doneTime && (
                            <p className="text-sm text-gray-500 mt-3">
                                {t('completedOn')}: {new Date(singleJob.doneTime).toLocaleString()}
                            </p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Add Deliverables Section for In Progress Jobs */}
            {isAssignedTechnician && singleJob.status === 'In Progress' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📸</span>
                            {t('addWorkProgressImages')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={onFileUpload}
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadLoading}
                                    className="flex items-center space-x-2"
                                >
                                    <Paperclip className="h-4 w-4" />
                                    <span>{uploadLoading ? t('uploading') : t('uploadProgressImages')}</span>
                                </Button>
                            </div>
                            <p className="text-sm text-gray-500">
                                {t('uploadProgressImagesDescription')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Add Notes Section for In Progress Jobs */}
            {isAssignedTechnician && singleJob.status === 'In Progress' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📝</span>
                            {t('addWorkProgressNotes')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <ReactQuill
                                value={notes}
                                onChange={onNotesChange}
                                modules={quillModules}
                                formats={quillFormats}
                                theme="snow"
                            />
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onSaveNotes}
                                >
                                    {t('saveNotes')}
                                </Button>
                            </div>
                            <p className="text-sm text-gray-500">
                                {t('addWorkProgressNotesDescription')}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Shipments */}
            {singleJob?.shipments && singleJob.shipments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">📦</span>
                            {t('shipments')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {singleJob.shipments.map((shipment, index) => (
                                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold">{t('shipment')} #{shipment.shipmentNumber}</h4>
                                        <Badge variant="outline">{shipment.status}</Badge>
                                    </div>
                                    {shipment.trackingId && (
                                        <p className="text-sm text-gray-600">{t('tracking')}: {shipment.trackingId}</p>
                                    )}
                                    {shipment.picture && (
                                        <img src={shipment.picture} alt="Shipment" className="mt-2 w-20 h-20 object-cover rounded" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Custom Fields */}
            {singleJob?.customFields && singleJob.customFields.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <span className="mr-2">⚙️</span>
                            {t('additionalInformation')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {singleJob.customFields.map((field, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                    <h4 className="font-medium text-gray-900 mb-1">{field.label}</h4>
                                    <p className="text-gray-700">{field.value}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default JobDetails;
