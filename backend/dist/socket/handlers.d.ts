import { Server } from 'socket.io';
export declare const setupSocketHandlers: (io: Server) => void;
export declare const emitToUser: (io: Server, userId: string, event: string, data: any) => void;
export declare const emitToRoom: (io: Server, room: string, event: string, data: any) => void;
export declare const emitToAll: (io: Server, event: string, data: any) => void;
//# sourceMappingURL=handlers.d.ts.map