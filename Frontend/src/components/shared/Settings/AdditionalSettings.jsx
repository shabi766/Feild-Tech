import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, CreditCard, Save } from "lucide-react";

const AdditionalSettings = ({ 
  settings, 
  handleSubmit, 
  handleNestedChange, 
  handleAddCertification,
  handleRemoveCertification,
  handleCertificationChange,
  handleAddCourse,
  handleRemoveCourse,
  handleCourseChange,
  isSaving 
}) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Certifications & Skills
          </CardTitle>
          <CardDescription>
            Add your professional certifications and completed courses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Certifications
              </label>
              {(settings.certifications || []).map((cert, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => handleCertificationChange(e, index)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter certification name"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveCertification(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={handleAddCertification} variant="outline" className="mt-2">
                <Award className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Courses & Training
              </label>
              {(settings.courses || []).map((course, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => handleCourseChange(e, index)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter course name"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveCourse(index)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={handleAddCourse} variant="outline" className="mt-2">
                <BookOpen className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>

            <Button type="submit" disabled={isSaving} className="w-full">
              Save Additional Information
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Social Links
          </CardTitle>
          <CardDescription>
            Connect your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={settings.socialLinks?.linkedin || ''}
                  onChange={(e) => handleNestedChange('socialLinks', 'linkedin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter Profile
                </label>
                <input
                  type="url"
                  value={settings.socialLinks?.twitter || ''}
                  onChange={(e) => handleNestedChange('socialLinks', 'twitter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Profile
              </label>
              <input
                type="url"
                value={settings.socialLinks?.github || ''}
                onChange={(e) => handleNestedChange('socialLinks', 'github', e.target.value)}
                className="w-full px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://github.com/yourusername"
              />
            </div>

            <Button type="submit" disabled={isSaving} className="w-full">
              Save Social Links
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdditionalSettings;
