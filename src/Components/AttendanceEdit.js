import React, { useEffect, useState ,useMemo} from "react";
import styled, { keyframes } from "styled-components";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import { Edit2, X, Save, Calendar, User, Activity, ArrowLeft, ArrowRight } from "react-feather";

const AttendanceSessionEditor = () => {
  const baseUrl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  const [attendanceList, setAttendanceList] = useState([]);
  const [selected, setSelected] = useState(null);
  
  // ✅ 1. Date Filter State
  const [currentDate, setCurrentDate] = useState(new Date());

  // ---------- FETCH ----------
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // ✅ 2. Calculate Month/Year and Append to URL
        const month = currentDate.getMonth() + 1; // JS months are 0-indexed
        const year = currentDate.getFullYear();
        
        // Construct URL with query params
        const url = `${baseUrl}get_all_patient_attendance/?month=${month}&year=${year}`;

        const res = await apiRequest(url, "GET");

        let data = [];
        if (Array.isArray(res?.data?.data)) data = res.data.data;
        else if (Array.isArray(res?.data)) data = res.data;
        else if (Array.isArray(res)) data = res;
        else throw new Error("Invalid data format");
        
        setAttendanceList(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load attendance");
      }
    };
    fetchAttendance();
  }, [baseUrl, currentDate]); // Re-run when date changes

  // ---------- DATE HANDLERS ----------
  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  // ---------- FORM DATA ----------
  const [formData, setFormData] = useState({
    not_attending_details: [],
    extra_attending_details: [],
    not_attending_remarks: "",
    extra_attending_remarks: ""
  });

  // ---------- When selecting a record ----------
const safeParse = (data) => {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch (e) {
      return [];
    }
  };

  // ✅ UPDATED: Open Editor with Data Pre-filling
  const openEditor = (record) => {
    setSelected(record);

    const therapies = safeParse(record.therapy_details);
    const existingNot = safeParse(record.not_attending_details);
    const existingExtra = safeParse(record.extra_attending_details);

    // Map existing "Not Attending" data to the therapy list order
    const notAttendingState = therapies.map(therapy => {
      const found = existingNot.find(item => item.therapy_name === therapy.therapy_name);
      return found ? { ...found } : { 
        therapy_name: therapy.therapy_name, 
        sessions: 0, 
        charge_per_session: 0, 
        total_amount: 0 
      };
    });

    // Map existing "Extra Attending" data to the therapy list order
    const extraAttendingState = therapies.map(therapy => {
      const found = existingExtra.find(item => item.therapy_name === therapy.therapy_name);
      return found ? { ...found } : { 
        therapy_name: therapy.therapy_name, 
        sessions: 0, 
        charge_per_session: 0, 
        total_amount: 0 
      };
    });

    setFormData({
      not_attending_details: notAttendingState,
      extra_attending_details: extraAttendingState,
      not_attending_remarks: record.not_attending_remarks || "",
      extra_attending_remarks: record.extra_attending_remarks || ""
    });
  };

  const closeEditor = () => {
    setSelected(null);
  };

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };
  // ---------- Input change handler ----------
  const handleInput = (index, type, value, therapy) => {
    const list = [...formData[type]];
    const sessionCount = therapy.sesion_per_therapy || 1; 
    const charge_per_session = (therapy.therapy_charge || 0) / sessionCount;

    list[index] = {
      therapy_name: therapy.therapy_name,
      sessions: Number(value),
      charge_per_session: charge_per_session,
      total_amount: Number(value) * charge_per_session,
    };

    setFormData((prev) => ({ ...prev, [type]: list }));
  };

  // ---------- Submit ----------
