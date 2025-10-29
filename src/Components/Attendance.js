import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Users, Calendar, Clock, DollarSign, CheckCircle, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
const PAGE_SIZE = 10;

const PatientAttendanceCard = () => {
  const [patients, setPatients] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

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

  const handleChange = (field, value) => {
    setAttendanceData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!attendanceData.date || !attendanceData.session || !attendanceData.therapy_charge) {
      toast.warning("Please fill all fields");
      return;
    }

try {
  const payload = {
    registration_number: selectedPatient.registration_number,
    date: attendanceData.date,
    session: attendanceData.session,
    therapy_charge: attendanceData.therapy_charge,
  };

  const response = await apiRequest(`${Milestonebaseurl}attendance/`, "POST", payload);

  // Check if backend returned a success status or specific flag
  if (response && response.success) { // adjust according to your backend response
    toast.success(`Attendance saved for ${selectedPatient.name_of_child}`, {
      autoClose: 2000,
      onClose: () => setModalOpen(false),
    });
    setAttendanceData({});
  } else {
    // Use backend message if exists
    const msg =
        response?.message ||
        response?.error ||
        "Attendance could not be saved. Please try again.";
      toast.error(msg, { autoClose: 2500 });
  }
} catch (error) {
  const message = error?.response?.data?.error || "Failed to save attendance";
  toast.error(message, { autoClose: 2000 });
}

  };

  const openModal = (patient) => {
    setSelectedPatient(patient);
    setAttendanceData({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPatient(null);
    setAttendanceData({});
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
            <PatientList>
              {displayedPatients.map((p) => {
                let age = { year: 0, months: 0, days: 0 };
                try {
                  age = typeof p.age === 'string' ? JSON.parse(p.age) : p.age;
                } catch {}

                return (
                  <PatientRow key={p.registration_number}>
                    <PatientContent>
                      <PatientHeader>
                        <PatientName>{p.name_of_child}</PatientName>
                        <RegBadge>REG #{p.registration_number}</RegBadge>
                      </PatientHeader>
                      <PatientDetails>
                        <DetailItem>
                          <DetailLabel>DOB:</DetailLabel>
                          <DetailValue>{new Date(p.dob).toLocaleDateString()}</DetailValue>
                        </DetailItem>
                        <DetailSeparator>•</DetailSeparator>
                        <DetailItem>
                          <DetailLabel>Age:</DetailLabel>
                          <DetailValue>{age.year}y {age.months}m {age.days}d</DetailValue>
                        </DetailItem>
                        {p.father_phone_number && (
                          <>
                            <DetailSeparator>•</DetailSeparator>
                            <DetailItem>
                              <DetailLabel>Phone:</DetailLabel>
                              <DetailValue>{p.father_phone_number}</DetailValue>
                            </DetailItem>
                          </>
                        )}
                      </PatientDetails>
                    </PatientContent>
                    <AttendanceButton onClick={() => openModal(p)}>
                      <CheckCircle size={20} />
                      <span>Attendance</span>
                    </AttendanceButton>
                  </PatientRow>
                );
              })}
            </PatientList>

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
                <X size={24} />X
              </CloseButton>
            </ModalHeader>

            <PatientInfoCard>
              <PatientInfoName>{selectedPatient.name_of_child}</PatientInfoName>
              <PatientInfoReg>Registration #{selectedPatient.registration_number}</PatientInfoReg>
            </PatientInfoCard>

            <FormGroup>
              <Label>
                <Calendar size={16} />
                Session Date
              </Label>
              <Input
                type="date"
                value={attendanceData.date || ""}
                onChange={(e) => handleChange("date", e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Clock size={16} />
                Number of Sessions
              </Label>
              <Input
                type="text"
                placeholder="Enter number of sessions"
                value={attendanceData.session || ""}
                onChange={(e) => handleChange("session", e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <DollarSign size={16} />
                Therapy Charge (₹)
              </Label>
              <Input
                type="number"
                placeholder="Enter therapy charge"
                value={attendanceData.therapy_charge || ""}
                onChange={(e) => handleChange("therapy_charge", e.target.value)}
              />
            </FormGroup>

            <ButtonGroup>
              <CancelButton onClick={closeModal}>Cancel</CancelButton>
              <SaveButton onClick={handleSave}>
                <CheckCircle size={18} />
                Save Attendance
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
  background: linear-gradient(135deg, #8db488a1 0%, #9bc0b4ff 100%);
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
  color: #10b981; /* nice green tint */
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
    color: #10b981;
    font-weight: 700;
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
    border-color: #a6dbb5b5;
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
  background: ${props => props.disabled ? '#e5e7eb' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'};
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
  color: #10b981;
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
  width: 500px;
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
  border: 2px solid #10b981;
`;

const PatientInfoName = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #065f46;
  margin-bottom: 0.25rem;
`;

const PatientInfoReg = styled.div`
  font-size: 0.9rem;
  color: #059669;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
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

  &:focus {
    outline: none;
    border-color: #10b981;
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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