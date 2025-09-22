import {
  Edit,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { teamsApi } from '../services/teamsApi';
import { usersApi } from '../services/usersApi';
import {
  CreateTeamRequest,
  Team,
  TeamMember,
  UpdateTeamRequest,
  User
} from '../types';

export const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateTeamRequest>({
    name: '',
    description: '',
    team_lead_id: 0,
    is_active: true
  });

  // Load teams and users on component mount
  useEffect(() => {
    loadTeams();
    loadUsers();
  }, []);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const response = await teamsApi.getTeams(1, 100);
      setTeams(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await usersApi.getUsers(1, 100);
      setUsers(response.data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    }
  };

  const loadTeamMembers = async (teamId: number) => {
    try {
      const response = await teamsApi.getTeamMembers(teamId);
      setTeamMembers(response.data || []);
    } catch (err: any) {
      console.error('Failed to load team members:', err);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await teamsApi.createTeam(formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', team_lead_id: 0, is_active: true });
      loadTeams();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    
    try {
      const updateData: UpdateTeamRequest = {
        name: formData.name,
        description: formData.description,
        team_lead_id: formData.team_lead_id,
        is_active: formData.is_active
      };
      
      await teamsApi.updateTeam(selectedTeam.id, updateData);
      setShowEditModal(false);
      setSelectedTeam(null);
      setFormData({ name: '', description: '', team_lead_id: 0, is_active: true });
      loadTeams();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await teamsApi.deleteTeam(teamId);
      loadTeams();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddMember = async (userId: number) => {
    if (!selectedTeam) return;
    
    try {
      await teamsApi.addTeamMember(selectedTeam.id, userId);
      loadTeamMembers(selectedTeam.id);
      setShowAddMemberModal(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedTeam) return;
    
    try {
      await teamsApi.removeTeamMember(selectedTeam.id, userId);
      loadTeamMembers(selectedTeam.id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description,
      team_lead_id: team.team_lead_id,
      is_active: team.is_active
    });
    setShowEditModal(true);
  };

  const openMembersModal = (team: Team) => {
    setSelectedTeam(team);
    loadTeamMembers(team.id);
    setShowMembersModal(true);
  };

  const openAddMemberModal = () => {
    setShowAddMemberModal(true);
  };

  // Filter teams based on search term and active status
  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === null || team.is_active === filterActive;
    return matchesSearch && matchesFilter;
  });

  const getTeamLeadName = (teamLeadId: number) => {
    const user = users.find(u => u.id === teamLeadId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown';
  };

  const getAvailableUsers = () => {
    if (!selectedTeam) return users;
    const memberIds = teamMembers.map(m => m.id);
    return users.filter(user => !memberIds.includes(user.id));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Teams</h1>
          <p className="text-gray-400 mt-2">Manage teams and team members</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Team
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterActive === null ? 'all' : filterActive.toString()}
          onChange={(e) => setFilterActive(e.target.value === 'all' ? null : e.target.value === 'true')}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Teams</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">{team.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{team.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  team.is_active 
                    ? 'bg-green-900/50 text-green-300 border border-green-700' 
                    : 'bg-red-900/50 text-red-300 border border-red-700'
                }`}>
                  {team.is_active ? 'Active' : 'Inactive'}
                </span>
                <div className="relative group">
                  <button className="p-1 hover:bg-gray-700 rounded">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                  <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={() => openMembersModal(team)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      View Members
                    </button>
                    <button
                      onClick={() => openEditModal(team)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Team
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Team
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Users className="w-4 h-4" />
                <span>Team Lead: {getTeamLeadName(team.team_lead_id)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Created: {new Date(team.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No teams found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterActive !== null 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by creating your first team.'
            }
          </p>
          {!searchTerm && filterActive === null && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Team
            </button>
          )}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Team</h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Lead</label>
                <select
                  value={formData.team_lead_id}
                  onChange={(e) => setFormData({ ...formData, team_lead_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>Select Team Lead</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-300">Active Team</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {showEditModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Edit Team</h2>
            <form onSubmit={handleUpdateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Team Lead</label>
                <select
                  value={formData.team_lead_id}
                  onChange={(e) => setFormData({ ...formData, team_lead_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value={0}>Select Team Lead</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active_edit"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active_edit" className="text-sm text-gray-300">Active Team</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Update Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Members Modal */}
      {showMembersModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Team Members - {selectedTeam.name}</h2>
              <div className="flex gap-2">
                <button
                  onClick={openAddMemberModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </button>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {!teamMembers && (
                <div className="text-center py-8 text-gray-400">
                  No members in this team yet.
                </div>
              )}
              {teamMembers && teamMembers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No members in this team yet.
                </div>
              ) : (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.first_name[0]}{member.last_name[0]}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-gray-400 text-sm">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        member.is_active 
                          ? 'bg-green-900/50 text-green-300 border border-green-700' 
                          : 'bg-red-900/50 text-red-300 border border-red-700'
                      }`}>
                        {member.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
                        title="Remove from team"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Add Team Member</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {getAvailableUsers().length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  All users are already members of this team.
                </div>
              ) : (
                getAvailableUsers().map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.first_name[0]}{user.last_name[0]}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-gray-400 text-xs">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(user.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
