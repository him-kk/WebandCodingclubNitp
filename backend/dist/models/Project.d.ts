import mongoose, { Document } from 'mongoose';
export interface IProject extends Document {
    title: string;
    description: string;
    image: string;
    techStack: string[];
    githubUrl: string;
    liveUrl?: string;
    category: 'web' | 'mobile' | 'ai' | 'security' | 'devops' | 'other';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    stars: number;
    forks: number;
    contributors: mongoose.Types.ObjectId[];
    lead: mongoose.Types.ObjectId;
    status: 'planning' | 'development' | 'completed' | 'archived';
    tags: string[];
    points: number;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}, {}> & IProject & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Project.d.ts.map