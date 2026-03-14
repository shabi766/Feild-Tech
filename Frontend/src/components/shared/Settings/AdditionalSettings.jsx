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
    <div className="space-y-8 max-w-4xl text-left animate-fade-in">
      
      {/* Certifications & Skills */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Certifications & Skills
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Add your professional certifications and completed courses.</p>
        </div>

        <div className="card-elevated p-6 rounded-2xl max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-foreground">
                Certifications
              </label>
              {(settings.certifications || []).map((cert, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => handleCertificationChange(e, index)}
                    className="w-full flex-1 px-4 py-2.5 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="Enter certification name"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveCertification(index)}
                    variant="outline"
                    className="w-full sm:w-auto text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={handleAddCertification} variant="outline" className="w-full sm:w-auto rounded-xl border-dashed">
                <Award className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <label className="block text-sm font-medium text-foreground">
                Courses & Training
              </label>
              {(settings.courses || []).map((course, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => handleCourseChange(e, index)}
                    className="w-full flex-1 px-4 py-2.5 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    placeholder="Enter course name"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveCourse(index)}
                    variant="outline"
                    className="w-full sm:w-auto text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" onClick={handleAddCourse} variant="outline" className="w-full sm:w-auto rounded-xl border-dashed">
                <BookOpen className="w-4 h-4 mr-2" />
                Add Course
              </Button>
            </div>

            <Button type="submit" disabled={isSaving} className="rounded-xl px-6 w-auto mt-4">
              {isSaving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Education details
                </>
              )}
            </Button>
          </form>
        </div>
      </section>

      {/* Social Links */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" /> Social Links
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Connect your social media profiles.</p>
        </div>

        <div className="card-elevated p-6 rounded-2xl max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={settings.socialLinks?.linkedin || ''}
                  onChange={(e) => handleNestedChange('socialLinks', 'linkedin', e.target.value)}
                  className="w-full px-4 py-2.5 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Twitter Profile
                </label>
                <input
                  type="url"
                  value={settings.socialLinks?.twitter || ''}
                  onChange={(e) => handleNestedChange('socialLinks', 'twitter', e.target.value)}
                  className="w-full px-4 py-2.5 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                GitHub Profile
              </label>
              <input
                type="url"
                value={settings.socialLinks?.github || ''}
                onChange={(e) => handleNestedChange('socialLinks', 'github', e.target.value)}
                className="w-full px-4 py-2.5 border border-border bg-background rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                placeholder="https://github.com/yourusername"
              />
            </div>

            <Button type="submit" disabled={isSaving} className="rounded-xl px-6 w-auto">
               {isSaving ? (
                <>
                  <Save className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Social Links
                </>
              )}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default AdditionalSettings;
