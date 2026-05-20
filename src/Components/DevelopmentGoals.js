import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled, { ThemeProvider, keyframes } from "styled-components";
import { 
  Save, 
  Plus, 
  ArrowLeft, 
  Calendar, 
  User, 
  Trash2, 
  CheckCircle2, 
  ChevronDown,
  ChevronRight,
  Target,
  FileText,
  Circle
} from "lucide-react";
import apiRequest from "./apiRequest";

const BASE_URL = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL?.trim();

const STATUS_OPTIONS = ["Not Started", "Emerging", "Developed", "Achieved"];

// --- Theme ---
const theme = {
  colors: {
    primary: "#406147",
    secondary: "#3f37c9",
    accent: "#4895ef",
    background: "#f8f9fa",
    surface: "#ffffff",
    text: "#212529",
    textLight: "#6c757d",
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
    info: "#2196f3",
    border: "#e2e8f0",
  },
  shadows: {
    small: "0 2px 5px rgba(0,0,0,0.1)",
    medium: "0 4px 10px rgba(0,0,0,0.08)",
    large: "0 10px 25px rgba(0,0,0,0.1)",
  },
  borderRadius: {
    small: "6px",
    medium: "12px",
    large: "16px",
  }
};

const fadeIn = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); }`;

const DevelopmentGoals = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const assessment = state?.assessment;
  const editData = state?.editData;

  // Form State
  const [selectedMonth, setSelectedMonth] = useState(
    editData?.date ? editData.date.substring(0, 7) : new Date().toISOString().substring(0, 7)
  );
  
  // Goals structure: [{ therapy, domain, goal, level, status }]
  const [addedGoals, setAddedGoals] = useState(() => {
    if (editData?.development_goals) {
      if (typeof editData.development_goals === 'string') {
        try { return JSON.parse(editData.development_goals); } catch(e) { return []; }
      }
      return editData.development_goals;
    }
    return [];
  });
  
  // Master Library Data
  const [therapyTypes, setTherapyTypes] = useState([]);
  const [allDomains, setAllDomains] = useState([]);
  const [goalLibrary, setGoalLibrary] = useState([]);
  
  // Selection state
  const [activeTherapy, setActiveTherapy] = useState("");
  const [expandedDomains, setExpandedDomains] = useState({});
  const [expandedLevels, setExpandedLevels] = useState({});
  const [customGoal, setCustomGoal] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const [tRes, dRes, gRes] = await Promise.all([
        apiRequest(`${BASE_URL}goal-therapy-types/`, "GET"),
        apiRequest(`${BASE_URL}goal-domains/`, "GET"),
        apiRequest(`${BASE_URL}goal-libraries/`, "GET")
      ]);

      if (tRes.success) {
        setTherapyTypes(tRes.data);
        if (tRes.data.length > 0) setActiveTherapy(tRes.data[0].id);
      }
      if (dRes.success) setAllDomains(dRes.data);
      if (gRes.success) setGoalLibrary(gRes.data);

    } catch (err) {
      console.error("Error fetching library:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousGoals = async () => {
    if (!assessment?.registration_number || editData) return;

    try {
      const result = await apiRequest(`${BASE_URL}development-goals/?registration_number=${assessment.registration_number}`, "GET");
      
      if (result.success && Array.isArray(result.data)) {
        const currentMonthDate = new Date(`${selectedMonth}-01`);
        const fourMonthsAgoDate = new Date(currentMonthDate);
        fourMonthsAgoDate.setMonth(fourMonthsAgoDate.getMonth() - 4);
        
        // Find records within the last 4 months
        const recentRecords = result.data
          .filter(r => {
            const recordDate = new Date(r.date);
            return recordDate < currentMonthDate && recordDate >= fourMonthsAgoDate;
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (recentRecords.length > 0) {
          // We take the most recent available plan from the last 4 months
          const latestPastRecord = recentRecords[0];
          
          let prevGoals = latestPastRecord.development_goals || [];
          if (typeof prevGoals === 'string') {
            try { prevGoals = JSON.parse(prevGoals); } catch(e) { prevGoals = []; }
          }
          
          const carryForward = (Array.isArray(prevGoals) ? prevGoals : []).filter(g => 
            g.status === "Not Started" || g.status === "Emerging"
          );

          if (carryForward.length > 0) {
            console.log(`Carrying forward ${carryForward.length} goals from ${latestPastRecord.date} (within 4-month lookback)`);
            setAddedGoals(prev => {
              const existingKeys = new Set(prev.map(p => `${p.therapy}-${p.domain}-${p.goal}`));
              const newGoals = carryForward.filter(cf => !existingKeys.has(`${cf.therapy}-${cf.domain}-${cf.goal}`));
              
              if (newGoals.length === 0) return prev;
              
              return [...prev, ...newGoals];
            });
          }
        }
      }
    } catch (err) {
      console.error("Error fetching previous goals:", err);
    }
  };

  useEffect(() => {
    fetchLibrary();
    console.log("Goals Component Mount - Edit Mode check:", {
      isEdit: !!editData,
      editId: editData?.id || editData?._id,
      addedGoalsCount: addedGoals.length
    });
  }, []);

  useEffect(() => {
    fetchPreviousGoals();
  }, [assessment?.registration_number, selectedMonth]);

  const toggleDomain = (id) => {
    setExpandedDomains(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLevel = (id) => {
    setExpandedLevels(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addGoal = (therapy, domain, goal, level = "Level 1") => {
    const exists = addedGoals.some(g => g.therapy === therapy && g.domain === domain && g.goal === goal);
    if (exists) return;
    
    setAddedGoals(prev => [...prev, { therapy, domain, goal, level, status: "Not Started" }]);
  };

  const updateGoalStatus = (index, status) => {
    setAddedGoals(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status };
      return updated;
    });
  };

  const removeGoal = (index) => {
    setAddedGoals(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCustom = () => {
    if (!customGoal.trim() || !customDomain.trim()) {
      alert("Please enter both Domain and Goal description.");
      return;
    }
    const currentTherapyName = therapyTypes.find(t => t.id === activeTherapy)?.therapy_name || "Other";
    addGoal(currentTherapyName, customDomain.trim(), customGoal.trim());
    setCustomGoal("");
    setCustomDomain("");
  };

  const handleSave = async () => {
    if (addedGoals.length === 0) {
      alert("Please add at least one goal.");
      return;
    }

    setSaving(true);
    const payload = {
      registration_number: assessment?.registration_number,
      date: `${selectedMonth}-01`,
      development_goals: addedGoals
    };

    try {
      // Use the new Upsert logic on the backend (Update if exists, otherwise create)
      // Identification is handled by registration_number + month (encoded in payload.date)
      const result = await apiRequest(`${BASE_URL}development-goals/`, "POST", payload);

      if (result.success) {
        alert(editData ? "Goals updated successfully!" : "Goals saved successfully!");
        navigate("/DevelopmentGoalsReport", { state: { report: result.data, patient: assessment } });
      } else {
        alert(result.error || "Failed to save goals.");
      }
    } catch (err) {
      alert("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <ArrowLeft size={20} /> Back
          </BackButton>
          <TitleSection>
            <Title>{editData ? "Edit Monthly Goals" : "Set Monthly Development Goals"}</Title>
            <Subtitle>Define therapy-wise domains and specific goals for the patient.</Subtitle>
          </TitleSection>
        </Header>

        <PatientBanner>
          <BannerItem>
            <BannerIcon color="#fff"><User size={18} /></BannerIcon>
            <BannerText>
              <label>Patient Name</label>
              <span>{assessment?.name_of_child || assessment?.patient_name || "Unknown"}</span>
            </BannerText>
          </BannerItem>
          <BannerItem>
            <BannerIcon color="#fff"><Target size={18} /></BannerIcon>
            <BannerText>
              <label>Registration No.</label>
              <span>{assessment?.registration_number || "N/A"}</span>
            </BannerText>
          </BannerItem>
          <BannerItem>
            <BannerIcon color="#fff"><Calendar size={18} /></BannerIcon>
            <BannerText>
              <label>Target Month</label>
              <MonthInput 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                disabled={!!editData}
              />
            </BannerText>
          </BannerItem>
        </PatientBanner>

        <MainLayout>
          <SelectionSection>
            <SectionHeader>
              <Target size={20} color={theme.colors.primary} />
              <h3>Goal Library</h3>
            </SectionHeader>
            
            <TherapyTabs>
              {therapyTypes.map(t => (
                <Tab 
                  key={t.id} 
                  active={activeTherapy === t.id}
                  onClick={() => setActiveTherapy(t.id)}
                >
                  {t.therapy_name.split('(')[0]}
                </Tab>
              ))}
            </TherapyTabs>

            <DomainsContainer>
              {loading ? <p>Loading domains...</p> : allDomains.filter(d => {
                const activeTherapyName = therapyTypes.find(tt => tt.id === String(activeTherapy))?.therapy_name;
                return String(d.therapy_type) === String(activeTherapy) || 
                       d.therapy_type === activeTherapyName;
              }).map((domain) => (
                <DomainCard key={domain.id}>
                  <DomainHeader onClick={() => toggleDomain(domain.id)}>
                    {expandedDomains[domain.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    <span>{domain.name} <small style={{opacity: 0.6, fontSize: '0.7em'}}>({domain.domain_no})</small></span>
                  </DomainHeader>
                  
                  {expandedDomains[domain.id] && (
                    <div style={{ padding: '5px 0' }}>
                      {Object.entries(
                        goalLibrary
                          .filter(g => String(g.domain) === String(domain.id) || String(g.domain) === String(domain.domain_no))
                          .reduce((acc, g) => {
                            const level = g.level_name || 'General';
                            if (!acc[level]) acc[level] = [];
                            acc[level].push(g);
                            return acc;
                          }, {})
                      ).map(([level, goals]) => (
                        <div key={level} style={{ marginLeft: '25px', marginBottom: '8px', borderLeft: '2px solid #eef2ff' }}>
                          <div 
                            onClick={() => toggleLevel(`${domain.id}-${level}`)}
                            style={{ 
                              padding: '10px 15px', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '10px',
                              background: '#f8fafc',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: theme.colors.primary,
                              borderRadius: '0 8px 8px 0'
                            }}
                          >
                            {expandedLevels[`${domain.id}-${level}`] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            {level}
                            <small style={{ marginLeft: 'auto', opacity: 0.5 }}>{goals.length} Goals</small>
                          </div>
                          
                          {expandedLevels[`${domain.id}-${level}`] && (
                            <GoalsList>
                              {goals.map((g) => {
                                const isSelected = addedGoals.some(ag => ag.goal === g.goal_name && ag.domain === g.domain_name);
                                return (
                                  <GoalItem 
                                    key={g.id} 
                                    className={isSelected ? 'selected' : ''}
                                    onClick={() => !isSelected && addGoal(g.therapy_type_name, g.domain_name, g.goal_name, g.level_name)}
                                  >
                                    {isSelected ? <CheckCircle2 size={16} color="#22c55e" /> : <Circle size={16} color="#94a3b8" />}
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                      <span style={{ opacity: isSelected ? 0.6 : 1, textDecoration: isSelected ? 'line-through' : 'none' }}>
                                        {g.goal_name}
                                      </span>
                                    </div>
                                    {!isSelected ? (
                                      <AddIcon><Plus size={14} /></AddIcon>
                                    ) : (
                                      <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>Added</span>
                                    )}
                                  </GoalItem>
                                );
                              })}
                            </GoalsList>
                          )}
                        </div>
                      ))}
                      {goalLibrary.filter(g => 
                        String(g.domain) === String(domain.id) || 
                        String(g.domain) === String(domain.domain_no)
                      ).length === 0 && <p style={{padding: '20px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center'}}>No goals defined in this domain.</p>}
                    </div>
                  )}
                </DomainCard>
              ))}

              <CustomGoalCard>
                <h4><Plus size={16} /> Add Custom Goal</h4>
                <div className="input-row">
                  <input placeholder="Domain (e.g. Literacy)" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} />
                  <input placeholder="Describe specific goal..." value={customGoal} onChange={(e) => setCustomGoal(e.target.value)} />
                  <button onClick={handleAddCustom}><Plus size={20} /></button>
                </div>
              </CustomGoalCard>
            </DomainsContainer>
          </SelectionSection>

          <ReviewSection>
            <SectionHeader>
              <FileText size={20} color={theme.colors.secondary} />
              <h3>Selected Goals Plan</h3>
            </SectionHeader>

            <GoalsReviewContainer>
              {addedGoals.length === 0 ? (
                <EmptyReview>
                  <Target size={48} />
                  <p>No goals selected yet.</p>
                </EmptyReview>
              ) : (
                addedGoals.map((g, idx) => (
                  <ReviewItem key={idx}>
                    <div className="count">{idx + 1}</div>
                    <div className="content">
                      <div className="meta">
                        <span className="therapy-tag">{g.therapy}</span>
                        <span className="domain-tag">{g.domain}</span>
                        <span className="level-tag" style={{background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600}}>{g.level || 'General'}</span>
                      </div>
                      <p className="goal-text">{g.goal}</p>
                      
                      <StatusSelector>
                        <label>Status:</label>
                        <div className="options">
                          {STATUS_OPTIONS.map(opt => (
                            <button 
                              key={opt}
                              className={g.status === opt ? 'active' : ''}
                              onClick={() => updateGoalStatus(idx, opt)}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </StatusSelector>
                    </div>
                    <RemoveBtn onClick={() => removeGoal(idx)}><Trash2 size={16} /></RemoveBtn>
                  </ReviewItem>
                ))
              )}
            </GoalsReviewContainer>

            <ActionPanel>
              <SaveButton onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : <><Save size={20} /> {editData ? "Update Goals" : "Save Goals"}</>}
              </SaveButton>
            </ActionPanel>
          </ReviewSection>
        </MainLayout>
      </PageContainer>
    </ThemeProvider>
  );
};

// --- Styled Components --- (Simplified for space but keeping quality)
const PageContainer = styled.div` 
max-width: 1400px; 
margin: 0 auto; 
padding: 30px; 
background-color: ${props => props.theme.colors.background}; 
min-height: 100vh; 
font-family: 'Inter', sans-serif; `;

const Header = styled.div` 
    display: flex; 
    align-items: flex-start; 
    gap: 30px; 
    justify-content: space-between; 
    align-items: center; 
    margin-bottom: 30px; 
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
    }
