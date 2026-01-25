
// CreateModal.tsx
import { useState } from 'react';
import api from '../services/api';

const CreateModal = ({ type, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(getInitialFormData(type));

  function getInitialFormData(type: string) {
    switch (type) {
      case 'events':
        return {
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          image: '',
          category: 'workshop',
          maxAttendees: 100,
          isOnline: false,
          onlineLink: '',
          requirements: '',
          tags: '',
          points: 100,
          status: 'upcoming'
        };
      case 'projects':
        return {
          title: '',
          description: '',
          githubUrl: '',
          liveUrl: '',
          image: '',
          techStack: '',
          category: 'web',
          difficulty: 'beginner',
          tags: '',
          points: 50,
          status: 'planning'
        };
      case 'users':
        return {
          name: '',
          email: '',
          password: '',
          role: 'member',
          bio: '',
          skills: '',
          github: '',
          linkedin: '',
          twitter: ''
        };
      default:
        return {};
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Format data for API
      const formattedData = { ...formData };
      
      // Convert comma-separated strings to arrays and filter empty values
      if (formattedData.tags) {
        formattedData.tags = formattedData.tags
          .split(',')
          .map((tag: string) => tag.trim())
          .filter((tag: string) => tag.length > 0);
        if (formattedData.tags.length === 0) {
          delete formattedData.tags;
        }
      }
      
      if (formattedData.techStack) {
        formattedData.techStack = formattedData.techStack
          .split(',')
          .map((tech: string) => tech.trim())
          .filter((tech: string) => tech.length > 0);
        
        // Tech stack is required for projects
        if (type === 'projects' && formattedData.techStack.length === 0) {
          alert('Please provide at least one technology in the tech stack');
          setLoading(false);
          return;
        }
      }
      
      if (formattedData.requirements) {
        formattedData.requirements = formattedData.requirements
          .split(',')
          .map((req: string) => req.trim())
          .filter((req: string) => req.length > 0);
        if (formattedData.requirements.length === 0) {
          delete formattedData.requirements;
        }
      }
      
      if (formattedData.skills) {
        formattedData.skills = formattedData.skills
          .split(',')
          .map((skill: string) => skill.trim())
          .filter((skill: string) => skill.length > 0);
        if (formattedData.skills.length === 0) {
          delete formattedData.skills;
        }
      }

      // Convert date string to ISO format for events
      if (type === 'events' && formattedData.date) {
        const dateTimeString = `${formattedData.date}T${formattedData.time || '00:00'}:00`;
        formattedData.date = new Date(dateTimeString).toISOString();
      }

      // Handle image field for events and projects
      if ((type === 'events' || type === 'projects')) {
        if (!formattedData.image || formattedData.image.trim() === '') {
          formattedData.image = null;
        }
      }

      // Convert numeric string values to actual numbers
      if (formattedData.maxAttendees) {
        formattedData.maxAttendees = parseInt(formattedData.maxAttendees, 10);
      }
      if (formattedData.points) {
        formattedData.points = parseInt(formattedData.points, 10);
      }

      // Remove empty optional fields
      Object.keys(formattedData).forEach(key => {
        if (formattedData[key] === '' && key !== 'description' && key !== 'title') {
          delete formattedData[key];
        }
      });

      // Don't send createdBy - backend sets it from JWT
      delete formattedData.createdBy;

      console.log('Sending payload:', JSON.stringify(formattedData, null, 2));

      const endpoint = type === 'events' ? '/events' : 
                       type === 'projects' ? '/projects' : 
                       '/admin/users';
      
      const response = await api.post(endpoint, formattedData);
      console.log('Success response:', response.data);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Failed to create ${type.slice(0, -1)}:`, error);
      
      if (error.response?.data) {
        console.error('Server error details:', error.response.data);
        const errorMessage = error.response.data.message || 
                           error.response.data.error || 
                           JSON.stringify(error.response.data);
        alert(`Error: ${errorMessage}`);
      } else if (error.request) {
        alert('No response from server. Please check your connection.');
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderEventForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light/70 mb-1">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Time *</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light/70 mb-1">Image URL</label>
        <input
          type="url"
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          placeholder="https://example.com/event-image.jpg"
        />
        <p className="text-xs text-light/50 mt-1">Optional: Provide a URL to an image for this event</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="workshop">Workshop</option>
            <option value="hackathon">Hackathon</option>
            <option value="competition">Competition</option>
            <option value="meetup">Meetup</option>
            <option value="webinar">Webinar</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Max Attendees</label>
          <input
            type="number"
            name="maxAttendees"
            value={formData.maxAttendees}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Points</label>
          <input
            type="number"
            name="points"
            value={formData.points}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isOnline"
          checked={formData.isOnline}
          onChange={handleChange}
          id="isOnline"
          className="rounded"
        />
        <label htmlFor="isOnline" className="text-light/70">Online Event</label>
      </div>

      {formData.isOnline && (
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Online Link</label>
          <input
            type="url"
            name="onlineLink"
            value={formData.onlineLink}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            placeholder="https://zoom.us/j/..."
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-light/70 mb-1">Requirements (comma-separated)</label>
        <input
          type="text"
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          placeholder="Laptop, Basic coding knowledge"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light/70 mb-1">Tags (comma-separated)</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          placeholder="react, workshop, coding"
        />
      </div>
    </form>
  );

  const renderProjectForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-light/70 mb-1">Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light/70 mb-1">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">GitHub URL *</label>
          <input
            type="url"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            placeholder="https://github.com/user/repo"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Live URL</label>
          <input
            type="url"
            name="liveUrl"
            value={formData.liveUrl}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light/70 mb-1">Image URL</label>
        <input
          type="url"
          name="image"
          value={formData.image}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          placeholder="https://example.com/project-image.jpg"
        />
        <p className="text-xs text-light/50 mt-1">Optional: Provide a URL to an image for this project</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Tech Stack (comma-separated) *</label>
          <input
            type="text"
            name="techStack"
            value={formData.techStack}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            placeholder="React, Node.js, MongoDB"
            required
          />
          <p className="text-xs text-light/50 mt-1">At least one technology is required</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="ai">AI</option>
            <option value="security">Security</option>
            <option value="devops">DevOps</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Difficulty</label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="planning">Planning</option>
            <option value="development">Development</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light/70 mb-1">Points</label>
        <input
          type="number"
          name="points"
          value={formData.points}
          onChange={handleChange}
          min="0"
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light/70 mb-1">Tags (comma-separated)</label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          placeholder="open-source, react, fullstack"
        />
      </div>
    </form>
  );

  const renderUserForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="lead">Lead</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light/70 mb-1">Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows={2}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          maxLength={500}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light/70 mb-1">Skills (comma-separated)</label>
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          placeholder="React, Node.js, UI/UX"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">GitHub</label>
          <input
            type="url"
            name="github"
            value={formData.github}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">LinkedIn</label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-light/70 mb-1">Twitter</label>
          <input
            type="url"
            name="twitter"
            value={formData.twitter}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>
      </div>
    </form>
  );

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-void border border-white/10 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Create New {type.slice(0, -1)}</h3>
          <button onClick={onClose} className="text-light/50 hover:text-white">
            ✕
          </button>
        </div>

        {type === 'events' && renderEventForm()}
        {type === 'projects' && renderProjectForm()}
        {type === 'users' && renderUserForm()}

        <div className="flex gap-4 justify-end mt-8 pt-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-white/20 text-white rounded-lg hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-orange text-black font-semibold rounded-lg hover:shadow-glow disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateModal;