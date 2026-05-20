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
    Search
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

    // Form inputs
    const [newTherapy, setNewTherapy] = useState("");
    const [newDomain, setNewDomain] = useState({ name: "", therapy_type: "" });
    const [newLevel, setNewLevel] = useState("");
    const [newGoal, setNewGoal] = useState({ goal_name: "", therapy_type: "", domain: "", level: "" });

    useEffect(() => {
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
                    apiRequest(`${BASE_URL}goal-libraries/`, "GET")
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
        const res = await apiRequest(`${BASE_URL}goal-therapy-types/`, "POST", { therapy_name: newTherapy });
        if (res.success) {
            setNewTherapy("");
            fetchData();
        }
    };

    const handleAddDomain = async () => {
        if (!newDomain.name || !newDomain.therapy_type) return;
        const res = await apiRequest(`${BASE_URL}goal-domains/`, "POST", newDomain);
        if (res.success) {
            setNewDomain({ name: "", therapy_type: "" });
            fetchData();
        }
    };

    const handleAddLevel = async () => {
        if (!newLevel) return;
        const res = await apiRequest(`${BASE_URL}goal-levels/`, "POST", { name: newLevel });
        if (res.success) {
            setNewLevel("");
            fetchData();
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
            level: levelObj ? levelObj.name : newGoal.level
        };

        const res = await apiRequest(`${BASE_URL}goal-libraries/`, "POST", payload);
        if (res.success) {
            setNewGoal({ goal_name: "", therapy_type: "", domain: "", level: "" });
            fetchData();
        }
    };

    const handleDelete = async (endpoint, id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            const res = await apiRequest(`${BASE_URL}${endpoint}${id}/`, "DELETE");
            if (res.success) fetchData();
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <Header>
                    <button className="back-btn" onClick={() => navigate(-1)}><ArrowLeft /></button>
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
                </TabsContainer>

                <ContentArea>
                    {activeTab === 'therapy' && (
                        <Panel>
                            <h3><Plus size={20} /> Add Therapy Type</h3>
                            <InputRow>
                                <input
                                    placeholder="e.g. Occupational Therapy (OT)"
                                    value={newTherapy}
                                    onChange={(e) => setNewTherapy(e.target.value)}
                                />
                                <button className="add-btn" onClick={handleAddTherapy}>Add Type</button>
                            </InputRow>
                            <List>
                                {therapies.map(t => (
                                    <ListItem key={t.id}>
                                        <span>{t.therapy_name}</span>
                                        <button onClick={() => handleDelete('goal-therapy-types/', t.id)}><Trash2 size={16} /></button>
                                    </ListItem>
                                ))}
                            </List>
                        </Panel>
                    )}

                    {activeTab === 'domain' && (
                        <Panel>
                            <h3><Plus size={20} /> Add Domain</h3>
                            <InputRow>
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
                                <button className="add-btn" onClick={handleAddDomain}>Add Domain</button>
                            </InputRow>
                            <List>
                                <div className="list-header">
                                    <span>Domain Name</span>
                                    <span>No.</span>
                                    <span>Therapy</span>
                                    <span>Action</span>
                                </div>
                                {domains.map(d => (
                                    <ListItem key={d.id} className="grid-list">
                                        <span>{d.name}</span>
                                        <span className="no">{d.domain_no}</span>
                                        <span className="tag">{d.therapy_type_name}</span>
                                        <button onClick={() => handleDelete('goal-domains/', d.id)}><Trash2 size={16} /></button>
                                    </ListItem>
                                ))}
                            </List>
                        </Panel>
                    )}

                    {activeTab === 'level' && (
                        <Panel>
                            <h3><Plus size={20} /> Add Performance Level</h3>
                            <InputRow>
                                <input
                                    placeholder="e.g. Level 1"
                                    value={newLevel}
                                    onChange={(e) => setNewLevel(e.target.value)}
                                />
                                <button className="add-btn" onClick={handleAddLevel}>Add Level</button>
                            </InputRow>
                            <List>
                                {levels.map(l => (
                                    <ListItem key={l.id}>
                                        <span>{l.name}</span>
                                        <button onClick={() => handleDelete('goal-levels/', l.id)}><Trash2 size={16} /></button>
                                    </ListItem>
                                ))}
                            </List>
                        </Panel>
                    )}

                    {activeTab === 'goals' && (
                        <Panel>
                            <h3><Plus size={20} /> Create Predefined Goal</h3>
                            <div className="grid-form">
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
                                    {domains
                                        .filter(d =>
                                            d.therapy_type &&
                                            newGoal.therapy_type &&
                                            String(d.therapy_type).trim() === String(newGoal.therapy_type).trim()
                                        )
                                        .map(d => (
                                            <option key={d.id || d._id} value={d.id || d._id}>
                                                {d.name} ({d.domain_no})
                                            </option>
                                        ))
                                    }
                                    {domains.filter(d =>
                                        d.therapy_type &&
                                        newGoal.therapy_type &&
                                        String(d.therapy_type).trim() === String(newGoal.therapy_type).trim()
                                    ).length === 0 && newGoal.therapy_type && (
                                            <option disabled>No domains found</option>
                                        )}
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
                                <button className="add-btn wide" onClick={handleAddGoal}>Register Goal</button>
                            </div>

                            <List className="mt-20">
                                <div className="list-header goals-grid">
                                    <span>No.</span>
                                    <span>Goal Description</span>
                                    <span>Domain</span>
                                    <span>Therapy</span>
                                    <span>Level</span>
                                    <span>Action</span>
                                </div>
                                {goals.map(g => (
                                    <ListItem key={g.id} className="grid-list goals-grid">
                                        <span className="no">{g.goal_no}</span>
                                        <span className="desc">{g.goal_name}</span>
                                        <span className="tag">{g.domain_name}</span>
                                        <span className="tag secondary">{g.therapy_type_name?.split('(')[0]}</span>
                                        <span className="level">{g.level_name || '-'}</span>
                                        <button onClick={() => handleDelete('goal-libraries/', g.id)}><Trash2 size={16} /></button>
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
  max-width: 1200px; margin: 40px auto; padding: 0 20px;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  display: flex; align-items: center; gap: 20px; margin-bottom: 40px;
  h1 { margin: 0; color: ${props => props.theme.colors.primary}; }
  p { margin: 5px 0 0 0; color: ${props => props.theme.colors.textLight}; }
  .back-btn { background: white; border: 1px solid ${props => props.theme.colors.border}; padding: 10px; border-radius: 8px; cursor: pointer; }
`;

const TabsContainer = styled.div`
  display: flex; gap: 10px; border-bottom: 1px solid ${props => props.theme.colors.border}; margin-bottom: 30px;
`;

const Tab = styled.button`
  padding: 12px 24px; border: none; background: none; cursor: pointer;
  display: flex; align-items: center; gap: 10px; font-weight: 600;
  color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.textLight};
  border-bottom: 3px solid ${props => props.active ? props.theme.colors.primary : 'transparent'};
  transition: 0.2s;
  &:hover { color: ${props => props.theme.colors.primary}; }
`;

const ContentArea = styled.div`
  animation: fadeIn 0.3s ease-out;
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10deg); } to { opacity: 1; transform: translateY(0); } }
`;

const Panel = styled.div`
  background: white; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  h3 { margin: 0 0 20px 0; display: flex; align-items: center; gap: 10px; font-size: 1.1rem; color: #334155; }
  .mt-20 { margin-top: 30px; }
  .grid-form {
    display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;
    textarea { grid-column: span 3; padding: 15px; border: 1px solid ${props => props.theme.colors.border}; border-radius: 8px; font-family: inherit; height: 80px; }
    select { padding: 12px; border: 1px solid ${props => props.theme.colors.border}; border-radius: 8px; }
    .wide { grid-column: span 3; }
  }
`;

const InputRow = styled.div`
  display: flex; gap: 15px; margin-bottom: 30px;
  input, select { flex: 1; padding: 12px 15px; border: 1px solid ${props => props.theme.colors.border}; border-radius: 10px; font-size: 0.95rem; }
  .add-btn { background: ${props => props.theme.colors.primary}; color: white; border: none; padding: 0 30px; border-radius: 10px; cursor: pointer; font-weight: 700; }
`;

const List = styled.div`
  border-top: 1px solid ${props => props.theme.colors.border};
  .list-header { 
    display: flex; justify-content: space-between; padding: 15px; background: #f8fafc; 
    font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: #64748b;
  }
  .grid-list { display: grid; grid-template-columns: 2fr 1fr 1.50fr 0.50fr; }
  .goals-grid { display: grid !important; grid-template-columns: 80px 3fr 1fr 1fr 1fr 60px !important; }
`;

const ListItem = styled.div`
  display: flex; justify-content: space-between; align-items: center; padding: 15px;
  border-bottom: 1px solid #f1f5f9;
  span { font-size: 0.95rem; color: #334155; }
  button { background: none; border: none; color: #cbd5e1; cursor: pointer; &:hover { color: #ef4444; } }
  .no { background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-weight: 700; color: #475569; }
  .tag { font-size: 0.75rem; padding: 3px 8px; border-radius: 6px; background: #f0fdf4; color: #166534; font-weight: 700; }
  .tag.secondary { background: #eef2ff; color: #3730a3; }
  .level { font-weight: 700; color: ${props => props.theme.colors.secondary}; }
  .desc { line-height: 1.4; padding-right: 20px; }
`;

export default GoalsMasterData;
