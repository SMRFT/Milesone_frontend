import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Calendar, Filter, RefreshCw, BarChart2, CheckCircle2, Clock, Users, UserCheck, ArrowRight, X, Download, Printer } from "lucide-react";
import { toast } from "react-toastify";
import apiRequest from "./apiRequest";

const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;

const tokens = {
  ink: "#17261F",
  inkSoft: "#5E6F65",
  inkFaint: "#94A399",
  paper: "#F7F2E7",
  paperRaised: "#FFFFFF",
  line: "#E7DFC9",
  lineSoft: "#EFE9D8",
  pine: "#1F5C46",
  pineDeep: "#123529",
  pineSoft: "#E4EEE7",
  marigold: "#C6862F",
  marigoldSoft: "#F6E8D2",
  rose: "#B24B42",
  roseSoft: "#F5E2DE",
  sage: "#3F7D55",
  sageSoft: "#E4EEE5",
  radius: "18px",
  radiusSm: "10px",
  shadow: "0 1px 2px rgba(18,53,41,0.04), 0 10px 28px -14px rgba(18,53,41,0.14)",
  shadowLift: "0 6px 14px rgba(18,53,41,0.07), 0 26px 46px -20px rgba(18,53,41,0.26)",
  fontDisplay: "'Fraunces', 'Georgia', serif",
  fontBody: "'Inter', 'Segoe UI', sans-serif",
};

const PageWrap = styled.div`
  font-family: ${tokens.fontBody};
  color: ${tokens.ink};
  background: ${tokens.paper};
  min-height: 100vh;
  padding: 28px 32px 60px;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
`;

const TitleBlock = styled.div``;

const Title = styled.h1`
  font-family: ${tokens.fontDisplay};
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  color: ${tokens.pineDeep};
`;

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13.5px;
  color: ${tokens.inkSoft};
`;

const FilterCard = styled.div`
  background: ${tokens.paperRaised};
  border-radius: ${tokens.radius};
  border: 1px solid ${tokens.line};
  box-shadow: ${tokens.shadow};
  padding: 20px;
  margin-bottom: 28px;
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 180px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${tokens.inkSoft};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DateInput = styled.input`
  font-family: ${tokens.fontBody};
  font-size: 14px;
  padding: 10px 14px;
  border-radius: ${tokens.radiusSm};
  border: 1px solid ${tokens.line};
  background: ${tokens.paper};
  color: ${tokens.ink};
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${tokens.pine};
    background: ${tokens.paperRaised};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  font-family: ${tokens.fontBody};
  font-weight: 600;
  font-size: 13.5px;
  padding: 10px 20px;
  border-radius: ${tokens.radiusSm};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &.primary {
    background: ${tokens.pine};
    color: white;
    &:hover {
      background: ${tokens.pineDeep};
    }
  }

  &.secondary {
    background: ${tokens.lineSoft};
    color: ${tokens.ink};
    &:hover {
      background: ${tokens.line};
    }
  }

  &.danger {
    background: ${tokens.rose};
    color: white;
    &:hover {
      background: #903c35;
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 28px;
`;

const SectionCard = styled.div`
  background: ${tokens.paperRaised};
  border-radius: ${tokens.radius};
  border: 1px solid ${tokens.line};
  box-shadow: ${tokens.shadow};
  padding: 24px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${tokens.shadowLift};
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${tokens.lineSoft};
  padding-bottom: 16px;
  margin-bottom: 20px;
`;

const SectionTitle = styled.h2`
  font-family: ${tokens.fontDisplay};
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: ${tokens.pineDeep};
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TotalBadge = styled.div`
  background: ${props => props.colorSoft || tokens.pineSoft};
  color: ${props => props.color || tokens.pineDeep};
  font-weight: 700;
  font-size: 18px;
  padding: 6px 14px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const MetricList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MetricRow = styled.div`
  background: ${tokens.paper};
  border-radius: ${tokens.radiusSm};
  padding: 14px 18px;
  border: 1px solid ${tokens.lineSoft};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${tokens.paperRaised};
    border-color: ${tokens.pine};
    transform: translateX(4px);
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const MetricLabel = styled.div`
  font-size: 13.5px;
  font-weight: 600;
  color: ${tokens.inkSoft};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MetricValue = styled.div`
  font-family: ${tokens.fontDisplay};
  font-size: 22px;
  font-weight: 600;
  color: ${tokens.ink};
`;

