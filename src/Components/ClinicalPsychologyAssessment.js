import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
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

const FormSelect = styled.select`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  font-size: 0.95rem;
  background-color: white;
  height: 40px;
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

const parseDevSkillValue = (val) => {
  if (!val) return { option: "", detail: "" };
  const strVal = String(val);
  if (strVal.startsWith("Developed - ")) {
    return { option: "Developed", detail: strVal.substring(12) };
  }
  if (strVal === "Developed") {
    return { option: "Developed", detail: "" };
  }
  if (strVal.startsWith("Partially Developed - ")) {
    return { option: "Partially Developed", detail: strVal.substring(22) };
  }
  if (strVal === "Partially Developed") {
    return { option: "Partially Developed", detail: "" };
  }
  return { option: "", detail: strVal };
};

export default function ClinicalPsychologyAssessment() {
  const location = useLocation()
  const navigate = useNavigate()
  const editRecord = location.state?.editRecord
  const isEdit = !!editRecord

  const [patientList, setPatientList] = useState([])
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [showForm, setShowForm] = useState(false)
  const [dbOptions, setDbOptions] = useState([])

  const [formData, setFormData] = useState({
    id: "",
    registrationNumber: "",
    patientName: "",
    date: new Date().toISOString().split("T")[0],
    clinicalPsychology: "",
    communication: "",
    dailyLivingSkill: "",
    socialSkill: "",
    cognition: "",
    fineGrossMotor: "",
    testAdministration: [{ key: "", value: "", isCustom: false }],
    behavioralObservation: "",
    testInterpretation: {},
    summary: "",
    impression: "",
    recommendation: "",
    notes: "",
  })

  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL || ""

  const fetchDbOptions = async () => {
    try {
      const response = await apiRequest(`${Milestonebaseurl}behavioral-observation-options/`, "GET")
      if (response.success && Array.isArray(response.data)) {
        setDbOptions(response.data.map(opt => opt.name))
      }
    } catch (err) {
      console.error("Failed to fetch behavioral observation options:", err)
    }
  }

  useEffect(() => {
    fetchDbOptions()
  }, [])

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
      const gt = parseJSON(editRecord.general_temperament) || {}
      const bo = parseJSON(editRecord.behavioral_observation) || []
      const au = parseJSON(editRecord.assessments_used) || {}
      const defaultAssessments = [
        "Binet Kamat Test of Intelligence (BKT)",
        "Vineland Social Maturity Scale (VSMS)",
        "Developmental Screening Test (DST)",
        "Childhood Autism Rating Scale - Second Edition (CARS-2)",
        "Modified Checklist for Autism in Toddlers (M-CHAT)",
        "ISAA (Indian Scale for Assessment of Autism)",
        "Seguin Form Board Test (SFBT)",
        "ADHD Assessment"
      ]

      const boStr = bo && typeof bo === "object" && "notes" in bo
        ? bo.notes
        : (typeof bo === "string" ? bo : (Array.isArray(bo) ? bo.map(item => `${item.key}: ${item.value}`).join("\n") : ""))

      const ta = au.test_administration
      const mappedTa = Array.isArray(ta) && ta.length > 0
        ? ta.map(item => ({
            ...item,
            isCustom: !defaultAssessments.includes(item.key) && !dbOptions.includes(item.key) && item.key !== ""
          }))
        : (ta ? [{ key: "Test Details", value: ta, isCustom: true }] : [{ key: "", value: "", isCustom: false }])
      
      setFormData({
        id: editRecord.id || editRecord._id || "",
        registrationNumber: editRecord.registrationNumber || "",
        patientName: editRecord.patientName || "",
        date: editRecord.assessment_date ? new Date(editRecord.assessment_date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        clinicalPsychology: gt.clinical_psychology || "",
        communication: gt.communication || "",
        dailyLivingSkill: gt.daily_living_skill || "",
        socialSkill: gt.social_skill || "",
        cognition: gt.cognition || "",
        fineGrossMotor: gt.fine_gross_motor || "",
        testAdministration: mappedTa,
        behavioralObservation: boStr,
        testInterpretation: au.test_interpretation || {},
        summary: au.summary || "",
        impression: editRecord.impression || "",
        recommendation: editRecord.recommendation || "",
        notes: editRecord.notes || "",
      })
      setShowForm(true)
    }
  }, [editRecord, dbOptions])

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
    if (isEdit) {
      navigate("/ClinicalPsychologyReport")
    }
  }

  const handleTestAdministrationChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.testAdministration]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, testAdministration: updated }
    })
  }

  const addTestAdministration = () => {
    setFormData((prev) => ({
      ...prev,
      testAdministration: [...prev.testAdministration, { key: "", value: "", isCustom: false }],
    }))
  }

  const removeTestAdministration = (index) => {
    setFormData((prev) => ({
      ...prev,
      testAdministration: prev.testAdministration.filter((_, idx) => idx !== index),
    }))
  }

  const handleSaveCustomOption = async (index, name) => {
    if (!name || name.trim() === "") {
      toast.warn("Please enter a valid option name.")
      return
    }
    try {
      const response = await apiRequest(`${Milestonebaseurl}behavioral-observation-options/`, "POST", { name })
      if (response.success) {
        toast.success("Option saved to database successfully!")
        await fetchDbOptions()
        setFormData((prev) => {
          const updated = [...prev.testAdministration]
          updated[index] = { ...updated[index], key: name, isCustom: false }
          return { ...prev, testAdministration: updated }
        })
      } else {
        toast.error(response.error || "Failed to save option.")
      }
    } catch (err) {
      console.error("Error saving option:", err)
      toast.error("Failed to save option.")
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
        behaviour_problems: [],
        general_temperament: {
          clinical_psychology: formData.clinicalPsychology,
          communication: formData.communication,
          daily_living_skill: formData.dailyLivingSkill,
          social_skill: formData.socialSkill,
          cognition: formData.cognition,
          fine_gross_motor: formData.fineGrossMotor,
        },
        behavioral_observation: { notes: formData.behavioralObservation },
        assessments_used: {
          test_administration: formData.testAdministration.map(ta => ({ key: ta.key, value: ta.value })),
          test_interpretation: formData.testInterpretation,
          summary: formData.summary,
        },
        impression: formData.impression,
        recommendation: formData.recommendation,
        notes: formData.notes,
      }

      if (isEdit) {
        payload.id = formData.id || editRecord?.id || editRecord?._id || ""
      }

      const url = `${Milestonebaseurl}clinical/`
      const method = isEdit ? "PUT" : "POST"

      const response = await apiRequest(url, method, payload)

      if (response.success) {
        toast.success(isEdit ? "Clinical Psychology Assessment updated successfully!" : "Clinical Psychology Assessment saved successfully!")

        setFormData({
          id: "",
          registrationNumber: "",
          patientName: "",
          date: new Date().toISOString().split("T")[0],
          clinicalPsychology: "",
          communication: "",
          dailyLivingSkill: "",
          socialSkill: "",
          cognition: "",
          fineGrossMotor: "",
          testAdministration: [{ key: "", value: "", isCustom: false }],
          behavioralObservation: "",
          testInterpretation: {},
          summary: "",
          impression: "",
          recommendation: "",
          notes: "",
        })

        setShowForm(false)
        if (isEdit) {
          navigate("/ClinicalPsychologyReport")
        }
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

              <FormSection color={theme.colors.info}>
                <SectionTitle>Clinical Psychology Domains</SectionTitle>
                <FormGroup>
                  <FormLabel>Clinical Psychology Notes / General Evaluation</FormLabel>
                  <TextArea
                    name="clinicalPsychology"
                    value={formData.clinicalPsychology}
                    onChange={handleChange}
                    placeholder="Enter Clinical Psychology notes..."
                    style={{ minHeight: "100px" }}
                  />
                </FormGroup>

                <h4 style={{ color: theme.colors.text, marginTop: theme.spacing.md, marginBottom: theme.spacing.sm }}>Developmental Skills (Developed / Partially Developed)</h4>
                {[
                  { field: "communication", label: "Communication" },
                  { field: "dailyLivingSkill", label: "Daily Living Skill" },
                  { field: "socialSkill", label: "Social Skill" },
                  { field: "cognition", label: "Cognition" },
                  { field: "fineGrossMotor", label: "Fine Motor & Gross Motor" }
                ].map((item) => {
                  const { option, detail } = parseDevSkillValue(formData[item.field]);
                  return (
                    <FormGroup key={item.field} style={{ borderBottom: "1px solid " + theme.colors.borderLight, paddingBottom: theme.spacing.sm }}>
                      <FormLabel>{item.label}</FormLabel>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.md, alignItems: "center" }}>
                        <RadioGroup style={{ marginBottom: 0 }}>
                          {["Developed", "Partially Developed"].map((optionName) => (
                            <RadioLabel key={optionName} style={{ margin: 0, marginRight: theme.spacing.md }}>
                              <input
                                type="radio"
                                name={item.field}
                                value={optionName}
                                checked={option === optionName}
                                onChange={(e) => {
                                  const nextOption = e.target.value;
                                  const nextValue = nextOption + (detail ? " - " + detail : "");
                                  setFormData((prev) => ({ ...prev, [item.field]: nextValue }));
                                }}
                              />
                              {optionName}
                            </RadioLabel>
                          ))}
                        </RadioGroup>
                        <FormInput
                          type="text"
                          placeholder="Specify details / notes..."
                          value={detail}
                          onChange={(e) => {
                            const nextDetail = e.target.value;
                            const nextValue = (option ? option + " - " : "") + nextDetail;
                            setFormData((prev) => ({ ...prev, [item.field]: nextValue }));
                          }}
                          style={{ flex: 1, minWidth: "250px" }}
                        />
                      </div>
                    </FormGroup>
                  );
                })}
              </FormSection>

              <FormSection color={theme.colors.success}>
                <SectionTitle>Behavioral Observation & Assessments</SectionTitle>
                <FormGroup>
                  <TextArea
                    name="behavioralObservation"
                    value={formData.behavioralObservation}
                    onChange={handleChange}
                    placeholder="Enter behavioral observations details..."
                    style={{ minHeight: "120px" }}
                  />
                </FormGroup>
              </FormSection>

              <FormSection color={theme.colors.accent}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.sm }}>
                  <SectionTitle style={{ margin: 0 }}>Test Administration</SectionTitle>
                  <button 
                    type="button" 
                    onClick={addTestAdministration}
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
                {formData.testAdministration?.map((assessment, index) => {
                  const showTextInput = assessment.isCustom || (!dbOptions.includes(assessment.key) && assessment.key !== "");
                  return (
                    <div key={index} style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing.md, marginBottom: theme.spacing.md, alignItems: "flex-end", borderBottom: "1px solid #cbd5e1", paddingBottom: theme.spacing.md }}>
                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <FormLabel>Assessment Name</FormLabel>
                        <FormSelect
                          value={assessment.isCustom ? "custom" : (dbOptions.includes(assessment.key) ? assessment.key : (assessment.key ? "custom" : ""))}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => {
                              const updated = [...prev.testAdministration]
                              if (val === "custom") {
                                updated[index] = { ...updated[index], isCustom: true, key: "" }
                              } else {
                                updated[index] = { ...updated[index], isCustom: false, key: val }
                              }
                              return { ...prev, testAdministration: updated }
                            })
                          }}
                        >
                          <option value="">Select Assessment...</option>
                          {dbOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                          <option value="custom">-- Add Custom Option --</option>
                        </FormSelect>
                      </div>

                      {showTextInput && (
                        <div style={{ flex: 1, minWidth: "200px", display: "flex", gap: "8px", alignItems: "flex-end" }}>
                          <div style={{ flex: 1 }}>
                            <FormLabel>Enter Custom Name</FormLabel>
                            <FormInput
                              type="text"
                              value={assessment.key || ""}
                              onChange={(e) => handleTestAdministrationChange(index, "key", e.target.value)}
                              placeholder="e.g., CARS-2, DST"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSaveCustomOption(index, assessment.key)}
                            style={{
                              padding: "10px 14px",
                              backgroundColor: theme.colors.secondary,
                              color: "white",
                              border: "none",
                              borderRadius: theme.borderRadius.small,
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                              height: "40px"
                            }}
                          >
                            Save to DB
                          </button>
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: "200px" }}>
                        <FormLabel>Score / Observations</FormLabel>
                        <FormInput
                          type="text"
                          value={assessment.value || ""}
                          onChange={(e) => handleTestAdministrationChange(index, "value", e.target.value)}
                          placeholder="Score/observations..."
                        />
                      </div>
                      
                      {formData.testAdministration.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestAdministration(index)}
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
                  );
                })}
              </FormSection>

              <FormSection color={theme.colors.info}>
                <SectionTitle>Test Interpretation</SectionTitle>
                {(() => {
                  const selectedAssessments = formData.testAdministration?.map(a => a.key).filter(Boolean) || [];
                  const isLegacy = typeof formData.testInterpretation === "string";

                  return (
                    <>
                      {selectedAssessments.map((name) => (
                        <FormGroup key={name}>
                          <FormLabel>Interpretation for <strong>{name}</strong></FormLabel>
                          <TextArea
                            value={(!isLegacy && formData.testInterpretation?.[name]) || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                testInterpretation: {
                                  ...(typeof prev.testInterpretation === "object" ? prev.testInterpretation : {}),
                                  [name]: val
                                }
                              }));
                            }}
                            placeholder={`Enter interpretation for ${name}...`}
                            style={{ minHeight: "80px" }}
                          />
                        </FormGroup>
                      ))}

                      {(selectedAssessments.length === 0 || isLegacy) && (
                        <FormGroup>
                          <FormLabel>{isLegacy ? "General / Legacy Interpretation" : "General Interpretation"}</FormLabel>
                          <TextArea
                            name="testInterpretation"
                            value={isLegacy ? formData.testInterpretation : (formData.testInterpretation?.general || "")}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (isLegacy) {
                                setFormData(prev => ({ ...prev, testInterpretation: val }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  testInterpretation: {
                                    ...prev.testInterpretation,
                                    general: val
                                  }
                                }));
                              }
                            }}
                            placeholder="Enter general interpretation details..."
                            style={{ minHeight: "100px" }}
                          />
                        </FormGroup>
                      )}
                    </>
                  );
                })()}
              </FormSection>

              <FormSection color={theme.colors.accent}>
                <SectionTitle>Summary</SectionTitle>
                <FormGroup>
                  <TextArea
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    placeholder="Enter summary..."
                    style={{ minHeight: "120px" }}
                  />
                </FormGroup>
              </FormSection>

              <FormSection color={theme.colors.success}>
                <SectionTitle>Impression</SectionTitle>
                <FormGroup>
                  <TextArea
                    name="impression"
                    value={formData.impression}
                    onChange={handleChange}
                    placeholder="Enter impression..."
                    style={{ minHeight: "120px" }}
                  />
                </FormGroup>
              </FormSection>

              <FormSection color={theme.colors.warning}>
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