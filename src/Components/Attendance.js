import React, { useEffect, useState } from "react";
import styled, {css} from "styled-components";
import { Users, Calendar, Clock, DollarSign, CheckCircle, Search, X, ChevronLeft, ChevronRight, ChevronDown,  Send } from "lucide-react";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
const PAGE_SIZE = 30;

const PatientAttendanceCard = () => {
  const [patients, setPatients] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [therapies, setTherapies] = useState([]);
  const [selectedTherapies, setSelectedTherapies] = useState([]);
  const [doctors, setDoctors] = useState([]);
const [attendanceData, setAttendanceData] = useState({
  date: "",
  session: "",
  therapy_charge: "",
  discount: "",
  discount_remarks: "",
  therapy_details: [],            // ✅ Important
  consultant_doctor: [],
  doctorDropdownOpen: false,
});

const resetAttendanceData = () => ({
  date: "",
  session: "",
  therapy_charge: "",
  discount: "",
  discount_remarks: "",
  therapy_details: [],
  consultant_doctor: [],
  doctorDropdownOpen: false,
});

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await apiRequest(`${Milestonebaseurl}get_all_patient_details/`, "GET");
      setPatients(response.data);
    } catch (error) {
      toast.error("Failed to load patient data");
    }
  };

useEffect(() => {
  fetchPatients();
  fetchTherapies();
  fetchConsultingDoctors(); 
}, []);

const fetchTherapies = async () => {
  try {
    const response = await apiRequest(`${Milestonebaseurl}therapy-details/`, "GET");

    // ✅ Ensure we store only the array
    if (response?.data?.data && Array.isArray(response.data.data)) {
      setTherapies(response.data.data);
    } else {
      setTherapies([]); // fallback empty array
      toast.warning("No therapy data found");
    }
  } catch (error) {
    setTherapies([]); // ensure fallback
    toast.error("Failed to load therapy details");
  }
};

const fetchConsultingDoctors = async () => {
  try {
    const result = await apiRequest(
      `${Milestonebaseurl}get-consulting-doctors/`,
      "GET"
    );

    // if API returns pure array
    if (Array.isArray(result)) {
      setDoctors(result);
    }

    // if API returns {success: true, data: [...] }
    else if (result.success && Array.isArray(result.data)) {
      setDoctors(result.data);
    }

  } catch (error) {
    console.error("Unexpected error fetching doctors:", error);
  }
};

  // useEffect(() => {
  //   fetchConsultingDoctors();
  // }, []);
const toggleDoctor = (name) => {
  setAttendanceData((prev) => {
    const selected = prev.consultant_doctor;

    if (selected.includes(name)) {
      // remove
      return {
        ...prev,
        consultant_doctor: selected.filter((d) => d !== name),
      };
    } else {
      // add — keep dropdown open so user can select more
      return {
        ...prev,
        consultant_doctor: [...selected, name],
        // doctorDropdownOpen: false,
      };
    }
  });
};

useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest(".doctor-dropdown-container")) {
      setAttendanceData((prev) => ({ ...prev, doctorDropdownOpen: false }));
    }
  };

  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

const updateOverallTotals = (updatedTherapies) => {
  const totalCharge = updatedTherapies.reduce(
    (sum, t) => sum + (t.therapy_charge || 0), 0
  );

  const totalDiscount = updatedTherapies.reduce(
    (sum, t) => sum + (t.discount || 0), 0
  );

  const totalAmount = totalCharge - totalDiscount;

  setAttendanceData(prev => ({
    ...prev,
    therapy_charge: totalCharge,
    discount: totalDiscount,
    total_amount: totalAmount
  }));
};

const handleTherapySelect = (therapy_name) => {
  if (!therapy_name) return;

  // get therapy object
  const selected = therapies.find((t) => t.therapy_name === therapy_name);
  if (!selected) return;

  // prevent duplicates
  if (selectedTherapies.some((t) => t.therapy_name === therapy_name)) {
    toast.info(`${therapy_name} already added`);
    return;
  }

  // default values
  const newTherapy = {
    therapy_name,
    per_session_charge: 0,     // user will enter
    sessions_per_month: 0,     // user will enter
    total_charge: 0,
    discount: 0,
  };

  const updated = [...selectedTherapies, newTherapy];
  setSelectedTherapies(updated);
};

