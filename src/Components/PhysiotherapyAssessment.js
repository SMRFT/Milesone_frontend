"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import styled from "styled-components"
import { Save, ArrowLeft } from "lucide-react"
import { ThemeProvider } from "styled-components"
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiRequest from "./apiRequest";

const theme = {
  colors: {
    primary: "#406147",
    secondary: "#3f37c9",
    accent: "#4895ef",
    success: "#4caf50",
    warning: "#ff9800",
    error: "#f44336",
    info: "#2196f3",
    background: "#f8f9fa",
    surface: "#ffffff",
    text: "#212529",
    textLight: "#6c757d",
    border: "#406147",
    borderLight: "#e9ecef",
    highlight: "#f0f7ff",
    hovercolor: "#7a9c78",
  },
  shadows: {
    small: "0 2px 5px rgba(0,0,0,0.1)",
  },
  borderRadius: {
    medium: "8px",
    small: "4px",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
}

const PageContainer = styled.div`
  background-color: ${theme.colors.background};
  padding: ${theme.spacing.md};
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
`

const FormSection = styled.div`
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  border-top: 4px solid ${(props) => props.color || theme.colors.primary};
  box-shadow: ${theme.shadows.small};
`

const SectionTitle = styled.h2`
  color: ${theme.colors.text};
  font-size: 1.5rem;
  margin: 0 0 ${theme.spacing.md} 0;
`

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
`

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: ${theme.spacing.xs};
  cursor: pointer;
`

const Checkbox = styled.input`
  margin-right: ${theme.spacing.sm};
  width: 18px;
  height: 18px;
  cursor: pointer;
`

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
`

const FormLabel = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.text};
  font-weight: 500;
  font-size: 0.875rem;
`

const FormInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  font-size: 0.95rem;
`

const TextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  resize: vertical;
  min-height: 80px;
  font-size: 0.95rem;
`

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.lg};
`

const RadioGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
  flex-wrap: wrap;
  margin-top: 4px;
`

const RadioLabel = styled.label`
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${theme.colors.borderLight};
  background-color: ${theme.colors.background};
  transition: all 0.2s ease-in-out;
  font-weight: 500;
  font-size: 0.9rem;
  user-select: none;
  
  &:hover {
    border-color: ${theme.colors.primary};
    background-color: ${theme.colors.highlight};
  }

  input {
    margin-right: 8px;
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: ${theme.colors.primary};
  }

  &:has(input:checked) {
    border-color: ${theme.colors.primary};
    background-color: ${theme.colors.highlight};
    color: ${theme.colors.primary};
    box-shadow: 0 2px 6px rgba(64, 97, 71, 0.15);
  }
`

const Button = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background-color: ${theme.colors.primary};
  color: ${theme.colors.surface};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-weight: 500;
  
  &:hover {
    background-color: ${theme.colors.hovercolor};
  }
`

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`

const table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: ${theme.spacing.sm};
    text-align: left;
    border-bottom: 1px solid ${theme.colors.borderLight};
  }
  
  th {
    background-color: ${theme.colors.background};
    font-weight: 600;
  }
  
  tbody tr:hover {
    background-color: ${theme.colors.highlight};
  }
`

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.small};
`

const PageTitle = styled.h1`
  color: ${theme.colors.primary};
  font-size: 2rem;
  margin: 0;
`

const FilterContainer = styled.div`
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.small};
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: ${theme.spacing.md};
  align-items: end;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const PatientCard = styled.div`
  background-color: ${theme.colors.surface};
  border: 2px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${theme.shadows.small};
  
  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transform: translateY(-2px);
  }
`

const PatientCardTitle = styled.h3`
  margin: 0 0 ${theme.spacing.sm} 0;
  color: ${theme.colors.primary};
  font-size: 1.1rem;
`

const PatientCardInfo = styled.p`
  margin: ${theme.spacing.xs} 0;
  color: ${theme.colors.text};
  font-size: 0.9rem;
  
  span {
    font-weight: 600;
  }
`

const PatientCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`

const NoDataMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};
  color: ${theme.colors.textLight};
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.medium};
`

const FilterLabel = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.xs};
  color: ${theme.colors.text};
  font-weight: 500;
  font-size: 0.875rem;
`

const FilterInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  font-size: 0.95rem;
`

const FilterButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  
  &:hover {
    background-color: ${theme.colors.hovercolor};
  }
`

const BackButton = styled(Button)`
  margin-bottom: ${theme.spacing.lg};
  background-color: ${theme.colors.textLight};
  
  &:hover {
    background-color: #5a6268;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 0.95rem;
`

