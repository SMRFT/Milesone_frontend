"use client"
import { useState , useEffect} from "react"
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

const SENSORY_PROFILE_CONFIG = {
  default: { // 86 box
    seeking: [14, 21, 22, 25, 27, 28, 30, 31, 32, 41, 48, 49, 50, 51, 55, 56, 60, 82, 83],
    avoiding: [1, 2, 5, 15, 18, 58, 59, 61, 63, 64, 65, 66, 67, 68, 70, 71, 72, 74, 75, 81],
    sensitivity: [3, 4, 6, 7, 9, 13, 16, 19, 20, 44, 45, 46, 47, 52, 69, 73, 77, 78, 84],
    registration: [8, 12, 23, 24, 26, 33, 34, 35, 36, 37, 38, 39, 40, 53, 54, 57, 62, 76, 79, 80, 85, 86]
  },
  toddler: { // 54 box (7m to 35m)
    seeking: [18, 19, 20, 32, 36, 37, 38],
    avoiding: [3, 10, 27, 28, 29, 33, 35, 42, 49, 53, 54],
    sensitivity: [1, 2, 13, 16, 26, 31, 34, 39, 41, 44, 46, 48, 52],
    registration: [9, 11, 12, 14, 15, 23, 24, 25, 30, 40, 45]
  }
};