const updateTherapyField = (index, field, value) => {
  const updated = [...selectedTherapies];
  updated[index][field] = Number(value);

  // Auto calculate total charge
  const per = Number(updated[index].per_session_charge || 0);
  const ses = Number(updated[index].sessions_per_month || 0);

  updated[index].total_charge = per * ses;

  setSelectedTherapies(updated);

  // update totals
  const totalCharge = updated.reduce((sum, t) => sum + t.total_charge, 0);
  const totalSessions = updated.reduce((sum, t) => sum + (t.sessions_per_month || 0), 0);
  // 3. ✅ NEW: Sum of all discounts
  const totalDiscount = updated.reduce((sum, t) => sum + (Number(t.discount) || 0), 0);

  handleChange("therapy_charge", totalCharge);
  handleChange("session", totalSessions);
  handleChange("discount", totalDiscount); // This updates the global discount input
  handleChange("total_amount", totalCharge - totalDiscount);
};

 // 🧩 define removeTherapy BEFORE return()
const removeTherapy = (therapyName) => {
  const updated = selectedTherapies.filter(t => t.therapy_name !== therapyName);
  setSelectedTherapies(updated);

  // ✅ Auto-update totals
  const totalCharge = updated.reduce((sum, t) => sum + Number(t.therapy_charge), 0);
  const totalSessions = updated.reduce((sum, t) => sum + Number(t.sessions_per_month || 0), 0);
  const totalDiscount = updated.reduce((sum, t) => sum + (Number(t.discount) || 0), 0);
  setAttendanceData(prev => ({
    ...prev,
    therapy_charge: totalCharge,
    session: totalSessions,
    discount: totalDiscount, // This updates the global discount input
    total_amount: totalCharge - totalDiscount
  }));
};

  const handleChange = (field, value) => {
    setAttendanceData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const handleSave = async () => {
  if (!attendanceData.date || !attendanceData.session || selectedTherapies.length === 0) {
    toast.warning("Please select date, session, and at least one therapy");
    return;
  }

try{
  // ✅ Send only name & type
const simplifiedTherapies = selectedTherapies.map((t) => ({
  therapy_name: t.therapy_name,
  therapy_charge: t.total_charge || t.therapy_charge, // ✅ use computed charge
  discount: t.discount || 0,   
  sesion_per_therapy: t.sessions_per_month,
}));

  const payload = {
  registration_number: selectedPatient.registration_number,
  attendance_date: attendanceData.date,
  therapy_charge: attendanceData.therapy_charge,
  discount: Number(attendanceData.discount || 0),
  discount_remarks: attendanceData.discount_remarks || "",
  therapy_details: simplifiedTherapies,
  session: attendanceData.session,
  // NEW: multiple doctors
  consultant_doctor: attendanceData.consultant_doctor || [], 
};



    const response = await apiRequest(`${Milestonebaseurl}attendance/`, "POST", payload);

    if (response && response.success) {
      toast.success(`Attendance saved for ${selectedPatient.name_of_child}`, {
        autoClose: 2000,
        onClose: () => setModalOpen(false),
      });
      setAttendanceData(resetAttendanceData());

      setSelectedTherapies([]);
    } else {
      const msg = response?.message || response?.error || "Attendance could not be saved. Please try again.";
      toast.error(msg, { autoClose: 2500 });
    }
  } catch (error) {
    const message = error?.response?.data?.error || "Failed to save attendance";
    toast.error(message, { autoClose: 2000 });
  }
};


  const openModal = (patient) => {
    setSelectedPatient(patient);
    setAttendanceData(resetAttendanceData());

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPatient(null);
    setAttendanceData(resetAttendanceData());

  };

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.registration_number?.toLowerCase().includes(term) ||
      p.name_of_child?.toLowerCase().includes(term) ||
      p.dob?.toLowerCase().includes(term) ||
      p.father_phone_number?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredPatients.length / PAGE_SIZE);
  const displayedPatients = filteredPatients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <Container>
      <Header>
        <TitleWrapper>
          <IconWrapper>
            <Users size={48} strokeWidth={2} />
          </IconWrapper>
          <TitleContent>
            <Title>Patient Attendance Management</Title>
            <Subtitle>Track therapy sessions and manage patient records</Subtitle>
          </TitleContent>
        </TitleWrapper>
      </Header>

      <ContentCard>
        <SearchSection>
          <SearchWrapper>
            <SearchIconWrapper>
              <Search size={18} />
            </SearchIconWrapper>

            <SearchInput
              type="text"
              placeholder="Search by registration, name, DOB, or father's phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {searchTerm && (
              <ClearButton onClick={() => setSearchTerm("")}>
                <X size={14} />
                <span>Clear</span>
              </ClearButton>
            )}
          </SearchWrapper>

          <ResultCount>
            Showing <strong>{displayedPatients.length}</strong> of{" "}
            <strong>{filteredPatients.length}</strong> patients
          </ResultCount>
        </SearchSection>

        {displayedPatients.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <Users size={64} />
            </EmptyIcon>
            <EmptyTitle>No patients found</EmptyTitle>
            <EmptyText>Try adjusting your search criteria</EmptyText>
          </EmptyState>
        ) : (
          <>
            <ThreeColumnRow>
              {displayedPatients.map((p) => {
                let age = { year: 0, months: 0, days: 0 };
                try {
                  age = typeof p.age === 'string' ? JSON.parse(p.age) : p.age;
                } catch {}

                return (
                  <Column key={p.registration_number}>
                    <ColumnHeader>
                      <Users size={20} />
                      <ColumnTitle>{p.name_of_child}</ColumnTitle>
                    </ColumnHeader>
                    <ColumnContent>
                      <PatientDetailRow>
                        <PatientDetailLabel>Reg #:</PatientDetailLabel>
                        <PatientDetailValue>{p.registration_number}</PatientDetailValue>
                      </PatientDetailRow>
                      <PatientDetailRow>
                        <PatientDetailLabel>DOB:</PatientDetailLabel>
                        <PatientDetailValue>{new Date(p.dob).toLocaleDateString()}</PatientDetailValue>
                      </PatientDetailRow>
                      <PatientDetailRow>
                        <PatientDetailLabel>Age:</PatientDetailLabel>
                        <PatientDetailValue>{age.year}y {age.months}m {age.days}d</PatientDetailValue>
                      </PatientDetailRow>
                      {p.father_phone_number && (
                        <PatientDetailRow>
                          <PatientDetailLabel>Phone:</PatientDetailLabel>
                          <PatientDetailValue>{p.father_phone_number}</PatientDetailValue>
                        </PatientDetailRow>
                      )}
                      <AttendanceButtonSmall onClick={() => openModal(p)}>
                        <CheckCircle size={16} />
                        Mark Attendance
                      </AttendanceButtonSmall>
                    </ColumnContent>
                  </Column>
                );
              })}
            </ThreeColumnRow>

            {totalPages > 1 && (
              <PaginationWrapper>
                <PaginationButton 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft size={18} />
                  Previous
                </PaginationButton>
                <PageInfo>
                  Page <PageNumber>{currentPage}</PageNumber> of <PageNumber>{totalPages}</PageNumber>
                </PageInfo>
                <PaginationButton
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                  <ChevronRight size={18} />
                </PaginationButton>
              </PaginationWrapper>
            )}
          </>
        )}
      </ContentCard>

      {modalOpen && selectedPatient && (
        <ModalBackdrop onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <CheckCircle size={24} />
                {/* Mark  */}Attendance
              </ModalTitle>
              <CloseButton onClick={closeModal}>
              X
                <X size={24} />
              </CloseButton>
            </ModalHeader>

            <PatientInfoCard>
              <PatientInfoName>{selectedPatient.name_of_child}</PatientInfoName>
              <PatientInfoReg>Registration #{selectedPatient.registration_number}</PatientInfoReg>
            </PatientInfoCard>

<FormGroup>
<FormRow>
  <HalfGroup>
    <Label>
      <Calendar size={16} />
      Session Date
    </Label>
    <Input
      type="date"
      value={attendanceData.date || ""}
      onChange={(e) => handleChange("date", e.target.value)}
    />
  </HalfGroup>

  <HalfGroup>
    <Label>
      <Clock size={16} />
      Number of Sessions
    </Label>
    <Input
      type="text"
      placeholder="Enter number of sessions"
      value={attendanceData.session || ""}
      onChange={(e) => handleChange("session", e.target.value)}
      disabled
    />
  </HalfGroup>
</FormRow>
</FormGroup>

            <FormGroup>
              <Label>
                <DollarSign size={16} />
                Select Therapies
              </Label>
              <select
                key={selectedTherapies.length}
                onChange={(e) => handleTherapySelect(e.target.value)}
                defaultValue=""
                style={{
                  width: "100%",
                  padding: "0.875rem",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  background: "#f9fafb",
                }}
              >
                <option value="">Select Therapy</option>
                {therapies.map((t, index) => (
                  <option
                    key={index}
                    value={`${t.therapy_name}`} // use a combined key
                  >
                    {`${t.therapy_name} `}
                  </option>
                ))}
              </select>

      {selectedTherapies.length > 0 && (
        <TherapyList>
          {selectedTherapies.map((t, index) => (
            <TherapyCard key={index}>
              <CardHeader>
                <span className="name">{t.therapy_name}</span>
                <RemoveButton
                  onClick={() => {
                    const updated = selectedTherapies.filter((x) => x !== t);
                    setSelectedTherapies(updated);
                    updateOverallTotals(updated);
                  }}
                >
                  <X size={14} /> Remove
                </RemoveButton>
              </CardHeader>

              <CardGrid>
                <MiniInputGroup>
                  <label>Charge</label>
                  <input
                    type="text"
                    value={t.per_session_charge}
                    onChange={(e) => updateTherapyField(index, "per_session_charge", e.target.value)}
                  />
                </MiniInputGroup>
                <MiniInputGroup>
                  <label>Sessions</label>
                  <input
                    type="text"
                    value={t.sessions_per_month}
                    onChange={(e) => updateTherapyField(index, "sessions_per_month", e.target.value)}
                  />
                </MiniInputGroup>
                <MiniInputGroup>
                  <label>Discount</label>
                  <input
                    type="text"
                    value={t.discount}
                    onChange={(e) => updateTherapyField(index, "discount", e.target.value)}
                  />
                </MiniInputGroup>
              </CardGrid>
              
              <CardFooter>
                <span>Total:</span>
                <strong>₹{t.total_charge}</strong>
              </CardFooter>
            </TherapyCard>
          ))}
          
          <GrandTotalBox>
             <span>Net Payable Amount</span>
             <h2>₹{attendanceData.therapy_charge 
                ? (attendanceData.therapy_charge - (attendanceData.discount || 0))
                : 0}
             </h2>
          </GrandTotalBox>
        </TherapyList>
      )}
            </FormGroup>

<FormGroup>
  <Label>
    <Users size={16} />
    Consultant Doctors
  </Label>

  <div className="doctor-dropdown-container" style={{ position: "relative" }}>
    
    {/* DROPDOWN BOX */}
    <div
      onClick={(e) => {
        e.stopPropagation();
        setAttendanceData((prev) => ({
          ...prev,
          doctorDropdownOpen: !prev.doctorDropdownOpen,
        }));
      }}
      style={{
        border: "2px solid #e5e7eb",
        borderRadius: "12px",
        padding: "0.875rem",
        background: "#f9fafb",
        cursor: "pointer",
      }}
    >
      {attendanceData.consultant_doctor.length > 0
        ? attendanceData.consultant_doctor.join(", ")
        : "Select Doctor(s)"}
    </div>

    {/* DROPDOWN MENU */}
    {attendanceData.doctorDropdownOpen && (
      <div
        style={{
          position: "absolute",
          width: "100%",
          background: "white",
          border: "2px solid #e5e7eb",
          borderRadius: "12px",
          marginTop: "6px",
          maxHeight: "260px",
          display: "flex",
          flexDirection: "column",
          zIndex: 100,
          overflow: "hidden",
        }}
      >
        {/* Close button row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            borderBottom: "1px solid #e5e7eb",
            background: "#f9fafb",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 500 }}>
            {attendanceData.consultant_doctor.length} selected
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAttendanceData((prev) => ({ ...prev, doctorDropdownOpen: false }));
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "#406147",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "4px 10px",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <X size={13} /> Done
          </button>
        </div>

        {/* Scrollable doctor list */}
        <div style={{ overflowY: "auto", maxHeight: "200px" }}>
          {doctors.map((doc, index) => {
            const name = doc.name;
            const isSelected = attendanceData.consultant_doctor.includes(name);

            return (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDoctor(name);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px",
                  cursor: "pointer",
                  background: isSelected ? "#ecfdf5" : "white",
                }}
              >
                <input type="checkbox" checked={isSelected} readOnly />
                <span>
                  {doc.name} — {doc.designation}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    )}
  </div>
</FormGroup>


            <FormGroup>
               <FormRow>
                <HalfGroup>
              <Label>
                <DollarSign size={16} />
                Discount (₹)
              </Label>
              <Input
                type="text"
                placeholder="Enter discount amount"
                value={attendanceData.discount}
                onChange={(e) => handleChange("discount", e.target.value)}
                readOnly
              />
            </HalfGroup><HalfGroup>
              <Label>
                <DollarSign size={16} />
                Discount Remarks
              </Label>
              <Input
                type="text"
                placeholder="Enter discount amount"
                value={attendanceData.discount_remarks}
                onChange={(e) => handleChange("discount_remarks", e.target.value)}
              />
              </HalfGroup>
              </FormRow>
            </FormGroup>

            <ButtonGroup>
              <CancelButton onClick={closeModal}>Cancel</CancelButton>

              <SaveButton onClick={handleSave}>
                <CheckCircle size={18} />
                {attendanceData.discount && Number(attendanceData.discount) > 0
                  ? "Send Request"
                  : "Save Attendance"}
              </SaveButton>
            </ButtonGroup>
          </ModalContent>
        </ModalBackdrop>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #a1c181 0%, rgba(122, 140, 104, 1) 100%);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: white;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const IconWrapper = styled.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const TitleContent = styled.div``;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.05rem;
  margin: 0.5rem 0 0;
  opacity: 0.95;
`;

const ContentCard = styled.div`
  background: white;
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);

  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 16px;
  }
`;

const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 20px 0;
  gap: 10px;
`;

const SearchIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a1c181; /* nice green tint */
  margin-bottom: 6px;

  svg {
    width: 22px;
    height: 22px;
  }
`;

const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 90%;
  max-width: 550px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 8px 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 38px 10px 12px; /* normal padding */
  border: none;
  outline: none;
  font-size: 15px;
  color: #333;
  background: transparent;

  &::placeholder {
    color: #999;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #000;
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ResultCount = styled.div`
  color: #6b7280;
  font-size: 0.95rem;

  strong {
    color: #a1c181;
    font-weight: 700;
  }
`;

// THREE COLUMN STYLED COMPONENTS
const ThreeColumnRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 2rem 0;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #a1c181;
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
    transform: translateY(-2px);
  }
`;

const ColumnHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: #a1c181;
`;

const ColumnTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

const ColumnContent = styled.div`
  color: #374151;
  font-size: 0.95rem;
  line-height: 1.6;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #a1c181;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const PatientDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;

  &:last-of-type {
    border-bottom: none;
  }
`;

const PatientDetailLabel = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const PatientDetailValue = styled.span`
  font-size: 0.875rem;
  color: #111827;
  font-weight: 600;
`;

const AttendanceButtonSmall = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #a1c181 0%, #7b896dff 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  color: #d1d5db;
  margin-bottom: 1.5rem;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  color: #374151;
  margin: 0 0 0.5rem;
  font-weight: 700;
`;

const EmptyText = styled.p`
  color: #6b7280;
  font-size: 1rem;
  margin: 0;
`;

const PatientList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PatientRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  transition: all 0.3s ease;
  gap: 1rem;

  &:hover {
    background: #f0fdf4;
    border-color: rgba(213, 238, 188, 1);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.15);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const PatientContent = styled.div`
  flex: 1;
`;

const PatientHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
`;

const PatientName = styled.h3`
  font-size: 1.25rem;
  color: #111827;
  font-weight: 700;
  margin: 0;
`;

const RegBadge = styled.span`
  background: linear-gradient(135deg, #a1c181 0%, #849375ff 100%);
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const PatientDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const DetailLabel = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
`;

const DetailSeparator = styled.span`
  color: #d1d5db;
  font-weight: 300;
`;

const AttendanceButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #a1c181 0%, rgba(132, 161, 102, 1) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.disabled ? '#e5e7eb' : 'linear-gradient(135deg, #a1c181 0%, rgba(141, 161, 121, 1) 100%)'};
  color: ${props => props.disabled ? '#9ca3af' : 'white'};
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 8px 24px rgba(16, 185, 129, 0.3)'};
  }
`;

const PageInfo = styled.div`
  font-size: 1rem;
  color: #6b7280;
  font-weight: 500;
`;

const PageNumber = styled.span`
  color: #a1c181;
  font-weight: 700;
  font-size: 1.1rem;
`;

const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 24px;
  width: 550px;
  height:800px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
`;

export const StyledSelect = styled.select`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: #1f2937;
  height: 100%;
  width: 100%;
  cursor: pointer;
  appearance: none; /* Hides default arrow */
  &:focus { outline: none; }
`;

export const InputContainer = styled.div`
  flex: 1;
  margin-bottom: 1rem;
`;

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 0 1rem;
  transition: all 0.2s;
  height: 50px;
  
  /* Focus state wrapper */
  &:focus-within {
    background: #fff;
    border-color: #a1c181;
    box-shadow: 0 0 0 4px rgba(161, 193, 129, 0.15);
  }

  /* Disabled state */
  ${props => props.disabled && css`
    background: #f3f4f6;
    opacity: 0.8;
    cursor: not-allowed;
  `}

  .icon {
    color: #9ca3af;
    margin-right: 0.75rem;
  }
`;

export const SectionTitle = styled.h4`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  font-weight: 700;
  margin: 1.5rem 0 0.75rem 0;
`;

const CloseButton = styled.button`
  background: #f3f4f6;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const PatientInfoCard = styled.div`
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  padding: 1.25rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  border: 2px solid #a1c181;
`;

const PatientInfoName = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: hsla(90, 14%, 40%, 1.00);
  margin-bottom: 0.25rem;
`;

const PatientInfoReg = styled.div`
  font-size: 0.9rem;
  color: rgba(109, 121, 96, 1);
  font-weight: 600;
`;
// --- Therapy Cards (The modern list) ---
export const TherapyList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const TherapyCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 1rem;
  transition: transform 0.2s;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
    border-color: #a1c181;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  .name {
    font-weight: 700;
    color: #374151;
    font-size: 1rem;
  }
`;

export const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fef2f2;
  color: #ef4444;
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  &:hover { background: #fee2e2; }
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
`;

export const MiniInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  
  label {
    font-size: 0.7rem;
    color: #6b7280;
    margin-bottom: 4px;
    font-weight: 600;
  }
  
  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.9rem;
    background: #f9fafb;
    &:focus {
        outline: none;
        border-color: #a1c181;
        background: white;
    }
  }
`;

export const CardFooter = styled.div`
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px dashed #e5e7eb;
  display: flex;
  justify-content: space-between;
  color: #4b5563;
  font-size: 0.9rem;
  strong { color: #111827; font-size: 1rem; }
`;

export const GrandTotalBox = styled.div`
  background: #ecfdf5;
  border: 1px dashed #a1c181;
  border-radius: 12px;
  padding: 1rem;
  text-align: right;
  
  span { display: block; font-size: 0.8rem; color: #166534; margin-bottom: 4px;}
  h2 { margin: 0; color: #14532d; font-size: 1.5rem; }
`;

// --- Custom Dropdown ---
export const DropdownMenu = styled.div`
  position: absolute;
  top: 110%;
  left: 0;
  width: 100%;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
  padding: 4px;
`;

export const DropdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.2s;
  background: ${props => props.isSelected ? '#f0fdf4' : 'transparent'};
  
  &:hover { background: #f3f4f6; }
  
  .checkbox {
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 2px solid ${props => props.isSelected ? '#a1c181' : '#d1d5db'};
    background: ${props => props.isSelected ? '#a1c181' : 'white'};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  span {
    font-size: 0.9rem;
    color: #374151;
    display: flex;
    flex-direction: column;
    small { color: #9ca3af; }
  }
`;
const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;
  justify-content: flex-end; 
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HalfGroup = styled(FormGroup)`
  flex: 1;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
  height: 52px;

  &:focus {
    outline: none;
    border-color: #a1c181;
    background: white;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 1rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
  }
`;

const SaveButton = styled.button`
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #a1c181 0%, rgba(119, 143, 95, 1) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default PatientAttendanceCard;