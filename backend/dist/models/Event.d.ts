import mongoose, { Document } from 'mongoose';
export interface IEvent extends Document {
    title: string;
    description: string;
    date: Date;
    time: string;
    location: string;
    image: string;
    category: 'workshop' | 'hackathon' | 'competition' | 'meetup' | 'webinar';
    attendees: mongoose.Types.ObjectId[];
    maxAttendees: number;
    isOnline: boolean;
    onlineLink?: string;
    requirements?: string[];
    tags: string[];
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    points: number;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IEvent, {}, {}, {}, mongoose.Document<unknown, {}, IEvent, {}, {}> & IEvent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Event.d.ts.map