import React from 'react';
import { Card, CardContent, CardHeader } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import RatingStar from './RatingStar';
import { format } from 'date-fns';

const ReviewCard = ({ review }) => {
    const {
        ratedByUser,
        rating,
        review: reviewText,
        createdAt,
        response
    } = review;

    const userInitials = ratedByUser?.fullname
        ? ratedByUser.fullname.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : '??';

    return (
        <Card className="w-full mb-4">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={ratedByUser?.profile?.profilePhoto} alt={ratedByUser?.fullname} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{ratedByUser?.fullname || 'Anonymous'}</h4>
                        <span className="text-xs text-muted-foreground">
                            {format(new Date(createdAt), 'MMM d, yyyy')}
                        </span>
                    </div>
                    <div className="mt-1">
                        <RatingStar rating={rating} readOnly size="sm" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {reviewText && (
                    <p className="text-sm text-foreground/80 mt-2">{reviewText}</p>
                )}

                {response && (
                    <div className="mt-4 bg-muted/50 p-3 rounded-md">
                        <p className="text-xs font-semibold mb-1">Response:</p>
                        <p className="text-sm text-muted-foreground">{response.text}</p>
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                            {format(new Date(response.respondedAt), 'MMM d, yyyy')}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ReviewCard;
