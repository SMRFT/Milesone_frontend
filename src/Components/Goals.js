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

  // New state for handling selected files
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState(editData?.goalsphoto || []);
  const [existingVideos, setExistingVideos] = useState(editData?.goalsvideo || []);


  // Goals List State
  const [goals, setGoals] = useState({
    ShortTerm: editData?.goals?.ShortTerm || [],
    LongTerm: editData?.goals?.LongTerm || []
  });


  // UI Helper State for the input area
  const [category, setCategory] = useState("ShortTerm");
  const [currentTask, setCurrentTask] = useState("");

  // Logic to add a goal to the specific category
  const addGoal = () => {
    if (!currentTask.trim()) return;

    setGoals(prev => ({
      ...prev,
      [category]: [...prev[category], { task: currentTask.trim(), status: "pending" }]
    }));

    setCurrentTask(""); // Clear input after adding
  };

  // Logic to remove a goal
  const removeGoal = (cat, index) => {
    setGoals(prev => ({
      ...prev,
      [cat]: prev[cat].filter((_, i) => i !== index)
    }));
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

      // 🔥 Convert to flat JSON array
      goals: [
        ...goals.ShortTerm.map(g => ({
          category: "ShortTerm",
          task: g.task,
          status: g.status
        })),
        ...goals.LongTerm.map(g => ({
          category: "LongTerm",
          task: g.task,
          status: g.status
        }))
      ],

      // Combine existing IDs with new base64 data
      goalsphoto: [
        ...existingPhotos.map(p => typeof p === 'object' ? p.file : p),
        ...previewFiles.filter(p => p.type === "image").map(p => p.base64)
      ],
      goalsvideo: [
        ...existingVideos.map(v => typeof v === 'object' ? v.file : v),
        ...previewFiles.filter(p => p.type === "video").map(p => p.base64)
      ]
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

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    const processFiles = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            file,
            base64: reader.result,
            url: URL.createObjectURL(file),
            type: file.type.startsWith("video") ? "video" : "image"
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const processed = await Promise.all(processFiles);
    setPreviewFiles(prev => [...prev, ...processed]);
  };

  const removeNewFile = (index) => {
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingMedia = (id, type) => {
    // id could be an object if coming from the new API structure
    const targetId = typeof id === 'object' ? id.file : id;

    if (type === "photo") {
      setExistingPhotos(prev => prev.filter(item => {
        const itemId = typeof item === 'object' ? item.file : item;
        return itemId !== targetId;
      }));
    } else {
      setExistingVideos(prev => prev.filter(item => {
        const itemId = typeof item === 'object' ? item.file : item;
        return itemId !== targetId;
      }));
    }
  };

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
          <GoalInputArea>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="ShortTerm">Short Term</option>
              <option value="LongTerm">Long Term</option>
            </select>
            <input
              type="text"
              placeholder="Enter specific task..."
              value={currentTask}
              onChange={e => setCurrentTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()} // Support Enter key
            />
            <button onClick={addGoal}><Plus size={20} /></button>
          </GoalInputArea>

          <DisplayArea>
            {Object.entries(goals).map(([cat, tasks]) => (
              <div key={cat} style={{ marginBottom: '15px' }}>
                <h4>{cat.replace(/([A-Z])/g, ' $1')}</h4>
                {tasks.length === 0 ? (
                  <small style={{ color: '#94a3b8' }}>No tasks added</small>
                ) : (
                  tasks.map((t, i) => (
                    <TaskItem key={i}>
                      <span>• {t.task}</span>
                      <Trash2
                        size={14}
                        className="remove-btn"
                        onClick={() => removeGoal(cat, i)}
                      />
                    </TaskItem>
                  ))
                )}
              </div>
            ))}
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

          <PhotoUploadSection>
            <label className="upload-label">
              <Plus size={24} />
              <span>Add Goals Photos & Videos</span>
              <input type="file" multiple accept="image/*,video/*" onChange={handleFileChange} hidden />
            </label>

            <div className="preview-container">
              {/* Existing Media */}
              {existingPhotos.map((item, i) => {
                const url = getMediaUrl(item);
                return (
                  <div key={`ex-p-${i}`} className="preview-card">
                    <img src={url} alt="existing" />
                    <div className="media-tag">Photo</div>
                    <button onClick={() => removeExistingMedia(item, "photo")}><X size={14} /></button>
                  </div>
                );
              })}
              {existingVideos.map((item, i) => {
                const url = getMediaUrl(item);
                return (
                  <div key={`ex-v-${i}`} className="preview-card video-card">
                    <video src={url} muted />
                    <div className="media-tag v-tag">Video</div>
                    <button onClick={() => removeExistingMedia(item, "video")}><X size={14} /></button>
                  </div>
                );
              })}

              {/* New Media Previews */}
              {previewFiles.map((p, i) => (
                <div key={`new-${i}`} className="preview-card">
                  {p.type === "image" ? (
                    <img src={p.url} alt="preview" />
                  ) : (
                    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
                      <video src={p.url} muted />
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(0,0,0,0.5)',
                        borderRadius: '50%',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none'
                      }}>
                        <Video color="white" size={24} />
                      </div>
                    </div>
                  )}
                  <div className={`media-tag ${p.type === "video" ? "v-tag" : ""}`}>
                    New {p.type === "image" ? "Photo" : "Video"}
                  </div>
                  <button onClick={() => removeNewFile(i)}><X size={14} /></button>
                </div>
              ))}
            </div>
          </PhotoUploadSection>
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

