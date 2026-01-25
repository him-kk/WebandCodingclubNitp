// import CreateModal from '../components/CreateModal';

// import { useState, useEffect } from 'react';
// import { 
//   Users, Calendar, FolderKanban, TrendingUp, Plus, Edit2, Trash2, 
//   Award, Settings, LogOut, Search, Filter, Eye, Mail, Star, CheckCircle, XCircle
// } from 'lucide-react';
// import api from '../services/api';
// import type { User, Event, Project } from '../types/admin';

// interface Stats {
//   totalUsers: number;
//   totalEvents: number;
//   totalProjects: number;
//   activeUsers: number;
//   upcomingEvents: number;
// }

// type ActiveTab = 'dashboard' | 'events' | 'projects' | 'users';

// const AdminDashboard = () => {
//   const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
//   const [stats, setStats] = useState<Stats | null>(null);
//   const [events, setEvents] = useState<Event[]>([]);
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [refresh, setRefresh] = useState(0);

//   // Fetch dashboard stats
//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const res = await api.get('/admin/stats');
//         setStats(res.data.data);
//       } catch (err) {
//         console.error('Failed to fetch stats:', err);
//       }
//     };
//     fetchStats();
//   }, [refresh]);

//   // Fetch data based on active tab
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         if (activeTab === 'events') {
//           const res = await api.get('/events');
//           setEvents(res.data.data || []);
//         } else if (activeTab === 'projects') {
//           const res = await api.get('/projects');
//           setProjects(res.data.data || []);
//         } else if (activeTab === 'users') {
//           const res = await api.get('/admin/users');
//           setUsers(res.data.data || []);
//         }
//       } catch (err) {
//         console.error(`Failed to fetch ${activeTab}:`, err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (activeTab !== 'dashboard') {
//       fetchData();
//     }
//   }, [activeTab, refresh]);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     window.location.href = '/login';
//   };

//   const handleDelete = async (id: string, type: ActiveTab) => {
//     if (!id) {
//       console.error('No ID provided for deletion');
//       alert('Error: Invalid ID');
//       return;
//     }

//     if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;

//     try {
//       console.log(`Attempting to delete ${type} with ID: ${id}`);
      
//       const endpoint = type === 'events' ? `/events/${id}` : 
//                        type === 'projects' ? `/projects/${id}` : 
//                        `/admin/users/${id}`;
      
//       console.log(`DELETE request to: ${endpoint}`);
      
//       const response = await api.delete(endpoint);
//       console.log('Delete response:', response.data);
      
//       alert(`${type.slice(0, -1)} deleted successfully!`);
//       setRefresh(prev => prev + 1);
//     } catch (error: any) {
//       console.error(`Failed to delete ${type}:`, error);
//       console.error('Error details:', error.response?.data);
      
//       if (error.response?.status === 404) {
//         alert(`Error: ${type.slice(0, -1)} not found. It may have already been deleted.`);
//       } else if (error.response?.data?.message) {
//         alert(`Error: ${error.response.data.message}`);
//       } else {
//         alert(`Failed to delete ${type.slice(0, -1)}. Please try again.`);
//       }
//     }
//   };

//   const handleSuccess = () => {
//     setRefresh(prev => prev + 1);
//   };

//   return (
//     <div className="min-h-screen bg-void">
//       {/* Sidebar */}
//       <aside className="fixed left-0 top-0 h-full w-64 bg-void/80 backdrop-blur-xl border-r border-white/10 p-6">
//         <div className="mb-8">
//           <h1 className="text-2xl font-bold text-orange">Admin Panel</h1>
//           <p className="text-sm text-light/50">Web & Coding Club</p>
//         </div>

//         <nav className="space-y-2">
//           {[
//             { id: 'dashboard' as ActiveTab, icon: TrendingUp, label: 'Dashboard' },
//             { id: 'events' as ActiveTab, icon: Calendar, label: 'Events' },
//             { id: 'projects' as ActiveTab, icon: FolderKanban, label: 'Projects' },
//             { id: 'users' as ActiveTab, icon: Users, label: 'Users' },
//           ].map((item) => (
//             <button
//               key={item.id}
//               onClick={() => setActiveTab(item.id)}
//               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
//                 activeTab === item.id
//                   ? 'bg-orange text-black'
//                   : 'text-light/70 hover:bg-white/5'
//               }`}
//             >
//               <item.icon className="w-5 h-5" />
//               <span>{item.label}</span>
//             </button>
//           ))}
//         </nav>

//         <button
//           onClick={handleLogout}
//           className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
//         >
//           <LogOut className="w-5 h-5" />
//           <span>Logout</span>
//         </button>
//       </aside>

//       {/* Main Content */}
//       <main className="ml-64 p-8">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h2 className="text-3xl font-bold text-white capitalize">{activeTab}</h2>
//             <p className="text-light/50">Manage your club's {activeTab}</p>
//           </div>

//           {activeTab !== 'dashboard' && (
//             <button
//               onClick={() => setShowCreateModal(true)}
//               className="flex items-center gap-2 px-6 py-3 bg-orange text-black font-semibold rounded-lg hover:shadow-glow transition-all"
//             >
//               <Plus className="w-5 h-5" />
//               Create {activeTab.slice(0, -1)}
//             </button>
//           )}
//         </div>

//         {/* Dashboard Stats */}
//         {activeTab === 'dashboard' && stats && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {[
//               { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
//               { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'orange' },
//               { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, color: 'green' },
//               { label: 'Active Users', value: stats.activeUsers, icon: TrendingUp, color: 'purple' },
//             ].map((stat, i) => (
//               <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
//                   <span className="text-2xl font-bold text-white">{stat.value}</span>
//                 </div>
//                 <p className="text-light/60">{stat.label}</p>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Events Table */}
//         {activeTab === 'events' && (
//           <EventsTable 
//             events={events} 
//             loading={loading} 
//             onDelete={(id: string) => handleDelete(id, 'events')}
//           />
//         )}

//         {/* Projects Table */}
//         {activeTab === 'projects' && (
//           <ProjectsTable 
//             projects={projects} 
//             loading={loading} 
//             onDelete={(id: string) => handleDelete(id, 'projects')}
//           />
//         )}

//         {/* Users Table */}
//         {activeTab === 'users' && (
//           <UsersTable 
//             users={users} 
//             loading={loading} 
//             onDelete={(id: string) => handleDelete(id, 'users')}
//           />
//         )}
//       </main>

//       {/* Create Modal */}
//       {showCreateModal && (
//         <CreateModal
//           type={activeTab as 'events' | 'projects' | 'users'}
//           onClose={() => setShowCreateModal(false)}
//           onSuccess={handleSuccess}
//         />
//       )}
//     </div>
//   );
// };

// // EventsTable Component
// interface EventsTableProps {
//   events: Event[];
//   loading: boolean;
//   onDelete: (id: string) => void;
// }

// const EventsTable = ({ events, loading, onDelete }: EventsTableProps) => {
//   const getStatusColor = (status: Event['status']) => {
//     switch (status) {
//       case 'upcoming': return 'text-blue-400';
//       case 'ongoing': return 'text-green-400';
//       case 'completed': return 'text-gray-400';
//       case 'cancelled': return 'text-red-400';
//       default: return 'text-gray-400';
//     }
//   };

//   if (loading) return <div className="text-center py-10 text-light/50">Loading...</div>;

//   return (
//     <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-white/5">
//             <tr>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Event</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Date & Time</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Category</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Attendees</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Status</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {events.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="px-6 py-8 text-center text-light/50">
//                   No events found. Create your first event!
//                 </td>
//               </tr>
//             ) : (
//               events.map((event: Event) => (
//                 <tr key={event._id} className="border-t border-white/10 hover:bg-white/5">
//                   <td className="px-6 py-4">
//                     <div>
//                       <div className="font-medium text-white">{event.title}</div>
//                       <div className="text-sm text-light/50 truncate max-w-xs">{event.location}</div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm">{new Date(event.date).toLocaleDateString()}</div>
//                     <div className="text-xs text-light/50">{event.time}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className="px-2 py-1 text-xs rounded-full bg-white/10 capitalize">
//                       {event.category}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-white">
//                       {event.attendees?.length || 0}<span className="text-light/50">/{event.maxAttendees}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)} bg-white/10 capitalize`}>
//                       {event.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2">
//                       <button 
//                         className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"
//                         title="Edit"
//                       >
//                         <Edit2 className="w-4 h-4" />
//                       </button>
//                       <button 
//                         onClick={() => {
//                           console.log('Delete button clicked for event:', event._id);
//                           onDelete(event._id);
//                         }}
//                         className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
//                         title="Delete"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                       <button 
//                         className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg"
//                         title="View"
//                       >
//                         <Eye className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// // ProjectsTable Component
// interface ProjectsTableProps {
//   projects: Project[];
//   loading: boolean;
//   onDelete: (id: string) => void;
// }

// const ProjectsTable = ({ projects, loading, onDelete }: ProjectsTableProps) => {
//   if (loading) return <div className="text-center py-10 text-light/50">Loading...</div>;

//   return (
//     <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-white/5">
//             <tr>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Project</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Tech Stack</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Difficulty</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Contributors</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Status</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {projects.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="px-6 py-8 text-center text-light/50">
//                   No projects found. Create your first project!
//                 </td>
//               </tr>
//             ) : (
//               projects.map((project: Project) => (
//                 <tr key={project._id} className="border-t border-white/10 hover:bg-white/5">
//                   <td className="px-6 py-4">
//                     <div>
//                       <div className="font-medium text-white">{project.title}</div>
//                       <div className="text-sm text-light/50 truncate max-w-xs">{project.description}</div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex flex-wrap gap-1">
//                       {project.techStack?.slice(0, 3).map((tech: string, i: number) => (
//                         <span key={i} className="px-2 py-1 text-xs rounded-full bg-white/10">
//                           {tech}
//                         </span>
//                       ))}
//                       {project.techStack?.length > 3 && (
//                         <span className="px-2 py-1 text-xs text-light/50">
//                           +{project.techStack.length - 3}
//                         </span>
//                       )}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 text-xs rounded-full capitalize ${
//                       project.difficulty === 'beginner' ? 'text-green-400' :
//                       project.difficulty === 'intermediate' ? 'text-yellow-400' : 'text-red-400'
//                     } bg-white/10`}>
//                       {project.difficulty}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-white">
//                       {project.contributors?.length || 0}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 text-xs rounded-full ${
//                       project.status === 'completed' ? 'text-green-400' :
//                       project.status === 'development' ? 'text-blue-400' : 'text-yellow-400'
//                     } bg-white/10 capitalize`}>
//                       {project.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2">
//                       <button 
//                         className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"
//                         title="Edit"
//                       >
//                         <Edit2 className="w-4 h-4" />
//                       </button>
//                       <button 
//                         onClick={() => {
//                           console.log('Delete button clicked for project:', project._id);
//                           onDelete(project._id);
//                         }}
//                         className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
//                         title="Delete"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                       <a 
//                         href={project.githubUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg"
//                         title="View on GitHub"
//                       >
//                         <Eye className="w-4 h-4" />
//                       </a>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// // UsersTable Component
// interface UsersTableProps {
//   users: User[];
//   loading: boolean;
//   onDelete: (id: string) => void;
// }

// const UsersTable = ({ users, loading, onDelete }: UsersTableProps) => {
//   if (loading) return <div className="text-center py-10 text-light/50">Loading...</div>;

//   return (
//     <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-white/5">
//             <tr>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">User</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Role</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Points</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Status</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Last Login</th>
//               <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="px-6 py-8 text-center text-light/50">
//                   No users found.
//                 </td>
//               </tr>
//             ) : (
//               users.map((user: User) => (
//                 <tr key={user._id} className="border-t border-white/10 hover:bg-white/5">
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
//                         {user.avatar ? (
//                           <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
//                         ) : (
//                           <span className="text-lg font-bold text-orange">
//                             {user.name.charAt(0).toUpperCase()}
//                           </span>
//                         )}
//                       </div>
//                       <div>
//                         <div className="font-medium text-white">{user.name}</div>
//                         <div className="text-sm text-light/50">{user.email}</div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 text-xs rounded-full capitalize ${
//                       user.role === 'admin' ? 'text-red-400' :
//                       user.role === 'lead' ? 'text-orange-400' : 'text-blue-400'
//                     } bg-white/10`}>
//                       {user.role}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-1">
//                       <Star className="w-4 h-4 text-yellow-400" />
//                       <span className="font-medium text-white">{user.points}</span>
//                       <span className="text-xs text-light/50">({user.level})</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     {user.isActive ? (
//                       <div className="flex items-center gap-1 text-green-400">
//                         <CheckCircle className="w-4 h-4" />
//                         <span>Active</span>
//                       </div>
//                     ) : (
//                       <div className="flex items-center gap-1 text-red-400">
//                         <XCircle className="w-4 h-4" />
//                         <span>Inactive</span>
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm">
//                       {new Date(user.lastLogin).toLocaleDateString()}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2">
//                       <button 
//                         className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"
//                         title="Edit"
//                       >
//                         <Edit2 className="w-4 h-4" />
//                       </button>
//                       <button 
//                         onClick={() => {
//                           console.log('Delete button clicked for user:', user._id);
//                           onDelete(user._id);
//                         }}
//                         className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
//                         title="Delete"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                       <button 
//                         className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg"
//                         title="Send Email"
//                       >
//                         <Mail className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;
import CreateModal from '../components/CreateModal';

import { useState, useEffect } from 'react';
import { 
  Users, Calendar, FolderKanban, TrendingUp, Plus, Edit2, Trash2, 
  Award, Settings, LogOut, Search, Filter, Eye, Mail, Star, CheckCircle, XCircle
} from 'lucide-react';
import api from '../services/api';
import type { User, Event, Project } from '../types/admin';

interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalProjects: number;
  activeUsers: number;
  upcomingEvents: number;
}