`;

const BackButton = styled.button` 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    padding: 10px 16px; 
    background: white; 
    border: 1px solid ${props => props.theme.colors.border}; 
    border-radius: 12px; 
    color: ${props => props.theme.colors.textLight}; 
    font-weight: 600; 
    cursor: pointer; 
`;

const TitleSection = styled.div``;

const Title = styled.h1` 
    font-size: 2rem; 
    color: ${props => props.theme.colors.primary}; 
    margin: 0 0 8px 0; 
    @media (max-width: 768px) {
        font-size: 1.5rem;
    }
`;

const Subtitle = styled.p` 
    color: ${props => props.theme.colors.textLight}; 
    margin: 0; 
    @media (max-width: 768px) {
        font-size: 0.85rem;
    }
`;

const PatientBanner = styled.div` 
    background: ${props => props.theme.colors.primary}; 
    border-radius: 16px; 
    padding: 24px 40px; 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    color: white; 
    margin-bottom: 40px; 
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    @media (max-width: 1024px) {
        flex-direction: column;
        gap: 20px;
        padding: 25px;
        align-items: flex-start;
    }
`;

const BannerItem = styled.div` 
    display: flex; 
    align-items: center; 
    gap: 15px; 
    width: 100%;
`;

const BannerIcon = styled.div` 
    background: rgba(255,255,255,0.2); 
    width: 44px; 
    height: 44px; 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
