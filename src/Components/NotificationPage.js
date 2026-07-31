import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Send,
  Bell,
  Users,
  CheckSquare,
  Square,
  Search,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  MessageSquare,
  Filter,
  FileText
} from "lucide-react";
import apiRequest from "./apiRequest";

const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL || "";
  return envUrl ? (envUrl.endsWith("/") ? envUrl : envUrl + "/") : "http://127.0.0.1:8000/";
};

const Container = styled.div`
  padding: 0;
  background-color: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  .title-section {
    h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: #0f172a;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    p {
      color: #64748b;
      margin: 0.25rem 0 0 0;
      font-size: 0.95rem;
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1.25fr 0.75fr;
  gap: 1.75rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  padding: 1.75rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;

  label {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.025em;
    margin-bottom: 0.5rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;

  &:focus {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  min-height: 110px;
  resize: vertical;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s;

  &:focus {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 0.75rem;
  margin-bottom: 0.75rem;
  background: white;

  &:focus-within {
    border-color: #0ea5e9;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  }

  input {
    border: none;
    padding: 0.6rem 0;
    width: 100%;
    outline: none;
    font-size: 0.9rem;
  }
`;

const SelectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.825rem;
  color: #64748b;

  .count {
    font-weight: 700;
    color: #0f172a;
  }

  .actions {
    display: flex;
    gap: 0.75rem;

    button {
      background: none;
      border: none;
      color: #0ea5e9;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.8rem;
      padding: 0;

      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const MemberList = styled.div`
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
`;

const MemberRow = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  background: ${(props) => (props.selected ? "#f0fdf4" : "white")};

  &:hover {
    background: ${(props) => (props.selected ? "#dcfce7" : "#f8fafc")};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const CheckboxIcon = styled.div`
  color: ${(props) => (props.selected ? "#16a34a" : "#94a3b8")};
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
`;

const RegBadge = styled.span`
  background: #f1f5f9;
  color: #475569;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  margin-left: 0.5rem;
`;

const SubmitBtn = styled.button`
  width: 100%;
  background: #0ea5e9;
  color: white;
  border: none;
  padding: 0.85rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);
  transition: all 0.2s;

  &:hover {
    background: #0284c7;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const PreviewBox = styled.div`
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  padding: 1.25rem;
  margin-top: 0.75rem;
`;

const PreviewTag = styled.span`
  background: #e0f2fe;
  color: #0369a1;
  font-size: 0.725rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
`;

const PreviewHeading = styled.h4`
  margin: 0.75rem 0 0.4rem 0;
  color: #0f172a;
  font-size: 1rem;
`;

const PreviewText = styled.p`
  margin: 0;
  color: #475569;
  font-size: 0.875rem;
  white-space: pre-wrap;
  line-height: 1.5;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.75rem;

  th {
    background: #f8fafc;
    text-align: left;
    padding: 0.75rem 0.9rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    border-bottom: 2px solid #f1f5f9;
  }

  td {
    padding: 0.75rem 0.9rem;
    border-bottom: 1px solid #f1f5f9;
    font-size: 0.875rem;
    color: #334155;
    vertical-align: middle;
  }
`;

const StatusChip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${(props) => (props.success ? "#dcfce7" : "#fef3c7")};
  color: ${(props) => (props.success ? "#15803d" : "#92400e")};
`;

const RefreshBtn = styled.button`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #0f172a;
  }
`;

export default function NotificationPage() {
  const [title, setTitle] = useState("");
  const [sub, setSub] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMemberRegs, setSelectedMemberRegs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingMembers, setFetchingMembers] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);

  const baseUrl = getBaseUrl();

  useEffect(() => {
    fetchMembers();
    fetchRecentNotifications();
  }, []);

  const fetchMembers = async () => {
    setFetchingMembers(true);
    try {
      const res = await apiRequest(`${baseUrl}all-patient-filterless/`, "GET");
      if (res.success && Array.isArray(res.data)) {
        setMembers(res.data);
      } else {
        const res2 = await apiRequest(`${baseUrl}all-patient/`, "GET");
        if (res2.success && Array.isArray(res2.data)) {
          setMembers(res2.data);
        }
      }
    } catch (err) {
      console.error("Error fetching members:", err);
      toast.error("Failed to load patient records.");
    } finally {
      setFetchingMembers(false);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      const res = await apiRequest(`${baseUrl}notifications/list/`, "GET");
      if (res.success && res.data?.data) {
        setRecentNotifications(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching recent notifications:", err);
    }
  };

  const handleSelectAll = () => {
    const filteredRegs = filteredMembers.map((m) => m.registration_number);
    const combined = Array.from(new Set([...selectedMemberRegs, ...filteredRegs]));
    setSelectedMemberRegs(combined);
  };

  const handleDeselectAll = () => {
    setSelectedMemberRegs([]);
  };

  const toggleMemberSelection = (regNo) => {
    if (selectedMemberRegs.includes(regNo)) {
      setSelectedMemberRegs(selectedMemberRegs.filter((r) => r !== regNo));
    } else {
      setSelectedMemberRegs([...selectedMemberRegs, regNo]);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !sub.trim()) {
      toast.warning("Please enter title and notification message content.");
      return;
    }
    if (selectedMemberRegs.length === 0) {
      toast.warning("Please select at least one recipient member.");
      return;
    }

    setLoading(true);

    const payloadMembers = selectedMemberRegs.map((regNo) => {
      const found = members.find((m) => m.registration_number === regNo);
      return {
        reg_no: regNo,
        name: found ? found.name_of_child : "",
      };
    });

    const payload = {
      title: title.trim(),
      sub: sub.trim(),
      members: payloadMembers,
      created_by: "Admin",
    };

    try {
      const res = await apiRequest(`${baseUrl}notifications/create/`, "POST", payload);
      if (res.success && res.data?.status === "success") {
        toast.success(`Notification ${res.data.notification_id} dispatched successfully!`);
        setTitle("");
        setSub("");
        setSelectedMemberRegs([]);
        fetchRecentNotifications();
      } else {
        toast.error(res.error || "Failed to dispatch notification.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Error dispatching notification.");
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const search = searchQuery.toLowerCase();
    const name = (m.name_of_child || "").toLowerCase();
    const reg = (m.registration_number || "").toLowerCase();
    return name.includes(search) || reg.includes(search);
  });

  return (
    <Container>
      <ToastContainer position="top-right" autoClose={3000} />
      <Header>
        <div className="title-section">
          <h1>
            <Bell size={24} color="#0ea5e9" /> Notification Dispatch & Setup
          </h1>
          <p>Compose notification messages and select target patient members for broadcast</p>
        </div>
      </Header>

      <ContentGrid>
        {/* Form Card */}
        <Card>
          <SectionTitle>
            <MessageSquare size={18} color="#0ea5e9" /> Compose Message & Target Audience
          </SectionTitle>

          <form onSubmit={handleSendNotification}>
            <FormGroup>
              <label>Notification Title</label>
              <Input
                type="text"
                placeholder="e.g., Monthly Assessment Appointment Reminder"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Notification Content / Message</label>
              <Textarea
                placeholder="Type the message body to be delivered to selected members..."
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <label>Assign Target Members</label>
              <SearchWrapper>
                <Search size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Search patient by name or registration number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </SearchWrapper>

              <SelectionHeader>
                <span className="count">
                  {selectedMemberRegs.length} patient member(s) selected
                </span>
                <div className="actions">
                  <button type="button" onClick={handleSelectAll}>
                    Select All
                  </button>
                  <span>•</span>
                  <button type="button" onClick={handleDeselectAll}>
                    Clear
                  </button>
                </div>
              </SelectionHeader>

              <MemberList>
                {fetchingMembers ? (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>
                    Loading patient list...
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div style={{ padding: "1.5rem", textAlign: "center", color: "#64748b", fontSize: "0.875rem" }}>
                    No patient members match the search term.
                  </div>
                ) : (
                  filteredMembers.map((m) => {
                    const isSelected = selectedMemberRegs.includes(m.registration_number);
                    return (
                      <MemberRow
                        key={m.registration_number}
                        selected={isSelected}
                        onClick={() => toggleMemberSelection(m.registration_number)}
                      >
                        <CheckboxIcon selected={isSelected}>
                          {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                        </CheckboxIcon>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.9rem" }}>
                            {m.name_of_child || "Patient"}
                          </span>
                          <RegBadge>{m.registration_number}</RegBadge>
                        </div>
                      </MemberRow>
                    );
                  })
                )}
              </MemberList>
            </FormGroup>

            <SubmitBtn type="submit" disabled={loading}>
              <Send size={18} /> {loading ? "Dispatching..." : "Send Notification"}
            </SubmitBtn>
          </form>
        </Card>

        {/* Side Panel: Preview & Recent Dispatches */}
        <div>
          <Card>
            <SectionTitle>
              <Eye size={18} color="#0ea5e9" /> Message Preview
            </SectionTitle>
            <PreviewBox>
              <PreviewTag>ID: NOTI/26/00001</PreviewTag>
              <PreviewHeading>{title || "Notification Title Placeholder"}</PreviewHeading>
              <PreviewText>
                {sub || "The body text of the notification will be previewed here as you type."}
              </PreviewText>
              <div style={{ marginTop: "0.85rem", fontSize: "0.8rem", color: "#64748b" }}>
                Target Recipients: <strong>{selectedMemberRegs.length} member(s)</strong>
              </div>
            </PreviewBox>
          </Card>

          <Card style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <SectionTitle style={{ margin: 0 }}>
                <Clock size={18} color="#0ea5e9" /> Recent Dispatches
              </SectionTitle>
              <RefreshBtn onClick={fetchRecentNotifications}>
                <RefreshCw size={14} /> Refresh
              </RefreshBtn>
            </div>

            {recentNotifications.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "0.875rem", margin: "1rem 0 0 0" }}>
                No notifications dispatched yet.
              </p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Notification ID</th>
                    <th>Title</th>
                    <th>Opened / Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentNotifications.slice(0, 5).map((n) => (
                    <tr key={n.notification_id}>
                      <td style={{ fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>
                        {n.notification_id}
                      </td>
                      <td>{n.title}</td>
                      <td>
                        <StatusChip success={n.read_count > 0}>
                          {n.read_count} / {n.total_members} Opened
                        </StatusChip>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </div>
      </ContentGrid>
    </Container>
  );
}
