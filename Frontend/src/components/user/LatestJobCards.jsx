import React from 'react';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { MapPin, Building2, DollarSign, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/app/technician/description/${job._id}`)}
      className={cn(
        "card-elevated p-6 cursor-pointer hover-lift transition-all duration-300",
        "animate-fade-in-up group"
      )}
    >
      {/* Header */}
      <div className="mb-4">
        <h1 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
          {job?.title}
        </h1>
        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <p className="text-sm">{job?.address}</p>
        </div>
      </div>

      {/* Company Info */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-lg text-foreground">
            {job?.Company?.name}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {job?.description}
        </p>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant="info"
          className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200"
        >
          <Briefcase className="h-3 w-3 mr-1" />
          {job?.requirments}
        </Badge>
        <Badge
          variant="warning"
          className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200"
        >
          {job?.jobType}
        </Badge>
        <Badge
          variant="success"
          className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
        >
          <DollarSign className="h-3 w-3 mr-1" />
          {job?.Salary}
        </Badge>
      </div>
    </div>
  );
};

export default LatestJobCards;
