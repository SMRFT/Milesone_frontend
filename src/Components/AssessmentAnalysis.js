"use client"

import { useState, useEffect, useCallback } from "react"
import styled from "styled-components"
import { Save, ArrowLeft, RefreshCw } from "lucide-react"
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
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
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

const PatientCardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
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

const AssessmentBadge = styled.span`
  display: inline-block;
  background-color: ${theme.colors.primary};
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  margin: 2px;
`

const NoDataMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg};
  color: ${theme.colors.textLight};
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.medium};
`

const BackButton = styled.button`
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background-color: ${theme.colors.textLight};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  &:hover {
    background-color: #5a6268;
  }
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
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
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

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  cursor: pointer;
  border-radius: ${theme.borderRadius.small};
  
  &:hover {
    background-color: ${theme.colors.highlight};
  }
`

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${theme.colors.primary};
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${theme.spacing.md};
  
  th, td {
    padding: ${theme.spacing.sm};
    text-align: left;
    border: 1px solid ${theme.colors.borderLight};
  }
  
  th {
    background-color: ${theme.colors.background};
    font-weight: 600;
    color: ${theme.colors.text};
  }
  
  tbody tr:hover {
    background-color: ${theme.colors.highlight};
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

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing.md};
`

const SubmissionsContainer = styled.div`
  background-color: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  border-left: 4px solid ${theme.colors.success};
  box-shadow: ${theme.shadows.small};
`

const SubmissionsTitle = styled.h3`
  color: ${theme.colors.text};
  font-size: 1.2rem;
  margin: 0 0 ${theme.spacing.md} 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const RefreshButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.info};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.small};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: 0.85rem;
  
  &:hover {
    background-color: #1976d2;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const SubmissionCard = styled.div`
  background-color: ${theme.colors.highlight};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.small};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`

const SubmissionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.borderLight};
`

const TherapistName = styled.span`
  font-weight: 600;
  color: ${theme.colors.primary};
  font-size: 0.95rem;
`

const SubmissionDate = styled.span`
  color: ${theme.colors.textLight};
  font-size: 0.85rem;
`

const SubmissionContent = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.text};
  line-height: 1.5;
`

const StatusMessage = styled.p`
  color: ${(props) => {
    switch (props.status) {
      case "loading":
        return theme.colors.info
      case "success":
        return theme.colors.success
      case "error":
        return theme.colors.error
      default:
        return theme.colors.text
    }
  }};
  font-size: 0.9rem;
  margin: ${theme.spacing.sm} 0;
