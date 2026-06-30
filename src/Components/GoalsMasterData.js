import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import {
    Plus,
    Trash2,
    Settings,
    Activity,
    Globe,
    Layers,
    Target,
    ArrowLeft,
    X,
    Search,
    Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiRequest from './apiRequest';

const BASE_URL = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL?.trim();

const theme = {
    colors: {
        primary: "#406147",
        secondary: "#3f37c9",
        background: "#f0f2f5",
        surface: "#ffffff",
        text: "#1e293b",
        textLight: "#64748b",
        border: "#e2e8f0",
        error: "#ef4444",
        success: "#22c55e"
    }
};

const FilterRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
  background: #f8fafc;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;

  input {
    flex: 2;
    min-width: 250px;
    padding: 12px 16px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 0.9rem;
    transition: all 0.2s;
    &:focus { 
      border-color: ${props => props.theme.colors.primary}; 
      box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.12);
      outline: none; 
    }
  }

  select {
    flex: 1;
    min-width: 150px;
    padding: 12px 16px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 0.9rem;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    &:focus { 
      border-color: ${props => props.theme.colors.primary}; 
      box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.12);
      outline: none; 
    }
  }
`;

const GoalsMasterData = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('therapy');

    // Data states
    const [therapies, setTherapies] = useState([]);
    const [domains, setDomains] = useState([]);
    const [levels, setLevels] = useState([]);
    const [goals, setGoals] = useState([]);

    // Loading states
    const [loading, setLoading] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
    const [isTherapyFormOpen, setIsTherapyFormOpen] = useState(false);
    const [isDomainFormOpen, setIsDomainFormOpen] = useState(false);
    const [isLevelFormOpen, setIsLevelFormOpen] = useState(false);

    // Form inputs
    const [newTherapy, setNewTherapy] = useState("");
    const [newDomain, setNewDomain] = useState({ name: "", therapy_type: "" });
    const [newLevel, setNewLevel] = useState("");
    const [newGoal, setNewGoal] = useState({ goal_name: "", therapy_type: "", domain: "", level: "" });

    // Filter states
    const [domainFilterTherapy, setDomainFilterTherapy] = useState("");
    const [goalFilterTherapy, setGoalFilterTherapy] = useState("");
    const [goalFilterDomain, setGoalFilterDomain] = useState("");
    const [goalFilterLevel, setGoalFilterLevel] = useState("");
    const [goalSearchQuery, setGoalSearchQuery] = useState("");

    const getDomainName = (g) => {
        const domainVal = g.domain;
        if (!domainVal) return g.domain_name || "—";
        const domainObj = domains.find(d => 
            (d.id || d._id) === domainVal || 
            d.domain_no === domainVal || 
            d.name === domainVal
        );
        return domainObj ? domainObj.name : (g.domain_name || domainVal);
    };

    useEffect(() => {
        setEditingId(null);
        setNewTherapy("");
        setNewDomain({ name: "", therapy_type: "" });
        setNewLevel("");
        setNewGoal({ goal_name: "", therapy_type: "", domain: "", level: "" });
        setIsGoalFormOpen(false);
        setIsTherapyFormOpen(false);
        setIsDomainFormOpen(false);
        setIsLevelFormOpen(false);
        // Reset filters
        setDomainFilterTherapy("");
        setGoalFilterTherapy("");
        setGoalFilterDomain("");
        setGoalFilterLevel("");
        setGoalSearchQuery("");
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'therapy') {
                const res = await apiRequest(`${BASE_URL}goal-therapy-types/`, "GET");
                if (res.success) setTherapies(res.data);
            } else if (activeTab === 'domain') {
                const [tRes, dRes] = await Promise.all([
                    apiRequest(`${BASE_URL}goal-therapy-types/`, "GET"),
                    apiRequest(`${BASE_URL}goal-domains/`, "GET")
                ]);
                if (tRes.success) setTherapies(tRes.data);
                if (dRes.success) setDomains(dRes.data);
                console.log("domains", domains);
            } else if (activeTab === 'level') {
                const res = await apiRequest(`${BASE_URL}goal-levels/`, "GET");
                if (res.success) setLevels(res.data);
            } else if (activeTab === 'goals') {
                const [tRes, dRes, lRes, gRes] = await Promise.all([
                    apiRequest(`${BASE_URL}goal-therapy-types/`, "GET"),
                    apiRequest(`${BASE_URL}goal-domains/`, "GET"),
                    apiRequest(`${BASE_URL}goal-levels/`, "GET"),
                    apiRequest(`${BASE_URL}goal-libraries/?is_custom=false`, "GET")
                ]);
                if (tRes.success) setTherapies(tRes.data);
                if (dRes.success) setDomains(dRes.data);
                if (lRes.success) setLevels(lRes.data);
                if (gRes.success) setGoals(gRes.data);
            } else if (activeTab === 'custom_goals') {
                const [tRes, dRes, lRes, gRes] = await Promise.all([
                    apiRequest(`${BASE_URL}goal-therapy-types/`, "GET"),
                    apiRequest(`${BASE_URL}goal-domains/`, "GET"),
                    apiRequest(`${BASE_URL}goal-levels/`, "GET"),
                    apiRequest(`${BASE_URL}goal-libraries/?is_custom=true`, "GET")
                ]);
                if (tRes.success) setTherapies(tRes.data);
                if (dRes.success) setDomains(dRes.data);
                if (lRes.success) setLevels(lRes.data);
                if (gRes.success) setGoals(gRes.data);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTherapy = async () => {
        if (!newTherapy) return;
        if (editingId) {
            const res = await apiRequest(`${BASE_URL}goal-therapy-types/${editingId}/`, "PATCH", { therapy_name: newTherapy });
            if (res.success) {
                setNewTherapy("");
                setEditingId(null);
                setIsTherapyFormOpen(false);
                fetchData();
            }
        } else {
            const res = await apiRequest(`${BASE_URL}goal-therapy-types/`, "POST", { therapy_name: newTherapy });
            if (res.success) {
                setNewTherapy("");
                setIsTherapyFormOpen(false);
                fetchData();
            }
        }
    };

    const handleAddDomain = async () => {
        if (!newDomain.name || !newDomain.therapy_type) return;
        if (editingId) {
            const res = await apiRequest(`${BASE_URL}goal-domains/${editingId}/`, "PATCH", newDomain);
            if (res.success) {
                setNewDomain({ name: "", therapy_type: "" });
                setEditingId(null);
                setIsDomainFormOpen(false);
                fetchData();
            }
        } else {
            const res = await apiRequest(`${BASE_URL}goal-domains/`, "POST", newDomain);
            if (res.success) {
                setNewDomain({ name: "", therapy_type: "" });
                setIsDomainFormOpen(false);
                fetchData();
            }
        }
    };

    const handleAddLevel = async () => {
        if (!newLevel) return;
        if (editingId) {
            const res = await apiRequest(`${BASE_URL}goal-levels/${editingId}/`, "PATCH", { name: newLevel });
            if (res.success) {
                setNewLevel("");
                setEditingId(null);
                setIsLevelFormOpen(false);
                fetchData();
            }
        } else {
            const res = await apiRequest(`${BASE_URL}goal-levels/`, "POST", { name: newLevel });
            if (res.success) {
                setNewLevel("");
                setIsLevelFormOpen(false);
                fetchData();
            }
        }
    };

    const handleAddGoal = async () => {
        if (!newGoal.goal_name || !newGoal.therapy_type || !newGoal.domain) return;
        
        // Resolve IDs to human-readable names/nos before saving
        const therapyObj = therapies.find(t => (t.id || t._id) === newGoal.therapy_type);
        const domainObj = domains.find(d => (d.id || d._id || d.domain_no) === newGoal.domain);
        const levelObj = levels.find(l => (l.id || l._id) === newGoal.level);

        const payload = {
            ...newGoal,
            therapy_type: therapyObj ? therapyObj.therapy_name : newGoal.therapy_type,
            domain: domainObj ? domainObj.domain_no : newGoal.domain,
            level: levelObj ? levelObj.name : newGoal.level,
            is_custom: activeTab === 'custom_goals'
        };

        if (editingId) {
            const res = await apiRequest(`${BASE_URL}goal-libraries/${editingId}/`, "PATCH", payload);
            if (res.success) {
                setNewGoal({ goal_name: "", therapy_type: "", domain: "", level: "" });
                setEditingId(null);
                setIsGoalFormOpen(false);
                fetchData();
            }
        } else {
            const res = await apiRequest(`${BASE_URL}goal-libraries/`, "POST", payload);
            if (res.success) {
                setNewGoal({ goal_name: "", therapy_type: "", domain: "", level: "" });
                setIsGoalFormOpen(false);
                fetchData();
            }
        }
    };

    const handleEditTherapy = (t) => {
        setEditingId(t.id);
        setNewTherapy(t.therapy_name);
        setIsTherapyFormOpen(true);
    };

    const handleEditDomain = (d) => {
        setEditingId(d.id);
        setNewDomain({ name: d.name, therapy_type: d.therapy_type });
        setIsDomainFormOpen(true);
    };

    const handleEditLevel = (l) => {
        setEditingId(l.id);
        setNewLevel(l.name);
        setIsLevelFormOpen(true);
    };

    const handleEditGoal = (g) => {
        setEditingId(g.id);
        const therapyObj = therapies.find(t => (t.id || t._id) === g.therapy_type || t.therapy_name === g.therapy_type);
        const domainObj = domains.find(d => (d.id || d._id) === g.domain || d.domain_no === g.domain || d.name === g.domain);
        const levelObj = levels.find(l => (l.id || l._id) === g.level || l.name === g.level);

        setNewGoal({
            goal_name: g.goal_name,
            therapy_type: therapyObj ? (therapyObj.id || therapyObj._id) : "",
            domain: domainObj ? (domainObj.id || domainObj._id) : "",
            level: levelObj ? (levelObj.id || levelObj._id) : ""
        });
        setIsGoalFormOpen(true);
    };

    const handleDelete = async (endpoint, id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            const res = await apiRequest(`${BASE_URL}${endpoint}${id}/`, "DELETE");
            if (res.success) {
                if (editingId === id) {
                    setEditingId(null);
                    setNewTherapy("");
                    setNewDomain({ name: "", therapy_type: "" });
                    setNewLevel("");
                    setNewGoal({ goal_name: "", therapy_type: "", domain: "", level: "" });
                }
                fetchData();
            }
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <Header>
                    <div>
                        <h1>Goal Library Management</h1>
                        <p>Configure therapy types, domains, levels, and predefined goals.</p>
                    </div>
                </Header>

                <TabsContainer>
                    <Tab active={activeTab === 'therapy'} onClick={() => setActiveTab('therapy')}>
                        <Activity size={18} /> Therapy Types
                    </Tab>
                    <Tab active={activeTab === 'domain'} onClick={() => setActiveTab('domain')}>
                        <Globe size={18} /> Domains
                    </Tab>
                    <Tab active={activeTab === 'level'} onClick={() => setActiveTab('level')}>
                        <Layers size={18} /> Levels
                    </Tab>
                    <Tab active={activeTab === 'goals'} onClick={() => setActiveTab('goals')}>
                        <Target size={18} /> Goals Master
                    </Tab>
                    <Tab active={activeTab === 'custom_goals'} onClick={() => setActiveTab('custom_goals')}>
                        <Target size={18} /> Custom Goal Master
                    </Tab>
                </TabsContainer>

                <ContentArea>
                    {activeTab === 'therapy' && (
                        <Panel>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                <h3 style={{ margin: 0 }}>
                                    {editingId ? <Edit size={20} /> : <Activity size={20} />} 
                                    {editingId ? "Edit Therapy Type" : "Therapy Type"}
                                </h3>
                                <button 
                                    onClick={() => {
                                        setIsTherapyFormOpen(!isTherapyFormOpen);
                                        if (isTherapyFormOpen && editingId) {
                                            setEditingId(null);
                                            setNewTherapy("");
                                        }
                                    }}
                                    style={{
                                        background: isTherapyFormOpen ? '#f1f5f9' : theme.colors.primary,
                                        color: isTherapyFormOpen ? '#475569' : 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isTherapyFormOpen ? (
                                        <>
                                            <X size={16} /> Close Form
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} /> Open Add Form
                                        </>
                                    )}
                                </button>
                            </div>

                            {isTherapyFormOpen && (
                                <InputRow style={{ marginTop: '25px' }}>
                                    <input
                                        placeholder="e.g. Occupational Therapy (OT)"
                                        value={newTherapy}
                                        onChange={(e) => setNewTherapy(e.target.value)}
                                    />
                                    <button className="add-btn" onClick={handleAddTherapy}>
                                        {editingId ? "Update Type" : "Add Type"}
                                    </button>
                                    {editingId && (
                                        <button 
                                            className="add-btn" 
                                            style={{ backgroundColor: '#64748b' }} 
                                            onClick={() => { 
                                                setEditingId(null); 
                                                setNewTherapy(""); 
                                                setIsTherapyFormOpen(false);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </InputRow>
                            )}

                            <List className={isTherapyFormOpen ? "" : "mt-20"} style={{ position: 'relative' }}>
                                {loading && (
                                    <LoadingOverlay>
                                        <Spinner />
                                    </LoadingOverlay>
                                )}
                                <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Therapy Name</span>
                                    <span>Action</span>
                                </div>
                                {therapies.map(t => (
                                    <ListItem key={t.id}>
                                        <span>{t.therapy_name}</span>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleEditTherapy(t)} style={{ color: '#64748b' }}><Edit size={16} /></button>
                                            <button onClick={() => handleDelete('goal-therapy-types/', t.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </ListItem>
                                ))}
                            </List>
                        </Panel>
                    )}

                    {activeTab === 'domain' && (
                        <Panel>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                <h3 style={{ margin: 0 }}>
                                    {editingId ? <Edit size={20} /> : <Globe size={20} />} 
                                    {editingId ? "Edit Domain" : "Domain"}
                                </h3>
                                <button 
                                    onClick={() => {
                                        setIsDomainFormOpen(!isDomainFormOpen);
                                        if (isDomainFormOpen && editingId) {
                                            setEditingId(null);
                                            setNewDomain({ name: "", therapy_type: "" });
                                        }
                                    }}
                                    style={{
                                        background: isDomainFormOpen ? '#f1f5f9' : theme.colors.primary,
                                        color: isDomainFormOpen ? '#475569' : 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isDomainFormOpen ? (
                                        <>
                                            <X size={16} /> Close Form
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} /> Open Add Form
                                        </>
                                    )}
                                </button>
                            </div>

                            {isDomainFormOpen && (
                                <InputRow style={{ marginTop: '25px' }}>
                                    <select
                                        value={newDomain.therapy_type}
                                        onChange={(e) => setNewDomain({ ...newDomain, therapy_type: e.target.value })}
                                    >
                                        <option value="">Select Therapy</option>
                                        {therapies.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.therapy_name}</option>)}
                                    </select>
                                    <input
                                        placeholder="Domain Name (e.g. Social Interaction)"
                                        value={newDomain.name}
                                        onChange={(e) => setNewDomain({ ...newDomain, name: e.target.value })}
                                    />
                                    <button className="add-btn" onClick={handleAddDomain}>
                                        {editingId ? "Update Domain" : "Add Domain"}
                                    </button>
                                    {editingId && (
                                        <button 
                                            className="add-btn" 
                                            style={{ backgroundColor: '#64748b' }} 
                                            onClick={() => { 
                                                setEditingId(null); 
                                                setNewDomain({ name: "", therapy_type: "" }); 
                                                setIsDomainFormOpen(false);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </InputRow>
                            )}

                            <FilterRow style={{ marginTop: '20px', marginBottom: '20px' }}>
                                <select 
                                    value={domainFilterTherapy}
                                    onChange={(e) => setDomainFilterTherapy(e.target.value)}
                                >
                                    <option value="">All Therapies</option>
                                    {therapies.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.therapy_name}</option>)}
                                </select>
                            </FilterRow>

                            <List className="" style={{ position: 'relative' }}>
                                {loading && (
                                    <LoadingOverlay>
                                        <Spinner />
                                    </LoadingOverlay>
                                )}
                                <div className="list-header grid-list">
                                    <span>Domain Name</span>
                                    <span>No.</span>
                                    <span>Therapy</span>
                                    <span>Action</span>
                                </div>
                                {domains
                                    .filter(d => {
                                        if (!domainFilterTherapy) return true;
                                        const selectedTherapyObj = therapies.find(t => (t.id || t._id) === domainFilterTherapy);
                                        return selectedTherapyObj && (
                                            String(d.therapy_type) === String(selectedTherapyObj.therapy_id) ||
                                            String(d.therapy_type) === String(selectedTherapyObj.therapy_name) ||
                                            String(d.therapy_type) === String(selectedTherapyObj.id || selectedTherapyObj._id)
                                        );
                                    })
                                    .map(d => {
                                        const therapyObj = therapies.find(t => (t.id || t._id) === d.therapy_type || t.therapy_id === d.therapy_type);
                                        const therapyName = therapyObj ? therapyObj.therapy_name : d.therapy_type;
                                        return (
                                            <ListItem key={d.id} className="grid-list">
                                                <span>{d.name}</span>
                                                <span className="no">{d.domain_no}</span>
                                                <span className="tag">{therapyName}</span>
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handleEditDomain(d)} style={{ color: '#64748b' }}><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete('goal-domains/', d.id)}><Trash2 size={16} /></button>
                                                </div>
                                            </ListItem>
                                        );
                                    })}
                            </List>
                        </Panel>
                    )}

                    {activeTab === 'level' && (
                        <Panel>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                <h3 style={{ margin: 0 }}>
                                    {editingId ? <Edit size={20} /> : <Layers size={20} />} 
                                    {editingId ? "Edit Performance Level" : "Performance Level"}
                                </h3>
                                <button 
                                    onClick={() => {
                                        setIsLevelFormOpen(!isLevelFormOpen);
                                        if (isLevelFormOpen && editingId) {
                                            setEditingId(null);
                                            setNewLevel("");
                                        }
                                    }}
                                    style={{
                                        background: isLevelFormOpen ? '#f1f5f9' : theme.colors.primary,
                                        color: isLevelFormOpen ? '#475569' : 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isLevelFormOpen ? (
                                        <>
                                            <X size={16} /> Close Form
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} /> Open Add Form
                                        </>
                                    )}
                                </button>
                            </div>

                            {isLevelFormOpen && (
                                <InputRow style={{ marginTop: '25px' }}>
                                    <input
                                        placeholder="e.g. Level 1"
                                        value={newLevel}
                                        onChange={(e) => setNewLevel(e.target.value)}
                                    />
                                    <button className="add-btn" onClick={handleAddLevel}>
                                        {editingId ? "Update Level" : "Add Level"}
                                    </button>
                                    {editingId && (
                                        <button 
                                            className="add-btn" 
                                            style={{ backgroundColor: '#64748b' }} 
                                            onClick={() => { 
                                                setEditingId(null); 
                                                setNewLevel(""); 
                                                setIsLevelFormOpen(false);
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </InputRow>
                            )}

                            <List className={isLevelFormOpen ? "" : "mt-20"} style={{ position: 'relative' }}>
                                {loading && (
                                    <LoadingOverlay>
                                        <Spinner />
                                    </LoadingOverlay>
                                )}
                                <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Level Name</span>
                                    <span>Action</span>
                                </div>
                                {levels.map(l => (
                                    <ListItem key={l.id}>
                                        <span>{l.name}</span>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => handleEditLevel(l)} style={{ color: '#64748b' }}><Edit size={16} /></button>
                                            <button onClick={() => handleDelete('goal-levels/', l.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </ListItem>
                                ))}
                            </List>
                        </Panel>
                    )}

                    {activeTab === 'goals' && (
                        <Panel>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                <h3 style={{ margin: 0 }}>
                                    {editingId ? <Edit size={20} /> : <Target size={20} />} 
                                    {editingId ? "Edit Predefined Goal" : "Predefined Goal"}
                                </h3>
                                <button 
                                    onClick={() => {
                                        setIsGoalFormOpen(!isGoalFormOpen);
                                        if (isGoalFormOpen && editingId) {
                                            setEditingId(null);
                                            setNewGoal({ goal_name: "", therapy_type: "", domain: "", level: "" });
                                        }
                                    }}
                                    style={{
                                        background: isGoalFormOpen ? '#f1f5f9' : theme.colors.primary,
                                        color: isGoalFormOpen ? '#475569' : 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isGoalFormOpen ? (
                                        <>
                                            <X size={16} /> Close Form
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} /> Open Create Form
                                        </>
                                    )}
                                </button>
                            </div>

                            {isGoalFormOpen && (
                                <div className="grid-form" style={{ marginTop: '25px' }}>
                                    <select
                                        value={newGoal.therapy_type}
                                        onChange={(e) => setNewGoal({ ...newGoal, therapy_type: e.target.value, domain: "" })}
                                    >
                                        <option value="">Select Therapy</option>
                                        {therapies.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.therapy_name}</option>)}
                                    </select>
                                    <select
                                        value={newGoal.domain}
                                        onChange={(e) => setNewGoal({ ...newGoal, domain: e.target.value })}
                                    >
                                        <option value="">Select Domain</option>
                                        {(() => {
                                            const selectedTherapyObj = therapies.find(t => (t.id || t._id) === newGoal.therapy_type);
                                            const selectedTherapyName = selectedTherapyObj ? selectedTherapyObj.therapy_name : "";
                                            
                                            const filteredDomains = domains.filter(d => {
                                                if (!d.therapy_type || !newGoal.therapy_type) return false;
                                                return String(d.therapy_type).trim() === String(newGoal.therapy_type).trim() ||
                                                       (selectedTherapyName && String(d.therapy_type).trim() === String(selectedTherapyName).trim());
                                            });

                                            return (
                                                <>
                                                    {filteredDomains.map(d => (
                                                        <option key={d.id || d._id} value={d.id || d._id}>
                                                            {d.name} ({d.domain_no})
                                                        </option>
                                                    ))}
                                                    {filteredDomains.length === 0 && newGoal.therapy_type && (
                                                        <option disabled>No domains found</option>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </select>
                                    <select
                                        value={newGoal.level}
                                        onChange={(e) => setNewGoal({ ...newGoal, level: e.target.value })}
                                    >
                                        <option value="">Select Level (Optional)</option>
                                        {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                    <textarea
                                        placeholder="Enter goal description..."
                                        value={newGoal.goal_name}
                                        onChange={(e) => setNewGoal({ ...newGoal, goal_name: e.target.value })}
                                    />
                                    <button className="add-btn wide" onClick={handleAddGoal}>
                                        {editingId ? "Update Goal" : "Register Goal"}
                                    </button>
                                    {editingId && (
                                        <button 
                                            className="add-btn wide" 
                                            style={{ backgroundColor: '#64748b' }} 
                                            onClick={() => { 
                                                setEditingId(null); 
                                                setNewGoal({ goal_name: "", therapy_type: "", domain: "", level: "" }); 
                                                setIsGoalFormOpen(false);
                                            }}
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            )}

                            <FilterRow style={{ marginTop: '20px', marginBottom: '20px' }}>
                                <input
                                    type="text"
                                    placeholder="Search by goal description or number..."
                                    value={goalSearchQuery}
                                    onChange={(e) => setGoalSearchQuery(e.target.value)}
                                />
                                <select 
                                    value={goalFilterTherapy}
                                    onChange={(e) => {
                                        setGoalFilterTherapy(e.target.value);
                                        setGoalFilterDomain("");
                                    }}
                                >
                                    <option value="">All Therapies</option>
                                    {therapies.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.therapy_name}</option>)}
                                </select>
                                <select 
                                    value={goalFilterDomain}
                                    onChange={(e) => setGoalFilterDomain(e.target.value)}
                                >
                                    <option value="">All Domains</option>
                                    {domains
                                        .filter(d => {
                                            if (!goalFilterTherapy) return true;
                                            const selectedTherapyObj = therapies.find(t => (t.id || t._id) === goalFilterTherapy);
                                            return selectedTherapyObj && (
                                                String(d.therapy_type) === String(selectedTherapyObj.therapy_id) ||
                                                String(d.therapy_type) === String(selectedTherapyObj.therapy_name) ||
                                                String(d.therapy_type) === String(selectedTherapyObj.id || selectedTherapyObj._id)
                                            );
                                        })
                                        .map(d => (
                                            <option key={d.id || d._id} value={d.id || d._id || d.domain_no}>
                                                {d.name} ({d.domain_no})
                                            </option>
                                        ))
                                    }
                                </select>
                                <select 
                                    value={goalFilterLevel}
                                    onChange={(e) => setGoalFilterLevel(e.target.value)}
                                >
                                    <option value="">All Levels</option>
                                    {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </FilterRow>

                            <List className="" style={{ position: 'relative' }}>
                                {loading && (
                                    <LoadingOverlay>
                                        <Spinner />
                                    </LoadingOverlay>
                                )}
                                <div className="list-header goals-grid">
                                    <span>No.</span>
                                    <span>Goal Description</span>
                                    <span>Domain</span>
                                    <span>Therapy</span>
                                    <span>Level</span>
                                    <span>Action</span>
                                </div>
                                {goals
                                    .filter(g => {
                                        // 1. Search Query
                                        if (goalSearchQuery) {
                                            const query = goalSearchQuery.toLowerCase();
                                            const matchesName = g.goal_name && g.goal_name.toLowerCase().includes(query);
                                            const matchesNo = g.goal_no && g.goal_no.toLowerCase().includes(query);
                                            if (!matchesName && !matchesNo) return false;
                                        }
                                        
                                        // 2. Therapy Filter
                                        if (goalFilterTherapy) {
                                            const selectedTherapyObj = therapies.find(t => (t.id || t._id) === goalFilterTherapy);
                                            const matchesTherapy = selectedTherapyObj && (
                                                String(g.therapy_type) === String(selectedTherapyObj.therapy_id) ||
                                                String(g.therapy_type) === String(selectedTherapyObj.therapy_name) ||
                                                String(g.therapy_type) === String(selectedTherapyObj.id || selectedTherapyObj._id)
                                            );
                                            if (!matchesTherapy) return false;
                                        }
                                        
                                        // 3. Domain Filter
                                        if (goalFilterDomain) {
                                            const selectedDomainObj = domains.find(d => 
                                                (d.id || d._id) === goalFilterDomain || 
                                                d.domain_no === goalFilterDomain ||
                                                d.name === goalFilterDomain
                                            );
                                            const matchesDomain = selectedDomainObj && (
                                                String(g.domain) === String(selectedDomainObj.domain_no) ||
                                                String(g.domain) === String(selectedDomainObj.name) ||
                                                String(g.domain) === String(selectedDomainObj.id || selectedDomainObj._id) ||
                                                String(g.domain_name) === String(selectedDomainObj.name)
                                            );
                                            if (!matchesDomain) return false;
                                        }
                                        
                                        // 4. Level Filter
                                        if (goalFilterLevel) {
                                            const selectedLevelObj = levels.find(l => (l.id || l._id) === goalFilterLevel);
                                            const matchesLevel = selectedLevelObj && (
                                                String(g.level) === String(selectedLevelObj.level_id) ||
                                                String(g.level) === String(selectedLevelObj.name) ||
                                                String(g.level) === String(selectedLevelObj.id || selectedLevelObj._id)
                                            );
                                            if (!matchesLevel) return false;
                                        }
                                        
                                        return true;
                                    })
                                    .map((g, index) => (
                                        <ListItem key={g.id} className="grid-list goals-grid">
                                            <span className="no">{index + 1}</span>
                                            <span className="desc">{g.goal_name}</span>
                                            <span className="tag">{getDomainName(g)}</span>
                                            <span className="tag secondary">{(g.therapy_type_name || g.therapy_type)?.split('(')[0]}</span>
                                            <span className="level">{g.level_name || '-'}</span>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleEditGoal(g)} style={{ color: '#64748b' }}><Edit size={16} /></button>
                                                <button onClick={() => handleDelete('goal-libraries/', g.id)}><Trash2 size={16} /></button>
                                            </div>
                                        </ListItem>
                                    ))}
                            </List>
                        </Panel>
                    )}

                    {activeTab === 'custom_goals' && (
                        <Panel>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                                <h3 style={{ margin: 0 }}>
                                    {editingId ? <Edit size={20} /> : <Target size={20} />} 
                                    {editingId ? "Edit Custom Goal" : "Custom Goal"}
                                </h3>
                                <button 
                                    onClick={() => {
                                        setIsGoalFormOpen(!isGoalFormOpen);
                                        if (isGoalFormOpen && editingId) {
                                            setEditingId(null);
                                            setNewGoal({ goal_name: "", therapy_type: "", domain: "", level: "" });
                                        }
                                    }}
                                    style={{
                                        background: isGoalFormOpen ? '#f1f5f9' : theme.colors.primary,
                                        color: isGoalFormOpen ? '#475569' : 'white',
                                        border: 'none',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {isGoalFormOpen ? (
                                        <>
                                            <X size={16} /> Close Form
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={16} /> Open Create Form
                                        </>
                                    )}
                                </button>
                            </div>

                            {isGoalFormOpen && (
                                <div className="grid-form" style={{ marginTop: '25px' }}>
                                    <select
                                        value={newGoal.therapy_type}
                                        onChange={(e) => setNewGoal({ ...newGoal, therapy_type: e.target.value, domain: "" })}
                                    >
                                        <option value="">Select Therapy</option>
                                        {therapies.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.therapy_name}</option>)}
                                    </select>
                                    <select
                                        value={newGoal.domain}
                                        onChange={(e) => setNewGoal({ ...newGoal, domain: e.target.value })}
                                    >
                                        <option value="">Select Domain</option>
                                        {(() => {
                                            const selectedTherapyObj = therapies.find(t => (t.id || t._id) === newGoal.therapy_type);
                                            const selectedTherapyName = selectedTherapyObj ? selectedTherapyObj.therapy_name : "";
                                            
                                            const filteredDomains = domains.filter(d => {
                                                if (!d.therapy_type || !newGoal.therapy_type) return false;
                                                return String(d.therapy_type).trim() === String(newGoal.therapy_type).trim() ||
                                                       (selectedTherapyName && String(d.therapy_type).trim() === String(selectedTherapyName).trim());
                                            });

                                            return (
                                                <>
                                                    {filteredDomains.map(d => (
                                                        <option key={d.id || d._id} value={d.id || d._id}>
                                                            {d.name} ({d.domain_no})
                                                        </option>
                                                    ))}
                                                    {filteredDomains.length === 0 && newGoal.therapy_type && (
                                                        <option disabled>No domains found</option>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </select>
                                    <select
                                        value={newGoal.level}
                                        onChange={(e) => setNewGoal({ ...newGoal, level: e.target.value })}
                                    >
                                        <option value="">Select Level (Optional)</option>
                                        {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                    <textarea
                                        placeholder="Enter custom goal description..."
                                        value={newGoal.goal_name}
                                        onChange={(e) => setNewGoal({ ...newGoal, goal_name: e.target.value })}
                                    />
                                    <button className="add-btn wide" onClick={handleAddGoal}>
                                        {editingId ? "Update Custom Goal" : "Register Custom Goal"}
                                    </button>
                                    {editingId && (
                                        <button 
                                            className="add-btn wide" 
                                            style={{ backgroundColor: '#64748b' }} 
                                            onClick={() => { 
                                                setEditingId(null); 
                                                setNewGoal({ goal_name: "", therapy_type: "", domain: "", level: "" }); 
                                                setIsGoalFormOpen(false);
                                            }}
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            )}

                            <FilterRow style={{ marginTop: '20px', marginBottom: '20px' }}>
                                <input
                                    type="text"
                                    placeholder="Search by goal description or number..."
                                    value={goalSearchQuery}
                                    onChange={(e) => setGoalSearchQuery(e.target.value)}
                                />
                                <select 
                                    value={goalFilterTherapy}
                                    onChange={(e) => {
                                        setGoalFilterTherapy(e.target.value);
                                        setGoalFilterDomain("");
                                    }}
                                >
                                    <option value="">All Therapies</option>
                                    {therapies.map(t => <option key={t.id || t._id} value={t.id || t._id}>{t.therapy_name}</option>)}
                                </select>
                                <select 
                                    value={goalFilterDomain}
                                    onChange={(e) => setGoalFilterDomain(e.target.value)}
                                >
                                    <option value="">All Domains</option>
                                    {domains
                                        .filter(d => {
                                            if (!goalFilterTherapy) return true;
                                            const selectedTherapyObj = therapies.find(t => (t.id || t._id) === goalFilterTherapy);
                                            return selectedTherapyObj && (
                                                String(d.therapy_type) === String(selectedTherapyObj.therapy_id) ||
                                                String(d.therapy_type) === String(selectedTherapyObj.therapy_name) ||
                                                String(d.therapy_type) === String(selectedTherapyObj.id || selectedTherapyObj._id)
                                            );
                                        })
                                        .map(d => (
                                            <option key={d.id || d._id} value={d.id || d._id || d.domain_no}>
                                                {d.name} ({d.domain_no})
                                            </option>
                                        ))
                                    }
                                </select>
                                <select 
                                    value={goalFilterLevel}
                                    onChange={(e) => setGoalFilterLevel(e.target.value)}
                                >
                                    <option value="">All Levels</option>
                                    {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                            </FilterRow>

                            <List className="" style={{ position: 'relative' }}>
                                {loading && (
                                    <LoadingOverlay>
                                        <Spinner />
                                    </LoadingOverlay>
                                )}
                                <div className="list-header goals-grid">
                                    <span>No.</span>
                                    <span>Goal Description</span>
                                    <span>Domain</span>
                                    <span>Therapy</span>
                                    <span>Level</span>
                                    <span>Action</span>
                                </div>
                                {goals
                                    .filter(g => {
                                        // 1. Search Query
                                        if (goalSearchQuery) {
                                            const query = goalSearchQuery.toLowerCase();
                                            const matchesName = g.goal_name && g.goal_name.toLowerCase().includes(query);
                                            const matchesNo = g.goal_no && g.goal_no.toLowerCase().includes(query);
                                            if (!matchesName && !matchesNo) return false;
                                        }
                                        
                                        // 2. Therapy Filter
                                        if (goalFilterTherapy) {
                                            const selectedTherapyObj = therapies.find(t => (t.id || t._id) === goalFilterTherapy);
                                            const matchesTherapy = selectedTherapyObj && (
                                                String(g.therapy_type) === String(selectedTherapyObj.therapy_id) ||
                                                String(g.therapy_type) === String(selectedTherapyObj.therapy_name) ||
                                                String(g.therapy_type) === String(selectedTherapyObj.id || selectedTherapyObj._id)
                                            );
                                            if (!matchesTherapy) return false;
                                        }
                                        
                                        // 3. Domain Filter
                                        if (goalFilterDomain) {
                                            const selectedDomainObj = domains.find(d => 
                                                (d.id || d._id) === goalFilterDomain || 
                                                d.domain_no === goalFilterDomain ||
                                                d.name === goalFilterDomain
                                            );
                                            const matchesDomain = selectedDomainObj && (
                                                String(g.domain) === String(selectedDomainObj.domain_no) ||
                                                String(g.domain) === String(selectedDomainObj.name) ||
                                                String(g.domain) === String(selectedDomainObj.id || selectedDomainObj._id) ||
                                                String(g.domain_name) === String(selectedDomainObj.name)
                                            );
                                            if (!matchesDomain) return false;
                                        }
                                        
                                        // 4. Level Filter
                                        if (goalFilterLevel) {
                                            const selectedLevelObj = levels.find(l => (l.id || l._id) === goalFilterLevel);
                                            const matchesLevel = selectedLevelObj && (
                                                String(g.level) === String(selectedLevelObj.level_id) ||
                                                String(g.level) === String(selectedLevelObj.name) ||
                                                String(g.level) === String(selectedLevelObj.id || selectedLevelObj._id)
                                            );
                                            if (!matchesLevel) return false;
                                        }
                                        
                                        return true;
                                    })
                                    .map((g, index) => (
                                        <ListItem key={g.id} className="grid-list goals-grid">
                                            <span className="no">{index + 1}</span>
                                            <span className="desc">{g.goal_name}</span>
                                            <span className="tag">{getDomainName(g)}</span>
                                            <span className="tag secondary">{(g.therapy_type_name || g.therapy_type)?.split('(')[0]}</span>
                                            <span className="level">{g.level_name || '-'}</span>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleEditGoal(g)} style={{ color: '#64748b' }}><Edit size={16} /></button>
                                                <button onClick={() => handleDelete('goal-libraries/', g.id)}><Trash2 size={16} /></button>
                                            </div>
                                        </ListItem>
                                    ))}
                            </List>
                        </Panel>
                    )}
                </ContentArea>
            </Container>
        </ThemeProvider>
    );
};

// --- Styled Components ---

const Container = styled.div`
  max-width: 100%; margin: 20px 40px;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  display: flex; align-items: center; gap: 20px; margin-bottom: 30px;
  h1 { margin: 0; color: ${props => props.theme.colors.primary}; font-size: 2.2rem; font-weight: 800; letter-spacing: -0.5px; }
  p { margin: 5px 0 0 0; color: ${props => props.theme.colors.textLight}; font-size: 1rem; }
