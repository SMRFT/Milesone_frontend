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
  Circle,
  Search,
  X
} from "lucide-react";
import apiRequest from "./apiRequest";

const BASE_URL = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL?.trim();

const STATUS_OPTIONS = ["Not Started", "Emerging", "Developed", "Achieved"];

const getStatusFromPercentage = (pct) => {
  if (pct <= 25) return "Not Started";
  if (pct <= 50) return "Emerging";
  if (pct <= 75) return "Developed";
  return "Achieved";
};

const normalizeLoadedGoals = (goals) => {
  if (!Array.isArray(goals)) return [];
  const todayStr = new Date().toISOString().split('T')[0];
  return goals.map(g => {
    const history = Array.isArray(g.history) ? g.history : [];
    
    let percentage = typeof g.percentage === 'number' ? g.percentage : null;
    if (percentage === null) {
      if (history.length > 0) {
        const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
        percentage = sorted[0].percentage;
      } else {
        const statusLower = String(g.status || "").toLowerCase();
        if (statusLower.includes("achieved")) percentage = 100;
        else if (statusLower.includes("developed") || statusLower.includes("developing")) percentage = 60;
        else if (statusLower.includes("emerging")) percentage = 30;
        else percentage = 0;
      }
    }
    
    const finalHistory = history.length > 0 ? history : [{ date: todayStr, percentage }];
    
    let status = g.status || "Not Started";
    if (percentage <= 25) status = "Not Started";
    else if (percentage <= 50) status = "Emerging";
    else if (percentage <= 75) status = "Developed";
    else status = "Achieved";

    return {
      ...g,
      percentage,
      status,
      history: finalHistory
    };
  });
};

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
        try { return normalizeLoadedGoals(JSON.parse(editData.development_goals)); } catch(e) { return []; }
      }
      return normalizeLoadedGoals(editData.development_goals);
    }
    return [];
  });
  
  // Master Library Data
  const [therapyTypes, setTherapyTypes] = useState([]);
  const [allDomains, setAllDomains] = useState([]);
  const [goalLibrary, setGoalLibrary] = useState([]);
  const [levels, setLevels] = useState([]);
  
  // Selection state
  const [activeTherapy, setActiveTherapy] = useState("");
  const [expandedDomains, setExpandedDomains] = useState({});
  const [expandedLevels, setExpandedLevels] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progressDates, setProgressDates] = useState({});
  const [expandedGoalHistories, setExpandedGoalHistories] = useState({});
  const [goalSearchQuery, setGoalSearchQuery] = useState("");
  const todayStr = new Date().toISOString().split('T')[0];

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const [tRes, dRes, gRes, lRes] = await Promise.all([
        apiRequest(`${BASE_URL}goal-therapy-types/`, "GET"),
        apiRequest(`${BASE_URL}goal-domains/`, "GET"),
        apiRequest(`${BASE_URL}goal-libraries/`, "GET"),
        apiRequest(`${BASE_URL}goal-levels/`, "GET")
      ]);

      if (tRes.success) {
        setTherapyTypes(tRes.data);
        if (tRes.data.length > 0) setActiveTherapy(tRes.data[0].id);
      }
      if (dRes.success) setAllDomains(dRes.data);
      if (gRes.success) setGoalLibrary(gRes.data);
      if (lRes && lRes.success) setLevels(lRes.data);

    } catch (err) {
      console.error("Error fetching library:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousGoals = async () => {
    if (!assessment?.registration_number) return;

    try {
      const result = await apiRequest(`${BASE_URL}development-goals/?registration_number=${assessment.registration_number}`, "GET");
      
      if (result.success && Array.isArray(result.data)) {
        const currentMonthDate = new Date(`${selectedMonth}-01`);
        const fourMonthsAgoDate = new Date(currentMonthDate);
        fourMonthsAgoDate.setMonth(fourMonthsAgoDate.getMonth() - 4);

        // 1. Retrieve goals set for the child in the current month (if any exist)
        const currentMonthRecord = result.data.find(r => r.date && r.date.substring(0, 7) === selectedMonth);
        let currentGoals = [];
        if (currentMonthRecord) {
          let goals = currentMonthRecord.development_goals || [];
          if (typeof goals === 'string') {
            try { goals = JSON.parse(goals); } catch(e) { goals = []; }
          }
          currentGoals = normalizeLoadedGoals(goals);
        }

        // 2. Retrieve goals from the most recent previous record (within a 4-month lookback) that are not developed or achieved
        const pastRecords = result.data
          .filter(r => {
            const recordDate = new Date(r.date);
            return recordDate < currentMonthDate && recordDate >= fourMonthsAgoDate;
          })
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        let carryForward = [];
        if (pastRecords.length > 0) {
          const latestPastRecord = pastRecords[0];
          let prevGoals = latestPastRecord.development_goals || [];
          if (typeof prevGoals === 'string') {
            try { prevGoals = JSON.parse(prevGoals); } catch(e) { prevGoals = []; }
          }
          prevGoals = normalizeLoadedGoals(prevGoals);
          
          carryForward = prevGoals.filter(g => {
            const statusLower = String(g.status || "").toLowerCase().trim();
            // Not developed or achieved means status is only "Not Started" or "Emerging"
            return statusLower === "not started" || statusLower === "emerging";
          });
        }

        // 3. Merge them, ensuring uniqueness of goals
        const mergedGoals = [...currentGoals];
        const existingKeys = new Set(currentGoals.map(p => `${String(p.therapy).toLowerCase()}-${String(p.domain).toLowerCase()}-${String(p.goal).toLowerCase()}`));

        carryForward.forEach(cf => {
          const key = `${String(cf.therapy).toLowerCase()}-${String(cf.domain).toLowerCase()}-${String(cf.goal).toLowerCase()}`;
          if (!existingKeys.has(key)) {
            existingKeys.add(key);
            mergedGoals.push(cf);
          }
        });

        console.log(`Goals load stats: current month: ${currentGoals.length}, carried forward: ${carryForward.length}, merged total: ${mergedGoals.length}`);
        setAddedGoals(mergedGoals);
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

  const addGoal = (g) => {
    const therapyVal = g.therapy_type || g.therapy_type_name;
    const domainVal = g.domain_no || g.domain || g.domain_name;
    const levelVal = g.level || g.level_name || "";

    const exists = addedGoals.some(ag => 
      ag.goal === g.goal_name && 
      (
        String(ag.domain) === String(domainVal) || 
        String(ag.domain) === String(g.domain_name)
      )
    );
    if (exists) return;
    
    setAddedGoals(prev => [...prev, { 
      therapy: therapyVal, 
      domain: domainVal, 
      goal: g.goal_name, 
      level: levelVal, 
      status: "Not Started",
      percentage: 0,
      employee_id: localStorage.getItem("employeeId") || "",
      history: [
        { date: todayStr, percentage: 0 }
      ]
    }]);
  };

  const getTherapyDisplayName = (therapyVal) => {
    if (!therapyVal) return "";
    const therapyObj = therapyTypes.find(t => 
      (t.id || t._id) === therapyVal || 
      t.therapy_id === therapyVal || 
      t.therapy_name === therapyVal
    );
    return therapyObj ? therapyObj.therapy_name : therapyVal;
  };

  const getTherapyColor = (therapyVal) => {
    if (!therapyVal) return "";
    const therapyObj = therapyTypes.find(t => 
      (t.id || t._id) === therapyVal || 
      t.therapy_id === therapyVal || 
      t.therapy_name === therapyVal
    );
    return therapyObj?.color || "#406147";
  };

  const getDomainDisplayName = (domainVal) => {
    if (!domainVal) return "";
    const domainObj = allDomains.find(d => 
      (d.id || d._id) === domainVal || 
      d.domain_no === domainVal || 
      d.name === domainVal
    );
    return domainObj ? domainObj.name : domainVal;
  };

  const getLevelDisplayName = (levelVal) => {
    if (!levelVal) return "General";
    const levelObj = levels.find(l => 
      (l.id || l._id) === levelVal || 
      l.level_id === levelVal || 
      l.name === levelVal
    );
    return levelObj ? levelObj.name : levelVal;
  };

  const updateGoalPercentage = (index, newPercentage, targetDate) => {
    setAddedGoals(prev => {
      const updated = [...prev];
      const goal = { ...updated[index] };
      
      let history = Array.isArray(goal.history) ? [...goal.history] : [];
      
      const existingIdx = history.findIndex(h => h.date === targetDate);
      if (existingIdx >= 0) {
        history[existingIdx] = { ...history[existingIdx], percentage: newPercentage };
      } else {
        history.push({ date: targetDate, percentage: newPercentage });
      }
      
      const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
      const latestEntry = sortedHistory[0];
      
      goal.history = history;
      goal.percentage = latestEntry.percentage;
      goal.status = getStatusFromPercentage(latestEntry.percentage);
      
      updated[index] = goal;
      return updated;
    });
  };

  const toggleGoalHistoryView = (idx) => {
    setExpandedGoalHistories(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleProgressDateChange = (idx, dateVal) => {
    setProgressDates(prev => ({ ...prev, [idx]: dateVal }));
  };

  const removeGoal = (index) => {
    setAddedGoals(prev => prev.filter((_, i) => i !== index));
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Target size={20} color={theme.colors.primary} />
                <h3>Goal Library</h3>
              </div>
              
              <SearchContainer>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text"
                  placeholder="Search goals..."
                  value={goalSearchQuery}
                  onChange={(e) => setGoalSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 32px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
                {goalSearchQuery && (
                  <button 
                    onClick={() => setGoalSearchQuery("")}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </SearchContainer>
            </SectionHeader>
            
            <TherapyTabs>
              {therapyTypes.map(t => (
                <Tab 
                  key={t.id} 
                  active={activeTherapy === t.id}
                  activeColor={t.color}
                  onClick={() => setActiveTherapy(t.id)}
                >
                  {t.therapy_name.split('(')[0]}
                </Tab>
              ))}
            </TherapyTabs>

            <DomainsContainer>
              {loading ? (
                <p>Loading domains...</p>
              ) : (() => {
                const selectedActiveTherapyObj = therapyTypes.find(tt => (tt.id || tt._id) === String(activeTherapy));
                const isEarlyIntervention = selectedActiveTherapyObj && (
                  String(selectedActiveTherapyObj.therapy_id) === "THP012" ||
                  String(selectedActiveTherapyObj.therapy_name).toLowerCase().includes("early intervention")
                );
                const filteredDomains = allDomains.filter(d => {
                  if (isEarlyIntervention) return true;
                  return selectedActiveTherapyObj && (
                    String(d.therapy_type) === String(selectedActiveTherapyObj.therapy_id) ||
                    String(d.therapy_type) === String(selectedActiveTherapyObj.therapy_name) ||
                    String(d.therapy_type) === String(selectedActiveTherapyObj.id || selectedActiveTherapyObj._id)
                  );
                });

                const groupedDomains = [];
                const domainGroups = {};
                filteredDomains.forEach(d => {
                  const nameKey = d.name.trim();
                  if (!domainGroups[nameKey]) {
                    domainGroups[nameKey] = {
                      name: d.name,
                      id: d.id || d._id,
                      domain_nos: [d.domain_no],
                      ids: [d.id || d._id]
                    };
                    groupedDomains.push(domainGroups[nameKey]);
                  } else {
                    domainGroups[nameKey].domain_nos.push(d.domain_no);
                    domainGroups[nameKey].ids.push(d.id || d._id);
                  }
                });

                const renderedDomains = groupedDomains.map((domain) => {
                  const domainGoals = goalLibrary.filter(g => 
                    !g.is_custom && 
                    (domain.ids.includes(String(g.domain)) || 
                     domain.domain_nos.includes(String(g.domain)))
                  ).filter(g => 
                    !goalSearchQuery || (g.goal_name || "").toLowerCase().includes(goalSearchQuery.toLowerCase())
                  );

                  if (domainGoals.length === 0) return null;

                  const isExpanded = expandedDomains[domain.id] || !!goalSearchQuery;

                  return (
                    <DomainCard key={domain.id}>
                      <DomainHeader onClick={() => toggleDomain(domain.id)}>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        <span>{domain.name} <small style={{opacity: 0.6, fontSize: '0.7em'}}>({domain.domain_nos.join(', ')})</small></span>
                      </DomainHeader>
                      
                      {isExpanded && (
                        <div style={{ padding: '5px 0' }}>
                          {(() => {
                            const generalGoals = domainGoals.filter(g => !g.level_name && !g.level || (g.level_name || g.level || '').toLowerCase() === 'general' || g.level_name === '-' || g.level === '-');
                            const lvl1Goals = domainGoals.filter(g => g.level_name?.toLowerCase() === 'level 1' || g.level === 'LVL01');
                            const lvl2Goals = domainGoals.filter(g => g.level_name?.toLowerCase() === 'level 2' || g.level === 'LVL02');
                            const lvl3Goals = domainGoals.filter(g => g.level_name?.toLowerCase() === 'level 3' || g.level === 'LVL03');
                            const lvl4Goals = domainGoals.filter(g => g.level_name?.toLowerCase() === 'level 4' || g.level === 'LVL04');

                          const renderGoalsList = (goalsList) => (
                            <GoalsList>
                              {goalsList.map((g) => {
                                const isSelected = addedGoals.some(ag => 
                                  ag.goal === g.goal_name && 
                                  (
                                    String(ag.domain) === String(g.domain_no) || 
                                    String(ag.domain) === String(g.domain) || 
                                    String(ag.domain) === String(g.domain_name)
                                  )
                                );
                                return (
                                  <GoalItem 
                                    key={g.id} 
                                    className={isSelected ? 'selected' : ''}
                                    onClick={() => !isSelected && addGoal(g)}
                                  >
                                    {isSelected ? <CheckCircle2 size={16} color="#22c55e" /> : <Circle size={16} color="#94a3b8" />}
                                    <div style={{display: 'flex', flexDirection: 'column'}}>
                                      <span style={{ opacity: isSelected ? 0.6 : 1, textDecoration: isSelected ? 'line-through' : 'none' }}>
                                        {g.goal_name}
                                      </span>
                                      {isEarlyIntervention && g.therapy_type_name && (
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                          <span style={{ fontSize: '0.65rem', color: getTherapyColor(g.therapy_type), background: `${getTherapyColor(g.therapy_type)}12`, padding: '1px 5px', borderRadius: '4px', width: 'fit-content', fontWeight: 600 }}>
                                            {g.therapy_type_name.split('(')[0].trim()}
                                          </span>
                                        </div>
                                      )}
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
                          );

                          const renderLevelBlock = (levelNum, goals) => {
                            const levelKey = `level-${levelNum}`;
                            const isExpanded = expandedLevels[`${domain.id}-${levelKey}`] || !!goalSearchQuery;
                            const levelLabel = `Level ${levelNum}`;
                            
                            return (
                              <div style={{ marginLeft: '20px', marginBottom: '8px', borderLeft: '2px solid #eef2ff' }}>
                                <div 
                                  onClick={() => toggleLevel(`${domain.id}-${levelKey}`)}
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
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  {levelLabel}
                                  <small style={{ marginLeft: 'auto', opacity: 0.5 }}>{goals.length} Goals</small>
                                </div>
                                
                                {isExpanded && (
                                  <div style={{ paddingLeft: '10px' }}>
                                    {goals.length > 0 ? renderGoalsList(goals) : (
                                      <p style={{ padding: '8px 15px', fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>No goals defined for this level.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          };

                          return (
                            <>
                              {generalGoals.length > 0 && (
                                <div style={{ marginLeft: '20px', marginBottom: '8px' }}>
                                  <div style={{ padding: '5px 15px', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>General / Uncategorized</div>
                                  {renderGoalsList(generalGoals)}
                                </div>
                              )}
                              {renderLevelBlock(1, lvl1Goals)}
                              {renderLevelBlock(2, lvl2Goals)}
                              {renderLevelBlock(3, lvl3Goals)}
                              {renderLevelBlock(4, lvl4Goals)}
                              {domainGoals.length === 0 && (
                                <p style={{padding: '20px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center'}}>No goals defined in this domain.</p>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      )}
                    </DomainCard>
                  );
                });

                const customGoals = goalLibrary.filter(g => 
                  g.is_custom && (
                    isEarlyIntervention ||
                    (selectedActiveTherapyObj && (
                      String(g.therapy_type) === String(selectedActiveTherapyObj.therapy_id) ||
                      String(g.therapy_type) === String(selectedActiveTherapyObj.therapy_name) ||
                      String(g.therapy_type) === String(selectedActiveTherapyObj.id || selectedActiveTherapyObj._id)
                    ))
                  )
                ).filter(g => 
                  !goalSearchQuery || (g.goal_name || "").toLowerCase().includes(goalSearchQuery.toLowerCase())
                );

                const isCustomGoalsExpanded = expandedDomains["custom-goals"] || !!goalSearchQuery;

                const customGoalsCard = customGoals.length > 0 ? (
                  <DomainCard key="custom-goals">
                    <DomainHeader onClick={() => toggleDomain("custom-goals")}>
                      {isCustomGoalsExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Custom Goals 
                        <span style={{ 
                          fontSize: '0.7rem', 
                          background: '#fef3c7', 
                          color: '#d97706', 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontWeight: 700 
                        }}>
                          Custom
                        </span>
                      </span>
                    </DomainHeader>
                    {isCustomGoalsExpanded && (
                      <div style={{ padding: '10px 20px' }}>
                        <GoalsList>
                          {customGoals.map((g) => {
                            const isSelected = addedGoals.some(ag => 
                              ag.goal === g.goal_name && 
                              (
                                String(ag.domain) === String(g.domain_no) || 
                                String(ag.domain) === String(g.domain) || 
                                String(ag.domain) === String(g.domain_name)
                              )
                            );
                            return (
                              <GoalItem 
                                key={g.id} 
                                className={isSelected ? 'selected' : ''}
                                onClick={() => !isSelected && addGoal(g)}
                              >
                                {isSelected ? <CheckCircle2 size={16} color="#22c55e" /> : <Circle size={16} color="#94a3b8" />}
                                <div style={{display: 'flex', flexDirection: 'column'}}>
                                  <span style={{ opacity: isSelected ? 0.6 : 1, textDecoration: isSelected ? 'line-through' : 'none' }}>
                                    {g.goal_name}
                                  </span>
                                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                    {g.domain_name && (
                                      <span style={{ fontSize: '0.7rem', color: getTherapyColor(activeTherapy), background: `${getTherapyColor(activeTherapy)}12`, padding: '2px 6px', borderRadius: '4px' }}>
                                        {g.domain_name}
                                      </span>
                                    )}
                                    {g.level_name && (
                                      <span style={{ fontSize: '0.7rem', color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                                        {g.level_name}
                                      </span>
                                    )}
                                  </div>
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
                      </div>
                    )}
                  </DomainCard>
                ) : null;

                return (
                  <>
                    {renderedDomains}
                    {customGoalsCard}
                  </>
                );
              })()}
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
                addedGoals.map((g, idx) => {
                  const currentEmployeeId = localStorage.getItem("employeeId") || "";
                  const isOwner = !g.employee_id || String(g.employee_id) === String(currentEmployeeId);
                  return (
                    <ReviewItem key={idx}>
                      <div className="count">{idx + 1}</div>
                      <div className="content">
                        <div className="meta">
                          <span 
                            className="therapy-tag"
                            style={{
                              color: getTherapyColor(g.therapy),
                              borderColor: getTherapyColor(g.therapy),
                              background: `${getTherapyColor(g.therapy)}12`
                            }}
                          >
                            {getTherapyDisplayName(g.therapy)}
                          </span>
                          <span className="domain-tag">{getDomainDisplayName(g.domain)}</span>
                          <span className="level-tag" style={{background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600}}>{getLevelDisplayName(g.level)}</span>
                          {g.employee_id && (
                            <span 
                              className="owner-tag" 
                              style={{
                                background: isOwner ? '#e0f2fe' : '#fee2e2', 
                                color: isOwner ? '#0369a1' : '#991b1b', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                fontSize: '0.7rem', 
                                fontWeight: 600
                              }}
                            >
                              Owner: {g.employee_id} {isOwner ? "(You)" : ""}
                            </span>
                          )}
                        </div>
                        <p className="goal-text">{g.goal}</p>
                        
                        <ProgressControls>
                          <ControlRow>
                            <DateGroup>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Date:</span>
                              <input 
                                type="date" 
                                value={progressDates[idx] || todayStr} 
                                onChange={(e) => handleProgressDateChange(idx, e.target.value)}
                                disabled={!isOwner}
                                style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem', outline: 'none', opacity: isOwner ? 1 : 0.7 }}
                              />
                            </DateGroup>

                            <RangeGroup>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>Progress:</span>
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={g.history?.find(h => h.date === (progressDates[idx] || todayStr))?.percentage ?? 0}
                                onChange={(e) => updateGoalPercentage(idx, parseInt(e.target.value), progressDates[idx] || todayStr)}
                                disabled={!isOwner}
                                style={{ flex: 1, accentColor: theme.colors.primary, opacity: isOwner ? 1 : 0.5 }}
                              />
                              <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                value={g.history?.find(h => h.date === (progressDates[idx] || todayStr))?.percentage ?? 0}
                                onChange={(e) => updateGoalPercentage(idx, Math.min(100, Math.max(0, parseInt(e.target.value) || 0)), progressDates[idx] || todayStr)}
                                disabled={!isOwner}
                                style={{ width: '45px', padding: '3px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem', textAlign: 'center', opacity: isOwner ? 1 : 0.7 }}
                              />
                              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>%</span>
                            </RangeGroup>

                            <StatusGroup>
                              <span style={{ 
                                padding: '3px 8px', 
                                borderRadius: '12px', 
                                fontSize: '0.7rem', 
                                fontWeight: 700, 
                                background: 
                                  g.status === 'Achieved' ? '#dcfce7' :
                                  g.status === 'Developed' ? '#dbeafe' :
                                  g.status === 'Emerging' ? '#fef3c7' : '#fee2e2',
                                color:
                                  g.status === 'Achieved' ? '#15803d' :
                                  g.status === 'Developed' ? '#1d4ed8' :
                                  g.status === 'Emerging' ? '#b45309' : '#b91c1c'
                              }}>
                                {g.status}
                              </span>
                            </StatusGroup>
                          </ControlRow>
                        </ProgressControls>

                          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <button 
                              type="button"
                              onClick={() => toggleGoalHistoryView(idx)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: theme.colors.secondary, 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                cursor: 'pointer', 
                                padding: 0, 
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              {expandedGoalHistories[idx] ? 'Hide Progress History' : 'View Progress History'} ({g.history?.length || 0} entries)
                            </button>

                            {expandedGoalHistories[idx] && g.history && (
                              <div style={{ marginTop: '5px', padding: '8px', background: '#ffffff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  {[...g.history].sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry, eIdx) => {
                                    const status = getStatusFromPercentage(entry.percentage);
                                    return (
                                      <div key={eIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569' }}>
                                        <span>📅 {entry.date}</span>
                                        <strong>{entry.percentage}% ({status})</strong>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                      </div>
                      {isOwner && <RemoveBtn onClick={() => removeGoal(idx)}><Trash2 size={16} /></RemoveBtn>}
                    </ReviewItem>
                  )
                })
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

const PageContainer = styled.div` 
  max-width: 1400px; 
  margin: 0 auto; 
  padding: 30px; 
  background-color: ${props => props.theme.colors.background}; 
  min-height: 100vh; 
  font-family: 'Inter', sans-serif; 
  
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

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
    @media (max-width: 768px) {
        width: 100%;
        box-sizing: border-box;
    }
`;

const MainLayout = styled.div` 
    display: grid; 
    grid-template-columns: 1.2fr 1fr; 
    gap: 30px; 
    animation: ${fadeIn} 0.5s ease-out; 
    @media (max-width: 1024px) {
        grid-template-columns: 1fr;
    }
`;

const SelectionSection = styled.div` 
    background: white; 
    padding: 30px; 
    border-radius: 16px; 
    border: 1px solid ${props => props.theme.colors.border}; 
    max-height: 850px;
    overflow-y: auto;

    &::-webkit-scrollbar { width: 6px; }
    &::-webkit-scrollbar-track { background: #f1f5f9; }
    &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

    @media (max-width: 1024px) {
        padding: 20px 15px;
        max-height: none;
        overflow-y: visible;
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
    justify-content: space-between;
    gap: 12px; 
    margin-bottom: 25px; 
    h3 { font-size: 1.25rem; margin: 0; } 
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
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
    background: ${props => props.active ? (props.activeColor || props.theme.colors.primary) : 'transparent'}; 
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
    
    @media (max-width: 1024px) {
        max-height: none;
        overflow-y: visible;
        padding-right: 0;
    }
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
    @media (max-width: 768px) {
        padding: 12px 15px;
        font-size: 0.95rem;
    }
`;

const GoalsList = styled.div` 
    padding: 10px 15px 15px 40px; 
    display: flex; 
    flex-direction: column; 
    gap: 8px; 
    @media (max-width: 768px) {
        padding: 10px 5px 10px 15px;
    }
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
    
    @media (max-width: 768px) {
        padding: 10px;
        gap: 8px;
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
    
    @media (max-width: 768px) {
        opacity: 1;
        position: static;
        transform: none;
        margin-left: auto;
    }
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
    
    @media (max-width: 768px) {
        padding: 12px;
        gap: 10px;
    }
    
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
            flex-wrap: wrap;
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
    @media (max-width: 768px) {
        justify-content: center;
    }
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
    @media (max-width: 768px) {
        width: 100%;
        padding: 14px 20px;
    }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 250px;
  margin-left: auto;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-left: 0;
    margin-top: 10px;
  }
`;

const ProgressControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    padding: 8px;
    gap: 8px;
  }
`;

const ControlRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 600px) {
    gap: 8px;
  }
`;

const DateGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  @media (max-width: 600px) {
    width: 100%;
    justify-content: space-between;
    input {
      flex: 1;
      max-width: 180px;
    }
  }
`;

const RangeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 160px;
  
  @media (max-width: 600px) {
    width: 100%;
    flex: none;
  }
`;

const StatusGroup = styled.div`
  margin-left: auto;
  
  @media (max-width: 600px) {
    margin-left: 0;
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
`;

export default DevelopmentGoals;