`;

const BannerText = styled.div` 
    display: flex; 
    flex-direction: column; 
    label { font-size: 0.75rem; opacity: 0.8; margin-bottom: 4px; text-transform: uppercase; } 
    span { font-size: 1.1rem; font-weight: 700; } 
`;

const MonthInput = styled.input` 
    background: rgba(255,255,255,0.1); 
    border: 1px solid rgba(255,255,255,0.3); 
    padding: 5px 12px; 
    border-radius: 8px; 
    color: white; 
    cursor: pointer; 
    &::-webkit-calendar-picker-indicator { filter: invert(1); } 
`;

const MainLayout = styled.div` 
    display: grid; 
    grid-template-columns: 1fr; 
    gap: 30px; 
    animation: ${fadeIn} 0.5s ease-out; 
`;

const SelectionSection = styled.div` 
    background: white; 
    padding: 30px; 
    border-radius: 16px; 
    border: 1px solid ${props => props.theme.colors.border}; 
    max-height: 750px;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: #f1f5f9; }
    &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

    @media (max-width: 768px) {
        padding: 20px 15px;
        max-height: 80vh;
    }
`;

const ReviewSection = styled.div` 
    background: white; 
    padding: 30px; 
    border-radius: 16px; 
    border: 1px solid ${props => props.theme.colors.border}; 
    display: flex; 
    flex-direction: column; 
    @media (max-width: 768px) {
        padding: 20px 15px;
    }