export default function PhysiotherapyForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const editRecord = location.state?.editRecord
  const isEdit = !!editRecord

  const [patientList, setPatientList] = useState([])
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [showForm, setShowForm] = useState(false)
  const [showToneOptions, setShowToneOptions] = useState(false)
  const [showReflexesOptions, setShowReflexesOptions] = useState(false)

  const [formData, setFormData] = useState({
    id: "",
    registrationNumber: "",
    patientName: "",
    date: new Date().toISOString().split("T")[0],
    
    // All sections as JSON
    onObservation: {
      restingPosture: "",
      gait: "",
      deformity: "",
      appliances: "",
    },
    
    tone: {
      upperLimb: "",
      upperLimbInput: "",
      lowerLimb: "",
      lowerLimbInput: "",
      unableToAssess: "",
      shoulder: "",
      elbow: "",
      wrist: "",
      fingers: "",
      hip: "",
      knee: "",
      ankle: "",
      toeFingers: "",
    },
    
    motorSystem: {
      upperLimb: "",
      upperLimbInput: "",
      lowerLimb: "",
      lowerLimbInput: "",
    },
    
    clonus: {
      status: "",
      notes: "",
    },
    
    coordination: {
      upperLimb: "",
      upperLimbInput: "",
      lowerLimb: "",
      lowerLimbInput: "",
    },
    
    patternAndPosition: {
      pattern: "",
      headPosition: "",
      trunkPosition: "",
    },
    
    limbLength: {
      handRight: "",
      handLeft: "",
      legRight: "",
      legLeft: "",
    },
    
    balance: {
      sittingStatic: "",
      sittingDynamic: "",
      standingStatic: "",
      standingDynamic: "",
    },
    
    sensation: {
      lightTouch: "",
      pain: "",
      proprioception: "",
    },
    
    assessmentsUsed: {
      physiotherapyAssessment: "",
    },
    
    grossDevelopment: {
      crawling: "",
      crawlingNotes: "",
      rollOver: "",
      rollOverNotes: "",
      sitting: "",
      sittingUnableInput: "",
      activities: {
        walking: { status: "", notes: "" },
        running: { status: "", notes: "" },
        kicking: { status: "", notes: "" },
        throwing: { status: "", notes: "" },
        catching: { status: "", notes: "" },
        jumping: { status: "", notes: "" },
        stairsClimbing: { status: "", notes: "" },
      }
    },
    
    reflexes: {
      bicepsRight: "",
      bicepsLeft: "",
      tricepsRight: "",
      tricepsLeft: "",
      kneeJerkRight: "",
      kneeJerkLeft: "",
      ankleJerkRight: "",
      ankleJerkLeft: "",
      plantarRight: "",
      plantarLeft: "",
    },
    
    shortTermGoals: "",
    longTermGoals: "",
    recommendation: "",
    notes: "",
  })

  const parseJSON = (str) => {
    if (!str) return null
    if (typeof str === "object") return str
    try {
      return JSON.parse(str)
    } catch (e) {
      return null
    }
  }

  useEffect(() => {
    if (editRecord) {
      setFormData({
        id: editRecord.id || editRecord._id || "",
        registrationNumber: editRecord.registrationNumber || "",
        patientName: editRecord.patientName || "",
        date: editRecord.assessment_date ? new Date(editRecord.assessment_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        onObservation: parseJSON(editRecord.on_observation) || { restingPosture: "", gait: "", deformity: "", appliances: "" },
        tone: parseJSON(editRecord.tone) || {
          upperLimb: "", upperLimbInput: "", lowerLimb: "", lowerLimbInput: "", unableToAssess: "",
          shoulder: "", elbow: "", wrist: "", fingers: "", hip: "", knee: "", ankle: "", toeFingers: ""
        },
        motorSystem: parseJSON(editRecord.motor_system) || { upperLimb: "", upperLimbInput: "", lowerLimb: "", lowerLimbInput: "" },
        clonus: parseJSON(editRecord.clonus) || { status: "", notes: "" },
        coordination: parseJSON(editRecord.coordination) || { upperLimb: "", upperLimbInput: "", lowerLimb: "", lowerLimbInput: "" },
        patternAndPosition: parseJSON(editRecord.pattern_and_position) || { pattern: "", headPosition: "", trunkPosition: "" },
        limbLength: parseJSON(editRecord.limb_length_discrepancy) || { handRight: "", handLeft: "", legRight: "", legLeft: "" },
        balance: parseJSON(editRecord.balance) || { sittingStatic: "", sittingDynamic: "", standingStatic: "", standingDynamic: "" },
        sensation: parseJSON(editRecord.sensation) || { lightTouch: "", pain: "", proprioception: "" },
        assessmentsUsed: parseJSON(editRecord.assessments_used) || { physiotherapyAssessment: "" },
        grossDevelopment: parseJSON(editRecord.gross_development) || {
          crawling: "", crawlingNotes: "", rollOver: "", rollOverNotes: "", sitting: "", sittingUnableInput: "",
          activities: {
            walking: { status: "", notes: "" }, running: { status: "", notes: "" }, kicking: { status: "", notes: "" },
            throwing: { status: "", notes: "" }, catching: { status: "", notes: "" }, jumping: { status: "", notes: "" },
            stairsClimbing: { status: "", notes: "" }
          }
        },
        reflexes: parseJSON(editRecord.reflexes) || {
          bicepsRight: "", bicepsLeft: "", tricepsRight: "", tricepsLeft: "", kneeJerkRight: "", kneeJerkLeft: "",
          ankleJerkRight: "", ankleJerkLeft: "", plantarRight: "", plantarLeft: ""
        },
        shortTermGoals: editRecord.short_term_goals || "",
        longTermGoals: editRecord.long_term_goals || "",
        recommendation: editRecord.recommendation || "",
        notes: editRecord.notes || "",
      })
      setShowForm(true)
    }
  }, [editRecord])

  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL || ""

const fetchPatients = async () => {
  try {
    if (!startDate || !endDate) {
      toast.info("Please select both start and end dates")
      return
    }

    const formattedStartDate =
      typeof startDate === "string"
        ? startDate
        : startDate.toISOString().split("T")[0]

    const formattedEndDate =
      typeof endDate === "string"
        ? endDate
        : endDate.toISOString().split("T")[0]

    const url = `${Milestonebaseurl}get_pt_patients/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`

    const result = await apiRequest(url, "GET")

    if (result.success) {
      const data = result.data
      console.log("Full API Response:", data)

      let patients = []

      if (Array.isArray(data)) {
        patients = data
      } else if (data.result && Array.isArray(data.result)) {
        patients = data.result
      } else if (data.ptPatients && Array.isArray(data.ptPatients)) {
        patients = data.ptPatients
      } else if (data.ptPatients && Array.isArray(data.ptPatients)) {
        patients = data.ptPatients
      }

      console.log("Processed patients:", patients)
      setPatientList(patients)
    } else {
      console.error("Failed to fetch patients:", result.error)
      toast.error(result.error || "Failed to fetch patients")
      setPatientList([])
    }
  } catch (error) {
    console.error("Error fetching patients:", error)
    toast.error("Error fetching patient data")
    setPatientList([])
  }
}

useEffect(() => {
  if (startDate && endDate) {
    fetchPatients()
  }
}, [startDate, endDate])


  const handlePatientSelect = (patient) => {
    setFormData((prev) => ({
      ...prev,
      registrationNumber: patient.registration_number || patient.registrationNumber || "",
      patientName: patient.patient_name || patient.patientName || "",
      date: new Date().toISOString().split("T")[0],
    }))
    setShowForm(true)
  }

  const handleBackToList = () => {
    setShowForm(false)
    if (isEdit) {
      navigate("/PhysiotherapyAssessmentReport")
    }
  }

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

const handleSubmit = async () => {
  try {
    const payload = {
      registrationNumber: formData.registrationNumber,
      patientName: formData.patientName,
      assessment_date: formData.date,
      on_observation: formData.onObservation,
      tone: formData.tone,
      motor_system: formData.motorSystem,
      clonus: formData.clonus,
      coordination: formData.coordination,
      pattern_and_position: formData.patternAndPosition,
      limb_length_discrepancy: formData.limbLength,
      balance: formData.balance,
      sensation: formData.sensation,
      assessments_used: formData.assessmentsUsed,
      gross_development: formData.grossDevelopment,
      reflexes: formData.reflexes,
      short_term_goals: formData.shortTermGoals,
      long_term_goals: formData.longTermGoals,
      recommendation: formData.recommendation,
      notes: formData.notes,
    }

    if (isEdit) {
      payload.id = formData.id
    }

    const url = `${Milestonebaseurl}physio/`
    const method = isEdit ? "PUT" : "POST"

    const response = await apiRequest(url, method, payload)

    if (response.success) {
      toast.success(isEdit ? "Physiotherapy Assessment updated successfully!" : "Physiotherapy Assessment saved successfully!")

      setFormData({
        id: "",
        registrationNumber: "",
        patientName: "",
        date: new Date().toISOString().split("T")[0],
        onObservation: {
          restingPosture: "",
          gait: "",
          deformity: "",
          appliances: "",
        },
        tone: {
          upperLimb: "",
          upperLimbInput: "",
          lowerLimb: "",
          lowerLimbInput: "",
          unableToAssess: "",
          shoulder: "",
          elbow: "",
          wrist: "",
          fingers: "",
          hip: "",
          knee: "",
          ankle: "",
          toeFingers: "",
        },
        motorSystem: {
          upperLimb: "",
          upperLimbInput: "",
          lowerLimb: "",
          lowerLimbInput: "",
        },
        clonus: {
          status: "",
          notes: "",
        },
        coordination: {
          upperLimb: "",
          upperLimbInput: "",
          lowerLimb: "",
          lowerLimbInput: "",
        },
        patternAndPosition: {
          pattern: "",
          headPosition: "",
          trunkPosition: "",
        },
        limbLength: {
          handRight: "",
          handLeft: "",
          legRight: "",
          legLeft: "",
        },
        balance: {
          sittingStatic: "",
          sittingDynamic: "",
          standingStatic: "",
          standingDynamic: "",
        },
        sensation: {
          lightTouch: "",
          pain: "",
          proprioception: "",
        },
        assessmentsUsed: {
          physiotherapyAssessment: "",
        },
        grossDevelopment: {
          crawling: "",
          crawlingNotes: "",
          rollOver: "",
          rollOverNotes: "",
          sitting: "",
          sittingUnableInput: "",
          activities: {
            walking: { status: "", notes: "" },
            running: { status: "", notes: "" },
            kicking: { status: "", notes: "" },
            throwing: { status: "", notes: "" },
            catching: { status: "", notes: "" },
            jumping: { status: "", notes: "" },
            stairsClimbing: { status: "", notes: "" },
          }
        },
        reflexes: {
          bicepsRight: "",
          bicepsLeft: "",
          tricepsRight: "",
          tricepsLeft: "",
          kneeJerkRight: "",
          kneeJerkLeft: "",
          ankleJerkRight: "",
          ankleJerkLeft: "",
          plantarRight: "",
          plantarLeft: "",
        },
        shortTermGoals: "",
        longTermGoals: "",
        recommendation: "",
        notes: "",
      })

      setShowToneOptions(false)
      setShowReflexesOptions(false)
      setShowForm(false)
      if (isEdit) {
        navigate("/PhysiotherapyAssessmentReport")
      }
    } else {
      toast.error(response.error || "Assessment could not be saved")
    }
  } catch (error) {
    toast.error("Failed to save assessment")
    console.error(error)
  }
}


  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <PageHeader>
          <PageTitle>Physiotherapy Assessment System</PageTitle>
        </PageHeader>

        {!showForm ? (
          <>
            <FilterContainer>
              <div>
                <FilterLabel>Start Date</FilterLabel>
                <FilterInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <FilterLabel>End Date</FilterLabel>
                <FilterInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <FilterButton onClick={fetchPatients}>Search Patients</FilterButton>
            </FilterContainer>

            {patientList.length > 0 ? (
              <div>
                <h3 style={{ color: theme.colors.text }}>Found {patientList.length} Patient(s)</h3>
                <PatientCardsContainer>
                  {patientList.map((patient, index) => (
                    <PatientCard key={index} onClick={() => handlePatientSelect(patient)}>
                      <PatientCardTitle>
                        {patient.patient_name || patient.patientName || "N/A"}
                      </PatientCardTitle>
                      <PatientCardInfo>
                        <span>Reg. No:</span> {patient.registration_number || patient.registrationNumber || "N/A"}
                      </PatientCardInfo>
                      <PatientCardInfo>
                        <span>Date:</span>{" "}
                        {patient.date ? new Date(patient.date).toLocaleDateString() : "N/A"}
                      </PatientCardInfo>
                      <PatientCardInfo
                        style={{ marginTop: theme.spacing.md, fontSize: "0.8rem", color: theme.colors.textLight }}
                      >
                        Click to fill assessment form
                      </PatientCardInfo>
                    </PatientCard>
                  ))}
                </PatientCardsContainer>
              </div>
            ) : (
              <NoDataMessage>
                {startDate && endDate
                  ? "No patients found for the selected date range. Try adjusting the dates."
                  : "Select date range and click 'Search Patients' to begin"}
              </NoDataMessage>
            )}
          </>
        ) : (
          <>
            <BackButton onClick={handleBackToList}>
              <ArrowLeft size={18} />
              {isEdit ? "Back to Report" : "Back to Patient List"}
            </BackButton>

            <FormSection>
              <SectionTitle>Patient Information</SectionTitle>
              <FormRow>
                <FormGroup>
                  <FormLabel>Registration Number</FormLabel>
                  <FormInput type="text" value={formData.registrationNumber} disabled />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Patient Name</FormLabel>
                  <FormInput type="text" value={formData.patientName} disabled />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Assessment Date</FormLabel>
                  <FormInput type="date" name="date" value={formData.date} onChange={handleChange} />
                </FormGroup>
              </FormRow>
            </FormSection>

            <FormSection color={theme.colors.info}>
              <SectionTitle>On Observation</SectionTitle>
              <FormRow>
                <FormGroup>
                  <FormLabel>Resting Posture</FormLabel>
                  <TextArea
                    value={formData.onObservation.restingPosture}
                    onChange={(e) => handleNestedChange("onObservation", "restingPosture", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Gait</FormLabel>
                  <TextArea
                    value={formData.onObservation.gait}
                    onChange={(e) => handleNestedChange("onObservation", "gait", e.target.value)}
                  />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <FormLabel>Deformity & Contracture</FormLabel>
                  <TextArea
                    value={formData.onObservation.deformity}
                    onChange={(e) => handleNestedChange("onObservation", "deformity", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>External Appliances</FormLabel>
                  <TextArea
                    value={formData.onObservation.appliances}
                    onChange={(e) => handleNestedChange("onObservation", "appliances", e.target.value)}
                  />
                </FormGroup>
              </FormRow>
            </FormSection>

            <FormSection color={theme.colors.warning}>
              <SectionTitle>On Examination - Muscle Tone</SectionTitle>
              <FormGroup style={{ marginBottom: "15px" }}>
                <FormLabel>Assess Muscle Tone?</FormLabel>
                <RadioGroup>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="assessMuscleTone"
                      value="yes"
                      checked={showToneOptions === true}
                      onChange={() => setShowToneOptions(true)}
                    />
                    Yes
                  </RadioLabel>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="assessMuscleTone"
                      value="no"
                      checked={showToneOptions === false}
                      onChange={() => {
                        setShowToneOptions(false);
                        setFormData(prev => ({
                          ...prev,
                          tone: {
                            upperLimb: "",
                            upperLimbInput: "",
                            lowerLimb: "",
                            lowerLimbInput: "",
                            unableToAssess: "",
                            shoulder: "",
                            elbow: "",
                            wrist: "",
                            fingers: "",
                            hip: "",
                            knee: "",
                            ankle: "",
                            toeFingers: ""
                          }
                        }));
                      }}
                    />
                    No
                  </RadioLabel>
                </RadioGroup>
              </FormGroup>

              {showToneOptions && (
                <>
                  <FormRow>
                    <FormGroup>
                      <FormLabel>Tone Upper Limb</FormLabel>
                      <RadioGroup>
                        {["Normal", "Hypertonia", "Hypotonia"].map((opt) => (
                          <RadioLabel key={opt}>
                            <input
                              type="radio"
                              value={opt}
                              checked={formData.tone.upperLimb === opt}
                              onChange={(e) => handleNestedChange("tone", "upperLimb", e.target.value)}
                            />
                            {opt}
                          </RadioLabel>
                        ))}
                      </RadioGroup>
                      <FormInput
                        type="text"
                        placeholder="Additional notes"
                        value={formData.tone.upperLimbInput}
                        onChange={(e) => handleNestedChange("tone", "upperLimbInput", e.target.value)}
                      />
                      <div style={{ marginTop: "12px", paddingLeft: "10px", borderLeft: "2px solid #ccc" }}>
                        <FormLabel>Joint-wise Tone (Upper Limb)</FormLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px" }}>
                          {["shoulder", "elbow", "wrist", "fingers"].map((joint) => (
                            <div key={joint}>
                              <FormLabel style={{ textTransform: "capitalize", fontSize: "0.8rem", marginBottom: "2px" }}>{joint}</FormLabel>
                              <FormInput
                                type="text"
                                placeholder="Enter tone..."
                                value={formData.tone[joint] || ""}
                                onChange={(e) => handleNestedChange("tone", joint, e.target.value)}
                                style={{ padding: "8px 12px", margin: 0 }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </FormGroup>
                    <FormGroup>
                      <FormLabel>Tone Lower Limb</FormLabel>
                      <RadioGroup>
                        {["Normal", "Hypertonia", "Hypotonia"].map((opt) => (
                          <RadioLabel key={opt}>
                            <input
                              type="radio"
                              value={opt}
                              checked={formData.tone.lowerLimb === opt}
                              onChange={(e) => handleNestedChange("tone", "lowerLimb", e.target.value)}
                            />
                            {opt}
                          </RadioLabel>
                        ))}
                      </RadioGroup>
                      <FormInput
                        type="text"
                        placeholder="Additional notes"
                        value={formData.tone.lowerLimbInput}
                        onChange={(e) => handleNestedChange("tone", "lowerLimbInput", e.target.value)}
                      />
                      <div style={{ marginTop: "12px", paddingLeft: "10px", borderLeft: "2px solid #ccc" }}>
                        <FormLabel>Joint-wise Tone (Lower Limb)</FormLabel>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px" }}>
                          {[
                            { key: "hip", label: "Hip" },
                            { key: "knee", label: "Knee" },
                            { key: "ankle", label: "Ankle" },
                            { key: "toeFingers", label: "Toe Fingers" }
                          ].map(({ key, label }) => (
                            <div key={key}>
                              <FormLabel style={{ fontSize: "0.8rem", marginBottom: "2px" }}>{label}</FormLabel>
                              <FormInput
                                type="text"
                                placeholder="Enter tone..."
                                value={formData.tone[key] || ""}
                                onChange={(e) => handleNestedChange("tone", key, e.target.value)}
                                style={{ padding: "8px 12px", margin: 0 }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </FormGroup>
                  </FormRow>
                  <FormGroup>
                    <FormLabel>Unable to Assess Tone (Reason)</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.tone.unableToAssess}
                      onChange={(e) => handleNestedChange("tone", "unableToAssess", e.target.value)}
                    />
                  </FormGroup>
                </>
              )}
            </FormSection>

            <FormSection color={theme.colors.success}>
              <SectionTitle>Motor System</SectionTitle>
              <FormRow>
                <FormGroup>
                  <FormLabel>Motor Upper Limb</FormLabel>
                  <RadioGroup>
                    {["Flaccidity", "Spasticity"].map((opt) => (
                      <RadioLabel key={opt}>
                        <input
                          type="radio"
                          value={opt}
                          checked={formData.motorSystem.upperLimb === opt}
                          onChange={(e) => handleNestedChange("motorSystem", "upperLimb", e.target.value)}
                        />
                        {opt}
                      </RadioLabel>
                    ))}
                  </RadioGroup>
                  <FormInput
                    type="text"
                    placeholder="Additional notes"
                    value={formData.motorSystem.upperLimbInput}
                    onChange={(e) => handleNestedChange("motorSystem", "upperLimbInput", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Motor Lower Limb</FormLabel>
                  <RadioGroup>
                    {["Flaccidity", "Spasticity"].map((opt) => (
                      <RadioLabel key={opt}>
                        <input
                          type="radio"
                          value={opt}
                          checked={formData.motorSystem.lowerLimb === opt}
                          onChange={(e) => handleNestedChange("motorSystem", "lowerLimb", e.target.value)}
                        />
                        {opt}
                      </RadioLabel>
                    ))}
                  </RadioGroup>
                  <FormInput
                    type="text"
                    placeholder="Additional notes"
                    value={formData.motorSystem.lowerLimbInput}
                    onChange={(e) => handleNestedChange("motorSystem", "lowerLimbInput", e.target.value)}
                  />
                </FormGroup>
              </FormRow>
            </FormSection>

            <FormSection color={theme.colors.accent}>
              <SectionTitle>Clonus</SectionTitle>
              <FormRow>
                <FormGroup>
                  <FormLabel>Status</FormLabel>
                  <RadioGroup>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="clonusStatus"
                        value="present"
                        checked={formData.clonus.status === "present"}
                        onChange={(e) => handleNestedChange("clonus", "status", e.target.value)}
                      />
                      Present
                    </RadioLabel>
                    <RadioLabel>
                      <input
                        type="radio"
                        name="clonusStatus"
                        value="absent"
                        checked={formData.clonus.status === "absent"}
                        onChange={(e) => handleNestedChange("clonus", "status", e.target.value)}
                      />
                      Absent
                    </RadioLabel>
                  </RadioGroup>
                </FormGroup>
                <FormGroup>
                  <FormLabel>Notes</FormLabel>
                  <FormInput
                    type="text"
                    placeholder="Enter clonus notes..."
                    value={formData.clonus.notes || ""}
                    onChange={(e) => handleNestedChange("clonus", "notes", e.target.value)}
                  />
                </FormGroup>
              </FormRow>
            </FormSection>

            <FormSection color={theme.colors.error}>
              <SectionTitle>Co-ordination</SectionTitle>
              <FormRow>
                <FormGroup>
                  <FormLabel>Upper Limb Co-ordination</FormLabel>
                  <RadioGroup>
                    {["Mild", "Moderate", "Good"].map((opt) => (
                      <RadioLabel key={opt}>
                        <input
                          type="radio"
                          value={opt}
                          checked={formData.coordination.upperLimb === opt}
                          onChange={(e) => handleNestedChange("coordination", "upperLimb", e.target.value)}
                        />
                        {opt}
                      </RadioLabel>
                    ))}
                  </RadioGroup>
                  <FormInput
                    type="text"
                    placeholder="Additional notes"
                    value={formData.coordination.upperLimbInput}
                    onChange={(e) => handleNestedChange("coordination", "upperLimbInput", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Lower Limb Co-ordination</FormLabel>
                  <RadioGroup>
                    {["Mild", "Moderate", "Good"].map((opt) => (
                      <RadioLabel key={opt}>
                        <input
                          type="radio"
                          value={opt}
                          checked={formData.coordination.lowerLimb === opt}
                          onChange={(e) => handleNestedChange("coordination", "lowerLimb", e.target.value)}
                        />
                        {opt}
                      </RadioLabel>
                    ))}
                  </RadioGroup>
                  <FormInput
                    type="text"
                    placeholder="Additional notes"
                    value={formData.coordination.lowerLimbInput}
                    onChange={(e) => handleNestedChange("coordination", "lowerLimbInput", e.target.value)}
                  />
                </FormGroup>
              </FormRow>
            </FormSection>

            <FormSection>
              <SectionTitle>Pattern & Position</SectionTitle>
              <FormRow>
                <FormGroup>
                  <FormLabel>Pattern</FormLabel>
                  <TextArea
                    value={formData.patternAndPosition.pattern}
                    onChange={(e) => handleNestedChange("patternAndPosition", "pattern", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Head Position</FormLabel>
                  <TextArea
                    value={formData.patternAndPosition.headPosition}
                    onChange={(e) => handleNestedChange("patternAndPosition", "headPosition", e.target.value)}
                  />
                </FormGroup>
              </FormRow>
              <FormGroup>
                <FormLabel>Trunk Position</FormLabel>
                <TextArea
                  value={formData.patternAndPosition.trunkPosition}
                  onChange={(e) => handleNestedChange("patternAndPosition", "trunkPosition", e.target.value)}
                />
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>Limb Length Discrepancy</SectionTitle>
              <table>
                <thead>
                  <tr>
                    <th>Body Part</th>
                    <th>Right</th>
                    <th>Left</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Hand</td>
                    <td>
                      <FormInput
                        type="text"
                        value={formData.limbLength.handRight}
                        onChange={(e) => handleNestedChange("limbLength", "handRight", e.target.value)}
                      />
                    </td>
                    <td>
                      <FormInput
                        type="text"
                        value={formData.limbLength.handLeft}
                        onChange={(e) => handleNestedChange("limbLength", "handLeft", e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Leg</td>
                    <td>
                      <FormInput
                        type="text"
                        value={formData.limbLength.legRight}
                        onChange={(e) => handleNestedChange("limbLength", "legRight", e.target.value)}
                      />
                    </td>
                    <td>
                      <FormInput
                        type="text"
                        value={formData.limbLength.legLeft}
                        onChange={(e) => handleNestedChange("limbLength", "legLeft", e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </FormSection>

            <FormSection>
              <SectionTitle>Balance</SectionTitle>
              <table>
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Static</th>
                    <th>Dynamic</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Sitting</td>
                    <td>
                      <FormInput
                        type="text"
                        value={formData.balance.sittingStatic}
                        onChange={(e) => handleNestedChange("balance", "sittingStatic", e.target.value)}
                      />
                    </td>
                    <td>
                      <FormInput
                        type="text"
                        value={formData.balance.sittingDynamic}
                        onChange={(e) => handleNestedChange("balance", "sittingDynamic", e.target.value)}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Standing</td>
                    <td>
                      <FormInput
                        type="text"
                        value={formData.balance.standingStatic}
                        onChange={(e) => handleNestedChange("balance", "standingStatic", e.target.value)}
                      />
                    </td>
                    <td>
                      <FormInput
                        type="text"
                        value={formData.balance.standingDynamic}
                        onChange={(e) => handleNestedChange("balance", "standingDynamic", e.target.value)}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </FormSection>

            <FormSection>
              <SectionTitle>Sensation</SectionTitle>
              <FormRow>
                <FormGroup>
                  <FormLabel>Light Touch</FormLabel>
                  <TextArea
                    value={formData.sensation.lightTouch}
                    onChange={(e) => handleNestedChange("sensation", "lightTouch", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Pain</FormLabel>
                  <TextArea
                    value={formData.sensation.pain}
                    onChange={(e) => handleNestedChange("sensation", "pain", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Proprioception</FormLabel>
                  <TextArea
                    value={formData.sensation.proprioception}
                    onChange={(e) => handleNestedChange("sensation", "proprioception", e.target.value)}
                  />
                </FormGroup>
              </FormRow>
            </FormSection>

            <FormSection color={theme.colors.primary}>
              <SectionTitle>Gross Development</SectionTitle>
              <FormRow>
                <FormGroup>
                  <FormLabel>Crawling</FormLabel>
                  <Select
                    value={formData.grossDevelopment?.crawling || ""}
                    onChange={(e) => handleNestedChange("grossDevelopment", "crawling", e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    <option value="Achieved">Achieved</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Not Started">Not Started</option>
                    <option value="Unable to Assess">Unable to Assess</option>
                  </Select>
                  <FormInput
                    type="text"
                    placeholder="Crawling details/notes"
                    value={formData.grossDevelopment?.crawlingNotes || ""}
                    onChange={(e) => handleNestedChange("grossDevelopment", "crawlingNotes", e.target.value)}
                    style={{ marginTop: "5px" }}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Roll Over</FormLabel>
                  <Select
                    value={formData.grossDevelopment?.rollOver || ""}
                    onChange={(e) => handleNestedChange("grossDevelopment", "rollOver", e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    <option value="Achieved">Achieved</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Not Started">Not Started</option>
                    <option value="Unable to Assess">Unable to Assess</option>
                  </Select>
                  <FormInput
                    type="text"
                    placeholder="Roll over details/notes"
                    value={formData.grossDevelopment?.rollOverNotes || ""}
                    onChange={(e) => handleNestedChange("grossDevelopment", "rollOverNotes", e.target.value)}
                    style={{ marginTop: "5px" }}
                  />
                </FormGroup>
              </FormRow>
              <FormRow>
                <FormGroup>
                  <FormLabel>Sitting</FormLabel>
                  <RadioGroup>
                    {[
                      { value: "with support", label: "With Support" },
                      { value: "without support", label: "Without Support" },
                      { value: "unable to assess", label: "Unable to Assess" }
                    ].map((opt) => (
                      <RadioLabel key={opt.value}>
                        <input
                          type="radio"
                          name="sitting"
                          value={opt.value}
                          checked={formData.grossDevelopment?.sitting === opt.value}
                          onChange={(e) => handleNestedChange("grossDevelopment", "sitting", e.target.value)}
                        />
                        {opt.label}
                      </RadioLabel>
                    ))}
                  </RadioGroup>
                  {formData.grossDevelopment?.sitting === "unable to assess" && (
                    <FormInput
                      type="text"
                      placeholder="Reason / Details for unable to assess"
                      value={formData.grossDevelopment?.sittingUnableInput || ""}
                      onChange={(e) => handleNestedChange("grossDevelopment", "sittingUnableInput", e.target.value)}
                      style={{ marginTop: "10px" }}
                    />
                  )}
                </FormGroup>
              </FormRow>

              <div style={{ marginTop: "20px" }}>
                <FormLabel style={{ fontWeight: "600", marginBottom: "10px" }}>Gross Motor Activities</FormLabel>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #ddd" }}>Activity</th>
                      <th style={{ textAlign: "center", padding: "8px", borderBottom: "2px solid #ddd" }}>Present</th>
                      <th style={{ textAlign: "center", padding: "8px", borderBottom: "2px solid #ddd" }}>Absent</th>
                      <th style={{ textAlign: "left", padding: "8px", borderBottom: "2px solid #ddd" }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: "walking", label: "Walking" },
                      { key: "running", label: "Running" },
                      { key: "kicking", label: "Kicking" },
                      { key: "throwing", label: "Throwing" },
                      { key: "catching", label: "Catching" },
                      { key: "jumping", label: "Jumping" },
                      { key: "stairsClimbing", label: "Stairs Climbing" }
                    ].map(({ key, label }) => {
                      const activityVal = formData.grossDevelopment?.activities?.[key] || {};
                      const status = typeof activityVal === "object" ? (activityVal.status || "") : activityVal;
                      const notes = typeof activityVal === "object" ? (activityVal.notes || "") : "";
                      
                      return (
                        <tr key={key} style={{ borderBottom: "1px solid #eee" }}>
                          <td style={{ padding: "8px", verticalAlign: "middle" }}><strong>{label}</strong></td>
                          <td style={{ textAlign: "center", padding: "8px", verticalAlign: "middle" }}>
                            <RadioLabel style={{ padding: "4px", borderRadius: "50%", minWidth: "30px", minHeight: "30px", justifyContent: "center", display: "inline-flex", margin: "0 auto" }}>
                              <input
                                type="radio"
                                name={`gross_motor_${key}`}
                                value="present"
                                style={{ marginRight: 0 }}
                                checked={status === "present"}
                                onChange={(e) => {
                                  const updatedActivities = {
                                    ...(formData.grossDevelopment?.activities || {}),
                                    [key]: { status: "present", notes }
                                  };
                                  handleNestedChange("grossDevelopment", "activities", updatedActivities);
                                }}
                              />
                            </RadioLabel>
                          </td>
                          <td style={{ textAlign: "center", padding: "8px", verticalAlign: "middle" }}>
                            <RadioLabel style={{ padding: "4px", borderRadius: "50%", minWidth: "30px", minHeight: "30px", justifyContent: "center", display: "inline-flex", margin: "0 auto" }}>
                              <input
                                type="radio"
                                name={`gross_motor_${key}`}
                                value="absent"
                                style={{ marginRight: 0 }}
                                checked={status === "absent"}
                                onChange={(e) => {
                                  const updatedActivities = {
                                    ...(formData.grossDevelopment?.activities || {}),
                                    [key]: { status: "absent", notes }
                                  };
                                  handleNestedChange("grossDevelopment", "activities", updatedActivities);
                                }}
                              />
                            </RadioLabel>
                          </td>
                          <td style={{ padding: "8px", verticalAlign: "middle" }}>
                            <FormInput
                              type="text"
                              placeholder="Notes"
                              value={notes}
                              onChange={(e) => {
                                const updatedActivities = {
                                  ...(formData.grossDevelopment?.activities || {}),
                                  [key]: { status, notes: e.target.value }
                                };
                                handleNestedChange("grossDevelopment", "activities", updatedActivities);
                              }}
                              style={{ margin: 0, padding: "6px 12px" }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </FormSection>

            <FormSection color={theme.colors.info}>
              <SectionTitle>Reflexes</SectionTitle>
              <FormGroup style={{ marginBottom: "15px" }}>
                <FormLabel>Assess Reflexes?</FormLabel>
                <RadioGroup>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="assessReflexes"
                      value="yes"
                      checked={showReflexesOptions === true}
                      onChange={() => setShowReflexesOptions(true)}
                    />
                    Yes
                  </RadioLabel>
                  <RadioLabel>
                    <input
                      type="radio"
                      name="assessReflexes"
                      value="no"
                      checked={showReflexesOptions === false}
                      onChange={() => {
                        setShowReflexesOptions(false);
                        setFormData(prev => ({
                          ...prev,
                          reflexes: {
                            bicepsRight: "",
                            bicepsLeft: "",
                            tricepsRight: "",
                            tricepsLeft: "",
                            kneeJerkRight: "",
                            kneeJerkLeft: "",
                            ankleJerkRight: "",
                            ankleJerkLeft: "",
                            plantarRight: "",
                            plantarLeft: ""
                          }
                        }));
                      }}
                    />
                    No
                  </RadioLabel>
                </RadioGroup>
              </FormGroup>

              {showReflexesOptions && (
                <table>
                  <thead>
                    <tr>
                      <th>Reflex</th>
                      <th>Right</th>
                      <th>Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: "biceps", label: "Biceps" },
                      { key: "triceps", label: "Triceps" },
                      { key: "kneeJerk", label: "Knee Jerk" },
                      { key: "ankleJerk", label: "Ankle Jerk" },
                      { key: "plantar", label: "Plantar" }
                    ].map(({ key, label }) => (
                      <tr key={key}>
                        <td><strong>{label}</strong></td>
                        <td>
                          <Select
                            value={formData.reflexes?.[`${key}Right`] || ""}
                            onChange={(e) => handleNestedChange("reflexes", `${key}Right`, e.target.value)}
                            style={{ padding: "4px 8px" }}
                          >
                            <option value="">-- Select --</option>
                            <option value="Normal">Normal (2+)</option>
                            <option value="Exaggerated">Brisk / Exaggerated (3+)</option>
                            <option value="Diminished">Sluggish / Diminished (1+)</option>
                            <option value="Absent">Absent (0)</option>
                            <option value="Clonus">Clonus (4+)</option>
                          </Select>
                        </td>
                        <td>
                          <Select
                            value={formData.reflexes?.[`${key}Left`] || ""}
                            onChange={(e) => handleNestedChange("reflexes", `${key}Left`, e.target.value)}
                            style={{ padding: "4px 8px" }}
                          >
                            <option value="">-- Select --</option>
                            <option value="Normal">Normal (2+)</option>
                            <option value="Exaggerated">Brisk / Exaggerated (3+)</option>
                            <option value="Diminished">Sluggish / Diminished (1+)</option>
                            <option value="Absent">Absent (0)</option>
                            <option value="Clonus">Clonus (4+)</option>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </FormSection>

            <FormSection color={theme.colors.secondary}>
              <SectionTitle>Assessments Used</SectionTitle>
              <FormGroup>
                <FormLabel>Physiotherapy Assessment</FormLabel>
                <TextArea
                  value={formData.assessmentsUsed.physiotherapyAssessment}
                  onChange={(e) => handleNestedChange("assessmentsUsed", "physiotherapyAssessment", e.target.value)}
                />
              </FormGroup>
            </FormSection>

            <FormSection color={theme.colors.accent}>
              <SectionTitle>Short Term Goals</SectionTitle>
              <FormGroup>
                <TextArea
                  name="shortTermGoals"
                  value={formData.shortTermGoals}
                  onChange={handleChange}
                  placeholder="Enter short term goals..."
                  style={{ minHeight: "100px" }}
                />
              </FormGroup>
            </FormSection>

             <FormSection color={theme.colors.accent}>
              <SectionTitle>Long Term Goals</SectionTitle>
              <FormGroup>
                <TextArea
                  name="longTermGoals"
                  value={formData.longTermGoals}
                  onChange={handleChange}
                  placeholder="Enter long term goals..."
                  style={{ minHeight: "100px" }}
                />
              </FormGroup>
            </FormSection>

            <FormSection color={theme.colors.success}>
              <SectionTitle>Recommendations</SectionTitle>
              <FormGroup>
                <TextArea
                  name="recommendation"
                  value={formData.recommendation}
                  onChange={handleChange}
                  placeholder="Enter recommendations..."
                  style={{ minHeight: "120px" }}
                />
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionTitle>Additional Notes</SectionTitle>
              <FormGroup>
                <TextArea name="notes" value={formData.notes} onChange={handleChange} placeholder="Enter any additional notes" />
              </FormGroup>
            </FormSection>

            <ButtonsContainer>
              <Button onClick={handleSubmit}>
                <Save size={18} />
                Save Assessment
              </Button>
            </ButtonsContainer>
          </>
        )}
      </PageContainer>
    </ThemeProvider>
  )
}