const calculateQuadrantTotal = (scores, itemNumbers) => {
  return itemNumbers.reduce((sum, itemNum) => {
    const val = parseInt(scores[itemNum], 10);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
};

const SensoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SensoryColumn = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  background-color: white;
`;

const ColumnHeader = styled.div`
  background-color: ${props => props.bgColor};
  color: white;
  padding: 10px;
  font-weight: 700;
  text-align: center;
  font-size: 0.95rem;
`;

const ColumnSubHeader = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 0.8rem;
  color: #64748b;
  padding: 6px 12px;
  text-align: center;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  border-bottom: 1px solid #f1f5f9;
  align-items: center;
  padding: 4px 12px;
  
  &:nth-child(even) {
    background-color: #f8fafc;
  }
`;

const ItemNumber = styled.span`
  font-weight: 700;
  font-size: 0.9rem;
  color: #334155;
  text-align: center;
`;

const ScoreInput = styled.input`
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  font-size: 0.85rem;
  text-align: center;
  outline: none;
  box-sizing: border-box;
  
  &:focus {
    border-color: ${props => props.focusColor};
    box-shadow: 0 0 0 2px ${props => props.focusColor}1a;
  }
`;

const ColumnTotalRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  background-color: #f8fafc;
  border-top: 2px solid ${props => props.borderColor};
  font-weight: 700;
  font-size: 0.8rem;
  padding: 8px 12px;
  align-items: center;
  margin-top: auto;
`;

const TotalLabel = styled.span`
  color: #334155;
  line-height: 1.2;
`;

const TotalValue = styled.span`
  font-size: 1rem;
  font-weight: 800;
  color: ${props => props.color};
  text-align: center;
  background-color: white;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 2px 6px;
`;



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

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
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

const VisualSkillRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.small};
`

const SkillLabel = styled.span`
  flex: 1;
  font-weight: 500;
`

const ADLRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.small};
`

const ADLLabel = styled.span`
  flex: 0 0 300px;
  font-weight: 500;
`

const ADLInputGroup = styled.div`
  flex: 1;
  display: flex;
  gap: ${theme.spacing.md};
  align-items: center;
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

export default function OccupationalTherapyForm() {
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
    motorSkills: { grossMotor: [], fineMotor: [] },
    handwritingSkills: { positionOfChild: "", scribbling: "", pencilGrasp: "", basicFigures: "", writingAlphabets: "" },
    cognitiveConcepts: { attention: "", memory: "", planning: "", orientation: "", rtLtDiscrimination: "" },
    visualPerceptualSkills: {
      skill1: { answer: "", notes: "" },
      skill2: { answer: "", notes: "" },
      skill3: { answer: "", notes: "" },
      skill4: { answer: "", notes: "" },
      skill5: { answer: "", notes: "" },
    },
    sensoryEvaluation: {
      is7mTo35m: false,
      scores: {},
    },
    adlEvaluation: {
      overallLevel: "",
      activities: {
        toileting: { selected: "", notes: "" },
        brushing: { selected: "", notes: "" },
        bathing: { selected: "", notes: "" },
        dressing: { selected: "", notes: "" },
        buttoning: { selected: "", notes: "" },
        grooming: { selected: "", notes: "" },
        eating: { selected: "", notes: "" },
      },
    },
    assessmentsUsed: { sensoryEvaluation: "", multisensoryProfile: "", weefin: "", other: "" },
    impression: "",
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
        motorSkills: parseJSON(editRecord.motor_skills) || { grossMotor: [], fineMotor: [] },
        handwritingSkills: parseJSON(editRecord.handwriting_skills) || { positionOfChild: "", scribbling: "", pencilGrasp: "", basicFigures: "", writingAlphabets: "" },
        cognitiveConcepts: parseJSON(editRecord.cognitive_concepts) || { attention: "", memory: "", planning: "", orientation: "", rtLtDiscrimination: "" },
        visualPerceptualSkills: parseJSON(editRecord.visual_perceptual_skills) || {
          skill1: { answer: "", notes: "" },
          skill2: { answer: "", notes: "" },
          skill3: { answer: "", notes: "" },
          skill4: { answer: "", notes: "" },
          skill5: { answer: "", notes: "" },
        },
        sensoryEvaluation: parseJSON(editRecord.sensory_profile) || { is7mTo35m: false, scores: {} },
        adlEvaluation: parseJSON(editRecord.adl_evaluation) || {
          overallLevel: "",
          activities: {
            toileting: { selected: "", notes: "" },
            brushing: { selected: "", notes: "" },
            bathing: { selected: "", notes: "" },
            dressing: { selected: "", notes: "" },
            buttoning: { selected: "", notes: "" },
            grooming: { selected: "", notes: "" },
            eating: { selected: "", notes: "" },
          },
        },
        assessmentsUsed: parseJSON(editRecord.assessments_used) || { sensoryEvaluation: "", multisensoryProfile: "", weefin: "", other: "" },
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

    const url = `${Milestonebaseurl}get_ot_patients/?start_date=${formattedStartDate}&end_date=${formattedEndDate}`

    const result = await apiRequest(url, "GET")

    if (result.success) {
      const data = result.data
      console.log("Full API Response:", data)

      let patients = []

      if (Array.isArray(data)) {
        patients = data
      } else if (data.result && Array.isArray(data.result)) {
        patients = data.result
      } else if (data.otPatients && Array.isArray(data.otPatients)) {
        patients = data.otPatients
      } else if (data.otPatients && Array.isArray(data.otPatients)) {
        patients = data.otPatients
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
      registrationNumber: patient.registrationNumber || patient.registration_number || "",
      patientName: patient.patientName || patient.patient_name || "",
      date: new Date().toISOString().split("T")[0],
    }))
    setShowForm(true)
  }

  const handleBackToList = () => {
    setShowForm(false)
    if (isEdit) {
      navigate("/OccupationalTherapyReport")
    }
  }

  const grossMotorOptions = [
    "Walking",
    "Running",
    "Jumping",
    "Hopping",
    "Obstacle Crossing",
    "Stair Climbing",
    "Tandem Walking",
  ]

  const fineMotorOptions = [
    "Hand Dominance",
    "Dexterity",
    "Reach",
    "Grasp",
    "Release/Pinch",
    "In-hand Manipulation",
    "Thread Beads",
    "Scissor Skills",
  ]

  const visualPerceptualSkills = [
    { key: "skill1", label: "Puts together 2 pieces of puzzles" },
    { key: "skill2", label: "Completes 4-5 pieces of puzzles" },
    { key: "skill3", label: "Matches letters, shapes & numbers" },
    { key: "skill4", label: "Imitates block train & patterns" },
    { key: "skill5", label: "Copies horizontal block patterns" },
  ]

  const adlDependencyOptions = ["Dependent", "Semi-Dependent", "Independent", "Fully Independent"]

  const sensoryModalities = [
    { key: "tactile", label: "Tactile" },
    { key: "vestibular", label: "Vestibular" },
    { key: "proprioception", label: "Proprioception" },
    { key: "auditory", label: "Auditory" },
    { key: "visual", label: "Visual" },
    { key: "oral", label: "Oral – Peri & Intra" },
  ]

  const adlActivities = [
    { key: "toileting", label: "Toileting", options: ["bowel indication", "bladder indication"] },
    { key: "brushing", label: "Brushing", options: ["self", "need help"] },
    { key: "bathing", label: "Bathing", options: ["applies soap", "pours water", "dry with towel"] },
    { key: "dressing", label: "Dressing & Undressing", options: [] },
    { key: "buttoning", label: "Buttoning & Unbuttoning", options: ["zips", "unzips"] },
    { key: "grooming", label: "Grooming", options: ["washing face & hands", "combing"] },
    { key: "eating", label: "Eating", options: ["indication"] },
  ]

  const handleMotorSkillChange = (category, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      motorSkills: {
        ...prev.motorSkills,
        [category]: checked
          ? [...prev.motorSkills[category], value]
          : prev.motorSkills[category].filter((item) => item !== value),
      },
    }))
  }

  const handleHandwritingChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      handwritingSkills: { ...prev.handwritingSkills, [field]: value },
    }))
  }

  const handleCognitiveChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      cognitiveConcepts: { ...prev.cognitiveConcepts, [field]: value },
    }))
  }

  const handleVisualSkillChange = (skill, field, value) => {
    setFormData((prev) => ({
      ...prev,
      visualPerceptualSkills: {
        ...prev.visualPerceptualSkills,
        [skill]: { ...prev.visualPerceptualSkills[skill], [field]: value },
      },
    }))
  }

  const handleSensoryScoreChange = (itemNum, val) => {
    const cleanedVal = val.replace(/[^0-9]/g, "");
    setFormData((prev) => ({
      ...prev,
      sensoryEvaluation: {
        ...prev.sensoryEvaluation,
        scores: {
          ...(prev.sensoryEvaluation?.scores || {}),
          [itemNum]: cleanedVal
        }
      }
    }));
  };

  const handleSensoryToggleAge = (checked) => {
    setFormData((prev) => ({
      ...prev,
      sensoryEvaluation: {
        is7mTo35m: checked,
        scores: {}
      }
    }));
  };

  const handleADLChange = (activity, field, value) => {
    setFormData((prev) => ({
      ...prev,
      adlEvaluation: {
        ...prev.adlEvaluation,
        activities: {
          ...prev.adlEvaluation.activities,
          [activity]: { ...prev.adlEvaluation.activities[activity], [field]: value },
        },
      },
    }))
  }

  const handleAssessmentChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      assessmentsUsed: { ...prev.assessmentsUsed, [field]: value },
    }))
  }

