import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Save, Plus, ArrowLeft, Calendar, Video, ClipboardList, User, Trash2, X, } from "lucide-react";
import apiRequest from "./apiRequest";
const BASE_URL = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL?.trim();
const Goals = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const assessment = state?.assessment;
  const editData = state?.editData;

  // Form State
  const [formData, setFormData] = useState({
    date: editData?.date || new Date().toISOString().split("T")[0],
    deadline: editData?.deadline || "",
    refference: editData?.refference || "", // Note: double 'f' to match your Django model
    comments: editData?.comments || "",
    recommendations: editData?.recommendations || "",
    parent_comments: editData?.parent_comments || "", // Added
  });

  // Library Master States
  const [therapyTypes, setTherapyTypes] = useState([]);
  const [allDomains, setAllDomains] = useState([]);
  const [activityLibrary, setActivityLibrary] = useState([]);

  // Library Selection States
  const [selectedTherapy, setSelectedTherapy] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [loadingLibrary, setLoadingLibrary] = useState(false);


  // Goals List State
  const [goals, setGoals] = useState(() => {
    if (!editData?.goals) return [];
    if (Array.isArray(editData.goals)) {
      return editData.goals;
    }
    // Fallback if it is grouped object
    const list = [];
    if (editData.goals.ShortTerm) list.push(...editData.goals.ShortTerm);
    if (editData.goals.LongTerm) list.push(...editData.goals.LongTerm);
    return list;
  });

  // Fetch Library Data
  React.useEffect(() => {
    const fetchLibrary = async () => {
      setLoadingLibrary(true);
      try {
        const [tRes, dRes, aRes] = await Promise.all([
          apiRequest(`${BASE_URL}goal-therapy-types/`, "GET"),
          apiRequest(`${BASE_URL}goal-domains/`, "GET"),
          apiRequest(`${BASE_URL}activity-libraries/`, "GET")
        ]);

        if (tRes.success) {
          setTherapyTypes(tRes.data);
          if (tRes.data.length > 0) {
            setSelectedTherapy(tRes.data[0].id || tRes.data[0].therapy_id || tRes.data[0]._id);
          }
        }
        if (dRes.success) setAllDomains(dRes.data);
        if (aRes.success) setActivityLibrary(aRes.data);
      } catch (err) {
        console.error("Error fetching library data:", err);
      } finally {
        setLoadingLibrary(false);
      }
    };
    fetchLibrary();
  }, []);

  // Filter domains based on selected therapy
  const filteredDomains = allDomains.filter(d => {
    if (!selectedTherapy) return false;
    const selectedTherapyObj = therapyTypes.find(t => 
      String(t.id || t._id || t.therapy_id) === String(selectedTherapy)
    );
    if (!selectedTherapyObj) return false;

    return (
      String(d.therapy_type) === String(selectedTherapyObj.therapy_id) ||
      String(d.therapy_type) === String(selectedTherapyObj.therapy_name) ||
      String(d.therapy_type) === String(selectedTherapyObj.id || selectedTherapyObj._id)
    );
  });

  // Reset selectedDomain when selectedTherapy changes
  React.useEffect(() => {
    if (filteredDomains.length > 0) {
      setSelectedDomain(filteredDomains[0].domain_no || filteredDomains[0].domain || filteredDomains[0].id || filteredDomains[0]._id);
    } else {
      setSelectedDomain("");
    }
  }, [selectedTherapy, allDomains]);

  // Filter tasks based on selected therapy and domain
  const filteredTasks = activityLibrary.filter(task => {
    if (!selectedTherapy || !selectedDomain) return false;

    const selectedTherapyObj = therapyTypes.find(t => 
      String(t.id || t._id || t.therapy_id) === String(selectedTherapy)
    );
    if (!selectedTherapyObj) return false;

    const therapyMatch = (
      String(task.therapy_type) === String(selectedTherapyObj.therapy_id) ||
      String(task.therapy_type) === String(selectedTherapyObj.therapy_name) ||
      String(task.therapy_type) === String(selectedTherapyObj.id || selectedTherapyObj._id)
    );

    const selectedDomainObj = allDomains.find(d => 
      String(d.domain_no || d.id || d._id) === String(selectedDomain)
    );
    if (!selectedDomainObj) return false;

    const domainMatch = (
      String(task.domain) === String(selectedDomainObj.domain_no) ||
      String(task.domain) === String(selectedDomainObj.name) ||
      String(task.domain) === String(selectedDomainObj.id || selectedDomainObj._id)
    );

    return therapyMatch && domainMatch;
  });

  // Reset selectedTask when selectedDomain changes
  React.useEffect(() => {
    if (filteredTasks.length > 0) {
      setSelectedTask(filteredTasks[0].task_name);
    } else {
      setSelectedTask("");
    }
  }, [selectedDomain, activityLibrary]);

  // Logic to add a goal from the library
  const addGoalFromLibrary = () => {
    if (!selectedTask) {
      alert("Please select a task from the activity library.");
      return;
    }

    const exists = goals.some(g => g.task === selectedTask);
    if (exists) {
      alert("This task has already been added.");
      return;
    }

    setGoals(prev => [
      ...prev,
      { task: selectedTask, status: "pending" }
    ]);
  };

  // Logic to remove a goal
  const removeGoal = (index) => {
    setGoals(prev => prev.filter((_, i) => i !== index));
  };

  // --- CREATE LOGIC ---
  const handleSave = async () => {
    const regNum = assessment?.registration_number;

    // 1. Validation
    if (!formData.deadline) return alert("Please select a deadline.");
    if (!regNum) return alert("No patient registration found.");

    // 2. Construct Payload to match your JSON precisely
    const payload = {
      registration_number: regNum,
      date: formData.date,
      deadline: formData.deadline,
      refference: formData.refference,
      comments: formData.comments,
      recommendations: formData.recommendations,
      parent_comments: formData.parent_comments,

      goals: goals.map(g => ({
        task: g.task,
        status: g.status
      })),

      goalsphoto: editData?.goalsphoto || [],
      goalsvideo: editData?.goalsvideo || []
    };

    if (editData) {
      await handleUpdate(payload);
    } else {
      const url = `${BASE_URL}goals/`;
      const result = await apiRequest(url, "POST", payload);

      if (result.success) {
        alert("Assessment saved!");
        navigate("/GoalsReport", { state: { report: result.data, patient: assessment } });
      } else {
        alert(result.error || "Save failed");
      }
    }
  };

  const handleUpdate = async (payload) => {
    // Use the ID from editData for the URL
    const url = `${BASE_URL}goals/${editData.id}/`;

    try {
      const result = await apiRequest(url, "PATCH", payload);

      if (result.success) {
        alert("Assessment updated successfully!");
        navigate("/GoalsReport", {
          state: { report: result.data, patient: assessment }
        });
      } else {
        alert(result.error || "Update failed.");
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert("An unexpected error occurred.");
    }
  };

  // Media handling methods removed

  const getMediaUrl = (item) => {
    if (!item) return "";

    // Helper to extract a 24-character hex ID from a string (common for MongoDB ObjectIds)
    const extractId = (str) => {
      if (typeof str !== 'string') return null;
      // Look for 'id': '...' or just a standalone 24-char hex string
      const idMatch = str.match(/'id',\s*'([a-f0-9]{24})'/) || str.match(/([a-f0-9]{24})/);
      return idMatch ? idMatch[1] : null;
    };

    // If it's a string, it might be just an ID or a messy OrderedDict string
    if (typeof item === 'string') {
      if (item.length === 24 && /^[a-f0-9]+$/.test(item)) {
        return `${BASE_URL}goals/file/${item}/`;
      }

      const extractedId = extractId(item);
      if (extractedId) return `${BASE_URL}goals/file/${extractedId}/`;

      return `${BASE_URL}goals/file/${item}/`;
    }

    const id = item.file || item.id || item._id;
    const url = item.url || item.path;

    if (url) {
      if (url.startsWith('http')) return url;
      const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
      return `${BASE_URL}${cleanUrl}`;
    }

    if (id) {
      // If id is an object or messy string, try extracting
      const cleanId = typeof id === 'string' ? extractId(id) || id : id;
      return `${BASE_URL}goals/file/${cleanId}/`;
    }
    return "";
  };

  return (
    <Container>
      <Header>
        <button onClick={() => navigate(-1)} className="back-btn"><ArrowLeft size={20} /> Back</button>
        <h2>{editData ? "Edit Therapeutic Goals" : "Set Therapeutic Goals"}</h2>
      </Header>

      <PatientStrip>
        <div className="item"><User size={16} /> <strong>Patient:</strong> {assessment?.name_of_child || "Unknown"}</div>
        <div className="item"><strong>ID:</strong> {assessment?.registration_number || "N/A"}</div>
        <div className="item"><strong>Sex:</strong> {assessment?.sex || "N/A"}</div>
      </PatientStrip>

      <MainGrid>
        <Section style={{ gridColumn: "1 / -1", marginTop: "20px" }}>

          <h3><Calendar size={18} /> Schedule & Reference</h3>
          <InputGroup>
            <label>Assessment Date</label>
            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
          </InputGroup>
          <InputGroup>
            <label>Target Deadline</label>
            <input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} className="deadline-input" />
          </InputGroup>
          <InputGroup>
            <label><Video size={16} /> Reference Video Link</label>
            <input
              type="url"
              placeholder="https://youtube.com/..."
              value={formData.refference}
              onChange={e => setFormData({ ...formData, refference: e.target.value })}
            />
          </InputGroup>
        </Section>

        <Section>
          <h3><ClipboardList size={18} /> Assign Tasks</h3>
          <GoalInputArea style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              <InputGroup style={{ marginBottom: 0 }}>
                <label>Therapy Type</label>
                <select value={selectedTherapy} onChange={e => setSelectedTherapy(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select Therapy...</option>
                  {therapyTypes.map(t => (
                    <option key={t.id || t._id} value={t.id || t._id || t.therapy_id}>{t.therapy_name}</option>
                  ))}
                </select>
              </InputGroup>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <InputGroup style={{ marginBottom: 0 }}>
                <label>Domain</label>
                <select value={selectedDomain} onChange={e => setSelectedDomain(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select Domain...</option>
                  {filteredDomains.map(d => (
                    <option key={d.id || d._id} value={d.domain_no || d.id || d._id}>{d.name} ({d.domain_no})</option>
                  ))}
                </select>
              </InputGroup>
              <InputGroup style={{ marginBottom: 0 }}>
                <label>Task / Activity</label>
                <select value={selectedTask} onChange={e => setSelectedTask(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select Task...</option>
                  {filteredTasks.map(t => (
                    <option key={t.id || t._id} value={t.task_name}>{t.task_name}</option>
                  ))}
                </select>
              </InputGroup>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button 
                type="button" 
                onClick={addGoalFromLibrary} 
                style={{ 
                  background: '#406147', 
                  color: 'white', 
                  border: 'none', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: '600',
                  height: 'auto',
                  width: 'auto'
                }}
              >
                <Plus size={18} /> Add Goal Task
              </button>
            </div>
          </GoalInputArea>

          <DisplayArea>
            <div style={{ marginBottom: '15px' }}>
              <h4>Assigned Tasks</h4>
              {goals.length === 0 ? (
                <small style={{ color: '#94a3b8' }}>No tasks added</small>
              ) : (
                goals.map((t, i) => (
                  <TaskItem key={i}>
                    <span>• {t.task}</span>
                    <Trash2
                      size={14}
                      className="remove-btn"
                      onClick={() => removeGoal(i)}
                    />
                  </TaskItem>
                ))
              )}
            </div>
          </DisplayArea>
        </Section>
        {/* ... previous sections (Schedule & Assign Tasks) ... */}

        <Section style={{ gridColumn: "1 / -1" }}>
          <h3><ClipboardList size={18} /> Clinical Documentation & Feedback</h3>

          <TextAreaGrid>
            <InputGroup>
              <label>Parents Comments</label>
              <textarea
                value={formData.comments}
                onChange={e => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Enter parents comments..."
              />
            </InputGroup>

            <InputGroup>
              <label>Recommendations</label>
              <textarea
                value={formData.recommendations}
                onChange={e => setFormData({ ...formData, recommendations: e.target.value })}
                placeholder="Home exercises, dietary changes, etc."
              />
            </InputGroup>

            {/* <InputGroup>
              <label>Parent/Guardian Feedback</label>
              <textarea
                value={formData.parent_comments}
                onChange={e => setFormData({ ...formData, parent_comments: e.target.value })}
                placeholder="Record what the parents shared..."
              />
            </InputGroup> */}
          </TextAreaGrid>

          {/* Photo and Video section removed */}
        </Section>
      </MainGrid>

      <Footer>
        <button className="save-btn" onClick={handleSave}>
          <Save size={20} /> {editData ? "Update Assessment" : "Save Assessment"}
        </button>
      </Footer>
    </Container>
  );
};

// Sty// Styles
const Container = styled.div`
  max-width: 100%;
  margin: 20px 40px;
  font-family: 'Inter', sans-serif; 
  background: transparent; 
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex; 
  align-items: center; 
  gap: 20px; 
  margin-bottom: 30px; 

  .back-btn { 
    background: white; 
    border: 1px solid #cbd5e1; 
    border-radius: 100px; 
    padding: 8px 16px;
    cursor: pointer; 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    color: #475569; 
    font-weight: 600; 
    font-size: 0.9rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease-in-out;
    &:hover {
      background: #f8fafc;
      transform: translateX(-2px);
    }
  } 

  h2 { 
    color: #406147; 
    margin: 0;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
`;

const PatientStrip = styled.div`
  display: flex; 
  align-items: center;
  flex-wrap: wrap;
  gap: 24px; 
  background: linear-gradient(135deg, #406147 0%, #2d4532 100%); 
  color: white; 
  padding: 16px 28px; 
  border-radius: 16px; 
  margin-bottom: 30px; 
  box-shadow: 0 4px 18px 0 rgba(64, 97, 71, 0.15);

  .item { 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    font-size: 1rem;
    font-weight: 500;
    svg {
      opacity: 0.9;
    }
  }
`;

const MainGrid = styled.div`
  display: grid; 
  grid-template-columns: 1fr 1.5fr; 
  gap: 30px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white; 
  padding: 30px; 
  border-radius: 16px; 
  border: 1px solid #e2e8f0; 
  box-shadow: 0 4px 18px 0 rgba(0, 0, 0, 0.03), 0 1px 2px 0 rgba(0, 0, 0, 0.02);

  h3 { 
    margin-top: 0; 
    margin-bottom: 24px; 
    color: #1e293b; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    font-size: 1.2rem; 
    font-weight: 700;
    border-bottom: 1px solid #f1f5f9;
    padding-bottom: 12px;
    svg {
      color: #406147;
    }
  }
`;

const InputGroup = styled.div`
  margin-bottom: 20px; 

  label { 
    display: block; 
    font-size: 0.85rem; 
    font-weight: 700; 
    color: #475569; 
    margin-bottom: 8px; 
    text-transform: uppercase;
    letter-spacing: 0.03em;
  } 

  input { 
    width: 100%; 
    padding: 12px 16px; 
    border: 1px solid #cbd5e1; 
    border-radius: 10px; 
    font-size: 0.95rem; 
    color: #1e293b;
    background: #f8fafc;
    transition: all 0.2s ease-in-out;

    &:focus {
      outline: none;
      border-color: #406147;
      background: white;
      box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.15);
    }
  } 

  .deadline-input { 
    border-left: 4px solid #ef4444; 
  }
`;

const GoalInputArea = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  align-items: center;
  width: 100%;

  select {
    padding: 12px 16px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    background-color: #f8fafc;
    font-weight: 600;
    color: #334155;
    min-width: 150px;
    height: 50px;
    cursor: pointer;
    transition: all 0.2s;
    &:focus {
      outline: none;
      border-color: #406147;
      box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.15);
    }
  }

  input {
    flex: 1;
    min-width: 200px;
    padding: 12px 16px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    font-size: 0.95rem;
    font-weight: 500;
    color: #1e293b;
    height: 50px;
    background: #f8fafc;
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #406147;
      background: white;
      box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.15);
    }
  }

  button {
    background: #406147;
    color: white;
    border: none;
    border-radius: 12px;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
      background: #2d4532;
      transform: scale(1.05);
    }
  }
`;

const TaskItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 8px;
  font-size: 0.95rem;
  color: #334155;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
  }

  .remove-btn {
    color: #ef4444;
    cursor: pointer;
    opacity: 0.6;
    transition: all 0.2s;
    &:hover { 
      opacity: 1; 
      transform: scale(1.1);
    }
  }
`;

const DisplayArea = styled.div`
  h4 { 
    color: #406147; 
    margin: 20px 0 10px; 
    font-size: 0.95rem; 
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 2px solid #e2e8f0; 
    padding-bottom: 6px;
  }
`;

const Footer = styled.div`
  margin-top: 40px; 
  text-align: center; 
  
  .save-btn { 
    background: #406147; 
    color: white; 
    border: none; 
    padding: 16px 48px; 
    border-radius: 100px; 
    font-weight: 700; 
    font-size: 1rem;
    cursor: pointer; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    margin: 0 auto; 
    box-shadow: 0 4px 18px 0 rgba(64, 97, 71, 0.25);
    transition: all 0.2s ease-in-out; 
    
    &:hover { 
      background: #2d4532;
      transform: translateY(-2px); 
      box-shadow: 0 8px 24px 0 rgba(64, 97, 71, 0.35); 
    } 
  }
`;

const TextAreaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 25px;

  textarea {
    width: 100%;
    min-height: 120px;
    padding: 14px 18px;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    font-family: inherit;
    font-size: 0.95rem;
    color: #1e293b;
    resize: vertical;
    background: #f8fafc;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #406147;
      background: white;
      box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.15);
    }
  }
