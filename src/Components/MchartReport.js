import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import apiRequest from "./apiRequest";

const Container = styled.div`
  max-width: 950px;
  margin: 30px auto;
  padding: 40px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #334155;

  @media print {
    margin: 0;
    padding: 0;
    box-shadow: none;
    max-width: 100%;
  }
`;

const Header = styled.div`
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 24px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media print {
    border-bottom: 1px solid #cbd5e1;
    margin-bottom: 20px;
    padding-bottom: 15px;
  }
`;

const TitleArea = styled.div`
  h1 {
    font-size: 30px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 6px 0;
  }
  p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
    font-weight: 500;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;

  @media print {
    display: none;
  }
`;

const ActionButton = styled.button`
  background: #406147;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #2f4935;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 97, 71, 0.25);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled(ActionButton)`
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
    box-shadow: none;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 35px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  span.label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    color: #64748b;
    font-weight: 700;
  }

  span.value {
    font-size: 16px;
    color: #0f172a;
    font-weight: 600;
  }
`;

const SummarySection = styled.div`
  display: flex;
  align-items: center;
  gap: 30px;
  background: #f8fafc;
  border-radius: 16px;
  padding: 24px 30px;
  margin-bottom: 40px;
  border: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const ScoreBadge = styled.div`
  min-width: 130px;
  height: 130px;
  border-radius: 50%;
  background: conic-gradient(
    #406147 ${(props) => (props.score / 20) * 360}deg,
    #e2e8f0 ${(props) => (props.score / 20) * 360}deg
  );
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  &::before {
    content: '';
    position: absolute;
    width: 108px;
    height: 108px;
    background: #ffffff;
    border-radius: 50%;
  }

  .score-text {
    position: relative;
    z-index: 1;
    text-align: center;
    
    .number {
      font-size: 34px;
      font-weight: 800;
      color: #1e293b;
      line-height: 1;
    }
    .total {
      font-size: 11px;
      color: #64748b;
      font-weight: 700;
      margin-top: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
`;

const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

const RiskBadge = styled.span`
  display: inline-block;
  padding: 6px 16px;
  border-radius: 30px;
  font-size: 13px;
  font-weight: 700;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  
  ${(props) => {
    switch (props.risk?.toLowerCase()) {
      case 'low risk':
        return `
          background-color: #ecfdf5;
          color: #047857;
          border: 1px solid #a7f3d0;
        `;
      case 'medium risk':
        return `
          background-color: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
        `;
      case 'high risk':
      default:
        return `
          background-color: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fca5a5;
        `;
    }
  }}
`;

