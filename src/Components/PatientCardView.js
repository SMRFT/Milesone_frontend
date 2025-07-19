"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";
import {
  Search,
  Calendar,
  ChevronRight,
  Loader2,
  Filter,
  User,
  Phone,
  Clock,
  CalendarIcon,
} from "lucide-react";

// Modern color palette with enhanced gradients
const colors = {
  primary: "#406147",
  secondary: "#3a0ca3",
  accent: "#4cc9f0",
  success: "#4ade80",
  warning: "#fbbf24",
  error: "#f87171",
  background: "#f8fafc",
  card: "#ffffff",
  text: "#555",
  textLight: "#64748b",
  border: "#e2e8f0",
  gradients: [
    "linear-gradient(135deg, #4361ee, #3a0ca3)",
    "linear-gradient(135deg, #4cc9f0, #4361ee)",
    "linear-gradient(135deg, #7209b7, #3a0ca3)",
    "linear-gradient(135deg, #f72585, #7209b7)",
    "linear-gradient(135deg, #4cc9f0, #06d6a0)",
  ],
};

// Layout Components
const PageContainer = styled.div`
  padding: 2rem;
  background-color: ${colors.background};
  min-height: 100vh;
  transition: all 0.3s ease;
`;

const Header = styled.header`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 800;
  color: ${colors.primary};
  margin-bottom: 0.5rem;
  position: relative;
  display: inline-block;

  &:after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 40%;
    height: 4px;
    background: ${colors.primary};
    border-radius: 2px;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: ${colors.textLight};
  margin-top: 1rem;
  margin-bottom: 2rem;
`;

// Search and Filter Components
const SearchContainer = styled.div`
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: ${colors.card};
  padding: 1.5rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border-radius: 0.75rem;
  border: 1px solid ${colors.border};
  background-color: ${colors.background};
  font-size: 1rem;
  transition: all 0.2s ease;
  color: ${colors.text};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  }

  &::placeholder {
    color: ${colors.textLight};
  }
`;

const SearchIconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${colors.textLight};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
  background-color: ${(props) =>
    props.active ? colors.primary : colors.background};
  color: ${(props) => (props.active ? "white" : colors.text)};
  border: 1px solid
    ${(props) => (props.active ? colors.primary : colors.border)};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover {
    background-color: ${(props) =>
      props.active ? colors.primary : colors.border};
    transform: translateY(-1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 767px) {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: ${colors.border};
      border-radius: 2px;
    }

    &::-webkit-scrollbar-thumb {
      background: ${colors.primary};
      border-radius: 2px;
    }
  }
`;

// Stats Components
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background: ${colors.card};
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
`;

const StatTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.textLight};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: ${colors.text};
`;

const StatChange = styled.div`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) =>
    props.positive
      ? colors.success
      : props.negative
      ? colors.error
      : colors.textLight};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// Card Components
const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.5rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1280px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const PatientCard = styled.div`
  border-radius: 1.25rem;
  overflow: hidden;
  background: ${(props) => props.gradient};
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  transform: scale(1);
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  position: relative;

  &:hover {
    transform: ${(props) => (props.disabled ? "scale(1)" : "scale(1.02)")};
    box-shadow: ${(props) =>
      props.disabled
        ? "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
        : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"};
  }

  &:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.2)
    );
    z-index: 1;
  }
`;

const CardContent = styled.div`
  padding: 1.75rem;
  color: white;
  position: relative;
  z-index: 2;
`;

const CardHeader = styled.div`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const CardRegistration = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 500;
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  backdrop-filter: blur(4px);
  margin-top: 0.5rem;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`;

const CardRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const CardLabel = styled.span`
  font-weight: 600;
  min-width: 100px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardValue = styled.span`
  flex: 1;
  font-weight: 500;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 1.5rem;
  opacity: 0.9;
  transition: all 0.2s ease;

  ${PatientCard}:hover & {
    opacity: 1;
    transform: translateX(4px);
  }
`;

const ViewDetailsText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  backdrop-filter: blur(4px);
`;

// Badge Component
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  background-color: ${(props) =>
    props.type === "new"
      ? "rgba(74, 222, 128, 0.2)"
      : props.type === "returning"
      ? "rgba(76, 201, 240, 0.2)"
      : "rgba(251, 191, 36, 0.2)"};
  color: ${(props) =>
    props.type === "new"
      ? colors.success
      : props.type === "returning"
      ? colors.accent
      : colors.warning};
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 3;
`;

// Empty and Loading States
const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: ${colors.card};
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  text-align: center;
  grid-column: 1 / -1;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 0.75rem;
`;

const EmptyStateText = styled.p`
  color: ${colors.textLight};
  margin-bottom: 2rem;
  max-width: 500px;
`;

const EmptyStateButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  background-color: ${colors.primary};
  color: white;
  border: none;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${colors.secondary};
    transform: translateY(-2px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  grid-column: 1 / -1;
`;

const LoadingSpinner = styled(Loader2)`
  animation: spin 1s linear infinite;
  color: ${colors.primary};

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Pagination Component
const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2.5rem;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  background-color: ${(props) => (props.active ? colors.primary : colors.card)};
  color: ${(props) => (props.active ? "white" : colors.text)};
  border: 1px solid
    ${(props) => (props.active ? colors.primary : colors.border)};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:hover:not(:disabled) {
    background-color: ${(props) =>
      props.active ? colors.primary : colors.border};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Age calculation function
const calculateAge = (dob) => {
  if (!dob) return "N/A";

  try {
    const today = new Date();
    const birthDate = new Date(dob);

    // Check if the date is valid
    if (isNaN(birthDate.getTime())) {
      return "Invalid Date";
    }

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust for negative days
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }

    // Adjust for negative months
    if (months < 0) {
      years--;
      months += 12;
    }

    // Format the age display
    if (years > 0) {
      if (months > 0 && days > 0) {
        return `${years} years, ${months} months, ${days} days`;
      } else if (months > 0) {
        return `${years} years, ${months} months`;
      } else if (days > 0) {
        return `${years} years, ${days} days`;
      } else {
        return `${years} years`;
      }
    } else if (months > 0) {
      if (days > 0) {
        return `${months} months, ${days} days`;
      } else {
        return `${months} months`;
      }
    } else {
      return `${days} days`;
    }
  } catch (error) {
    console.error("Error calculating age:", error);
    return "Error calculating age";
  }
};

const PatientDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterByDate, setFilterByDate] = useState(true);
  const [filterByStatus, setFilterByStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 6;
  const navigate = useNavigate();
  const { type } = useParams();
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);

      const result = await apiRequest(`${Milestonebaseurl}all-patient/`, "GET");

      if (result.success) {
        console.log("API Response Data:", result.data);
        // Add a status field to each patient for demo purposes
        const patientsWithStatus = result.data.map((patient) => ({
          ...patient,
          status:
            Math.random() > 0.7
              ? "new"
              : Math.random() > 0.5
              ? "returning"
              : "scheduled",
        }));
        setPatients(patientsWithStatus);
      } else {
        console.error("Error fetching patient details:", result.error);

        // Handle 403 Forbidden specifically
        if (result.status === 403) {
          toast.error("You are unauthorized to do this action");
        } else {
          toast.error(result.error || "Failed to load patients");
        }
      }

      setLoading(false);
    };

    fetchPatients();
  }, []);

  const handleCardClick = (patient) => {
    try {
      // Add formatted age to patient object before navigation
      const patientWithFormattedAge = {
        ...patient,
        formattedAge: calculateAge(patient.dob),
      };

      if (type === "Assessments") {
        navigate("/Assessments", {
          state: { patient: patientWithFormattedAge },
        });
      } else if (type === "PediatricAssessmentForm") {
        navigate("/PediatricAssessmentForm", {
          state: { patient: patientWithFormattedAge },
        });
      }
    } catch (error) {
      console.error("Navigation error:", error);
      setError("Failed to navigate to the requested page.");
    }
  };

  const formatDate = (date) => {
    try {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return null;
    }
  };

  const currentDate = formatDate(new Date());

  const filteredPatients = Array.isArray(patients)
    ? patients.filter((patient) => {
        try {
          const nameOfChild = patient.name_of_child || "";
          const phoneNumber = [
            patient.father_phone_number,
            patient.mother_phone_number,
          ]
            .filter(Boolean) // Removes any falsy values (null, undefined, empty string)
            .join(", "); // Joins with a comma and space

          const matchesQuery = searchQuery
            ? nameOfChild.toLowerCase().includes(searchQuery.toLowerCase()) ||
              phoneNumber.includes(searchQuery)
            : true;

          const matchesDate =
            filterByDate && patient.date
              ? formatDate(patient.date) === currentDate
              : true;

          const matchesStatus =
            filterByStatus !== "all" ? patient.status === filterByStatus : true;

          return matchesDate && matchesQuery && matchesStatus;
        } catch (error) {
          console.error("Error filtering patient:", error);
          return false;
        }
      })
    : [];

  // Get current patients for pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Calculate stats
  const totalPatients = patients.length || 0;
  const todaysPatients = patients.filter(
    (patient) => patient.date && formatDate(patient.date) === currentDate
  ).length;
  const newPatients = patients.filter(
    (patient) => patient.status === "new"
  ).length;
  const returningPatients = patients.filter(
    (patient) => patient.status === "returning"
  ).length;

  // Error state
  if (error) {
    return (
      <PageContainer>
        <Header>
          <Title>Patient Dashboard</Title>
          <Subtitle>View and manage patient information</Subtitle>
        </Header>
        <EmptyState>
          <EmptyStateTitle>Error Loading Data</EmptyStateTitle>
          <EmptyStateText>{error}</EmptyStateText>
          <EmptyStateButton onClick={() => window.location.reload()}>
            Retry
          </EmptyStateButton>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <Title>Patient Dashboard</Title>
        <Subtitle>View and manage patient information</Subtitle>
      </Header>

      <StatsContainer>
        <StatCard>
          <StatTitle>
            <User size={16} />
            Total Patients
          </StatTitle>
          <StatValue>{totalPatients}</StatValue>
        </StatCard>

        <StatCard>
          <StatTitle>
            <CalendarIcon size={16} />
            Today's Patients
          </StatTitle>
          <StatValue>{todaysPatients}</StatValue>
        </StatCard>
      </StatsContainer>

      <SearchContainer>
        <SearchInputWrapper>
          <SearchIconWrapper></SearchIconWrapper>
          <SearchInput
            type="text"
            placeholder="Search by patient name or phone number"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
          />
        </SearchInputWrapper>

        <FilterContainer>
          <FilterButton
            active={filterByDate}
            onClick={() => setFilterByDate(!filterByDate)}
          >
            <Calendar size={18} />
            {filterByDate ? "Today" : "All Dates"}
          </FilterButton>
        </FilterContainer>
      </SearchContainer>

      {loading ? (
        <LoadingContainer>
          <LoadingSpinner size={40} />
        </LoadingContainer>
      ) : filteredPatients.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>No patients found</EmptyStateTitle>
          <EmptyStateText>
            {searchQuery
              ? "Try adjusting your search query"
              : filterByDate
              ? "No patients registered today"
              : "No patient records available"}
          </EmptyStateText>
        </EmptyState>
      ) : (
        <>
          <CardsGrid>
            {currentPatients.map((patient, index) => (
              <PatientCard
                key={patient.id || index}
                gradient={colors.gradients[index % colors.gradients.length]}
                disabled={patient.disabled}
                onClick={() => !patient.disabled && handleCardClick(patient)}
              >
                <Badge type={patient.status}>
                  {patient.status === "new"
                    ? "New Patient"
                    : patient.status === "returning"
                    ? "Returning"
                    : "Scheduled"}
                </Badge>

                <CardContent>
                  <CardHeader>
                    <CardTitle>{patient.name_of_child}</CardTitle>
                    <CardRegistration>
                      Reg No: {patient.registration_number}
                    </CardRegistration>
                  </CardHeader>

                  <CardBody>
                    <CardRow>
                      <CardLabel>
                        <CalendarIcon size={16} />
                        Date:
                      </CardLabel>
                      <CardValue>{patient.date}</CardValue>
                    </CardRow>
                    <CardRow>
                      <CardLabel>
                        <CalendarIcon size={16} />
                        DOB:
                      </CardLabel>
                      <CardValue>{patient.dob}</CardValue>
                    </CardRow>

                    <CardRow>
                      <CardLabel>
                        <Clock size={16} />
                        Age:
                      </CardLabel>
                      <CardValue>{calculateAge(patient.dob)}</CardValue>
                    </CardRow>

                    <CardRow>
                      <CardLabel>
                        <User size={16} />
                        Gender:
                      </CardLabel>
                      <CardValue>{patient.sex}</CardValue>
                    </CardRow>

                    <CardRow>
                      <CardLabel>
                        <User size={16} />
                        Parents:
                      </CardLabel>
                      <CardValue>
                        {patient.mother_name &&
                          `${patient.mother_name} (Mother)`}
                        {patient.mother_name && patient.father_name && <br />}
                        {patient.father_name &&
                          `${patient.father_name} (Father)`}
                      </CardValue>
                    </CardRow>

                    <CardRow>
                      <CardLabel>
                        <Phone size={16} />
                        Father Phone:
                      </CardLabel>
                      <CardValue>{patient.father_phone_number}</CardValue>
                    </CardRow>
                    <CardRow>
                      <CardLabel>
                        <Phone size={16} />
                        Mother Phone:
                      </CardLabel>
                      <CardValue>{patient.mother_phone_number}</CardValue>
                    </CardRow>
                    <CardRow>
                      <CardLabel>
                        <Phone size={16} />
                        E-Mail ID:
                      </CardLabel>
                      <CardValue>{patient.mail_id}</CardValue>
                    </CardRow>
                  </CardBody>

                  <CardFooter>
                    <ViewDetailsText>
                      For Assessment Billing <ChevronRight size={16} />
                    </ViewDetailsText>
                  </CardFooter>
                </CardContent>
              </PatientCard>
            ))}
          </CardsGrid>

          {totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </PaginationButton>

              {[...Array(totalPages)].map((_, i) => (
                <PaginationButton
                  key={i}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationButton>
              ))}

              <PaginationButton
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                &gt;
              </PaginationButton>
            </PaginationContainer>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default PatientDashboard;
