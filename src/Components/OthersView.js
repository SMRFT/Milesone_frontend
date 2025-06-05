import React, { useEffect, useState } from "react";
import axios from "axios";
import styled, { ThemeProvider, keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Search,
  User,
  Phone,
  Clock,
  ChevronRight,
} from "lucide-react";

// Theme
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
    purple: "#9c27b0",
    border: "#406147",
    borderLight: "#e9ecef",
  },
  shadows: {
    small: "0 2px 5px rgba(0,0,0,0.1)",
    medium: "0 4px 8px rgba(0,0,0,0.12)",
    large: "0 8px 16px rgba(0,0,0,0.15)",
    hover: "0 8px 20px rgba(0,0,0,0.2)",
  },
  borderRadius: {
    small: "4px",
    medium: "8px",
    large: "12px",
    xl: "16px",
    round: "50%",
  },
  transitions: {
    default: "all 0.3s ease",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },
};

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Styled Components
const PageContainer = styled.div`
  padding: ${(props) => props.theme.spacing.xl};
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  background-color: ${(props) => props.theme.colors.background};
  min-height: 100vh;
  color: ${(props) => props.theme.colors.text};
`;

const PageHeader = styled.header`
  margin-bottom: ${(props) => props.theme.spacing.xl};
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
  margin-bottom: ${(props) => props.theme.spacing.md};
  position: relative;
  display: inline-block;

  &::after {
    content: "";
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background-color: ${(props) => props.theme.colors.accent};
    border-radius: ${(props) => props.theme.borderRadius.round};
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${(props) => props.theme.colors.textLight};
  max-width: 600px;
  margin: 0 auto;
`;

const SearchPanel = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.large};
  box-shadow: ${(props) => props.theme.shadows.medium};
  padding: ${(props) => props.theme.spacing.lg};
  margin-bottom: ${(props) => props.theme.spacing.xl};
  animation: ${fadeIn} 0.5s ease;
`;

const SearchForm = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.md};
  justify-content: center;
  max-width: 900px;
  margin: 0 auto;
`;

const InputGroup = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => props.theme.colors.textLight};
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  font-size: 1rem;
  background-color: white;
  transition: ${(props) => props.theme.transitions.default};
  color: ${(props) => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.theme.colors.primary}25;
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.textLight};
  }
`;

const ResultsContainer = styled.div`
  margin-top: ${(props) => props.theme.spacing.xl};
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const ResultsCount = styled.div`
  font-size: 1.1rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.text};

  span {
    font-weight: 700;
    color: ${(props) => props.theme.colors.primary};
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${(props) => props.theme.spacing.xl};
  animation: ${fadeIn} 0.6s ease;
`;

const Card = styled.div`
  background-color: ${(props) => props.theme.colors.surface};
  border-radius: ${(props) => props.theme.borderRadius.large};
  box-shadow: ${(props) => props.theme.shadows.small};
  overflow: hidden;
  transition: ${(props) => props.theme.transitions.default};
  cursor: pointer;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 6px;
    height: 100%;
    background-color: ${(props) =>
      props.borderColor || props.theme.colors.primary};
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: ${(props) => props.theme.shadows.hover};
  }
`;

const CardHeader = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
  border-bottom: 1px solid ${(props) => props.theme.colors.borderLight};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PatientName = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardArrow = styled.div`
  color: ${(props) => props.theme.colors.textLight};
  transition: ${(props) => props.theme.transitions.default};

  ${Card}:hover & {
    color: ${(props) => props.theme.colors.primary};
    transform: translateX(4px);
  }
`;

const CardBody = styled.div`
  padding: ${(props) => props.theme.spacing.lg};
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: ${(props) => props.theme.borderRadius.round};
  background-color: ${(props) => props.color || props.theme.colors.primary}15;
  color: ${(props) => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${(props) => props.theme.spacing.sm};
  flex-shrink: 0;
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  color: ${(props) => props.theme.colors.textLight};
  margin-right: ${(props) => props.theme.spacing.xs};
`;

const InfoValue = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.text};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xxl} 0;
  color: ${(props) => props.theme.colors.textLight};
  animation: ${fadeIn} 0.5s ease;
`;

const EmptyStateText = styled.p`
  font-size: 1.1rem;
  margin-top: ${(props) => props.theme.spacing.md};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${(props) => props.theme.spacing.xxl} 0;
  animation: ${fadeIn} 0.5s ease;
`;

const LoadingDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: ${(props) => props.theme.borderRadius.round};
  background-color: ${(props) => props.theme.colors.primary};
  margin: 0 ${(props) => props.theme.spacing.xs};
  animation: ${pulse} 1.5s infinite ease-in-out;
  animation-delay: ${(props) => props.delay || "0s"};
`;

const ErrorMessage = styled.div`
  background-color: ${(props) => props.theme.colors.error}15;
  color: ${(props) => props.theme.colors.error};
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.borderRadius.medium};
  margin-top: ${(props) => props.theme.spacing.lg};
  text-align: center;
  animation: ${fadeIn} 0.5s ease;
`;