type ActiveTab = 'dashboard' | 'events' | 'projects' | 'users';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refresh, setRefresh] = useState(0);

  console.log('🔍 AdminDashboard rendered');
  console.log('📊 Stats:', stats);
  console.log('🔑 Token exists:', !!localStorage.getItem('token'));

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('📡 Fetching stats from /admin/stats...');
        const res = await api.get('/admin/stats');
        console.log('✅ Stats received:', res.data);
        setStats(res.data.data);
      } catch (err: any) {
        console.error('❌ Failed to fetch stats:', err);
        console.error('Error response:', err.response?.data);
        console.error('Error status:', err.response?.status);
        // Set default stats if API fails
        setStats({
          totalUsers: 0,
          totalEvents: 0,
          totalProjects: 0,
          activeUsers: 0,
          upcomingEvents: 0,
        });
      }
    };
    fetchStats();
  }, [refresh]);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'events') {
          console.log('📡 Fetching events...');
          const res = await api.get('/events');
          console.log('✅ Events received:', res.data);
          setEvents(res.data.data || []);
        } else if (activeTab === 'projects') {
          console.log('📡 Fetching projects...');
          const res = await api.get('/projects');
          console.log('✅ Projects received:', res.data);
          setProjects(res.data.data || []);
        } else if (activeTab === 'users') {
          console.log('📡 Fetching users...');
          const res = await api.get('/admin/users');
          console.log('✅ Users received:', res.data);
          setUsers(res.data.data || []);
        }
      } catch (err: any) {
        console.error(`❌ Failed to fetch ${activeTab}:`, err);
        console.error('Error response:', err.response?.data);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab !== 'dashboard') {
      fetchData();
    }
  }, [activeTab, refresh]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleDelete = async (id: string, type: ActiveTab) => {
    if (!id) {
      console.error('No ID provided for deletion');
      alert('Error: Invalid ID');
      return;
    }

    if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;

    try {
      console.log(`Attempting to delete ${type} with ID: ${id}`);
      
      const endpoint = type === 'events' ? `/events/${id}` : 
                       type === 'projects' ? `/projects/${id}` : 
                       `/admin/users/${id}`;
      
      console.log(`DELETE request to: ${endpoint}`);
      
      const response = await api.delete(endpoint);
      console.log('Delete response:', response.data);
      
      alert(`${type.slice(0, -1)} deleted successfully!`);
      setRefresh(prev => prev + 1);
    } catch (error: any) {
      console.error(`Failed to delete ${type}:`, error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 404) {
        alert(`Error: ${type.slice(0, -1)} not found. It may have already been deleted.`);
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert(`Failed to delete ${type.slice(0, -1)}. Please try again.`);
      }
    }
  };

  const handleSuccess = () => {
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-void">
      {/* Debug Banner */}
      <div className="fixed top-0 right-0 bg-green-500 text-white px-4 py-2 z-50 text-xs">
        ✅ Dashboard Loaded | Token: {localStorage.getItem('token') ? 'YES' : 'NO'}
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-void/80 backdrop-blur-xl border-r border-white/10 p-6 z-40">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-orange">Admin Panel</h1>
          <p className="text-sm text-light/50">Web & Coding Club</p>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'dashboard' as ActiveTab, icon: TrendingUp, label: 'Dashboard' },
            { id: 'events' as ActiveTab, icon: Calendar, label: 'Events' },
            { id: 'projects' as ActiveTab, icon: FolderKanban, label: 'Projects' },
            { id: 'users' as ActiveTab, icon: Users, label: 'Users' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                console.log('Tab clicked:', item.id);
                setActiveTab(item.id);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id
                  ? 'bg-orange text-black'
                  : 'text-light/70 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white capitalize">{activeTab}</h2>
            <p className="text-light/50">Manage your club's {activeTab}</p>
          </div>

          {activeTab !== 'dashboard' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-orange text-black font-semibold rounded-lg hover:shadow-glow transition-all"
            >
              <Plus className="w-5 h-5" />
              Create {activeTab.slice(0, -1)}
            </button>
          )}
        </div>

        {/* Dashboard Stats */}
        {activeTab === 'dashboard' && (
          <div>
            {!stats ? (
              <div className="text-center py-10">
                <div className="text-light/50 mb-4">Loading stats...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'blue' },
                  { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'orange' },
                  { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, color: 'green' },
                  { label: 'Active Users', value: stats.activeUsers, icon: TrendingUp, color: 'purple' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <stat.icon className={`w-8 h-8 text-${stat.color}-400`} />
                      <span className="text-2xl font-bold text-white">{stat.value}</span>
                    </div>
                    <p className="text-light/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Events Table */}
        {activeTab === 'events' && (
          <EventsTable 
            events={events} 
            loading={loading} 
            onDelete={(id: string) => handleDelete(id, 'events')}
          />
        )}

        {/* Projects Table */}
        {activeTab === 'projects' && (
          <ProjectsTable 
            projects={projects} 
            loading={loading} 
            onDelete={(id: string) => handleDelete(id, 'projects')}
          />
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
          <UsersTable 
            users={users} 
            loading={loading} 
            onDelete={(id: string) => handleDelete(id, 'users')}
          />
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateModal
          type={activeTab as 'events' | 'projects' | 'users'}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

// EventsTable Component
interface EventsTableProps {
  events: Event[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const EventsTable = ({ events, loading, onDelete }: EventsTableProps) => {
  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'upcoming': return 'text-blue-400';
      case 'ongoing': return 'text-green-400';
      case 'completed': return 'text-gray-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) return <div className="text-center py-10 text-light/50">Loading...</div>;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Event</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Date & Time</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Category</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Attendees</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-light/50">
                  No events found. Create your first event!
                </td>
              </tr>
            ) : (
              events.map((event: Event) => (
                <tr key={event._id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{event.title}</div>
                      <div className="text-sm text-light/50 truncate max-w-xs">{event.location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{new Date(event.date).toLocaleDateString()}</div>
                    <div className="text-xs text-light/50">{event.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-white/10 capitalize">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white">
                      {event.attendees?.length || 0}<span className="text-light/50">/{event.maxAttendees}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(event.status)} bg-white/10 capitalize`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(event._id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ProjectsTable Component
interface ProjectsTableProps {
  projects: Project[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const ProjectsTable = ({ projects, loading, onDelete }: ProjectsTableProps) => {
  if (loading) return <div className="text-center py-10 text-light/50">Loading...</div>;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Project</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Tech Stack</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Difficulty</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Contributors</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-light/50">
                  No projects found. Create your first project!
                </td>
              </tr>
            ) : (
              projects.map((project: Project) => (
                <tr key={project._id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{project.title}</div>
                      <div className="text-sm text-light/50 truncate max-w-xs">{project.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {project.techStack?.slice(0, 3).map((tech: string, i: number) => (
                        <span key={i} className="px-2 py-1 text-xs rounded-full bg-white/10">
                          {tech}
                        </span>
                      ))}
                      {project.techStack?.length > 3 && (
                        <span className="px-2 py-1 text-xs text-light/50">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      project.difficulty === 'beginner' ? 'text-green-400' :
                      project.difficulty === 'intermediate' ? 'text-yellow-400' : 'text-red-400'
                    } bg-white/10`}>
                      {project.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white">
                      {project.contributors?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'completed' ? 'text-green-400' :
                      project.status === 'development' ? 'text-blue-400' : 'text-yellow-400'
                    } bg-white/10 capitalize`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(project._id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <a 
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg"
                        title="View on GitHub"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// UsersTable Component
interface UsersTableProps {
  users: User[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const UsersTable = ({ users, loading, onDelete }: UsersTableProps) => {
  if (loading) return <div className="text-center py-10 text-light/50">Loading...</div>;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">User</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Role</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Points</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Last Login</th>
              <th className="px-6 py-4 text-left text-xs font-tech text-light/50 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-light/50">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user: User) => (
                <tr key={user._id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-lg font-bold text-orange">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-sm text-light/50">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                      user.role === 'admin' ? 'text-red-400' :
                      user.role === 'lead' ? 'text-orange-400' : 'text-blue-400'
                    } bg-white/10`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium text-white">{user.points}</span>
                      <span className="text-xs text-light/50">({user.level})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.isActive ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-400">
                        <XCircle className="w-4 h-4" />
                        <span>Inactive</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(user._id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-green-400 hover:bg-green-400/10 rounded-lg"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;