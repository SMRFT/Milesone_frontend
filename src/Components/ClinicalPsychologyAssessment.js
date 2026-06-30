import { useState, useEffect } from "react"
import styled from "styled-components"
import { ThemeProvider } from "styled-components"
import { Save, ArrowLeft } from "lucide-react"
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

export default function ClinicalPsychologyAssessment() {
  const [patientList, setPatientList] = useState([])
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    registrationNumber: "",
    patientName: "",
    date: new Date().toISOString().split("T")[0],
    
    behaviourProblems: [],
    
    generalTemperament: {
      activityLevel: "",
      attentionSpan: "",
      approachOrAvoidance: "",
      adaptability: "",
      distractibility: "",
      intensityOrReaction: "",
      thresholdOrResponsiveness: "",
      qualityOfMood: "",
      rhythmicBiologicalFunctions: "",
    },
    
    behavioralObservation: {
      generalAssessment: "",
      communicationComprehension: "",
      emotionalityBehaviour: "",
      socialSkillsPeerRelationship: "",
      cognition: "",
      fineGrossMotorDevelopment: "",
    },
    
    assessmentsUsed: {
      dst: { da: "", dq: "" },
      vsms: { sa: "", sq: "" },
      sfbt: { ma: "", iq: "" },
      adhd: "",
      isaa: "",
      otherAssessments: [{ key: "", value: "" }],
    },
    
    impression: "",
    notes: "",
  })

  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL || ""

  const behaviourProblemOptions = [
    "Temper Tantrums",
    "Thumb Sucking",
    "Nail Biting",
    "Stuttering",
    "Nightmares",
    "Night Terrors",
    "Bedwetting",
    "Lying",
    "Truancy",
    "Stealing",
    "Destructiveness",
    "Fire Setting",
  ]

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

    const url = `${Milestonebaseurl}get_psychological_patients/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`

    const result = await apiRequest(url, "GET")

    if (result.success) {
      const data = result.data
      console.log("Full API Response:", data)

      let patients = []

      if (Array.isArray(data)) {
        patients = data
      } else if (data.result && Array.isArray(data.result)) {
        patients = data.result
      } else if (data.psychologicalPatients && Array.isArray(data.psychologicalPatients)) {
        patients = data.psychologicalPatients
      } else if (data.PsychologicalPatients && Array.isArray(data.PsychologicalPatients)) {
        patients = data.PsychologicalPatients
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

  const handleAssessmentChange = (test, field, value) => {
    setFormData((prev) => ({
      ...prev,
      assessmentsUsed: {
        ...prev.assessmentsUsed,
        [test]: typeof prev.assessmentsUsed[test] === 'object' 
          ? { ...prev.assessmentsUsed[test], [field]: value }
          : value,
      },
    }))
  }

  const handleOtherAssessmentChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedOthers = [...prev.assessmentsUsed.otherAssessments];
      updatedOthers[index] = { ...updatedOthers[index], [field]: value };
      return {
        ...prev,
        assessmentsUsed: {
          ...prev.assessmentsUsed,
          otherAssessments: updatedOthers
        }
      };
    });
  }

  const addOtherAssessment = () => {
    setFormData((prev) => ({
      ...prev,
      assessmentsUsed: {
        ...prev.assessmentsUsed,
        otherAssessments: [...prev.assessmentsUsed.otherAssessments, { key: "", value: "" }]
      }
    }));
  }

  const removeOtherAssessment = (index) => {
    setFormData((prev) => ({
      ...prev,
      assessmentsUsed: {
        ...prev.assessmentsUsed,
        otherAssessments: prev.assessmentsUsed.otherAssessments.filter((_, idx) => idx !== index)
      }
    }));
  }

  const handleBehaviourChange = (value, checked) => {
    setFormData((prev) => ({
      ...prev,
      behaviourProblems: checked
        ? [...prev.behaviourProblems, value]
        : prev.behaviourProblems.filter((item) => item !== value),
    }))
  }

  const handleOtherBehaviourChange = (value) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        behaviourProblems: [...new Set([...prev.behaviourProblems.filter(p => !behaviourProblemOptions.includes(p)), value])],
      }))
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