const OthersView = () => {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  const getCurrentDate = () => new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(getCurrentDate());
  const [toDate, setToDate] = useState(getCurrentDate());

  const navigate = useNavigate();

  useEffect(() => {
    fetchPatientAssessments();
  }, []);

  const fetchPatientAssessments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${Milestonebaseurl}all-patient/`);
      console.log("API Response:", response.data); // Debugging

      if (Array.isArray(response.data)) {
        const currentDate = getCurrentDate();
        const filteredData = response.data.filter(
          (assessment) => assessment.date && assessment.date === currentDate
        );

        setAssessments(response.data);
        setFilteredAssessments(filteredData); // Set filtered data initially
      } else {
        setError("Invalid response format");
      }
    } catch (err) {
      setError("Error fetching data. Please try again.");
    }
    setLoading(false);
  };

  const filterByDateRange = (data) => {
    if (!fromDate || !toDate) return data;

    const fromDateObj = new Date(fromDate);
    const toDateObj = new Date(toDate);

    return data.filter((assessment) => {
      if (!assessment.date) return false; // Exclude if date is missing
      const assessmentDateObj = new Date(assessment.date);
      return assessmentDateObj >= fromDateObj && assessmentDateObj <= toDateObj;
    });
  };

  const handleSearch = (e) => {
    const value = e?.target?.value || searchQuery;
    setSearchQuery(value);

    const dateFiltered = filterByDateRange(assessments);

    const searchFiltered = value
      ? dateFiltered.filter(
          (assessment) =>
            (assessment.name_of_child || "")
              .toLowerCase()
              .includes(value.toLowerCase()) ||
            (assessment.registration_number || "")
              .toLowerCase()
              .includes(value.toLowerCase()) ||
            (assessment.father_phone_number || "")
              .toLowerCase()
              .includes(value.toLowerCase()) ||
            (assessment.mother_phone_number || "")
              .toLowerCase()
              .includes(value.toLowerCase())
        )
      : dateFiltered;

    setFilteredAssessments(searchFiltered);
  };

  useEffect(() => {
    handleSearch();
  }, [fromDate, toDate, searchQuery]);

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <PageHeader>
          <PageTitle>Patient List for Others Billing</PageTitle>
          <PageSubtitle>
            Search and manage patient assessments for others billing
          </PageSubtitle>
        </PageHeader>

        <SearchPanel>
          <SearchForm>
            <InputGroup>
              <InputIcon>
                <Calendar size={18} />
              </InputIcon>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                aria-label="From Date"
              />
            </InputGroup>

            <InputGroup>
              <InputIcon>
                <Calendar size={18} />
              </InputIcon>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                aria-label="To Date"
              />
            </InputGroup>

            <InputGroup>
              <Input
                type="text"
                placeholder="Search by name, registration number, or phone"
                value={searchQuery}
                onChange={handleSearch}
                aria-label="Search"
              />
            </InputGroup>
          </SearchForm>
        </SearchPanel>

        {loading ? (
          <LoadingContainer>
            <LoadingDot delay="0s" />
            <LoadingDot delay="0.2s" />
            <LoadingDot delay="0.4s" />
          </LoadingContainer>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : (
          <ResultsContainer>
            {filteredAssessments.length > 0 ? (
              <>
                <ResultsHeader>
                  <ResultsCount>
                    Found <span>{filteredAssessments.length}</span> patient
                    {filteredAssessments.length !== 1 ? "s" : ""}
                  </ResultsCount>
                </ResultsHeader>

                <CardGrid>
                  {filteredAssessments.map((assessment, index) => (
                    <Card
                      key={index}
                      onClick={() =>
                        navigate("/OthersBilling", { state: { assessment } })
                      }
                    >
                      <CardHeader>
                        <PatientName>
                          {assessment.name_of_child || "Unknown Patient"}
                        </PatientName>
                        <CardArrow>
                          <ChevronRight size={20} />
                        </CardArrow>
                      </CardHeader>

                      <CardBody>
                        <PatientInfo>
                          <InfoIcon color={theme.colors.info}>
                            <Clock size={16} />
                          </InfoIcon>
                          <InfoLabel>Age:</InfoLabel>
                          <InfoValue>
                            {assessment.age
                              ? `${assessment.age.year}y ${assessment.age.months}m ${assessment.age.days}d`
                              : "N/A"}
                          </InfoValue>
                        </PatientInfo>

                        <PatientInfo>
                          <InfoIcon color={theme.colors.success}>
                            <User size={16} />
                          </InfoIcon>
                          <InfoLabel>Sex:</InfoLabel>
                          <InfoValue>{assessment.sex || "N/A"}</InfoValue>
                        </PatientInfo>

                        <PatientInfo>
                          <InfoIcon color={theme.colors.warning}>
                            <Phone size={16} />
                          </InfoIcon>
                          <InfoLabel>Father Phone:</InfoLabel>
                          <InfoValue>
                            {assessment.father_phone_number || "N/A"}
                          </InfoValue>
                        </PatientInfo>

                        <PatientInfo>
                          <InfoIcon color={theme.colors.warning}>
                            <Phone size={16} />
                          </InfoIcon>
                          <InfoLabel>Mother Phone:</InfoLabel>
                          <InfoValue>
                            {assessment.mother_phone_number || "N/A"}
                          </InfoValue>
                        </PatientInfo>
                        <PatientInfo>
                          <InfoIcon color={theme.colors.warning}>
                            <Phone size={16} />
                          </InfoIcon>
                          <InfoLabel>E-Mail ID:</InfoLabel>
                          <InfoValue>{assessment.mail_id || "N/A"}</InfoValue>
                        </PatientInfo>
                      </CardBody>
                    </Card>
                  ))}
                </CardGrid>
              </>
            ) : (
              <EmptyState>
                <Calendar size={48} color={theme.colors.textLight} />
                <EmptyStateText>
                  No patient assessments found for the selected date range.
                </EmptyStateText>
              </EmptyState>
            )}
          </ResultsContainer>
        )}
      </PageContainer>
    </ThemeProvider>
  );
};

export default OthersView;