const handleSubmit = async () => {
  try {
    const payload = {
      registrationNumber: formData.registrationNumber,
      patientName: formData.patientName,
      assessment_date: formData.date,
      motor_skills: formData.motorSkills,
      handwriting_skills: formData.handwritingSkills,
      cognitive_concepts: formData.cognitiveConcepts,
      visual_perceptual_skills: formData.visualPerceptualSkills,
      sensory_profile: formData.sensoryEvaluation,
      adl_evaluation: formData.adlEvaluation,
      assessments_used: formData.assessmentsUsed,
      impression: formData.impression,
      recommendation: formData.recommendation,
      notes: formData.notes,
    }

    if (isEdit) {
      payload.id = formData.id
    }

    const url = `${Milestonebaseurl}ot/`
    const method = isEdit ? "PUT" : "POST"

    const response = await apiRequest(url, method, payload)

    if (response.success) {
      toast.success(isEdit ? "Occupational Therapy Assessment updated successfully!" : "Occupational Therapy Assessment saved successfully!")

      setFormData({
        id: "",
        registrationNumber: "",
        patientName: "",
        date: new Date().toISOString().split("T")[0],
        motorSkills: { grossMotor: [], fineMotor: [] },
        handwritingSkills: { positionOfChild: "", scribbling: "", pencilGrasp: "", basicFigures: "", writingAlphabets: "" },
        cognitiveConcepts: { attention: "", memory: "", planning: "", orientation: "", rtLtDiscrimination: "" },
        visualPerceptualSkills: {
          skill1: { answer: "", notes: "" },
          skill2: { answer: "", notes: "" },
          skill3: { answer: "", notes: "" },
          skill4: { answer: "", notes: "" },
          skill5: { answer: "", notes: "" },
        },
        sensoryEvaluation: {
          is7mTo35m: false,
          scores: {},
        },
        adlEvaluation: {
          overallLevel: "",
          activities: {
            toileting: { selected: "", notes: "" },
            brushing: { selected: "", notes: "" },
            bathing: { selected: "", notes: "" },
            dressing: { selected: "", notes: "" },
            buttoning: { selected: "", notes: "" },
            grooming: { selected: "", notes: "" },
            eating: { selected: "", notes: "" },
          },
        },
        assessmentsUsed: { sensoryEvaluation: "", multisensoryProfile: "", weefin: "", other: "" },
        impression: "",
        recommendation: "",
        notes: "",
      })

      setShowForm(false)
      if (isEdit) {
        navigate("/OccupationalTherapyReport")
      }
    } else {
      toast.error(response.error || "Assessment could not be saved. Please try again.")
    }
  } catch (error) {
    console.error("Error saving assessment:", error)
    toast.error("Failed to save assessment. Please try again.")
  }
}


  return (
    <ThemeProvider theme={theme}>
      <PageContainer>
        <PageHeader>
          <PageTitle>Occupational Therapy Assessment System</PageTitle>
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
                      <PatientCardTitle>{patient.patientName || patient.patient_name || "N/A"}</PatientCardTitle>
                      <PatientCardInfo>
                        <span>Reg. No:</span> {patient.registrationNumber || patient.registration_number || "N/A"}
                      </PatientCardInfo>
                      <PatientCardInfo>
                        <span>Date:</span> {patient.date || "N/A"}
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

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
            >
              <FormSection>
                <SectionTitle>Patient Information</SectionTitle>
                <FormRow>
                  <FormGroup>
                    <FormLabel>Registration Number</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Patient Name</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, patientName: e.target.value }))}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Assessment Date</FormLabel>
                    <FormInput
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </FormGroup>
                </FormRow>
              </FormSection>

              <FormSection color={theme.colors.info}>
                <SectionTitle>Motor Skills - Gross & Fine Motor</SectionTitle>
                <TwoColumnGrid>
                  <div>
                    <FormLabel style={{ marginBottom: "16px", display: "block", fontWeight: "600" }}>
                      Gross Motor (Multiple Select)
                    </FormLabel>
                    <CheckboxGroup>
                      {grossMotorOptions.map((skill) => (
                        <CheckboxLabel key={skill}>
                          <Checkbox
                            type="checkbox"
                            value={skill}
                            checked={formData.motorSkills.grossMotor.includes(skill)}
                            onChange={(e) => handleMotorSkillChange("grossMotor", skill, e.target.checked)}
                          />
                          {skill}
                        </CheckboxLabel>
                      ))}
                    </CheckboxGroup>
                  </div>
                  <div>
                    <FormLabel style={{ marginBottom: "16px", display: "block", fontWeight: "600" }}>
                      Fine Motor (Multiple Select)
                    </FormLabel>
                    <CheckboxGroup>
                      {fineMotorOptions.map((skill) => (
                        <CheckboxLabel key={skill}>
                          <Checkbox
                            type="checkbox"
                            value={skill}
                            checked={formData.motorSkills.fineMotor.includes(skill)}
                            onChange={(e) => handleMotorSkillChange("fineMotor", skill, e.target.checked)}
                          />
                          {skill}
                        </CheckboxLabel>
                      ))}
                    </CheckboxGroup>
                  </div>
                </TwoColumnGrid>
              </FormSection>

              <FormSection color={theme.colors.success}>
                <SectionTitle>Handwriting Skills</SectionTitle>
                <FormRow>
                  <FormGroup>
                    <FormLabel>Position of the Child</FormLabel>
                    <TextArea
                      value={formData.handwritingSkills.positionOfChild}
                      onChange={(e) => handleHandwritingChange("positionOfChild", e.target.value)}
                      placeholder="Describe child's position"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Scribbling/Coloring</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.handwritingSkills.scribbling}
                      onChange={(e) => handleHandwritingChange("scribbling", e.target.value)}
                    />
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <FormLabel>Pencil Grasp</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.handwritingSkills.pencilGrasp}
                      onChange={(e) => handleHandwritingChange("pencilGrasp", e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Basic Figures</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.handwritingSkills.basicFigures}
                      onChange={(e) => handleHandwritingChange("basicFigures", e.target.value)}
                    />
                  </FormGroup>
                </FormRow>
                <FormGroup>
                  <FormLabel>Writing Alphabets & Numbers</FormLabel>
                  <FormInput
                    type="text"
                    value={formData.handwritingSkills.writingAlphabets}
                    onChange={(e) => handleHandwritingChange("writingAlphabets", e.target.value)}
                  />
                </FormGroup>
              </FormSection>

              <FormSection color={theme.colors.warning}>
                <SectionTitle>Cognitive Concepts</SectionTitle>
                <FormRow>
                  <FormGroup>
                    <FormLabel>Attention</FormLabel>
                    <TextArea
                      value={formData.cognitiveConcepts.attention}
                      onChange={(e) => handleCognitiveChange("attention", e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Memory</FormLabel>
                    <TextArea
                      value={formData.cognitiveConcepts.memory}
                      onChange={(e) => handleCognitiveChange("memory", e.target.value)}
                    />
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <FormLabel>Planning</FormLabel>
                    <TextArea
                      value={formData.cognitiveConcepts.planning}
                      onChange={(e) => handleCognitiveChange("planning", e.target.value)}
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Orientation</FormLabel>
                    <TextArea
                      value={formData.cognitiveConcepts.orientation}
                      onChange={(e) => handleCognitiveChange("orientation", e.target.value)}
                    />
                  </FormGroup>
                </FormRow>
                <FormGroup>
                  <FormLabel>RT/LT Discrimination</FormLabel>
                  <TextArea
                    value={formData.cognitiveConcepts.rtLtDiscrimination}
                    onChange={(e) => handleCognitiveChange("rtLtDiscrimination", e.target.value)}
                  />
                </FormGroup>
              </FormSection>

              <FormSection color={theme.colors.error}>
                <SectionTitle>Visual Perceptual Skills</SectionTitle>
                {visualPerceptualSkills.map(({ key, label }) => (
                  <VisualSkillRow key={key}>
                    <SkillLabel>{label}</SkillLabel>
                    <RadioGroup>
                      <RadioLabel>
                        <input
                          type="radio"
                          value="Yes"
                          checked={formData.visualPerceptualSkills[key].answer === "Yes"}
                          onChange={(e) => handleVisualSkillChange(key, "answer", e.target.value)}
                        />
                        Yes
                      </RadioLabel>
                      <RadioLabel>
                        <input
                          type="radio"
                          value="No"
                          checked={formData.visualPerceptualSkills[key].answer === "No"}
                          onChange={(e) => handleVisualSkillChange(key, "answer", e.target.value)}
                        />
                        No
                      </RadioLabel>
                    </RadioGroup>
                    <FormInput
                      type="text"
                      value={formData.visualPerceptualSkills[key].notes}
                      onChange={(e) => handleVisualSkillChange(key, "notes", e.target.value)}
                      placeholder="Notes"
                      style={{ flex: 1 }}
                    />
                  </VisualSkillRow>
                ))}
              </FormSection>

              <FormSection color="#ec4899">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <SectionTitle style={{ margin: 0 }}>Sensory Profile</SectionTitle>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: theme.colors.text }}>
                    <input 
                      type="checkbox" 
                      checked={formData.sensoryEvaluation?.is7mTo35m || false}
                      onChange={(e) => handleSensoryToggleAge(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    7m to 35m (54 box)
                  </label>
                </div>

                {(() => {
                  const isToddler = formData.sensoryEvaluation?.is7mTo35m || false;
                  const config = isToddler ? SENSORY_PROFILE_CONFIG.toddler : SENSORY_PROFILE_CONFIG.default;
                  const scores = formData.sensoryEvaluation?.scores || {};
                  
                  const seekingTotal = calculateQuadrantTotal(scores, config.seeking);
                  const avoidingTotal = calculateQuadrantTotal(scores, config.avoiding);
                  const sensitivityTotal = calculateQuadrantTotal(scores, config.sensitivity);
                  const registrationTotal = calculateQuadrantTotal(scores, config.registration);

                  return (
                    <SensoryGrid>
                      {/* Seeking column */}
                      <SensoryColumn borderColor="#f59e0b">
                        <ColumnHeader bgColor="#f59e0b">Seeking/Seeker</ColumnHeader>
                        <ColumnSubHeader>
                          <span>Item</span>
                          <span>Raw Score</span>
                        </ColumnSubHeader>
                        <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                          {config.seeking.map(itemNum => (
                            <ItemRow key={itemNum}>
                              <ItemNumber>{itemNum}</ItemNumber>
                              <ScoreInput 
                                type="text"
                                maxLength="3"
                                value={scores[itemNum] || ""}
                                onChange={(e) => handleSensoryScoreChange(itemNum, e.target.value)}
                                focusColor="#f59e0b"
                              />
                            </ItemRow>
                          ))}
                        </div>
                        <ColumnTotalRow borderColor="#f59e0b">
                          <TotalLabel>Seeking Quadrant Raw Score Total</TotalLabel>
                          <TotalValue color="#f59e0b">{seekingTotal}</TotalValue>
                        </ColumnTotalRow>
                      </SensoryColumn>

                      {/* Avoiding column */}
                      <SensoryColumn borderColor="#3b82f6">
                        <ColumnHeader bgColor="#3b82f6">Avoiding/Avoider</ColumnHeader>
                        <ColumnSubHeader>
                          <span>Item</span>
                          <span>Raw Score</span>
                        </ColumnSubHeader>
                        <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                          {config.avoiding.map(itemNum => (
                            <ItemRow key={itemNum}>
                              <ItemNumber>{itemNum}</ItemNumber>
                              <ScoreInput 
                                type="text"
                                maxLength="3"
                                value={scores[itemNum] || ""}
                                onChange={(e) => handleSensoryScoreChange(itemNum, e.target.value)}
                                focusColor="#3b82f6"
                              />
                            </ItemRow>
                          ))}
                        </div>
                        <ColumnTotalRow borderColor="#3b82f6">
                          <TotalLabel>Avoiding Quadrant Raw Score Total</TotalLabel>
                          <TotalValue color="#3b82f6">{avoidingTotal}</TotalValue>
                        </ColumnTotalRow>
                      </SensoryColumn>

                      {/* Sensitivity column */}
                      <SensoryColumn borderColor="#10b981">
                        <ColumnHeader bgColor="#10b981">Sensitivity/Sensor</ColumnHeader>
                        <ColumnSubHeader>
                          <span>Item</span>
                          <span>Raw Score</span>
                        </ColumnSubHeader>
                        <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                          {config.sensitivity.map(itemNum => (
                            <ItemRow key={itemNum}>
                              <ItemNumber>{itemNum}</ItemNumber>
                              <ScoreInput 
                                type="text"
                                maxLength="3"
                                value={scores[itemNum] || ""}
                                onChange={(e) => handleSensoryScoreChange(itemNum, e.target.value)}
                                focusColor="#10b981"
                              />
                            </ItemRow>
                          ))}
                        </div>
                        <ColumnTotalRow borderColor="#10b981">
                          <TotalLabel>Sensitivity Quadrant Raw Score Total</TotalLabel>
                          <TotalValue color="#10b981">{sensitivityTotal}</TotalValue>
                        </ColumnTotalRow>
                      </SensoryColumn>

                      {/* Registration column */}
                      <SensoryColumn borderColor="#db2777">
                        <ColumnHeader bgColor="#db2777">Registration/Bystander</ColumnHeader>
                        <ColumnSubHeader>
                          <span>Item</span>
                          <span>Raw Score</span>
                        </ColumnSubHeader>
                        <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                          {config.registration.map(itemNum => (
                            <ItemRow key={itemNum}>
                              <ItemNumber>{itemNum}</ItemNumber>
                              <ScoreInput 
                                type="text"
                                maxLength="3"
                                value={scores[itemNum] || ""}
                                onChange={(e) => handleSensoryScoreChange(itemNum, e.target.value)}
                                focusColor="#db2777"
                              />
                            </ItemRow>
                          ))}
                        </div>
                        <ColumnTotalRow borderColor="#db2777">
                          <TotalLabel>Registration Quadrant Raw Score Total</TotalLabel>
                          <TotalValue color="#db2777">{registrationTotal}</TotalValue>
                        </ColumnTotalRow>
                      </SensoryColumn>
                    </SensoryGrid>
                  );
                })()}
              </FormSection>

              <FormSection>
                <SectionTitle>ADL Evaluation</SectionTitle>

                <FormGroup>
                  <FormLabel style={{ marginBottom: "12px", fontWeight: "600" }}>Overall ADL Dependency Level</FormLabel>
                  <RadioGroup>
                    {adlDependencyOptions.map((option) => (
                      <RadioLabel key={`overall-${option}`}>
                        <input
                          type="radio"
                          value={option}
                          checked={formData.adlEvaluation.overallLevel === option}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              adlEvaluation: { ...prev.adlEvaluation, overallLevel: e.target.value },
                            }))
                          }
                        />
                        {option}
                      </RadioLabel>
                    ))}
                  </RadioGroup>
                </FormGroup>

                <div style={{ marginTop: "24px", borderTop: "2px solid #e9ecef", paddingTop: "24px" }}>
                  <FormLabel style={{ marginBottom: "16px", display: "block", fontWeight: "600" }}>
                    Individual ADL Activities
                  </FormLabel>
                  {adlActivities.map(({ key, label, options }) => (
                    <ADLRow key={key}>
                      <ADLLabel>{label}</ADLLabel>
                      <ADLInputGroup>
                        {options.length > 0 ? (
                          <RadioGroup>
                            {options.map((option) => (
                              <RadioLabel key={`${key}-${option}`}>
                                <input
                                  type="radio"
                                  value={option}
                                  checked={formData.adlEvaluation.activities[key].selected === option}
                                  onChange={(e) => handleADLChange(key, "selected", e.target.value)}
                                />
                                {option}
                              </RadioLabel>
                            ))}
                          </RadioGroup>
                        ) : (
                          <span style={{ color: "#6c757d", fontStyle: "italic" }}>No options</span>
                        )}
                        <FormInput
                          type="text"
                          value={formData.adlEvaluation.activities[key].notes}
                          onChange={(e) => handleADLChange(key, "notes", e.target.value)}
                          placeholder="Notes"
                          style={{ minWidth: "200px" }}
                        />
                      </ADLInputGroup>
                    </ADLRow>
                  ))}
                </div>
              </FormSection>

              <FormSection color={theme.colors.secondary}>
                <SectionTitle>Assessments Used</SectionTitle>
                <FormRow>
                  <FormGroup>
                    <FormLabel>Sensory Evaluation</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.assessmentsUsed.sensoryEvaluation}
                      onChange={(e) => handleAssessmentChange("sensoryEvaluation", e.target.value)}
                      placeholder="Enter assessment details"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Multisensory Profile</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.assessmentsUsed.multisensoryProfile}
                      onChange={(e) => handleAssessmentChange("multisensoryProfile", e.target.value)}
                      placeholder="Enter assessment details"
                    />
                  </FormGroup>
                </FormRow>
                <FormRow>
                  <FormGroup>
                    <FormLabel>WeeFIM</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.assessmentsUsed.weefin}
                      onChange={(e) => handleAssessmentChange("weefin", e.target.value)}
                      placeholder="Enter assessment details"
                    />
                  </FormGroup>
                  <FormGroup>
                    <FormLabel>Other Assessment</FormLabel>
                    <FormInput
                      type="text"
                      value={formData.assessmentsUsed.other}
                      onChange={(e) => handleAssessmentChange("other", e.target.value)}
                      placeholder="Enter other assessment details"
                    />
                  </FormGroup>
                </FormRow>
              </FormSection>

              <FormSection color={theme.colors.accent}>
                <SectionTitle>Impression</SectionTitle>
                <FormGroup>
                  <TextArea
                    value={formData.impression}
                    onChange={(e) => setFormData((prev) => ({ ...prev, impression: e.target.value }))}
                    placeholder="Enter clinical impression"
                    style={{ minHeight: "120px" }}
                  />
                </FormGroup>
              </FormSection>

              <FormSection color={theme.colors.success}>
                <SectionTitle>Recommendations</SectionTitle>
                <FormGroup>
                  <TextArea
                    value={formData.recommendation}
                    onChange={(e) => setFormData((prev) => ({ ...prev, recommendation: e.target.value }))}
                    placeholder="Enter recommendations"
                    style={{ minHeight: "120px" }}
                  />
                </FormGroup>
              </FormSection>

              <FormSection>
                <SectionTitle>Additional Notes</SectionTitle>
                <FormGroup>
                  <TextArea
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter any additional notes"
                  />
                </FormGroup>
              </FormSection>

              <ButtonsContainer>
                <Button type="submit">
                  <Save size={18} />
                  Save Assessment
                </Button>
              </ButtonsContainer>
            </form>
          </>
        )}
      </PageContainer>
    </ThemeProvider>
  )
}