const handleSubmit = async (e) => {
  e.preventDefault()

  try {
    const payload = {
      registrationNumber: formData.registrationNumber,
      patientName: formData.patientName,
      assessment_date: formData.date,
      behaviour_problems: formData.behaviourProblems,
      general_temperament: formData.generalTemperament,
      behavioral_observation: formData.behavioralObservation,
      assessments_used: formData.assessmentsUsed,
      impression: formData.impression,
      notes: formData.notes,
    }

    const response = await apiRequest(
      `${Milestonebaseurl}clinical/`,
      "POST",
      payload
    )

    if (response.success) {
      toast.success("Clinical Psychology Assessment saved successfully!")

      setFormData({
        registrationNumber: "",
        patientName: "",
        date: new Date().toISOString().split("T")[0],
        behaviourProblems: [],
        generalTemperament: {
          activityLevel: "",
          attentionSpan: "",
          approachOrAvoidance: "",
          adaptability: "",
          distractibility: "",
          intensityOrReaction: "",
          thresholdOrResponsiveness: "",
          qualityOfMood: "",
          rhythmicBiologicalFunctions: "",
        },
        behavioralObservation: {
          generalAssessment: "",
          communicationComprehension: "",
          emotionalityBehaviour: "",
          socialSkillsPeerRelationship: "",
          cognition: "",
          fineGrossMotorDevelopment: "",
        },
        assessmentsUsed: {
          dst: { da: "", dq: "" },
          vsms: { sa: "", sq: "" },
          sfbt: { ma: "", iq: "" },
          adhd: "",
          isaa: "",
          otherAssessments: [{ key: "", value: "" }],
        },
        impression: "",
        notes: "",
      })

      setShowForm(false)
    } else {
      toast.error(response.error || "Assessment could not be saved. Please try again.")
    }
  } catch (error) {
    console.error("Error:", error)
    toast.error("Error saving assessment")
  }
}

  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <PageHeader>
          <PageTitle>Clinical Psychology Assessment System</PageTitle>
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
                      <PatientCardTitle>{patient.patient_name || patient.patientName || "N/A"}</PatientCardTitle>
                      <PatientCardInfo>
                        <span>Reg. No:</span> {patient.registration_number || patient.registrationNumber || "N/A"}
                      </PatientCardInfo>
                      <PatientCardInfo>
                        <span>Date:</span> {patient.date ? new Date(patient.date).toLocaleDateString() : "N/A"}
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
              Back to Patient List
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
                    <FormInput
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Assessment Date</FormLabel>
                    <FormInput type="date" name="date" value={formData.date} onChange={handleChange} required />
                  </FormGroup>
                </FormRow>
              </FormSection>

              <FormSection color={theme.colors.error}>
                <SectionTitle>Behaviour Problems</SectionTitle>
                <CheckboxGroup>
                  {behaviourProblemOptions.map((problem) => (
                    <CheckboxLabel key={problem}>
                      <Checkbox
                        type="checkbox"
                        value={problem}
                        checked={formData.behaviourProblems.includes(problem)}
                        onChange={(e) => handleBehaviourChange(problem, e.target.checked)}
                      />
                      {problem}
                    </CheckboxLabel>
                  ))}
                </CheckboxGroup>
                <FormGroup style={{ marginTop: theme.spacing.md }}>
                  <FormLabel>Other Behaviour Problems (press Enter to add)</FormLabel>
                  <FormInput
                    type="text"
                    placeholder="Type and press Enter to add"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleOtherBehaviourChange(e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  {formData.behaviourProblems.filter(p => !behaviourProblemOptions.includes(p)).length > 0 && (
                    <div style={{ marginTop: theme.spacing.sm, fontSize: "0.9rem" }}>
                      <strong>Added:</strong> {formData.behaviourProblems.filter(p => !behaviourProblemOptions.includes(p)).join(", ")}
                    </div>
                  )}
                </FormGroup>
              </FormSection>

              <FormSection color={theme.colors.info}>
                <SectionTitle>General Temperament</SectionTitle>
                <FormRow>
                  <FormGroup>
                    <FormLabel>Activity Level</FormLabel>
                    <TextArea
                      value={formData.generalTemperament.activityLevel}
                      onChange={(e) => handleNestedChange("generalTemperament", "activityLevel", e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Attention Span & Persistence</FormLabel>
                    <TextArea
                      value={formData.generalTemperament.attentionSpan}
                      onChange={(e) => handleNestedChange("generalTemperament", "attentionSpan", e.target.value)}
                    />
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <FormLabel>Approach or Avoidance</FormLabel>
                    <TextArea
                      value={formData.generalTemperament.approachOrAvoidance}
                      onChange={(e) => handleNestedChange("generalTemperament", "approachOrAvoidance", e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Adaptability</FormLabel>
                    <TextArea
                      value={formData.generalTemperament.adaptability}
                      onChange={(e) => handleNestedChange("generalTemperament", "adaptability", e.target.value)}
                    />
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <FormLabel>Distractibility</FormLabel>
                    <TextArea
                      value={formData.generalTemperament.distractibility}
                      onChange={(e) => handleNestedChange("generalTemperament", "distractibility", e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Intensity or Reaction</FormLabel>
                    <TextArea
                      value={formData.generalTemperament.intensityOrReaction}
                      onChange={(e) => handleNestedChange("generalTemperament", "intensityOrReaction", e.target.value)}
                    />
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <FormLabel>Threshold or Responsiveness</FormLabel>
                    <TextArea
                      value={formData.generalTemperament.thresholdOrResponsiveness}
                      onChange={(e) => handleNestedChange("generalTemperament", "thresholdOrResponsiveness", e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Quality of Mood</FormLabel>
                    <TextArea
                      value={formData.generalTemperament.qualityOfMood}
                      onChange={(e) => handleNestedChange("generalTemperament", "qualityOfMood", e.target.value)}
                    />
                  </FormGroup>
                </FormRow>
                <FormGroup>
                  <FormLabel>Rhythmic (Regularity) of Biological Functions</FormLabel>
                  <TextArea
                    value={formData.generalTemperament.rhythmicBiologicalFunctions}
                    onChange={(e) => handleNestedChange("generalTemperament", "rhythmicBiologicalFunctions", e.target.value)}
                  />
                </FormGroup>
              </FormSection>

              <FormSection color={theme.colors.success}>
                <SectionTitle>Behavioral Observation & Psychological Evaluation</SectionTitle>
                <FormGroup>
                  <FormLabel>General Behaviour during Assessment</FormLabel>
                  <TextArea
                    value={formData.behavioralObservation.generalAssessment}
                    onChange={(e) => handleNestedChange("behavioralObservation", "generalAssessment", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Communication & Comprehension</FormLabel>
                  <TextArea
                    value={formData.behavioralObservation.communicationComprehension}
                    onChange={(e) => handleNestedChange("behavioralObservation", "communicationComprehension", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Emotionality & Behaviour</FormLabel>
                  <TextArea
                    value={formData.behavioralObservation.emotionalityBehaviour}
                    onChange={(e) => handleNestedChange("behavioralObservation", "emotionalityBehaviour", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Social Skills & Peer Group Relationship</FormLabel>
                  <TextArea
                    value={formData.behavioralObservation.socialSkillsPeerRelationship}
                    onChange={(e) => handleNestedChange("behavioralObservation", "socialSkillsPeerRelationship", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Cognition</FormLabel>
                  <TextArea
                    value={formData.behavioralObservation.cognition}
                    onChange={(e) => handleNestedChange("behavioralObservation", "cognition", e.target.value)}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Fine & Gross Motor Development</FormLabel>
                  <RadioGroup>
                    <RadioLabel>
                      <input
                        type="radio"
                        value="Developed"
                        checked={formData.behavioralObservation.fineGrossMotorDevelopment === "Developed"}
                        onChange={(e) => handleNestedChange("behavioralObservation", "fineGrossMotorDevelopment", e.target.value)}
                      />
                      Developed
                    </RadioLabel>
                    <RadioLabel>
                      <input
                        type="radio"
                        value="Partially Developed"
                        checked={formData.behavioralObservation.fineGrossMotorDevelopment === "Partially Developed"}
                        onChange={(e) => handleNestedChange("behavioralObservation", "fineGrossMotorDevelopment", e.target.value)}
                      />
                      Partially Developed
                    </RadioLabel>
                  </RadioGroup>
                </FormGroup>
              </FormSection>

              <FormSection color={theme.colors.accent}>
                <SectionTitle>Assessments Used</SectionTitle>
                
                <FormGroup>
                  <FormLabel>DST (Developmental Screening Test)</FormLabel>
                  <FormRow>
                    <FormGroup>
                      <FormLabel>DA</FormLabel>
                      <FormInput
                        type="text"
                        value={formData.assessmentsUsed.dst.da}
                        onChange={(e) => handleAssessmentChange("dst", "da", e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel>DQ</FormLabel>
                      <FormInput
                        type="text"
                        value={formData.assessmentsUsed.dst.dq}
                        onChange={(e) => handleAssessmentChange("dst", "dq", e.target.value)}
                      />
                    </FormGroup>
                  </FormRow>
                </FormGroup>

                <FormGroup>
                  <FormLabel>VSMS (Vineland Social Maturity Scale)</FormLabel>
                  <FormRow>
                    <FormGroup>
                      <FormLabel>SA</FormLabel>
                      <FormInput
                        type="text"
                        value={formData.assessmentsUsed.vsms.sa}
                        onChange={(e) => handleAssessmentChange("vsms", "sa", e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel>SQ</FormLabel>
                      <FormInput
                        type="text"
                        value={formData.assessmentsUsed.vsms.sq}
                        onChange={(e) => handleAssessmentChange("vsms", "sq", e.target.value)}
                      />
                    </FormGroup>
                  </FormRow>
                </FormGroup>

                <FormGroup>
                  <FormLabel>SFBT (Seguin Form Board Test)</FormLabel>
                  <FormRow>
                    <FormGroup>
                      <FormLabel>MA</FormLabel>
                      <FormInput
                        type="text"
                        value={formData.assessmentsUsed.sfbt.ma}
                        onChange={(e) => handleAssessmentChange("sfbt", "ma", e.target.value)}
                      />
                    </FormGroup>
                    <FormGroup>
                      <FormLabel>IQ</FormLabel>
                      <FormInput
                        type="text"
                        value={formData.assessmentsUsed.sfbt.iq}
                        onChange={(e) => handleAssessmentChange("sfbt", "iq", e.target.value)}
                      />
                    </FormGroup>
                  </FormRow>
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <FormLabel>ADHD - Total Score Level</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.assessmentsUsed.adhd}
                      onChange={(e) => handleAssessmentChange("adhd", null, e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>ISAA - Total Score Category</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.assessmentsUsed.isaa}
                      onChange={(e) => handleAssessmentChange("isaa", null, e.target.value)}
                    />
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.sm }}>
                    <FormLabel style={{ margin: 0 }}>Other Assessments</FormLabel>
                    <button 
                      type="button" 
                      onClick={addOtherAssessment}
                      style={{ 
                        padding: "6px 12px", 
                        fontSize: "0.85rem",
                        backgroundColor: theme.colors.primary,
                        color: "white",
                        border: "none",
                        borderRadius: theme.borderRadius.small,
                        cursor: "pointer",
                        fontWeight: 500
                      }}
                    >
                      + Add Assessment
                    </button>
                  </div>
                  {formData.assessmentsUsed.otherAssessments?.map((assessment, index) => (
                    <div key={index} style={{ display: "flex", gap: theme.spacing.md, marginBottom: theme.spacing.sm, alignItems: "flex-end" }}>
                      <div style={{ flex: 1 }}>
                        <FormLabel>Key</FormLabel>
                        <FormInput
                          type="text"
                          value={assessment.key || ""}
                          onChange={(e) => handleOtherAssessmentChange(index, "key", e.target.value)}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <FormLabel>Value</FormLabel>
                        <FormInput
                          type="text"
                          value={assessment.value || ""}
                          onChange={(e) => handleOtherAssessmentChange(index, "value", e.target.value)}
                        />
                      </div>
                      {formData.assessmentsUsed.otherAssessments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeOtherAssessment(index)}
                          style={{
                            backgroundColor: theme.colors.error,
                            color: "white",
                            border: "none",
                            borderRadius: theme.borderRadius.small,
                            padding: "8px 16px",
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer"
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
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