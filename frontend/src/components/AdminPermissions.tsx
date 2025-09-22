import React, { useCallback, useEffect, useState } from 'react';
import { permissionsApi } from '../services/permissionsApi';
import { CreatePermissionRequest, Permission, UpdatePermissionRequest } from '../types';

export const AdminPermissions: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPermission, setDeletingPermission] = useState<Permission | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreatePermissionRequest>({
    key: '',
    description: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Load permissions
  const loadPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await permissionsApi.getPermissions(page, limit);
      setPermissions(response.data);
      setTotal(response.meta.total);
      setTotalPages(Math.ceil(response.meta.total / limit));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  // Handle create permission
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormErrors({});

    try {
      await permissionsApi.createPermission(formData);
      setShowCreateModal(false);
      setFormData({ key: '', description: '' });
      loadPermissions();
    } catch (err: any) {
      setFormErrors({ general: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update permission
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPermission) return;

    setSubmitting(true);
    setFormErrors({});

    try {
      const updateData: UpdatePermissionRequest = {
        key: formData.key,
        description: formData.description
      };
      await permissionsApi.updatePermission(editingPermission.id, updateData);
      setShowEditModal(false);
      setEditingPermission(null);
      setFormData({ key: '', description: '' });
      loadPermissions();
    } catch (err: any) {
      setFormErrors({ general: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete permission
  const handleDelete = async () => {
    if (!deletingPermission) return;

    try {
      await permissionsApi.deletePermission(deletingPermission.id);
      setShowDeleteModal(false);
      setDeletingPermission(null);
      loadPermissions();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Open edit modal
  const openEditModal = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      key: permission.key,
      description: permission.description
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (permission: Permission) => {
    setDeletingPermission(permission);
    setShowDeleteModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({ key: '', description: '' });
    setFormErrors({});
  };

  // Close modals
  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setEditingPermission(null);
    setDeletingPermission(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Permissions</h1>
          <p className="text-gray-400 mt-2">Manage system permissions and access control</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Permission
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Permissions Table */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading permissions...</p>
          </div>
        ) : permissions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No permissions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {permissions.map((permission) => (
                    <tr key={permission.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm text-blue-400 bg-gray-800 px-2 py-1 rounded">
                          {permission.key}
                        </code>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-300">{permission.description}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(permission.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(permission)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(permission)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-700/30 px-6 py-3 flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} permissions
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-300">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Permission Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Create Permission</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Key
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., VIEW_USERS"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Description of the permission"
                    rows={3}
                    required
                  />
                </div>
                {formErrors.general && (
                  <div className="text-red-400 text-sm">{formErrors.general}</div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permission Modal */}
      {showEditModal && editingPermission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Edit Permission</h2>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Key
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., VIEW_USERS"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Description of the permission"
                    rows={3}
                    required
                  />
                </div>
                {formErrors.general && (
                  <div className="text-red-400 text-sm">{formErrors.general}</div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
                >
                  {submitting ? 'Updating...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Permission Modal */}
      {showDeleteModal && deletingPermission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold text-white mb-4">Delete Permission</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete the permission "{deletingPermission.key}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
