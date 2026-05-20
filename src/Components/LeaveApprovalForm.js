import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import apiRequest from './apiRequest';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  MessageSquare,
  AlertCircle,
  Search,
  ChevronRight,
  Filter
} from 'lucide-react';

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

const LeaveApprovalForm = () => {
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectingLeave, setRejectingLeave] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const parseJSON = (value) => {
    try {
      if (typeof value === "string") return JSON.parse(value);
      return value;
    } catch (e) {
      return value;
    }
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const response = await apiRequest(`${Milestonebaseurl}get-pending-leaves/`, 'GET');
      if (response.success && response.data.status === 'success') {
        const cleanedData = (response.data.data || []).map(item => ({
          ...item,
          age: parseJSON(item.age),
          reason_for_visit: parseJSON(item.reason_for_visit),
          source_of_referral: parseJSON(item.source_of_referral)
        }));
        setPendingLeaves(cleanedData);
      } else {
        toast.error(response.error || 'Failed to fetch leave requests');
      }
    } catch (error) {
      toast.error('Network error while fetching leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leave) => {
    if (!window.confirm(`Are you sure you want to approve leave for ${leave.name_of_child}?`)) return;
    
    setActionLoading(true);
    try {
      const payload = {
        registration_number: leave.leave_details.registration_number,
        leave_date: leave.leave_details.leave_date,
        leave_status: 'Approved',
        'auth-user-id': localStorage.getItem('auth-user-id') || 'Admin'
      };
      
      const response = await apiRequest(`${Milestonebaseurl}update-leave-status/`, 'PATCH', payload);
      if (response.success) {
        toast.success('Leave request approved successfully');
        fetchLeaves();
      } else {
        toast.error(response.error || 'Approval failed');
      }
    } catch (error) {
      toast.error('Network error during approval');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (leave) => {
    setRejectingLeave(leave);
    setRejectRemark('');
  };

  const handleReject = async () => {
    if (!rejectRemark.trim()) {
      toast.warning('Please provide a reason for rejection (Remark)');
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        registration_number: rejectingLeave.leave_details.registration_number,
        leave_date: rejectingLeave.leave_details.leave_date,
        leave_status: 'Rejected',
        leave_reject_comments: rejectRemark,
        'auth-user-id': localStorage.getItem('auth-user-id') || 'Admin'
      };
      
      const response = await apiRequest(`${Milestonebaseurl}update-leave-status/`, 'PATCH', payload);
      if (response.success) {
        toast.success('Leave request rejected with remark');
        setRejectingLeave(null);
        fetchLeaves();
      } else {
        toast.error(response.error || 'Rejection failed');
      }
    } catch (error) {
      toast.error('Network error during rejection');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLeaves = pendingLeaves.filter(p => 
    p.name_of_child?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.registration_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <div className="title-group">
          <h1>Leave Approval Management</h1>
          <p>Review and process student leave requests</p>
        </div>
        <div className="stats-group">
          <StatBox>
            <Clock size={20} color="#f59e0b" />
            <div className="stat-content">
              <span className="stat-value">{pendingLeaves.length}</span>
              <span className="stat-label">Pending Requests</span>
            </div>
          </StatBox>
        </div>
      </Header>

      <Controls>
        <SearchBox>
          <Search size={18} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search by student name or reg number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
        <FilterButton>
          <Filter size={18} />
          <span>Filter</span>
        </FilterButton>
      </Controls>

      {loading ? (
        <LoadingState>
          <Spinner />
          <p>Fetching pending requests...</p>
        </LoadingState>
      ) : filteredLeaves.length === 0 ? (
        <EmptyState>
          <AlertCircle size={48} color="#cbd5e1" />
          <h3>No Pending Requests</h3>
          <p>{searchTerm ? 'No results match your search' : 'All leave requests have been processed'}</p>
        </EmptyState>
      ) : (
        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <th>Registration</th>
                <th>Details</th>
                <th>Leave Date</th>
                <th>Reason for Leave</th>
                <th className="center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave, index) => (
                <tr key={index}>
                  <td>
                    <RegID>#{leave.registration_number}</RegID>
                  </td>
                  <td>
                    <UserInfo>
                      <Avatar>{leave.name_of_child?.charAt(0) || '?'}</Avatar>
                      <div className="user-text">
                        <span className="name">{leave.name_of_child}</span>
                        <span className="meta">{leave.age ? `${leave.age.year}y ${leave.age.months}m` : 'N/A'} • {leave.sex}</span>
                      </div>
                    </UserInfo>
                  </td>
                  <td>
                    <DateBadge>
                      <Calendar size={14} />
                      {leave.leave_details.leave_date}
                    </DateBadge>
                  </td>
                  <td>
                    <ReasonText title={leave.leave_details.leave_reason}>
                      {leave.leave_details.leave_reason || 'No reason provided'}
                    </ReasonText>
                  </td>
                  <td className="center">
                    <ActionButtons>
                      <ApproveBtn onClick={() => handleApprove(leave)} disabled={actionLoading}>
                        <CheckCircle size={16} />
                        <span>Approve</span>
                      </ApproveBtn>
                      <RejectBtn onClick={() => openRejectModal(leave)} disabled={actionLoading}>
                        <XCircle size={16} />
                        <span>Reject</span>
                      </RejectBtn>
                    </ActionButtons>
                  </td>
                </tr>
              ))}
            </tbody>
          </StyledTable>
        </TableContainer>
      )}

      {/* Rejection Remark Modal */}
      {rejectingLeave && (
        <ModalOverlay onClick={() => setRejectingLeave(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div className="header-icon reject">
                <XCircle size={24} color="#dc2626" />
              </div>
              <div className="header-text">
                <h3>Reject Leave Request</h3>
                <p>Provide a reason for rejecting <strong>{rejectingLeave.name_of_child}</strong>'s leave.</p>
              </div>
            </ModalHeader>
            <ModalBody>
              <RemarkLabel>
                <MessageSquare size={16} />
                <span>Rejection Remark (Required)</span>
              </RemarkLabel>
              <RemarkInput 
                autoFocus
                placeholder="Type the reason for rejection here..."
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
              />
              <div className="info-note">
                <AlertCircle size={14} />
                <span>This remark will be sent to the student record.</span>
              </div>
            </ModalBody>
            <ModalFooter>
              <SecondaryBtn onClick={() => setRejectingLeave(null)}>Cancel</SecondaryBtn>
              <PrimaryRejectBtn onClick={handleReject} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
              </PrimaryRejectBtn>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

// --- STYLES ---

const Container = styled.div`
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  color: #1e293b;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  @media (max-width: 768px) { flex-direction: column; align-items: flex-start; gap: 1rem; }

  h1 { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin-bottom: 0.25rem; }
  p { color: #64748b; font-size: 0.95rem; }
`;

const StatBox = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;

  .stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: #0f172a; line-height: 1.2; }
  .stat-label { font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.025em; }
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  @media (max-width: 640px) { flex-direction: column; }
`;

const SearchBox = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: white;
  padding: 0 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s;
  
  &:focus-within { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
  input { border: none; padding: 0.75rem 0; width: 100%; outline: none; font-size: 0.95rem; }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.25rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  &:hover { background: #f8fafc; }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow-x: auto;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  &::-webkit-scrollbar { height: 8px; }
  &::-webkit-scrollbar-track { background: #f1f5f9; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  &::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 850px;
  
  th {
    background: #f8fafc;
    text-align: left;
    padding: 1rem 1.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
  }
  
  td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  
  .center { text-align: center; }
`;

const RegID = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.85rem;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  .name { display: block; font-weight: 600; color: #1e293b; }
  .meta { display: block; font-size: 0.8rem; color: #64748b; }
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  background: #557153;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
`;

const DateBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f0f9ff;
  color: #0369a1;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
`;

const ReasonText = styled.div`
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #475569;
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

const BaseBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const ApproveBtn = styled(BaseBtn)`
  background: #dcfce7;
  color: #15803d;
  &:hover:not(:disabled) { background: #bbf7d0; transform: translateY(-1px); }
`;

const RejectBtn = styled(BaseBtn)`
  background: #fee2e2;
  color: #b91c1c;
  &:hover:not(:disabled) { background: #fecaca; transform: translateY(-1px); }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #f1f5f9;
  
  .header-icon {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    &.reject { background: #fef2f2; }
  }
  
  h3 { font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
  p { font-size: 0.9rem; color: #64748b; }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  
  .info-note {
    display: flex; align-items: center; gap: 0.5rem;
    margin-top: 1rem; color: #64748b; font-size: 0.8rem;
  }
`;

const RemarkLabel = styled.div`
  display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 0.75rem; font-size: 0.9rem; font-weight: 600; color: #475569;
`;

const RemarkInput = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  resize: none;
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s;
  
  &:focus { outline: none; border-color: #f87171; box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.1); }
`;

const ModalFooter = styled.div`
  padding: 1.25rem 1.5rem;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const SecondaryBtn = styled.button`
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: white;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #f1f5f9; }
`;

const PrimaryRejectBtn = styled.button`
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  background: #dc2626;
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  &:hover:not(:disabled) { background: #b91c1c; }
  &:disabled { opacity: 0.7; }
`;

const LoadingState = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 4rem; gap: 1rem; color: #64748b;
`;

const Spinner = styled.div`
  width: 40px; height: 40px; border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6; border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
`;

const EmptyState = styled.div`
  text-align: center; padding: 4rem 2rem; border: 2px dashed #e2e8f0; border-radius: 16px;
  h3 { margin: 1rem 0 0.5rem; color: #475569; }
  p { color: #94a3b8; }
`;

export default LeaveApprovalForm;