`;

const TabsContainer = styled.div`
  display: flex; gap: 12px; border-bottom: 1px solid ${props => props.theme.colors.border}; margin-bottom: 30px; padding-bottom: 8px;
`;

const Tab = styled.button`
  padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 0.95rem;
  color: ${props => props.active ? 'white' : props.theme.colors.textLight};
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  transition: all 0.25s ease;
  
  &:hover {
    color: ${props => props.active ? 'white' : props.theme.colors.primary};
    background: ${props => props.active ? props.theme.colors.primary : 'rgba(64, 97, 71, 0.06)'};
  }
`;

const ContentArea = styled.div`
  animation: fadeIn 0.3s ease-out;
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10deg); } to { opacity: 1; transform: translateY(0); } }
`;

const Panel = styled.div`
  background: white; padding: 35px; border-radius: 16px; 
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
  h3 { margin: 0 0 24px 0; display: flex; align-items: center; gap: 10px; font-size: 1.25rem; font-weight: 700; color: #1e293b; }
  .mt-20 { margin-top: 30px; }
  .grid-form {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px;
    textarea { 
      grid-column: span 3; padding: 15px; border: 1px solid #cbd5e1; border-radius: 10px; 
      font-family: inherit; height: 100px; resize: vertical; transition: all 0.2s;
      &:focus { border-color: ${props => props.theme.colors.primary}; box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.12); outline: none; }
    }
    select { 
      padding: 14px; border: 1px solid #cbd5e1; border-radius: 10px; transition: all 0.2s;
      &:focus { border-color: ${props => props.theme.colors.primary}; box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.12); outline: none; }
    }
    .wide { grid-column: span 3; }
  }