`;

const SectionHeader = styled.div` 
    display: flex; 
    align-items: center; 
    gap: 12px; 
    margin-bottom: 25px; 
    h3 { font-size: 1.25rem; margin: 0; } 
`;

const TherapyTabs = styled.div` 
    display: flex; 
    gap: 8px; 
    margin-bottom: 25px; 
    border-bottom: 1px solid #f1f5f9; 
    overflow-x: auto; 
`;

const Tab = styled.button` 
    padding: 10px 18px; 
    border-radius: 8px; 
    border: none; 
    background: ${props => props.active ? props.theme.colors.primary : 'transparent'}; 
    color: ${props => props.active ? 'white' : props.theme.colors.textLight}; 
    font-weight: 600; 
    cursor: pointer; 
`;

const DomainsContainer = styled.div` 
    display: flex; 
    flex-direction: column; 
    gap: 15px; 
    padding-right: 5px;
`;

// ... other styles ...

const GoalsReviewContainer = styled.div` 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    gap: 16px; 
    max-height: 650px; 
    overflow-y: auto; 
    padding-right: 5px;

    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: #f1f5f9; }
    &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
`;

const DomainCard = styled.div` 
    border: 1px solid #f1f5f9; 
    border-radius: 10px; 
    overflow: hidden; 
