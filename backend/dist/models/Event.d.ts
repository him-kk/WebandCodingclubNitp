import mongoose, { Document } from 'mongoose';
export interface IEvent extends Document {
    title: string;
    description: string;
    date: Date;
    time: string;
    location: string;
    image: string;
    category: 'workshop' | 'hackathon' | 'competition' | 'meetup' | 'webinar';
    maxAttendees: number;
    attendees: mongoose.Types.ObjectId[];
    points: number;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    registrationLink?: string;
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