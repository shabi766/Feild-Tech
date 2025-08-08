import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut } from "lucide-react";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-2 text-gray-700">
      <Icon className="w-4 h-4 text-gray-500" />
      <span className="text-sm">{label}</span>
    </div>
    <span className="text-sm font-medium text-gray-900">{value}</span>
  </div>
);

const JobActivity = ({ job, formatDate, calculateTotalTime }) => {
  if (!job) return null;

  const checkIn = job?.checkinTime ? formatDate(job.checkinTime) : "N/A";
  const checkOut = job?.checkoutTime ? formatDate(job.checkoutTime) : "N/A";
  const total = job?.checkinTime && job?.checkoutTime
    ? calculateTotalTime(job.checkinTime, job.checkoutTime)
    : "N/A";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-600" />
          Activity & Logs
          {job?.status && (
            <Badge variant="outline" className="ml-2 capitalize">{job.status}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-100">
          <InfoRow icon={LogIn} label="Check-in" value={checkIn} />
          <InfoRow icon={LogOut} label="Check-out" value={checkOut} />
          <InfoRow icon={Clock} label="Total Time" value={total} />
        </div>
      </CardContent>
    </Card>
  );
};

export default JobActivity;


