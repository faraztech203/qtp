import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Edit2, Trash2, LogOut, User, 
  FileText, CheckCircle, XCircle, Camera, Loader2 
} from 'lucide-react';

interface License {
  id: number;
  name: string;
  fatherName: string;
  cnic: string;
  licenseNo: string;
  branch: string;
  type: string;
  category: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  photoUrl: string;
}

export default function AdminDashboard() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [formData, setFormData] = useState({
    name: '', fatherName: '', cnic: '', licenseNo: '', branch: '',
    type: 'PERMANENT', category: '', issueDate: '', expiryDate: '',
    status: 'ACTIVE', photoUrl: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      const response = await fetch('/api/admin/licenses');
      if (response.ok) {
        const data = await response.json();
        setLicenses(data);
      } else if (response.status === 404) {
        navigate('/secure-portal-9xA82');
      }
    } catch (err) {
      console.error('Failed to fetch licenses');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    navigate('/secure-portal-9xA82');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingLicense ? `/api/admin/licenses/${editingLicense.id}` : '/api/admin/licenses';
    const method = editingLicense ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setEditingLicense(null);
        setFormData({
          name: '', fatherName: '', cnic: '', licenseNo: '', branch: '',
          type: 'PERMANENT', category: '', issueDate: '', expiryDate: '',
          status: 'ACTIVE', photoUrl: ''
        });
        fetchLicenses();
      }
    } catch (err) {
      alert('Failed to save record');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await fetch(`/api/admin/licenses/${id}`, { method: 'DELETE' });
      fetchLicenses();
    }
  };

  const openEditModal = (license: License) => {
    setEditingLicense(license);
    setFormData({ ...license });
    setIsModalOpen(true);
  };

  const filteredLicenses = licenses.filter(l => 
    l.cnic.includes(searchQuery) || 
    l.licenseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin Header */}
      <header className="bg-[#0b3d91] text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8" />
          <h1 className="text-xl font-bold">License Management System</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm">
            <User className="w-4 h-4" />
            <span>Administrator</span>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 px-3 py-1.5 rounded-full text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="Search by CNIC, License No, or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-[#0b3d91] shadow-sm"
            />
          </div>
          <button 
            onClick={() => {
              setEditingLicense(null);
              setFormData({
                name: '', fatherName: '', cnic: '', licenseNo: '', branch: '',
                type: 'PERMANENT', category: '', issueDate: '', expiryDate: '',
                status: 'ACTIVE', photoUrl: ''
              });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-[#0b3d91] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#082d6b] transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add New License
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-bottom border-slate-200">
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Photo</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Name / CNIC</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">License Info</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0b3d91] mb-2" />
                      <span className="text-slate-500">Loading records...</span>
                    </td>
                  </tr>
                ) : filteredLicenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredLicenses.map((license) => (
                    <tr key={license.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <img 
                          src={license.photoUrl || 'https://via.placeholder.com/40'} 
                          alt="" 
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{license.name}</div>
                        <div className="text-xs text-slate-500">{license.cnic}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#0b3d91]">{license.licenseNo}</div>
                        <div className="text-xs text-slate-500">{license.type} • {license.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          license.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {license.status === 'ACTIVE' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {license.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(license)}
                            className="p-2 text-slate-400 hover:text-[#0b3d91] hover:bg-[#0b3d91]/10 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(license.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
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
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">
                {editingLicense ? 'Edit License Record' : 'Add New License Record'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0b3d91]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Father/Husband Name</label>
                  <input 
                    required
                    value={formData.fatherName}
                    onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0b3d91]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">CNIC Number</label>
                  <input 
                    required
                    placeholder="54400-0000000-0"
                    value={formData.cnic}
                    onChange={(e) => setFormData({...formData, cnic: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0b3d91]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">License Number</label>
                  <input 
                    required
                    placeholder="QTA-DL-00000"
                    value={formData.licenseNo}
                    onChange={(e) => setFormData({...formData, licenseNo: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0b3d91]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Branch</label>
                  <input 
                    required
                    value={formData.branch}
                    onChange={(e) => setFormData({...formData, branch: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0b3d91]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category</label>
                  <input 
                    required
                    placeholder="M CYCLE, M CAR"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0b3d91]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Issue Date</label>
                  <input 
                    required
                    placeholder="12-Jan-2020"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0b3d91]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Expiry Date</label>
                  <input 
                    required
                    placeholder="11-Jan-2025"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0b3d91]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Photo URL</label>
                  <div className="relative">
                    <Camera className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      value={formData.photoUrl}
                      onChange={(e) => setFormData({...formData, photoUrl: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0b3d91]"
                      placeholder="https://..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-[#0b3d91]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#0b3d91] text-white rounded-xl font-semibold hover:bg-[#082d6b] transition-all shadow-lg shadow-[#0b3d91]/20"
                >
                  {editingLicense ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