const ExplanationText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: #475569;
  margin: 0;

  strong {
    color: #0f172a;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 40px 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #f1f5f9;

  @media print {
    margin-top: 30px;
  }
`;

const TableContainer = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
  background: #ffffff;

  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    font-size: 14px;
  }

  th {
    background: #f8fafc;
    color: #475569;
    font-weight: 600;
    padding: 16px 20px;
    border-bottom: 1px solid #e2e8f0;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.7px;
  }

  td {
    padding: 16px 20px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    vertical-align: middle;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: #f8fafc;
  }

  @media (max-width: 600px) {
    overflow-x: auto;
  }
`;

const AnswerBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${(props) =>
    props.type?.toLowerCase() === 'pass'
      ? `
        background-color: #ecfdf5;
        color: #059669;
        border: 1px solid #d1fae5;
      `
      : `
        background-color: #fef2f2;
        color: #dc2626;
        border: 1px solid #fee2e2;
      `}
`;

const QuestionTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const QuestionMainText = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.5;
`;

const DetailsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 13px;
  color: #64748b;

  .detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 10px;
  background: #f8fafc;
  padding: 35px;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;

  .input-group {
    display: flex;
    gap: 12px;

    @media (max-width: 600px) {
      flex-direction: column;
    }
  }

  input {
    flex: 1;
    padding: 14px 20px;
    border: 1.5px solid #cbd5e1;
    border-radius: 10px;
    font-size: 16px;
    outline: none;
    transition: all 0.2s ease;

    &:focus {
      border-color: #406147;
      box-shadow: 0 0 0 4px rgba(64, 97, 71, 0.12);
    }
  }
`;

const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 24px;

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid #406147;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  p {
    font-size: 16px;
    color: #64748b;
    font-weight: 600;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 40px 20px;
  background: #fff5f5;
  border-radius: 16px;
  border: 1px solid #fee2e2;

  .error-message {
    font-size: 16px;
    color: #c53030;
    font-weight: 600;
    text-align: center;
    margin: 0;
  }
`;

const MChartReport = ({ registration_number: propRegNo }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const registration_number =
    propRegNo || location.state?.registration_number || queryParams.get("registration_number") || queryParams.get("reg_no");

  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchRegNo, setSearchRegNo] = useState("");
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  useEffect(() => {
    if (!registration_number) {
      return;
    }

    const fetchMchatReport = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiRequest(
          `${Milestonebaseurl}get-mchat/${encodeURIComponent(registration_number)}/`,
          "GET"
        );
        if (response && response.success) {
          setReportData(response.data);
        } else {
          setError(response?.error || "Failed to fetch the M-CHAT-R report.");
        }
      } catch (err) {
        setError("Failed to fetch the M-CHAT-R report. Please ensure the registration number is correct.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMchatReport();
  }, [registration_number, Milestonebaseurl]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchRegNo.trim()) {
      const queryParams = new URLSearchParams(location.search);
      queryParams.set("registration_number", searchRegNo.trim());
      const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
      window.location.href = newUrl;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetSearch = () => {
    setError("");
    setReportData(null);
    window.location.href = window.location.pathname;
  };

  // 1. Missing Registration Number View
  if (!registration_number) {
    return (
      <Container>
        <Header>
          <TitleArea>
            <h1>M-CHAT-R Report Search</h1>
            <p>Enter a patient's registration number to view their detailed diagnostic screener report</p>
          </TitleArea>
        </Header>
        <SearchForm onSubmit={handleSearchSubmit}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter Registration Number (e.g., MDC/076/2025)"
              value={searchRegNo}
              onChange={(e) => setSearchRegNo(e.target.value)}
              required
            />
            <ActionButton type="submit">View Report</ActionButton>
          </div>
        </SearchForm>
      </Container>
    );
  }

  // 2. Loading State View
  if (loading) {
    return (
      <Container>
        <LoadingWrapper>
          <div className="spinner"></div>
          <p>Fetching M-CHAT-R report data...</p>
        </LoadingWrapper>
      </Container>
    );
  }

  // 3. Error State View
  if (error) {
    return (
      <Container>
        <Header>
          <TitleArea>
            <h1>M-CHAT-R Report Error</h1>
            <p>Something went wrong while retrieving the report for <strong>{registration_number}</strong></p>
          </TitleArea>
        </Header>
        <ErrorWrapper>
          <p className="error-message">{error}</p>
          <ActionButton onClick={handleResetSearch}>Go to Search</ActionButton>
        </ErrorWrapper>
      </Container>
    );
  }

  // 4. Report Data Not Found View (Fallback)
  if (!reportData) {
    return (
      <Container>
        <Header>
          <TitleArea>
            <h1>M-CHAT-R Report Error</h1>
            <p>No report data returned for <strong>{registration_number}</strong></p>
          </TitleArea>
        </Header>
        <ErrorWrapper>
          <p className="error-message">No records found for this registration number.</p>
          <ActionButton onClick={handleResetSearch}>Back to Search</ActionButton>
        </ErrorWrapper>
      </Container>
    );
  }

  const { patient_name, age, sex, score, riskLevel, question } = reportData;

  // Robustly parse the age field (it could be an object, a JSON string, or a plain string)
  let ageDisplay = "N/A";
  if (age) {
    if (typeof age === 'object') {
      ageDisplay = `${age.year ?? 0}y ${age.months ?? 0}m ${age.days ?? 0}d`;
    } else if (typeof age === 'string') {
      try {
        const parsedAge = JSON.parse(age);
        if (parsedAge && typeof parsedAge === 'object') {
          ageDisplay = `${parsedAge.year ?? 0}y ${parsedAge.months ?? 0}m ${parsedAge.days ?? 0}d`;
        } else {
          ageDisplay = age;
        }
      } catch (e) {
        ageDisplay = age;
      }
    }
  }

  // Robustly parse the questions list (it could be an array or a JSON string)
  let questionsList = [];
  if (question) {
    if (Array.isArray(question)) {
      questionsList = question;
    } else if (typeof question === 'string') {
      try {
        const parsedQuestions = JSON.parse(question);
        if (Array.isArray(parsedQuestions)) {
          questionsList = parsedQuestions;
        }
      } catch (e) {
        console.error("Failed to parse question JSON string in MChartReport:", e);
      }
    }
  }

  const formattedDate = reportData.created_date 
    ? new Date(reportData.created_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : "N/A";

  return (
    <Container>
      <Header>
        <TitleArea>
          <h1>M-CHAT-R™ Report</h1>
          <p>Modified Checklist for Autism in Toddlers, Revised</p>
        </TitleArea>
        <ActionButtons>
          <SecondaryButton onClick={handleResetSearch}>
            🔍 Search Another
          </SecondaryButton>
          <ActionButton onClick={handlePrint}>
            🖨️ Print Report
          </ActionButton>
        </ActionButtons>
      </Header>

      <InfoGrid>
        <InfoCard>
          <span className="label">Patient Name</span>
          <span className="value">{patient_name || "N/A"}</span>
        </InfoCard>
        <InfoCard>
          <span className="label">Registration Number</span>
          <span className="value">{registration_number}</span>
        </InfoCard>
        <InfoCard>
          <span className="label">Age</span>
          <span className="value">{ageDisplay}</span>
        </InfoCard>
        <InfoCard>
          <span className="label">Gender</span>
          <span className="value" style={{ textTransform: 'capitalize' }}>
            {sex || "N/A"}
          </span>
        </InfoCard>
        <InfoCard>
          <span className="label">Assessment Date</span>
          <span className="value">{formattedDate}</span>
        </InfoCard>
      </InfoGrid>

      <SummarySection>
        <ScoreBadge score={score}>
          <div className="score-text">
            <div className="number">{score ?? 0}</div>
            <div className="total">Score</div>
          </div>
        </ScoreBadge>
        <SummaryContent>
          <RiskBadge risk={riskLevel}>{riskLevel || "Unknown Risk"}</RiskBadge>
          <ExplanationText>
            On M-CHAT-R, the child scored <strong>{score ?? 0}</strong> out of 20 and is determined
            to be at <strong>{riskLevel || "Unknown Risk"}</strong> for Autism. 
            <br />
            <small style={{ display: 'block', marginTop: '6px', color: '#64748b' }}>
              * Note: The M-CHAT-R is a screening instrument, not a diagnostic test. High scores indicate 
              the child should be referred for professional evaluation.
            </small>
          </ExplanationText>
        </SummaryContent>
      </SummarySection>

      {questionsList && questionsList.length > 0 && (
        <>
          <SectionTitle>Screener Response Details</SectionTitle>
          <TableContainer>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Q. No.</th>
                  <th>Question</th>
                </tr>
              </thead>
              <tbody>
                {questionsList.map((q) => (
                  <tr key={q.question_no}>
                    <td style={{ fontWeight: 'bold', verticalAlign: 'top', paddingTop: '16px' }}>
                      {q.question_no}
                    </td>
                    <td>
                      <QuestionTextContainer>
                        <QuestionMainText>{q.question_text}</QuestionMainText>
                        <DetailsRow>
                          <div className="detail-item">
                            <strong>Answer:</strong>
                            <AnswerBadge type={q.answer}>{q.answer}</AnswerBadge>
                          </div>
                          <div className="detail-item">
                            <strong>Score:</strong>
                            <span style={{ fontWeight: '700', color: q.score > 0 ? '#10b981' : '#64748b' }}>
                              {q.score}
                            </span>
                          </div>
                        </DetailsRow>
                      </QuestionTextContainer>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableContainer>
        </>
      )}
    </Container>
  );
};

export default MChartReport;