// Styles
const Container = styled.div`
      padding: 30px; 
    max-width: 1000px; 
    margin: 0 auto; 
    font-family: 'Inter', sans-serif; 
    background: #f8fafc; 
    min-height: 100vh;
`;
const Header = styled.div`
    display: flex; 
    align-items: center; 
    gap: 20px; 
    margin-bottom: 20px; 
    .back-btn { 
        background: none; 
        border: none; 
        cursor: pointer; 
        display: flex; 
        align-items: center; 
        gap: 5px; 
        color: #64748b; 
        font-weight: 600; 
    } 
    h2 { 
        color: #406147; 
    }
`;
const PatientStrip = styled.div`
    display: flex; 
    gap: 30px; 
    background: #406147; 
    color: white; 
    padding: 15px 25px; 
    border-radius: 12px; 
    margin-bottom: 25px; 
    .item { 
        display: flex; 
        align-items: center; 
        gap: 8px; 
    }
`;
const MainGrid = styled.div`
    display: grid; 
    grid-template-columns: 1fr 1.5fr; 
    gap: 25px;
`;
const Section = styled.div`
    background: white; 
    padding: 25px; 
    border-radius: 12px; 
    border: 1px solid #e2e8f0; 
    h3 { margin-top: 0; margin-bottom: 20px; 
    color: #1e293b; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    font-size: 1.1rem; 
}
`;

const InputGroup = styled.div`
      margin-bottom: 15px; 
    label { 
        display: block; 
        font-size: 0.85rem; 
        font-weight: 600; 
        color: #64748b; 
        margin-bottom: 5px; 
    } 
    input { 
        width: 100%; 
        padding: 10px; 
        border: 1px solid #cbd5e1; 
        border-radius: 8px; 
        font-size: 0.95rem; 
    } 
    .deadline-input { 
        border-left: 4px solid #e11d48; 
    }
`;
const GoalInputArea = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  align-items: center; /* Ensures everything is vertically aligned */
  width: 100%;

  select {
    padding: 14px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    background-color: #f8fafc;
    font-weight: 500;
    min-width: 150px; /* Gives the dropdown a consistent width */
    height: 54px;   /* Matching height for all elements */
  }

  input {
    flex: 1;          /* This tells the input to grow and fill the space */
    min-width: 300px; /* Ensures it never gets too small */
    padding: 14px 20px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-size: 1.1rem;
    height: 54px;     /* Comfortable height */
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);

    &:focus {
      outline: none;
      border-color: #3f37c9;
      box-shadow: 0 0 0 4px rgba(63, 55, 201, 0.1);
    }
  }

  button {
    background: #3f37c9;
    color: white;
    border: none;
    border-radius: 10px;
    width: 54px;      /* Square button for the plus icon */
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #342ead;
    }
  }
`;

const TaskItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f1f5f9;
  border-radius: 6px;
  margin-bottom: 5px;
  font-size: 0.95rem;
  color: #334155;

  .remove-btn {
    color: #ef4444;
    cursor: pointer;
    opacity: 0.6;
    &:hover { opacity: 1; }
  }
`;

const DisplayArea = styled.div`
    h4 { 
        color: #406147; 
          margin: 15px 0 5px; 
        font-size: 0.9rem; 
        border-bottom: 1px solid #f1f5f9; 
    } 
    .task-row { 
        font-size: 0.9rem; 
        padding: 5px 0; 
        color: #334155; 
    }`;
const Footer = styled.div`
      margin-top: 30px; 
    text-align: center; 
    .save-btn { 
        background: #406147; 
        color: white; 
        border: none; 
        padding: 15px 40px; 
        border-radius: 12px; 
        font-weight: 700; 
        cursor: pointer; 
        display: flex; 
        align-items: center; 
        gap: 10px; 
        margin: 0 auto; 
        transition: 0.2s; 
        &:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); 
        } 
    }`;

const TextAreaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;

  textarea {
    width: 100%;
    min-height: 120px;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    font-family: inherit;
    font-size: 0.95rem;
    resize: vertical;
    background: #fdfdfd;

    &:focus {
      outline: none;
      border-color: #406147;
      box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.1);
    }
  }
`;

const PhotoUploadSection = styled.div`
  border-top: 1px solid #f1f5f9;
  padding-top: 20px;

  .upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
    border: 2px dashed #cbd5e1;
    border-radius: 12px;
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
      margin-top: 10px;
      font-weight: 600;
      font-size: 0.9rem;
    }
  }

  .preview-container {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-top: 20px;
  }

  .preview-card {
    position: relative;
    width: 140px;
    height: 140px;
    background: #000;
    border-radius: 10px;
    overflow: hidden;
    
    img, video { 
      width: 100%; 
      height: 100%; 
      object-fit: cover; 
    }

    .media-tag {
      position: absolute;
      bottom: 5px;
      left: 5px;
      background: rgba(0,0,0,0.6);
      color: white;
      font-size: 0.65rem;
      padding: 2px 6px;
      border-radius: 4px;
      backdrop-filter: blur(2px);
    }

    .v-tag { background: rgba(30, 64, 175, 0.7); }

    button {
      position: absolute; 
      top: 5px; 
      right: 5px;
      background: #ef4444; 
      color: white; 
      border: none;
      border-radius: 50%; 
      width: 20px; 
      height: 20px;
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      z-index: 2;
      
      &:hover {
        background: #dc2626;
      }
    }
  }
`;

export default Goals;