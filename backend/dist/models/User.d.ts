import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    avatar?: string;
    role: 'member' | 'admin' | 'lead';
    points: number;
    level: string;
    badges: string[];
    streak: number;
    github?: string;
    linkedin?: string;
    twitter?: string;
    bio?: string;
    skills: string[];
    isActive: boolean;
    lastLogin: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map