const handleSubmit = async () => {
    if (!selected) return;
    
    // Calculate Totals
    const totalNot = formData.not_attending_details.reduce((sum, item) => sum + (item.total_amount || 0), 0);
    const totalExtra = formData.extra_attending_details.reduce((sum, item) => sum + (item.total_amount || 0), 0);

    const payload = {
      registration_number: selected.registration_number,
      attendance_date: selected.attendance_date?.split("T")[0],
      not_attending_details: formData.not_attending_details.filter(i => i.sessions > 0), // Only send active changes
      not_attending: totalNot,
      not_attending_remarks: formData.not_attending_remarks,
      extra_attending_details: formData.extra_attending_details.filter(i => i.sessions > 0),
      extra_attending: totalExtra,
      extra_attending_remarks: formData.extra_attending_remarks,
    };

    try {
      await apiRequest(`${baseUrl}update_attendance_sessions/`, "PATCH", payload);
      toast.success("Updated Successfully!");
      
      // Optimistic Update locally
      setAttendanceList(prev => prev.map(item => 
        item._id === selected._id 
        ? { ...item, ...payload, total_amount: (item.therapy_charge - totalNot + totalExtra) } 
        : item
      ));
      
      closeEditor();
    } catch (err) {
      console.log(err);
      toast.error("Update Failed!");
    }
  };

  // ✅ Calculation for Summary & "Is Fully Paid" Check
  const editorCalculations = useMemo(() => {
    if (!selected) return { base: 0, deduction: 0, addition: 0, final: 0, isFullyPaid: false };
    
    const base = selected.therapy_charge || 0;
    const discount = selected.discount || 0;
    const deduction = formData.not_attending_details.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const addition = formData.extra_attending_details.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    
    const paid = selected.total_amount_paid || 0;
    const currentBillable = base - deduction + addition - discount;

    // ✅ Logic: If they paid the full base amount (minus discount), disable further deductions
    const isFullyPaid = paid >= (base - discount);
  return { base, deduction, addition, final: currentBillable, isFullyPaid, paid };
  }, [selected, formData]);
  
  // Dynamic Totals for Summary in Modal
  const currentSummary = useMemo(() => {
    if (!selected) return { base: 0, deduction: 0, addition: 0, final: 0,amount_paid : 0 };
    const base = selected.therapy_charge || 0;
    const paid = selected.total_amount_paid || 0;
    const deduction = formData.not_attending_details.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    const addition = formData.extra_attending_details.reduce((sum, i) => sum + (i.total_amount || 0), 0);
    return { base, deduction, addition, paid , final: base - deduction + addition };
  }, [selected, formData]);

  return (
    <Container>
      <Header>
        <div>
          <Title>Attendance Manager</Title>
          <Subtitle>Manage monthly sessions and discrepancies</Subtitle>
        </div>
        
        {/* ✅ Distinct Color Month Buttons */}
        <FilterBar>
          <FilterButton onClick={() => changeMonth(-1)}>
            <ArrowLeft size={60} color="#15803d" strokeWidth={3} />
            
          </FilterButton>
          <DateLabel>
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </DateLabel>
          <FilterButton onClick={() => changeMonth(1)}>
            
           <ArrowRight size={60} color="#15803d" strokeWidth={3} />
          </FilterButton>
        </FilterBar>
      </Header>

      {/* DESKTOP VIEW */}
      <DesktopView>
        <TableCard>
          <StyledTable>
            <thead>
              <tr>
                <Th>Reg No</Th>
                <Th>Name</Th>
                <Th>Attendance Date</Th>
                <Th>Therapies</Th>
                <Th align="right">Current Total</Th>
                <Th align="center">Action</Th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.length === 0 ? (
                <tr><Td colSpan="6" align="center">No records for this month</Td></tr>
              ) : (
                attendanceList.map((a) => (
                  <Tr key={a._id} onClick={() => openEditor(a)}>
                    <Td><Badge>{a.registration_number}</Badge></Td>
                    <Td>
                      <UserRow>
                        <Avatar><User size={16} /></Avatar>
                        <NameText>{a.name_of_child}</NameText>
                      </UserRow>
                    </Td>
                    <Td>
                      <DateText><Calendar size={14} /> {a.attendance_date?.split('T')[0]}</DateText>
                    </Td>
                    <Td>{safeParse(a.therapy_details).length} Therapies</Td>
                    <Td align="right">
                      <PriceTag>{formatCurrency(a.total_amount)}</PriceTag>
                    </Td>
                    <Td align="center">
                      <EditButton><Edit2 size={16} /> Edit</EditButton>
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </StyledTable>
        </TableCard>
      </DesktopView>

      {/* MOBILE VIEW */}
      <MobileView>
        {attendanceList.map((a) => (
          <MobileCard key={a._id} onClick={() => openEditor(a)}>
            <MobileCardHeader>
              <Badge>{a.registration_number}</Badge>
              <PriceTag>{formatCurrency(a.total_amount)}</PriceTag>
            </MobileCardHeader>
            <MobileCardBody>
              <Avatar><User size={16} /></Avatar>
              <div>
                <NameText>{a.name_of_child}</NameText>
                <DateText>{a.attendance_date?.split('T')[0]}</DateText>
              </div>
            </MobileCardBody>
            <MobileCardFooter>
              <EditButton style={{width:'100%', justifyContent:'center'}}>
                <Edit2 size={14} /> Update Details
              </EditButton>
            </MobileCardFooter>
          </MobileCard>
        ))}
      </MobileView>

      {/* ✅ DYNAMIC EDITOR OVERLAY */}
      {selected && (
        <Overlay>
          <EditorCard>
            <CardHeader>
              <div>
                <CardTitle>Session Details</CardTitle>
                <CardSubtitle>{selected.name_of_child} ({selected.registration_number})</CardSubtitle>
              </div>
              <CloseBtn onClick={closeEditor}><X size={24} /></CloseBtn>
            </CardHeader>

            <CardContent>
              {/* Dynamic Summary Panel */}
              <SummaryPanel>
                 <SummaryItem>
                    <span>Base Charge</span>
                    <strong>{formatCurrency(currentSummary.base)}</strong>
                 </SummaryItem>
                 <SummaryItem color="#ef4444">
                    <span>Deductions</span>
                    <strong>- {formatCurrency(currentSummary.deduction)}</strong>
                 </SummaryItem>
                 <SummaryItem color="#22c55e">
                    <span>Additions</span>
                    <strong>+ {formatCurrency(currentSummary.addition)}</strong>
                 </SummaryItem>
                 <SummaryDivider />
                 <SummaryItem isTotal>
                    <span>Final Amount</span>
                    <strong>{formatCurrency(currentSummary.final)}</strong>
                 </SummaryItem>
                 <SummaryItem isTotal>
                    <span>Amount Paid</span>
                    <strong>{formatCurrency(currentSummary.paid)}</strong>
                 </SummaryItem>                 
              </SummaryPanel>

              {safeParse(selected.therapy_details).map((therapy, index) => {
                 const sessionCount = therapy.sesion_per_therapy || 1;
                 const unitCost = (therapy.therapy_charge || 0) / sessionCount;
                 
                 // Get current impacts for visual feedback
                 const deduction = formData.not_attending_details[index]?.total_amount || 0;
                 const addition = formData.extra_attending_details[index]?.total_amount || 0;

                 return (
                  <TherapyGroup key={index}>
                    <TherapyHeader>
                      <Activity size={16} /> 
                      <div>
                        {therapy.therapy_name}
                        <SmallMeta>Base: {therapy.sesion_per_therapy} sessions @ {formatCurrency(unitCost)}/session</SmallMeta>
                      </div>
                    </TherapyHeader>
                    
                    <InputsRow>
                      <InputWrapper>
                        <Label>Missed Sessions</Label>
                        <InputGroup>
                          <Input 
                            type="number" min="0" placeholder="0"
                            value={formData.not_attending_details[index]?.sessions}
                            onChange={(e) => handleInput(index, "not_attending_details", e.target.value, therapy)}
                          
                            disabled={editorCalculations.isFullyPaid} 
                            style={{ 
                                backgroundColor: editorCalculations.isFullyPaid ? '#f1f5f9' : 'white',
                                cursor: editorCalculations.isFullyPaid ? 'not-allowed' : 'text',
                                opacity: editorCalculations.isFullyPaid ? 0.6 : 1
                            }}

                          />
                          {deduction > 0 && <ImpactLabel color="#ef4444">- {formatCurrency(deduction)}</ImpactLabel>}
                        </InputGroup>
                      </InputWrapper>
                      
                      <InputWrapper>
                        <Label>Extra Sessions</Label>
                        <InputGroup>
                          <Input 
                            type="number" min="0" placeholder="0"
                            value={formData.extra_attending_details[index]?.sessions}
                            onChange={(e) => handleInput(index, "extra_attending_details", e.target.value, therapy)}
                            style={{borderColor: addition > 0 ? '#22c55e' : '#e2e8f0'}}
                          />
                          {addition > 0 && <ImpactLabel color="#22c55e">+ {formatCurrency(addition)}</ImpactLabel>}
                        </InputGroup>
                      </InputWrapper>
                    </InputsRow>
                  </TherapyGroup>
                )
              })}

              <Divider />
              
              <RemarksSection>
                <InputWrapper style={{ width: "100%" }}>
                  <Label>Remarks (Not Attending)</Label>
                  <TextArea 
                    value={formData.not_attending_remarks}
                    placeholder="Reason for missing sessions..." 
                    onChange={(e) => setFormData(prev => ({ ...prev, not_attending_remarks: e.target.value }))} 
                  />
                </InputWrapper>
                <InputWrapper style={{ width: "100%" }}>
                  <Label>Remarks (Extra Attending)</Label>
                  <TextArea 
                    value={formData.extra_attending_remarks}
                    placeholder="Reason for extra sessions..." 
                    onChange={(e) => setFormData(prev => ({ ...prev, extra_attending_remarks: e.target.value }))} 
                  />
                </InputWrapper>
              </RemarksSection>
            </CardContent>

            <CardFooter>
              <CancelButton onClick={closeEditor}>Cancel</CancelButton>
              <SubmitButton onClick={handleSubmit}><Save size={18} /> Save Changes</SubmitButton>
            </CardFooter>
          </EditorCard>
        </Overlay>
      )}
    </Container>
  );
};

/* ──────────────────────────────────────────────────────────────
   STYLED COMPONENTS
   ────────────────────────────────────────────────────────────── */

const fadeIn = keyframes` from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } `;
const overlayFade = keyframes` from { opacity: 0; } to { opacity: 1; } `;

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #a1c181 0%, rgba(122, 140, 104, 1) 100%);
  padding: 2rem;
  @media (max-width: 768px) { padding: 1rem; }
`;

const Header = styled.div` margin-bottom: 2rem; color: white; `;
const Title = styled.h2` margin: 0; font-size: 2rem; font-weight: 800; @media (max-width: 768px) { font-size: 1.5rem; }`;
const Subtitle = styled.p` margin: 5px 0 0; opacity: 0.9; font-size: 0.9rem; `;
const SmallMeta = styled.div` font-size: 0.75rem; color: #94a3b8; font-weight: 400; margin-top: 2px; `;
const InputGroup = styled.div` position: relative; display: flex; align-items: center; `;
/* --- Filter Bar Styles --- */
const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  padding: 10px;
  border-radius: 12px;
  width: fit-content;
  @media (max-width: 768px) { width: 100%; justify-content: space-between; }
`;

const DateLabel = styled.span` font-weight: 700; font-size: 1.1rem; min-width: 140px; text-align: center; `;

const FilterButton = styled.button`
  background: #ffffff; /* Solid White */
  border: 1px solid #e2e8f0; /* Subtle grey border for definition */
  border-radius: 12px;
  
  /* Increased Button Size */
  width: 50px; 
  height: 50px;
  
  display: flex; 
  align-items: center; 
  justify-content: center;
  
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  transition: all 0.2s ease;

  &:hover {
    background: #f0fdf4; /* Light green hover */
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0,0,0,0.1);
    border-color: #bbf7d0;
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

/* --- View Switching --- */
const DesktopView = styled.div`
  display: block;
  @media (max-width: 768px) { display: none; }
`;

/* 3. Update MobileView to also scroll if the list is long */
const MobileView = styled.div`
  display: none;
  @media (max-width: 768px) { 
    display: flex; 
    flex-direction: column; 
    gap: 1rem;
    
    /* ADDED: Mobile Scroll Logic */
    max-height: 70vh;
    overflow-y: auto;
    padding-bottom: 20px; /* Space for scrollbar */
  }
`;

/* --- Mobile Card Styles --- */
const MobileCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  animation: ${fadeIn} 0.5s ease-out;
  cursor: pointer;
`;

const MobileCardHeader = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 0.8rem;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.5rem;
`;

const MobileCardBody = styled.div`
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 1rem;
`;

const MobileCardFooter = styled.div`
  padding-top: 0.5rem;
`;

const EmptyState = styled.div`
    text-align: center; color: white; font-weight: 500; margin-top: 2rem;
`;

/* --- Existing Styles (Table) --- */
const TableCard = styled.div`
background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  animation: ${fadeIn} 0.5s ease-out;

  /* ADDED: Scroll Logic */
  max-height: 65vh; /* Adjusts height based on screen size */
  overflow-y: auto; /* Enables vertical scrolling */
  border: 1px solid #e2e8f0;

  /* ADDED: Custom Scrollbar Styling */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const SummaryPanel = styled.div`
  background: #f1f5f9; border-radius: 12px; padding: 1rem; margin-bottom: 1.5rem;
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
  border: 1px solid #e2e8f0;
`;
const SummaryItem = styled.div`
  display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 80px;
  span { font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
  strong { font-size: ${({isTotal}) => isTotal ? '1.2rem' : '1rem'}; color: ${({color, isTotal}) => isTotal ? '#0f172a' : color || '#334155'}; }
`;
const SummaryDivider = styled.div` width: 1px; height: 40px; background: #cbd5e1; margin: 0 10px; @media(max-width:500px){display:none;} `;
const UserRow = styled.div` display: flex; align-items: center; gap: 10px; `;
const PriceTag = styled.span` font-weight: 700; color: #16a34a; `;
const StyledTable = styled.table` width: 100%; border-collapse: collapse; `;

const Th = styled.th`
  text-align: ${({ align }) => align || 'left'};
  padding: 1.2rem;
  
  /* ADDED: Sticky Header Logic */
  position: sticky;
  top: 0;
  z-index: 10;
  background: #f0fdf4; /* Background required to hide scrolling content behind it */
  
  color: #3f6212;
  font-weight: 700;
  border-bottom: 2px solid #dcfce7;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02); /* Subtle shadow for depth */
`;

const Tr = styled.tr` cursor: pointer; transition: all 0.2s; &:hover { background: #f8fafc; transform: scale(1.005); box-shadow: 0 4px 12px rgba(0,0,0,0.05); } border-bottom: 1px solid #f1f5f9; `;
const Td = styled.td` padding: 1rem 1.2rem; color: #334155; font-size: 0.95rem; text-align: ${({ align }) => align || 'left'}; `;
const Badge = styled.span` background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-family: monospace; font-weight: 600; `;
const Avatar = styled.div` width: 32px; height: 32px; background: #dcfce7; color: #166534; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; `;
const NameText = styled.span` font-weight: 600; color: #0f172a; `;
const DateText = styled.div` display: flex; align-items: center; gap: 6px; color: #64748b; font-size: 0.9rem; `;
const EditButton = styled.button` background: transparent; border: 1px solid #cbd5e1; color: #64748b; padding: 6px 12px; border-radius: 20px; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; font-size: 0.8rem; transition: all 0.2s; &:hover { background: #3f6212; color: white; border-color: #3f6212; } `;
const ImpactLabel = styled.span` position: absolute; right: 10px; font-size: 0.8rem; font-weight: 700; color: ${({color}) => color}; background: white; padding: 2px 6px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);`;

/* --- Editor Modal Styles (Unchanged mostly) --- */
const Overlay = styled.div` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(5px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; animation: ${overlayFade} 0.3s ease; `;
const EditorCard = styled.div` background: white; width: 100%; max-width: 600px; max-height: 90vh; border-radius: 20px; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); animation: ${fadeIn} 0.3s cubic-bezier(0.16, 1, 0.3, 1); `;
const CardHeader = styled.div` padding: 1.5rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; `;
const CardTitle = styled.h3` margin: 0; color: #0f172a; font-size: 1.25rem; `;
const CardSubtitle = styled.span` color: #64748b; font-size: 0.9rem; `;
const CloseBtn = styled.button` background: none; border: none; cursor: pointer; color: #94a3b8; &:hover { color: #ef4444; } `;
const CardContent = styled.div` padding: 1.5rem; overflow-y: auto; flex: 1; `;
const TherapyGroup = styled.div` background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; `;
const TherapyHeader = styled.div` display: flex; align-items: center; gap: 8px; font-weight: 700; color: #334155; margin-bottom: 1rem; svg { color: #a1c181; } `;
const InputsRow = styled.div` display: flex; gap: 1rem; @media (max-width: 500px) { flex-direction: column; } `;
const InputWrapper = styled.div` flex: 1; display: flex; flex-direction: column; gap: 5px; `;
const Label = styled.label` font-size: 0.85rem; color: #64748b; font-weight: 500; `;
const Input = styled.input` padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; transition: border-color 0.2s; &:focus { outline: none; border-color: #a1c181; } `;
const Divider = styled.hr` border: none; border-top: 1px dashed #cbd5e1; margin: 1.5rem 0; `;
const RemarksSection = styled.div` display: flex; flex-direction: column; gap: 1rem; `;
const TextArea = styled.textarea` width: 100%; padding: 10px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; min-height: 60px; resize: vertical; font-family: inherit; &:focus { outline: none; border-color: #a1c181; } `;
const CardFooter = styled.div` padding: 1.5rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 1rem; background: #fcfcfc; border-radius: 0 0 20px 20px; `;
const ButtonBase = styled.button` padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; border: none; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; transition: transform 0.1s; &:active { transform: translateY(1px); } `;
const CancelButton = styled(ButtonBase)` background: #f1f5f9; color: #475569; &:hover { background: #e2e8f0; } `;
const SubmitButton = styled(ButtonBase)` background: linear-gradient(135deg, #a1c181 0%, #7a8c68 100%); color: white; box-shadow: 0 4px 10px rgba(161, 193, 129, 0.4); &:hover { box-shadow: 0 6px 15px rgba(161, 193, 129, 0.5); } `;

export default AttendanceSessionEditor;