`

export default function AssessmentAnalysisForm() {
  const [patientList, setPatientList] = useState([])
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const [selectedPatient, setSelectedPatient] = useState(null)
  const [assessmentId, setAssessmentId] = useState(null)

  const [submissions, setSubmissions] = useState([])
  const [submissionLoading, setSubmissionLoading] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState("")
  const [therapistName, setTherapistName] = useState("")
  const [autoRefresh, setAutoRefresh] = useState(true)

  const [formData, setFormData] = useState({
    registrationNumber: "",
    patientName: "",
    age: "",
    sex: "",
    date: new Date().toISOString().split("T")[0],
    billingNo: "",

    provisionalDiagnosis: "",

    preferredLanguage: {
      tamil: false,
      english: false,
    },

    homeModification: "",

    parentingModifications: "",

    mappingTherapy: {
      PSY: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
      OT: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
      SLP: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
      PHYSIO: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
      SPED: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
    },

    sessionNumbers: {
      BT_CT: "",
      OT: "",
      SLP: "",
      PT: "",
      SplEdu: "",
      EI: "",
      ArtTherapy: "",
    },

    therapyMethods: {
      BMI: false,
      ABA_VB: false,
      CBT: false,
      SOCIAL_SKILL: false,
      EMOTIONAL_REG: false,
      PLAY_THERAPY: false,
      ESDM: false,
      PECS: false,
      VIDEO_MODELING: false,
      EXECUTIVE_FUNC: false,
      SPECIAL_EDU: false,
      ARTICULATION: false,
      SENSORY_INTEGRATION: false,
    },
  })

  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL || ""

const fetchSubmissions = useCallback(async () => {
  if (!selectedPatient) return

  try {
    setSubmissionLoading(true)

    const result = await apiRequest(
      `${Milestonebaseurl}assessment-analysis/`,
      "GET"
    )

    // apiRequest usually returns { success, data }
    const data = result?.data || []

    const patientSubmissions = Array.isArray(data)
      ? data.filter(
          (sub) =>
            sub.registration_number === selectedPatient.registration_number
        )
      : []

    setSubmissions(patientSubmissions)
    setSubmissionStatus("")
  } catch (error) {
    console.error("Error fetching submissions:", error)
    setSubmissionStatus("error")
  } finally {
    setSubmissionLoading(false)
  }
}, [Milestonebaseurl, selectedPatient])


  useEffect(() => {
    if (selectedPatient) {
      fetchSubmissions()
    }
  }, [selectedPatient, fetchSubmissions])

  useEffect(() => {
    if (showForm && autoRefresh && selectedPatient) {
      fetchSubmissions()
      const interval = setInterval(fetchSubmissions, 3000)
      return () => clearInterval(interval)
    }
  }, [showForm, autoRefresh, fetchSubmissions, selectedPatient])

const fetchPatients = async () => {
  try {
    if (!startDate || !endDate) {
      toast.info("Please select both start and end dates")
      return
    }

    setLoading(true)

    const url = `${Milestonebaseurl}get_all_category_patients/?start_date=${startDate}&end_date=${endDate}`

    const result = await apiRequest(url, "GET")

    // apiRequest returns { success, data }
    const data = result?.data

    if (data?.patients && Array.isArray(data.patients)) {
      setPatientList(data.patients)
    } else {
      setPatientList([])
    }
  } catch (error) {
    console.error("Error fetching patients:", error)
    toast.error("Error fetching patient data")
    setPatientList([])
  } finally {
    setLoading(false)
  }
}


  useEffect(() => {
    if (startDate && endDate) {
      fetchPatients()
    }
  }, [startDate, endDate])

  const formatAge = (ageData) => {
    if (!ageData) return "N/A"

    try {
      const ageObj = typeof ageData === "string" ? JSON.JSON.parse(ageData) : ageData
      const { year, months, days } = ageObj

      const parts = []
      if (year) parts.push(`${year}Y`)
      if (months) parts.push(`${months}M`)
      if (days) parts.push(`${days}D`)

      return parts.length > 0 ? parts.join(" ") : "N/A"
    } catch (e) {
      return String(ageData)
    }
  }

  const parseAssessments = (assessmentsData) => {
    if (!assessmentsData) return []

    try {
      const assessments = typeof assessmentsData === "string" ? JSON.parse(assessmentsData) : assessmentsData

      return Array.isArray(assessments) ? assessments : []
    } catch (e) {
      return []
    }
  }

const fetchPatientAssessment = async (patient) => {
  try {
    const result = await apiRequest(
      `${Milestonebaseurl}assessment-analysis/`,
      "GET"
    )

    const data = result?.data
    const assessments = Array.isArray(data) ? data : []

    // Find existing assessment for selected patient
    const existingAssessment = assessments.find(
      (assessment) =>
        assessment.registration_number === patient.registration_number
    )

    console.log("Existing assessment for patient:", existingAssessment)

    if (existingAssessment) {
      setAssessmentId(existingAssessment.id)

      setFormData({
        registrationNumber: existingAssessment.registration_number || "",
        patientName: existingAssessment.patient_name || "",
        age: existingAssessment.age || formatAge(patient.age),
        sex: existingAssessment.sex || "",
        date:
          existingAssessment.date ||
          new Date().toISOString().split("T")[0],
        billingNo: existingAssessment.billing_no || "",

        provisionalDiagnosis:
          existingAssessment.provisional_diagnosis || "",

        preferredLanguage:
          existingAssessment.preferred_language || {
            tamil: false,
            english: false,
          },

        homeModification:
          existingAssessment.home_modification || "",

        parentingModifications:
          existingAssessment.parenting_modifications || "",

        mappingTherapy:
          existingAssessment.mapping_therapy || {
            PSY: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
            OT: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
            SLP: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
            PHYSIO: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
            SPED: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
          },

        sessionNumbers:
          existingAssessment.session_numbers || {
            BT_CT: "",
            OT: "",
            SLP: "",
            PT: "",
            SplEdu: "",
            EI: "",
            ArtTherapy: "",
          },

        therapyMethods:
          existingAssessment.therapy_methods || {
            BMI: false,
            ABA_VB: false,
            CBT: false,
            SOCIAL_SKILL: false,
            EMOTIONAL_REG: false,
            PLAY_THERAPY: false,
            ESDM: false,
            PECS: false,
            VIDEO_MODELING: false,
            EXECUTIVE_FUNC: false,
            SPECIAL_EDU: false,
            ARTICULATION: false,
            SENSORY_INTEGRATION: false,
          },
      })
    } else {
      // No existing assessment → prepare fresh form
      setAssessmentId(null)

      setFormData((prev) => ({
        ...prev,
        registrationNumber: patient.registration_number || "",
        patientName: patient.patient_name || "",
        age: formatAge(patient.age),
        sex: patient.sex || "",
        billingNo: patient.billing_no || "",
        date: new Date().toISOString().split("T")[0],
      }))
    }
  } catch (error) {
    console.error("Error fetching patient assessment:", error)

    // Fallback to patient info
    setAssessmentId(null)
    setFormData((prev) => ({
      ...prev,
      registrationNumber: patient.registration_number || "",
      patientName: patient.patient_name || "",
      age: formatAge(patient.age),
      sex: patient.sex || "",
      billingNo: patient.billing_no || "",
      date: new Date().toISOString().split("T")[0],
    }))
  }
}


  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient)
    fetchPatientAssessment(patient)
    setShowForm(true)
    fetchSubmissions()
  }

  const handleBackToList = () => {
    setShowForm(false)
    setSelectedPatient(null)
    setAssessmentId(null)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLanguageChange = (lang, checked) => {
    setFormData((prev) => ({
      ...prev,
      preferredLanguage: {
        ...prev.preferredLanguage,
        [lang]: checked,
      },
    }))
  }

  const handleMappingChange = (row, col) => {
    setFormData((prev) => ({
      ...prev,
      mappingTherapy: {
        ...prev.mappingTherapy,
        [row]: {
          ...prev.mappingTherapy[row],
          [col]: !prev.mappingTherapy[row][col],
        },
      },
    }))
  }

  const handleSessionNumberChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      sessionNumbers: {
        ...prev.sessionNumbers,
        [key]: value,
      },
    }))
  }

  const handleTherapyMethodChange = (key, checked) => {
    setFormData((prev) => ({
      ...prev,
      therapyMethods: {
        ...prev.therapyMethods,
        [key]: checked,
      },
    }))
  }

const handleSubmit = async () => {
  try {
    const payloadData = {
      registration_number: formData.registrationNumber,
      patient_name: formData.patientName,
      age: formData.age,
      sex: formData.sex,
      date: formData.date,
      billing_no: formData.billingNo,
      provisional_diagnosis: formData.provisionalDiagnosis,
      preferred_language: formData.preferredLanguage,
      home_modification: formData.homeModification,
      parenting_modifications: formData.parentingModifications,
      mapping_therapy: formData.mappingTherapy,
      session_numbers: formData.sessionNumbers,
      therapy_methods: formData.therapyMethods,
    }

    setSubmissionStatus("loading")

    const isUpdate = Boolean(assessmentId)
    const method = isUpdate ? "PATCH" : "POST"
    const url = isUpdate
      ? `${Milestonebaseurl}assessment-analysis/${assessmentId}/`
      : `${Milestonebaseurl}assessment-analysis/`

    const result = await apiRequest(url, method, payloadData)

    if (!result?.success) {
      throw new Error(result?.error || "Failed to save assessment")
    }

    const responseData = result.data
    setAssessmentId(responseData.id)

    setSubmissionStatus("success")

    setTimeout(() => {
      setSubmissionStatus("")
      fetchSubmissions()
    }, 2000)

    toast.success("Assessment Analysis submitted successfully!")
  } catch (error) {
    console.error("Error saving assessment:", error)
    setSubmissionStatus("error")
    toast.error("Failed to save assessment. Please try again.")
  }
}


  const handleSubmissionClick = (submission) => {
    console.log("[v0] Populating form with submission data:", submission)

    setFormData({
      registrationNumber: submission.registration_number || "",
      patientName: submission.patient_name || "",
      age: submission.age || "",
      sex: submission.sex || "",
      date: submission.date || new Date().toISOString().split("T")[0],
      billingNo: submission.billing_no || "",
      provisionalDiagnosis: submission.provisional_diagnosis || "",
      preferredLanguage: submission.preferred_language || {
        tamil: false,
        english: false,
      },
      homeModification: submission.home_modification || "",
      parentingModifications: submission.parenting_modifications || "",
      mappingTherapy: submission.mapping_therapy || {
        PSY: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
        OT: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
        SLP: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
        PHYSIO: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
        SPED: { BT_CT : false, SPEECH: false, OT: false, PT: false, PSY: false, EI: false, GROUP_T: false },
      },
      sessionNumbers: submission.session_numbers || {
        BT_CT: "",
        OT: "",
        SLP: "",
        PT: "",
        SplEdu: "",
        EI: "",
        ArtTherapy: "",
      },
      therapyMethods: submission.therapy_methods || {
        BMI: false,
        ABA_VB: false,
        CBT: false,
        SOCIAL_SKILL: false,
        EMOTIONAL_REG: false,
        PLAY_THERAPY: false,
        ESDM: false,
        PECS: false,
        VIDEO_MODELING: false,
        EXECUTIVE_FUNC: false,
        SPECIAL_EDU: false,
        ARTICULATION: false,
        SENSORY_INTEGRATION: false,
      },
    })
    console.log("[v0] Form populated successfully")
  }

  const therapyRows = ["PSY", "OT", "SLP", "PHYSIO", "SPED"]
  const therapyColumns = ["BT/CT","SPEECH", "OT", "PT", "PSY", "EI", "GROUP_T"]

  const therapyMethodsList = [
    { key: "BMI", label: "BMI / Behavioral Therapy" },
    { key: "ABA_VB", label: "ABA/ VB" },
    { key: "CBT", label: "CBT" },
    { key: "SOCIAL_SKILL", label: "Social Skill Training" },
    { key: "EMOTIONAL_REG", label: "Emotional Regulation" },
    { key: "PLAY_THERAPY", label: "Play Therapy" },
    { key: "ESDM", label: "ESDM" },
    { key: "PECS", label: "PECS" },
    { key: "VIDEO_MODELING", label: "Video Modeling" },
    { key: "EXECUTIVE_FUNC", label: "Executive Functioning Therapy" },
    { key: "SPECIAL_EDU", label: "Special Education / Remedial Education" },
    { key: "ARTICULATION", label: "Articulation Therapy (speech buddy)" },
    { key: "SENSORY_INTEGRATION", label: "Sensory Integration Therapy" },
  ]

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <PageHeader>
          <PageTitle>Assessment Analysis Form System</PageTitle>
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
              <FilterButton onClick={fetchPatients} disabled={loading}>
                {loading ? "Loading..." : "Search Patients"}
              </FilterButton>
            </FilterContainer>

            {patientList.length > 0 ? (
              <div>
                <h3 style={{ color: theme.colors.text }}>Found {patientList.length} Patient(s)</h3>
                <PatientCardsContainer>
                  {patientList.map((patient, index) => (
                    <PatientCard key={index} onClick={() => handlePatientSelect(patient)}>
                      <PatientCardTitle>{patient.patient_name || "N/A"}</PatientCardTitle>
                      <PatientCardInfo>
                        <span>Reg. No:</span> {patient.registration_number || "N/A"}
                      </PatientCardInfo>
                      <PatientCardInfo>
                        <span>Billing No:</span> {patient.billing_no || "N/A"}
                      </PatientCardInfo>
                      <PatientCardInfo>
                        <span>Age:</span> {formatAge(patient.age)} | <span>Sex:</span> {patient.sex || "N/A"}
                      </PatientCardInfo>
                      <PatientCardInfo>
                        <span>Date:</span> {patient.date ? new Date(patient.date).toLocaleDateString() : "N/A"}
                      </PatientCardInfo>
                      {parseAssessments(patient.assessments).length > 0 && (
                        <div style={{ marginTop: theme.spacing.sm }}>
                          {parseAssessments(patient.assessments).map((assessment, idx) => (
                            <AssessmentBadge key={idx}>{assessment.category}</AssessmentBadge>
                          ))}
                        </div>
                      )}
                      <PatientCardInfo
                        style={{ marginTop: theme.spacing.md, fontSize: "0.8rem", color: theme.colors.textLight }}
                      >
                        Click to fill assessment analysis form
                      </PatientCardInfo>
                    </PatientCard>
                  ))}
                </PatientCardsContainer>
              </div>
            ) : (
              <NoDataMessage>
                {loading
                  ? "Loading patients..."
                  : startDate && endDate
                    ? "No patients found for the selected date range. Try adjusting the dates."
                    : "Select date range and click 'Search Patients' to begin"}
              </NoDataMessage>
            )}
          </>
        ) : (
          <>
            <BackButton onClick={handleBackToList}>
              <ArrowLeft size={18} />
              Back to Patient List
            </BackButton>

            {/* Patient Information */}
            <FormSection>
              <SectionTitle>Patient Information</SectionTitle>
              <FormRow>
                <FormGroup>
                  <FormLabel>Registration Number</FormLabel>
                  <FormInput
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    readOnly
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Patient Name</FormLabel>
                  <FormInput
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    readOnly
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Age</FormLabel>
                  <FormInput type="text" name="age" value={formData.age} readOnly />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Sex</FormLabel>
                  <FormInput type="text" name="sex" value={formData.sex} readOnly />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Assessment Date</FormLabel>
                  <FormInput type="date" name="date" value={formData.date} onChange={handleChange} />
                </FormGroup>
              </FormRow>
            </FormSection>

            {/* Provisional Diagnosis */}
            <FormSection color={theme.colors.warning}>
              <SectionTitle>⚠️ Provisional / Clinical Diagnosis</SectionTitle>
              <FormGroup>
                <TextArea
                  name="provisionalDiagnosis"
                  value={formData.provisionalDiagnosis}
                  onChange={handleChange}
                  placeholder="Enter provisional/clinical diagnosis..."
                  rows={4}
                />
              </FormGroup>
            </FormSection>

            {/* Mapping Therapy */}
            <FormSection color={theme.colors.info}>
              <SectionTitle>⚡ Mapping Therapy</SectionTitle>
              <p style={{ fontSize: "0.9rem", color: theme.colors.textLight, marginBottom: theme.spacing.md }}>
                Child severity based therapy
              </p>
              <Table>
                <thead>
                  <tr>
                    <th>Therapy</th>
                    {therapyColumns.map((col) => (
                      <th key={col} style={{ textAlign: "center", fontSize: "0.85rem" }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {therapyRows.map((row) => (
                    <tr key={row}>
                      <td>
                        <strong>{row}</strong>
                      </td>
                      {therapyColumns.map((col) => (
                        <td key={col} style={{ textAlign: "center" }}>
                          <Checkbox
                            type="checkbox"
                            checked={formData.mappingTherapy[row][col]}
                            onChange={() => handleMappingChange(row, col)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </FormSection>

            {/* Preferred Language */}
            <FormSection color={theme.colors.success}>
              <SectionTitle>➤ Preferred Language of Therapy</SectionTitle>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={formData.preferredLanguage.tamil}
                  onChange={(e) => handleLanguageChange("tamil", e.target.checked)}
                />
                <span>Tamil</span>
              </CheckboxLabel>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={formData.preferredLanguage.english}
                  onChange={(e) => handleLanguageChange("english", e.target.checked)}
                />
                <span>English</span>
              </CheckboxLabel>
            </FormSection>

            {/* Session Numbers */}
            <FormSection color={theme.colors.accent}>
              <SectionTitle>Therapy Plan - Session Numbers Based on Severity</SectionTitle>
              <Table>
                <thead>
                  <tr>
                    <th>Therapy</th>
                    <th style={{ textAlign: "center" }}>BT/CT</th>
                    <th style={{ textAlign: "center" }}>OT</th>
                    <th style={{ textAlign: "center" }}>SLP</th>
                    <th style={{ textAlign: "center" }}>PT</th>
                    <th style={{ textAlign: "center" }}>Spl.Edu</th>
                    <th style={{ textAlign: "center" }}>EI</th>
                    <th style={{ textAlign: "center" }}>Art Therapy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Number of Sessions</strong>
                    </td>
                    {Object.keys(formData.sessionNumbers).map((key) => (
                      <td key={key} style={{ padding: "4px" }}>
                        <FormInput
                          type="text"
                          value={formData.sessionNumbers[key]}
                          onChange={(e) => handleSessionNumberChange(key, e.target.value)}
                          style={{ textAlign: "center", padding: "4px" }}
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </Table>
            </FormSection>

            {/* Therapy Methods */}
            <FormSection color={theme.colors.secondary}>
              <SectionTitle>Therapy Methods</SectionTitle>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: theme.spacing.sm,
                }}
              >
                {therapyMethodsList.map((method) => (
                  <CheckboxLabel key={method.key}>
                    <Checkbox
                      type="checkbox"
                      checked={formData.therapyMethods[method.key]}
                      onChange={(e) => handleTherapyMethodChange(method.key, e.target.checked)}
                    />
                    <span style={{ fontSize: "0.9rem" }}>{method.label}</span>
                  </CheckboxLabel>
                ))}
              </div>
            </FormSection>

            {/* Home Modification */}
            <FormSection color={theme.colors.success}>
              <SectionTitle>➤ Home Modification</SectionTitle>
              <FormGroup>
                <TextArea
                  name="homeModification"
                  value={formData.homeModification}
                  onChange={handleChange}
                  placeholder="Enter home modification details..."
                  rows={4}
                />
              </FormGroup>
            </FormSection>

            {/* Parenting Modifications */}
            <FormSection color={theme.colors.error}>
              <SectionTitle>➤ Parenting Modifications</SectionTitle>
              <FormGroup>
                <TextArea
                  name="parentingModifications"
                  value={formData.parentingModifications}
                  onChange={handleChange}
                  placeholder="Enter parenting modifications..."
                  rows={4}
                />
              </FormGroup>
            </FormSection>

            {/* Save Button */}
            <ButtonsContainer>
              <Button onClick={handleSubmit}>
                <Save size={20} />
                Post Assessment
              </Button>
            </ButtonsContainer>
          </>
        )}
      </PageContainer>
    </ThemeProvider>
  )
}