`;

const DomainHeader = styled.div` 
    background: #f8fafc; 
    padding: 14px 20px; 
    display: flex; 
    align-items: center; 
    gap: 12px; 
    cursor: pointer; 
    font-weight: 700; 
`;

const GoalsList = styled.div` 
    padding: 10px 15px 15px 40px; 
    display: flex; 
    flex-direction: column; 
    gap: 8px; 
`;

const GoalItem = styled.div` 
    display: flex; 
    align-items: flex-start; 
    gap: 12px; 
    padding: 12px; 
    border-radius: 8px; 
    cursor: pointer; 
    position: relative; 
    transition: all 0.2s;
    &:hover { background: #f0f9ff; } 

    &.selected {
        background: #f8fafc;
        cursor: default;
        border-left: 3px solid #22c55e;
        &:hover { background: #f8fafc; }
    }
`;

const AddIcon = styled.div` 
    position: absolute; 
    right: 15px; 
    top: 50%; 
    transform: translateY(-50%); 
    width: 24px; 
    height: 24px; 
    border-radius: 50%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    opacity: 0; 
    transition: opacity 0.2s; 
    ${GoalItem}:hover & { opacity: 1; } 
`;

const CustomGoalCard = styled.div` 
    margin-top: 10px; 
    border-top: 1px dashed #cbd5e1; 
    padding-top: 20px; 
    .input-row { 
        display: flex; 
        flex-direction: column; 
        gap: 12px; 
        input { 
            padding: 12px; 
            border: 1px solid ${props => props.theme.colors.border}; 
            border-radius: 8px; 
        } 
        button { 
            background: ${props => props.theme.colors.primary}; 
            color: white; 
            border: none; 
            padding: 12px; 
            border-radius: 8px; 
            cursor: pointer; 
        } 
    } 
`;
const ReviewItem = styled.div` 
    display: flex; 
    gap: 15px; 
    background: #f8fafc; 
    padding: 16px; 
    border-radius: 12px; 
    border: 1px solid #f1f5f9; 
    position: relative; 
    .count { 
        width: 28px; 
        height: 28px; 
        background: #eef2ff; 
        color: #3730a3; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center; 
        font-weight: 700; 
        flex-shrink: 0; 
    } 
    .content { 
        flex: 1; 
        .meta { 
            display: flex; 
            gap: 10px; 
            margin-bottom: 8px; 
        } 
        .therapy-tag { 
            font-size: 0.7rem; 
            font-weight: 700; 
            color: ${props => props.theme.colors.primary}; 
            padding: 2px 8px; 
            border-radius: 4px; 
            border: 1px solid ${props => props.theme.colors.primary}; 
        } 
        .domain-tag { 
            font-size: 0.75rem; 
            font-weight: 600; 
            color: #64748b; 
        } 
        .goal-text { 
            margin: 0; 
            font-size: 1rem; 
            color: #334155; 
        } 
    } 
`;

const StatusSelector = styled.div` 
    margin-top: 12px; 
    display: flex; 
    align-items: center; 
    gap: 10px; 
    label { font-size: 0.75rem; font-weight: 800; color: #94a3b8; } 
    .options { 
        display: flex; 
        gap: 5px; 
        button { 
            padding: 6px 12px; 
            border-radius: 6px; 
            border: 1px solid #e2e8f0; 
            background: white; 
            font-size: 0.75rem; 
            font-weight: 600;
            color: ${props => props.theme.colors.textLight};
            cursor: pointer; 
            transition: all 0.2s;

            &:hover {
                border-color: ${props => props.theme.colors.primary};
                color: ${props => props.theme.colors.primary};
            }

            &.active { 
                background: ${props => props.theme.colors.primary}; 
                color: white; 
                border-color: ${props => props.theme.colors.primary};
            } 
        } 
    } 
`;

const RemoveBtn = styled.button` 
    background: transparent; 
    border: none; 
    color: #cbd5e1; 
    cursor: pointer; 
    &:hover { color: #ef4444; } 
`;

const EmptyReview = styled.div` 
    height: 100%; 
    display: flex; 
    flex-direction: column; 
    align-items: center; 
    justify-content: center; 
    color: #cbd5e1; 
    text-align: center; 
    padding: 60px 40px; 
`;

const ActionPanel = styled.div` 
    border-top: 1px solid #f1f5f9; 
    padding-top: 25px; 
    display: flex; 
    justify-content: flex-end; 
`;

const SaveButton = styled.button` 
    background: ${props => props.theme.colors.primary}; 
    color: white; 
    border: none; 
    padding: 16px 40px; 
    border-radius: 12px; 
    font-weight: 700; 
    cursor: pointer; 
    &:disabled { background: #cbd5e1; } 
`;

export default DevelopmentGoals;