`;

const InputRow = styled.div`
  display: flex; gap: 20px; margin-bottom: 30px;
  input, select { 
    flex: 1; padding: 14px 18px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.95rem; transition: all 0.2s;
    &:focus { border-color: ${props => props.theme.colors.primary}; box-shadow: 0 0 0 3px rgba(64, 97, 71, 0.12); outline: none; }
  }
  .add-btn { 
    background: ${props => props.theme.colors.primary}; color: white; border: none; padding: 0 35px; border-radius: 10px; 
    cursor: pointer; font-weight: 700; transition: all 0.2s;
    &:hover { background: #324c38; transform: translateY(-1px); }
    &:active { transform: translateY(0); }
  }
`;

const List = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  max-height: 480px;
  overflow: auto;
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
  
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: #f8fafc;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  .list-header { 
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex; justify-content: space-between; padding: 16px 20px; background: #f8fafc; 
    font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: #475569; letter-spacing: 0.5px;
    border-bottom: 1px solid #e2e8f0;
    min-width: 600px;
  }
  .grid-list { display: grid; grid-template-columns: 2fr 1fr 1.50fr 80px; min-width: 800px; }
  .goals-grid { display: grid !important; grid-template-columns: 80px 3fr 1fr 1fr 1fr 80px !important; min-width: 1000px; }
`;

const ListItem = styled.div`
  display: flex; justify-content: space-between; align-items: center; padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  min-width: 600px;
  transition: background 0.15s ease;
  
  &:hover {
    background: #f8fafc;
  }
  
  &.grid-list {
    min-width: 800px;
  }
  
  &.goals-grid {
    min-width: 1000px;
  }

  span { font-size: 0.95rem; color: #334155; }
  button { 
    background: none; border: none; color: #94a3b8; cursor: pointer; transition: all 0.2s;
    &:hover { color: ${props => props.theme.colors.primary}; }
  }
  .no { background: #f1f5f9; padding: 3px 8px; border-radius: 6px; font-family: monospace; font-weight: 700; color: #475569; }
  .tag { font-size: 0.75rem; padding: 4px 10px; border-radius: 8px; background: #e2f0d9; color: #385723; font-weight: 700; }
  .tag.secondary { background: #eef2ff; color: #3730a3; }
  .level { font-weight: 700; color: ${props => props.theme.colors.secondary}; }
  .desc { line-height: 1.5; padding-right: 20px; color: #1e293b; }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  border-radius: 8px;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default GoalsMasterData;
