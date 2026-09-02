import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import apiRequest from "./apiRequest";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  font-family: "Segoe UI", sans-serif;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #406147;
  margin: 0;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SearchInput = styled.input`
  padding: 8px 14px;
  font-size: 0.95rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  width: 280px;
  outline: none;
  &:focus {
    border-color: #406147;
    box-shadow: 0 0 0 2px rgba(64, 97, 71, 0.2);
  }
`;

const ClearButton = styled.button`
  padding: 8px 12px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  &:hover {
    background-color: #5a6268;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  background-color: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  th {
    background-color: #406147;
    color: white;
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    font-size: 0.9rem;
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid #e9ecef;
    font-size: 0.95rem;
  }

  tbody tr:hover {
    background-color: #f8f9fa;
  }
`;

const ActionButton = styled.button`
  background-color: #406147;
  color: white;
  padding: 8px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #334d38;
  }
`;

const LoadingMessage = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  text-align: center;
  padding: 40px 0;
`;

const FetchCBCL = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest(`${Milestonebaseurl}all-patient-filterless/`, "GET");
        if (response && response.success) {
          setPatients(response.data || []);
        } else {
          setError(response?.error || "Error fetching patient data");
        }
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Failed to load patient list from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [Milestonebaseurl]);

  const handleNavigateToTasks = (patient) => {
    navigate("/CBCLforGirls6To18y", { state: { patient } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, "dd/MM/yyyy");
  };

  const formatAge = (age) => {
    if (!age) return "N/A";
    let parsed = age;
    if (typeof age === "string") {
      try {
        parsed = JSON.parse(age.replace(/'/g, '"'));
      } catch (e) {
        return age;
      }
    }
    if (typeof parsed !== "object" || parsed === null) return "N/A";

    const years = parsed.year ?? parsed.years ?? 0;
    const months = parsed.months ?? 0;
    const days = parsed.days ?? 0;

    return `${years} ${years === 1 ? "Year" : "Years"}, ${months} ${months === 1 ? "Month" : "Months"}, ${days} ${days === 1 ? "Day" : "Days"}`;
  };

  // Filter patients by name or registration number
  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase().trim();
    const name = (patient.name_of_child || patient.patient_name || "").toLowerCase();
    const regNo = (patient.registration_number || "").toLowerCase();
    return name.includes(term) || regNo.includes(term);
  });

  return (
    <Container>
      <HeaderSection>
        <Title>CBCL Patient Assessment Selection</Title>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search by Name or Reg No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ClearButton onClick={() => setSearchTerm("")}>Clear</ClearButton>
          )}
        </SearchContainer>
      </HeaderSection>

      {loading ? (
        <LoadingMessage>Loading patient records...</LoadingMessage>
      ) : error ? (
        <p style={{ color: "#c62828", textAlign: "center" }}>{error}</p>
      ) : filteredPatients.length === 0 ? (
        <p style={{ textAlign: "center", color: "#6c757d", padding: "20px" }}>
          No patient records found.
        </p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Registration Number</th>
              <th>Name of Child</th>
              <th>Date</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient, index) => (
              <tr key={patient.id || patient.registration_number || index}>
                <td style={{ fontWeight: "bold" }}>
                  {patient.registration_number || "N/A"}
                </td>
                <td>{patient.name_of_child || patient.patient_name || "N/A"}</td>
                <td>{formatDate(patient.date)}</td>
                <td>{formatAge(patient.age)}</td>
                <td>{patient.sex || patient.gender || "N/A"}</td>
                <td>
                  <ActionButton onClick={() => handleNavigateToTasks(patient)}>
                    Go to Assessment
                  </ActionButton>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default FetchCBCL;