`;

const PhotoUploadSection = styled.div`
  border-top: 1px solid #e2e8f0;
  padding-top: 25px;

  .upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    border: 2px dashed #cbd5e1;
    border-radius: 16px;
    cursor: pointer;
    color: #64748b;
    transition: all 0.2s ease;
    background: #f8fafc;
    
    &:hover { 
      background: #f1f5f9; 
      border-color: #406147; 
      color: #406147; 
    }

    span {
      margin-top: 12px;
      font-weight: 700;
      font-size: 0.95rem;
    }
  }

  .preview-container {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 25px;
  }

  .preview-card {
    position: relative;
    width: 140px;
    height: 140px;
    background: #0f172a;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    
    img, video { 
      width: 100%; 
      height: 100%; 
      object-fit: cover; 
    }

    .media-tag {
      position: absolute;
      bottom: 8px;
      left: 8px;
      background: rgba(0, 0, 0, 0.75);
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 6px;
      backdrop-filter: blur(4px);
    }

    .v-tag { background: rgba(30, 64, 175, 0.85); }

    button {
      position: absolute; 
      top: 8px; 
      right: 8px;
      background: #ef4444; 
      color: white; 
      border: none;
      border-radius: 50%; 
      width: 22px; 
      height: 22px;
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      z-index: 2;
      box-shadow: 0 2px 4px rgba(0,0,0,0.25);
      transition: all 0.2s;
      
      &:hover {
        background: #dc2626;
        transform: scale(1.1);
      }
    }
  }
`;

export default Goals;