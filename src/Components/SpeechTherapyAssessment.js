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
  gap: ${theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  input {
    margin-right: 6px;
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

export default function SpeechAssessment() {
  const location = useLocation()
  const navigate = useNavigate()
  const editRecord = location.state?.editRecord
  const isEdit = !!editRecord

  const [patientList, setPatientList] = useState([])
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    id: "",
    registrationNumber: "",
    patientName: "",
    date: new Date().toISOString().split("T")[0],

    oralMechanism: {
      lips: { appearance: "", function: "" },
      teeth: { appearance: "", function: "" },
      alveolus: { appearance: "" },
      tongue: { appearance: "", function: "" },
      hardPalate: { appearance: "" },
      softPalate: { appearance: "", function: "" },
      uvula: { appearance: "" },
      jaw: { appearance: "", function: "" },
    },
    oralImpression: "",

    vegetativeSkills: {
      sucking: { selected: false, notes: "" },
      swallowing: { selected: false, notes: "" },
      chewing: { selected: false, notes: "" },
      biting: { selected: false, notes: "" },
      blowing: { selected: false, notes: "" },
      drooling: { selected: false, notes: "" },
    },

    respiration: "",
    phonation: "",
    articulation: "",
    fluency: "",
    prosody: "",

    receptionMode: "",
    expressionMode: "",

    phonologicalSkills: "",
    morphoSyntacticSkills: "",
    semanticSkills: "",
    pragmaticSkills: "",

    articulationAssessment: "",
    otherAssessment: "",

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
      const sp = parseJSON(editRecord.speech_parameters) || {}
      const lp = parseJSON(editRecord.linguistic_profile) || {}
      const au = parseJSON(editRecord.assessments_used) || {}
      setFormData({
        id: editRecord.id || editRecord._id || "",
        registrationNumber: editRecord.registrationNumber || "",
        patientName: editRecord.patientName || "",
        date: editRecord.assessment_date ? new Date(editRecord.assessment_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],

        oralMechanism: parseJSON(editRecord.oral_peripheral_mechanism) || {
          lips: { appearance: "", function: "" },
          teeth: { appearance: "", function: "" },
          alveolus: { appearance: "" },
          tongue: { appearance: "", function: "" },
          hardPalate: { appearance: "" },
          softPalate: { appearance: "", function: "" },
          uvula: { appearance: "" },
          jaw: { appearance: "", function: "" },
        },
        oralImpression: editRecord.oral_impression || "",

        vegetativeSkills: parseJSON(editRecord.vegetative_skills) || {
          sucking: { selected: false, notes: "" },
          swallowing: { selected: false, notes: "" },
          chewing: { selected: false, notes: "" },
          biting: { selected: false, notes: "" },
          blowing: { selected: false, notes: "" },
          drooling: { selected: false, notes: "" },
        },

        respiration: sp.respiration || "",
        phonation: sp.phonation || "",
        articulation: sp.articulation || "",
        fluency: sp.fluency || "",
        prosody: sp.prosody || "",

        receptionMode: parseJSON(editRecord.communication_profile)?.reception || "",
        expressionMode: parseJSON(editRecord.communication_profile)?.expression || "",

        phonologicalSkills: lp.phonologicalSkills || "",
        morphoSyntacticSkills: lp.morphoSyntacticSkills || "",
        semanticSkills: lp.semanticSkills || "",
        pragmaticSkills: lp.pragmaticSkills || "",

        articulationAssessment: au.articulation || "",
        otherAssessment: au.other || "",

        impression: editRecord.impression || "",
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

    const url = `${Milestonebaseurl}get_speech_patients/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`

    const result = await apiRequest(url, "GET")

    if (result.success) {
      const data = result.data
      console.log("Full API Response:", data)

      let patients = []

      if (Array.isArray(data)) {
        patients = data
      } else if (data.result && Array.isArray(data.result)) {
        patients = data.result
      } else if (data.speechPatients && Array.isArray(data.speechPatients)) {
        patients = data.speechPatients
      } else if (data.speechPatients && Array.isArray(data.speechPatients)) {
        patients = data.speechPatients
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
      navigate("/SpeechTherapyReport")
    }
  }

  const handleOralMechanismChange = (structure, field, value) => {
    setFormData((prev) => ({
      ...prev,
      oralMechanism: {
        ...prev.oralMechanism,
        [structure]: {
          ...prev.oralMechanism[structure],
          [field]: value,
        },
      },
    }))
  }

  const handleVegetativeChange = (skill, field, value) => {
    setFormData((prev) => ({
      ...prev,
      vegetativeSkills: {
        ...prev.vegetativeSkills,
        [skill]: {
          ...prev.vegetativeSkills[skill],
          [field]: value,
        },
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

      oral_peripheral_mechanism: formData.oralMechanism,
      oral_impression: formData.oralImpression,
      vegetative_skills: formData.vegetativeSkills,

      speech_parameters: {
        respiration: formData.respiration,
        phonation: formData.phonation,
        articulation: formData.articulation,
        fluency: formData.fluency,
        prosody: formData.prosody,
      },

      communication_profile: {
        reception: formData.receptionMode,
        expression: formData.expressionMode,
      },

      linguistic_profile: {
        phonologicalSkills: formData.phonologicalSkills,
        morphoSyntacticSkills: formData.morphoSyntacticSkills,
        semanticSkills: formData.semanticSkills,
        pragmaticSkills: formData.pragmaticSkills,
      },

      assessments_used: {
        articulation: formData.articulationAssessment,
        other: formData.otherAssessment,
      },

      impression: formData.impression,
      recommendation: formData.recommendation,
      notes: formData.notes,
    }

    if (isEdit) {
      payload.id = formData.id || editRecord?.id || editRecord?._id || ""
    }

    const url = `${Milestonebaseurl}speech/`
    const method = isEdit ? "PUT" : "POST"

    const response = await apiRequest(url, method, payload)

    if (response.success) {
      toast.success(isEdit ? "Speech Therapy Assessment updated successfully!" : "Speech Therapy Assessment saved successfully!")

      setFormData({
        registrationNumber: "",
        patientName: "",
        date: new Date().toISOString().split("T")[0],
        oralMechanism: {
          lips: { appearance: "", function: "" },
          teeth: { appearance: "", function: "" },
          alveolus: { appearance: "" },
          tongue: { appearance: "", function: "" },
          hardPalate: { appearance: "" },
          softPalate: { appearance: "", function: "" },
          uvula: { appearance: "" },
          jaw: { appearance: "", function: "" },
        },
        oralImpression: "",
        vegetativeSkills: {
          sucking: { selected: false, notes: "" },
          swallowing: { selected: false, notes: "" },
          chewing: { selected: false, notes: "" },
          biting: { selected: false, notes: "" },
          blowing: { selected: false, notes: "" },
          drooling: { selected: false, notes: "" },
        },
        respiration: "",
        phonation: "",
        articulation: "",
        fluency: "",
        prosody: "",
        receptionMode: "",
        expressionMode: "",
        phonologicalSkills: "",
        morphoSyntacticSkills: "",
        semanticSkills: "",
        pragmaticSkills: "",
        articulationAssessment: "",
        otherAssessment: "",
        impression: "",
        recommendation: "",
        notes: "",
      })

      setShowForm(false)
      if (isEdit) {
        navigate("/SpeechTherapyReport")
      }
    } else {
      toast.error(response.error || "Assessment could not be saved")
    }
  } catch (error) {
    toast.error("Failed to save assessment")
    console.error(error)
  }
}

  const oralStructures = [
    {
      key: "lips",
      label: "Lips",
      appearances: ["Normal", "Asymmetrical", "Cleft", "Repaired"],
      functions: ["Pursing", "Puckering", "Rounding", "Spreading"],
    },
    {
      key: "teeth",
      label: "Teeth",
      appearances: ["Normal", "Missing", "Malaligned"],
      functions: ["Biting", "Chewing"],
    },
    { key: "alveolus", label: "Alveolus", appearances: ["Normal", "Cleft", "Repaired", "Fistula"], functions: [] },
    {
      key: "tongue",
      label: "Tongue",
      appearances: ["Normal", "Asymmetrical", "Microglossia", "Macroglossia", "Ankyloglossia"],
      functions: ["Protrusion", "Retraction", "Lateralization", "Elevation"],
    },
    {
      key: "hardPalate",
      label: "Hard Palate",
      appearances: ["Normal", "Cleft", "Repaired", "Fistula", "Submucous cleft"],
      functions: [],
    },
    {
      key: "softPalate",
      label: "Soft Palate",
      appearances: ["Normal", "Cleft", "Repaired", "Fistula"],
      functions: ["Adequate", "Inadequate"],
    },
    { key: "uvula", label: "Uvula", appearances: ["Normal", "Asymmetrical", "Bifid", "Short"], functions: [] },
    { key: "jaw", label: "Jaw", appearances: ["Normal", "Asymmetrical"], functions: ["Adequate", "Inadequate"] },
  ]

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <PageHeader>
          <PageTitle>Speech Therapy Assessment System</PageTitle>
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
                  <FormInput
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Patient Name</FormLabel>
                  <FormInput type="text" name="patientName" value={formData.patientName} onChange={handleChange} required />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Assessment Date</FormLabel>
                  <FormInput type="date" name="date" value={formData.date} onChange={handleChange} required />
                </FormGroup>
              </FormRow>
            </FormSection>

            <FormSection color={theme.colors.info}>
              <SectionTitle>Oral Peripheral Mechanism Examination</SectionTitle>
              <table>
                <thead>
                  <tr>
                    <th>Structure</th>
                    <th>Appearance</th>
                    <th>Function</th>
                  </tr>
                </thead>
                <tbody>
                  {oralStructures.map((structure) => (
                    <tr key={structure.key}>
                      <td>
                        <strong>{structure.label}</strong>
                      </td>
                      <td>
                        <Select
                          value={formData.oralMechanism[structure.key].appearance}
                          onChange={(e) => handleOralMechanismChange(structure.key, "appearance", e.target.value)}
                        >
                          <option value="">Select...</option>
                          {structure.appearances.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td>
                        {structure.functions.length > 0 ? (
                          <Select
                            value={formData.oralMechanism[structure.key].function}
                            onChange={(e) => handleOralMechanismChange(structure.key, "function", e.target.value)}
                          >
                            <option value="">Select...</option>
                            {structure.functions.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <span style={{ color: theme.colors.textLight }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <FormGroup>
                <FormLabel>Oral Impression</FormLabel>
                <TextArea
                  name="oralImpression"
                  value={formData.oralImpression}
                  onChange={handleChange}
                  placeholder="Enter impression notes..."
                />
              </FormGroup>
            </FormSection>

            <FormSection color={theme.colors.success}>
              <SectionTitle>Vegetative Skills</SectionTitle>
              {Object.keys(formData.vegetativeSkills).map((skill) => (
                <div key={skill} style={{ marginBottom: theme.spacing.md }}>
                  <CheckboxLabel>
                    <Checkbox
                      type="checkbox"
                      checked={formData.vegetativeSkills[skill].selected}
                      onChange={(e) => handleVegetativeChange(skill, "selected", e.target.checked)}
                    />
                    <strong style={{ textTransform: "capitalize" }}>{skill}</strong>
                  </CheckboxLabel>
                  {formData.vegetativeSkills[skill].selected && (
                    <FormGroup style={{ marginLeft: "28px" }}>
                      <FormLabel>Notes</FormLabel>
                      <TextArea
                        value={formData.vegetativeSkills[skill].notes}
                        onChange={(e) => handleVegetativeChange(skill, "notes", e.target.value)}
                        placeholder={`Notes for ${skill}...`}
                        rows={2}
                      />
                    </FormGroup>
                  )}
                </div>
              ))}
            </FormSection>

            <FormSection color={theme.colors.accent}>
              <SectionTitle>Communication Profile</SectionTitle>
              <FormRow>
                <FormGroup>
                  <FormLabel>Reception Mode</FormLabel>
                  <TextArea
                    name="receptionMode"
                    value={formData.receptionMode}
                    onChange={handleChange}
                    placeholder="Mode of reception..."
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Expression Mode</FormLabel>
                  <TextArea
                    name="expressionMode"
                    value={formData.expressionMode}
                    onChange={handleChange}
                    placeholder="Mode of expression..."
                  />
                </FormGroup>
              </FormRow>
            </FormSection>

            <FormSection color={theme.colors.secondary}>
              <SectionTitle>Assessments Used</SectionTitle>
              <FormGroup>
                <FormLabel>Articulation Assessment</FormLabel>
                <TextArea name="articulationAssessment" value={formData.articulationAssessment} onChange={handleChange} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Any Other Assessment</FormLabel>
                <TextArea name="otherAssessment" value={formData.otherAssessment} onChange={handleChange} />
              </FormGroup>
            </FormSection>

            <FormSection color={theme.colors.accent}>
              <SectionTitle>Impression</SectionTitle>
              <FormGroup>
                <TextArea
                  name="impression"
                  value={formData.impression}
                  onChange={handleChange}
                  placeholder="Enter clinical impression..."
                  style={{ minHeight: "120px" }}
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