const ProgressBarContainer = styled.div`
  height: 6px;
  background: ${tokens.lineSoft};
  border-radius: 99px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: ${props => props.color || tokens.pine};
  width: ${props => props.percent || "0%"};
  border-radius: 99px;
`;

const ConversionRateCard = styled.div`
  background: linear-gradient(135deg, ${tokens.pineDeep} 0%, ${tokens.pine} 100%);
  color: white;
  border-radius: ${tokens.radius};
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  box-shadow: ${tokens.shadowLift};
`;

const RateText = styled.div`
  flex: 1;
`;

const RateTitle = styled.h3`
  font-family: ${tokens.fontDisplay};
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 6px 0;
`;

const RateDesc = styled.p`
  margin: 0;
  font-size: 13px;
  opacity: 0.85;
`;

const RateCircle = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 5px solid rgba(255, 255, 255, 0.2);
  border-top-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  font-family: ${tokens.fontDisplay};
`;

const LoaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  color: ${tokens.inkSoft};
  gap: 12px;
`;

/* ----------------------------------------------------------------------
 * Modal Styled Components
 * -------------------------------------------------------------------- */
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(23, 38, 31, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${tokens.paperRaised};
  border-radius: ${tokens.radius};
  border: 1px solid ${tokens.line};
  box-shadow: ${tokens.shadowLift};
  width: 100%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const ModalHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid ${tokens.lineSoft};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${tokens.paper};
`;

const ModalTitle = styled.h3`
  font-family: ${tokens.fontDisplay};
  font-size: 22px;
  font-weight: 600;
  color: ${tokens.pineDeep};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${tokens.inkSoft};
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: ${tokens.lineSoft};
    color: ${tokens.ink};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border: 1px solid ${tokens.lineSoft};
  border-radius: ${tokens.radiusSm};
  background: ${tokens.paperRaised};
`;

const ReportTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  text-align: left;

  th, td {
    padding: 12px 16px;
    border-bottom: 1px solid ${tokens.lineSoft};
  }

  th {
    background: ${tokens.paper};
    color: ${tokens.pineDeep};
    font-weight: 700;
  }

  tr:last-child td {
    border-bottom: none;
  }

  tr:hover td {
    background: ${tokens.pineSoft}33;
  }
`;

const ModalFooter = styled.div`
  padding: 16px 24px;
  border-top: 1px solid ${tokens.lineSoft};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  background: ${tokens.paper};
`;

const NoRecords = styled.div`
  text-align: center;
  padding: 40px;
  color: ${tokens.inkSoft};
  font-size: 15px;
`;

export default function AppointmentReport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalType, setModalType] = useState("enquiry");

  const fetchReport = async (start = "", end = "") => {
    try {
      setLoading(true);
      const url = `${Milestonebaseurl}appointment-report/?start_date=${start}&end_date=${end}`;
      const res = await apiRequest(url, "GET");
      if (res.success) {
        setData(res.data);
      } else {
        toast.error(res.error || "Failed to load report data.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while loading the report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleApplyFilter = () => {
    if (!fromDate || !toDate) {
      toast.warn("Please select both Start Date and End Date.");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      toast.warn("Start Date cannot be after End Date.");
      return;
    }
    fetchReport(fromDate, toDate);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    fetchReport("", "");
  };

  const getPercentage = (value, total) => {
    if (!total || !value) return "0%";
    const pct = (value / total) * 100;
    return `${pct.toFixed(0)}%`;
  };

  const calculateEnquiryConversion = () => {
    if (!data?.enquiry?.total) return 0;
    return ((data.enquiry.converted / data.enquiry.total) * 100).toFixed(0);
  };

  const handleCardClick = (title, listData, type) => {
    setModalTitle(title);
    setModalData(listData || []);
    setModalType(type);
    setShowModal(true);
  };

  // CSV Export Utility
  const handleExportCSV = () => {
    if (!modalData || modalData.length === 0) {
      toast.warn("No data available to export.");
      return;
    }

    let csvContent = "";
    
    if (modalType === "enquiry") {
      csvContent += "Child Name,Age,Mobile Number,Problem,Date\n";
      modalData.forEach((row) => {
        csvContent += `"${row.name_of_child || ""}","${row.age || ""}","${row.mobile_number || ""}","${(row.problem || "").replace(/"/g, '""')}","${row.date || ""}"\n`;
      });
    } else if (modalType === "appointment") {
      csvContent += "Child Name,Registration Number,Mobile Number,Date,Status\n";
      modalData.forEach((row) => {
        csvContent += `"${row.name_of_child || ""}","${row.registration_number || ""}","${row.mobile_number || ""}","${row.date || ""}","${row.status || ""}"\n`;
      });
    } else if (modalType === "registration") {
      csvContent += "Child Name,Registration Number,Gender,Mobile Number,Date\n";
      modalData.forEach((row) => {
        const ph = row.father_phone_number || row.mother_phone_number || "";
        csvContent += `"${row.name_of_child || ""}","${row.registration_number || ""}","${row.sex || ""}","${ph}","${row.date || ""}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${modalTitle.replace(/\s+/g, "_").toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Table Utility
  const handlePrintTable = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${modalTitle}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #17261F; }
            h2 { color: #123529; border-bottom: 2px solid #1F5C46; padding-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #E7DFC9; padding: 10px 12px; text-align: left; font-size: 13px; }
            th { background: #F7F2E7; color: #123529; }
          </style>
        </head>
        <body>
          <h2>${modalTitle}</h2>
          <table>
            <thead>
              ${modalType === "enquiry" ? `
                <tr>
                  <th>Child Name</th>
                  <th>Age</th>
                  <th>Mobile Number</th>
                  <th>Problem</th>
                  <th>Date</th>
                </tr>
              ` : modalType === "appointment" ? `
                <tr>
                  <th>Child Name</th>
                  <th>Registration Number</th>
                  <th>Mobile Number</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              ` : `
                <tr>
                  <th>Child Name</th>
                  <th>Registration Number</th>
                  <th>Gender</th>
                  <th>Mobile Number</th>
                  <th>Date</th>
                </tr>
              `}
            </thead>
            <tbody>
              ${modalData.map(row => {
                if (modalType === "enquiry") {
                  return `
                    <tr>
                      <td>${row.name_of_child || "—"}</td>
                      <td>${row.age || "—"}</td>
                      <td>${row.mobile_number || "—"}</td>
                      <td>${row.problem || "—"}</td>
                      <td>${row.date || "—"}</td>
                    </tr>
                  `;
                } else if (modalType === "appointment") {
                  return `
                    <tr>
                      <td>${row.name_of_child || "—"}</td>
                      <td>${row.registration_number || "—"}</td>
                      <td>${row.mobile_number || "—"}</td>
                      <td>${row.date || "—"}</td>
                      <td>${row.status || "—"}</td>
                    </tr>
                  `;
                } else {
                  const phone = row.father_phone_number || row.mother_phone_number || "—";
                  return `
                    <tr>
                      <td>${row.name_of_child || "—"}</td>
                      <td>${row.registration_number || "—"}</td>
                      <td>${row.sex || "—"}</td>
                      <td>${phone}</td>
                      <td>${row.date || "—"}</td>
                    </tr>
                  `;
                }
              }).join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <PageWrap>
      <HeaderRow>
        <TitleBlock>
          <Title>Appointment & Conversions Report</Title>
          <Subtitle>Analyze patient inquiries, booking workflows, and registered attendance conversions. Click any metric card for details.</Subtitle>
        </TitleBlock>
      </HeaderRow>

      <FilterCard>
        <InputGroup>
          <Label>Start Date</Label>
          <DateInput
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </InputGroup>
        <InputGroup>
          <Label>End Date</Label>
          <DateInput
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </InputGroup>
        <ButtonGroup>
          <Button className="primary" onClick={handleApplyFilter} disabled={loading}>
            <Filter size={16} /> Filter
          </Button>
          <Button className="secondary" onClick={handleReset} disabled={loading}>
            <RefreshCw size={16} /> Reset
          </Button>
        </ButtonGroup>
      </FilterCard>

      {loading && (
        <LoaderWrapper>
          <RefreshCw className="animate-spin" size={36} />
          <span>Generating conversion report...</span>
        </LoaderWrapper>
      )}

      {!loading && data && (
        <>
          <DashboardGrid>
            {/* 1. ENQUIRIES */}
            <SectionCard>
              <SectionHeader>
                <SectionTitle>
                  <Users size={20} color={tokens.pine} /> Enquiries
                </SectionTitle>
                <TotalBadge color={tokens.pineDeep} colorSoft={tokens.pineSoft}>
                  {data.enquiry.total} Total
                </TotalBadge>
              </SectionHeader>

              <MetricList>
                <MetricRow onClick={() => handleCardClick("Converted Enquiries", data.enquiry.converted_list, "enquiry")}>
                  <MetricHeader>
                    <MetricLabel>
                      <UserCheck size={16} color={tokens.sage} /> Converted to Appointment
                    </MetricLabel>
                    <MetricValue>{data.enquiry.converted}</MetricValue>
                  </MetricHeader>
                  <ProgressBarContainer>
                    <ProgressBarFill
                      color={tokens.sage}
                      percent={getPercentage(data.enquiry.converted, data.enquiry.total)}
                    />
                  </ProgressBarContainer>
                </MetricRow>

                <MetricRow onClick={() => handleCardClick("Pending Enquiries", data.enquiry.pending_list, "enquiry")}>
                  <MetricHeader>
                    <MetricLabel>
                      <Clock size={16} color={tokens.marigold} /> Pending Enquiries
                    </MetricLabel>
                    <MetricValue>{data.enquiry.pending}</MetricValue>
                  </MetricHeader>
                  <ProgressBarContainer>
                    <ProgressBarFill
                      color={tokens.marigold}
                      percent={getPercentage(data.enquiry.pending, data.enquiry.total)}
                    />
                  </ProgressBarContainer>
                </MetricRow>
              </MetricList>
            </SectionCard>

            {/* 2. APPOINTMENTS */}
            <SectionCard>
              <SectionHeader>
                <SectionTitle>
                  <Calendar size={20} color={tokens.marigold} /> Appointments
                </SectionTitle>
                <TotalBadge color={tokens.marigold} colorSoft={tokens.marigoldSoft}>
                  {data.appointment.total} Total
                </TotalBadge>
              </SectionHeader>

              <MetricList>
                <MetricRow onClick={() => handleCardClick("Direct Bookings", data.appointment.direct_list, "appointment")}>
                  <MetricHeader>
                    <MetricLabel>
                      <CheckCircle2 size={16} color={tokens.pine} /> Direct Bookings
                    </MetricLabel>
                    <MetricValue>{data.appointment.direct}</MetricValue>
                  </MetricHeader>
                  <ProgressBarContainer>
                    <ProgressBarFill
                      color={tokens.pine}
                      percent={getPercentage(data.appointment.direct, data.appointment.total)}
                    />
                  </ProgressBarContainer>
                </MetricRow>

                <MetricRow onClick={() => handleCardClick("Converted from Enquiry", data.appointment.convert_from_enquiry_list, "appointment")}>
                  <MetricHeader>
                    <MetricLabel>
                      <ArrowRight size={16} color={tokens.sage} /> Converted from Enquiry
                    </MetricLabel>
                    <MetricValue>{data.appointment.convert_from_enquiry}</MetricValue>
                  </MetricHeader>
                  <ProgressBarContainer>
                    <ProgressBarFill
                      color={tokens.sage}
                      percent={getPercentage(data.appointment.convert_from_enquiry, data.appointment.total)}
                    />
                  </ProgressBarContainer>
                </MetricRow>

                <MetricRow onClick={() => handleCardClick("Converted to Registration", data.appointment.convert_to_registration_list, "appointment")}>
                  <MetricHeader>
                    <MetricLabel>
                      <UserCheck size={16} color={tokens.pineDeep} /> Converted to Registration
                    </MetricLabel>
                    <MetricValue>{data.appointment.convert_to_registration}</MetricValue>
                  </MetricHeader>
                  <ProgressBarContainer>
                    <ProgressBarFill
                      color={tokens.pineDeep}
                      percent={getPercentage(data.appointment.convert_to_registration, data.appointment.total)}
                    />
                  </ProgressBarContainer>
                </MetricRow>

                <MetricRow onClick={() => handleCardClick("Pending Non-Registered", data.appointment.pending_non_registered_list, "appointment")}>
                  <MetricHeader>
                    <MetricLabel>
                      <Clock size={16} color={tokens.rose} /> Pending Non-Registered
                    </MetricLabel>
                    <MetricValue>{data.appointment.pending_non_registered}</MetricValue>
                  </MetricHeader>
                  <ProgressBarContainer>
                    <ProgressBarFill
                      color={tokens.rose}
                      percent={getPercentage(data.appointment.pending_non_registered, data.appointment.total)}
                    />
                  </ProgressBarContainer>
                </MetricRow>
              </MetricList>
            </SectionCard>

            {/* 3. REGISTRATIONS */}
            <SectionCard>
              <SectionHeader>
                <SectionTitle>
                  <BarChart2 size={20} color={tokens.rose} /> Registrations
                </SectionTitle>
                <TotalBadge color={tokens.rose} colorSoft={tokens.roseSoft}>
                  {data.registration.total} Total
                </TotalBadge>
              </SectionHeader>

              <MetricList>
                <MetricRow onClick={() => handleCardClick("Attendance Children", data.registration.attendance_list, "registration")}>
                  <MetricHeader>
                    <MetricLabel>
                      <CheckCircle2 size={16} color={tokens.pine} /> Attendance Child
                    </MetricLabel>
                    <MetricValue>{data.registration.attendance}</MetricValue>
                  </MetricHeader>
                  <ProgressBarContainer>
                    <ProgressBarFill
                      color={tokens.pine}
                      percent={getPercentage(data.registration.attendance, data.registration.total)}
                    />
                  </ProgressBarContainer>
                </MetricRow>

                <MetricRow onClick={() => handleCardClick("Non-Attendance Children", data.registration.non_attendance_list, "registration")}>
                  <MetricHeader>
                    <MetricLabel>
                      <Clock size={16} color={tokens.rose} /> Non-Attendance Child
                    </MetricLabel>
                    <MetricValue>{data.registration.non_attendance}</MetricValue>
                  </MetricHeader>
                  <ProgressBarContainer>
                    <ProgressBarFill
                      color={tokens.rose}
                      percent={getPercentage(data.registration.non_attendance, data.registration.total)}
                    />
                  </ProgressBarContainer>
                </MetricRow>
              </MetricList>
            </SectionCard>
          </DashboardGrid>

          {/* Conversion Banner */}
          <ConversionRateCard>
            <RateText>
              <RateTitle>Inquiry Conversion Performance</RateTitle>
              <RateDesc>
                Out of {data.enquiry.total} inquiries logged, {calculateEnquiryConversion()}% converted into actual therapy bookings. Keep driving conversions by addressing pending inquiries promptly.
              </RateDesc>
            </RateText>
            <RateCircle>{calculateEnquiryConversion()}%</RateCircle>
          </ConversionRateCard>
        </>
      )}

      {/* DETAIL VIEW MODAL */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{modalTitle} ({modalData.length})</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              {modalData.length === 0 ? (
                <NoRecords>No records found in this category.</NoRecords>
              ) : (
                <TableContainer>
                  <ReportTable>
                    <thead>
                      {modalType === "enquiry" ? (
                        <tr>
                          <th>Child Name</th>
                          <th>Age</th>
                          <th>Mobile Number</th>
                          <th>Problem</th>
                          <th>Date</th>
                        </tr>
                      ) : modalType === "appointment" ? (
                        <tr>
                          <th>Child Name</th>
                          <th>Registration Number</th>
                          <th>Mobile Number</th>
                          <th>Date</th>
                          <th>Status</th>
                        </tr>
                      ) : (
                        <tr>
                          <th>Child Name</th>
                          <th>Registration Number</th>
                          <th>Gender</th>
                          <th>Mobile Number</th>
                          <th>Date</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {modalData.map((row, idx) => {
                        if (modalType === "enquiry") {
                          return (
                            <tr key={idx}>
                              <td><strong>{row.name_of_child || "—"}</strong></td>
                              <td>{row.age || "—"}</td>
                              <td>{row.mobile_number || "—"}</td>
                              <td>{row.problem || "—"}</td>
                              <td>{row.date || "—"}</td>
                            </tr>
                          );
                        } else if (modalType === "appointment") {
                          return (
                            <tr key={idx}>
                              <td><strong>{row.name_of_child || "—"}</strong></td>
                              <td>{row.registration_number || "—"}</td>
                              <td>{row.mobile_number || "—"}</td>
                              <td>{row.date || "—"}</td>
                              <td>{row.status || "—"}</td>
                            </tr>
                          );
                        } else {
                          const phone = row.father_phone_number || row.mother_phone_number || "—";
                          return (
                            <tr key={idx}>
                              <td><strong>{row.name_of_child || "—"}</strong></td>
                              <td>{row.registration_number || "—"}</td>
                              <td>{row.sex || "—"}</td>
                              <td>{phone}</td>
                              <td>{row.date || "—"}</td>
                            </tr>
                          );
                        }
                      })}
                    </tbody>
                  </ReportTable>
                </TableContainer>
              )}
            </ModalBody>
            <ModalFooter>
              <Button className="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button className="primary" onClick={handleExportCSV} disabled={modalData.length === 0}>
                <Download size={16} /> Export CSV
              </Button>
              <Button className="primary" onClick={handlePrintTable} disabled={modalData.length === 0}>
                <Printer size={16} /> Print Table
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageWrap>
  );
}
