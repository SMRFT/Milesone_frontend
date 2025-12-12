import React, { useState } from "react";
import styled from "styled-components";
import axios from 'axios';
import { useLocation } from "react-router-dom";

/* ---------- Modern Styled Components ---------- */
const Container = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 3px;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
`;

const InnerContainer = styled.div`
  background: #ffffff;
  padding: 2.5rem;
  border-radius: 14px;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const Section = styled.section`
  margin-bottom: 2.5rem;
  background: #ffffff;
  border: 1px solid #e9ecef;
  padding: 1.75rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.15);
    border-color: #667eea;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid #667eea;
  display: inline-block;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  font-size: 0.95rem;
  color: #495057;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.95rem;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    background: #ffffff;
  }
  
  &:hover {
    border-color: #adb5bd;
  }
`;

const TextArea = styled.textarea`
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.95rem;
  width: 100%;
  min-height: 120px;
  resize: vertical;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    background: #ffffff;
  }
  
  &:hover {
    border-color: #adb5bd;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e9ecef;
`;

const Button = styled.button`
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  color: white;
  background: ${(props) => (props.secondary ? "linear-gradient(135deg, #868f96 0%, #596164 100%)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")};
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px ${(props) => (props.secondary ? "rgba(108, 117, 125, 0.3)" : "rgba(102, 126, 234, 0.4)")};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px ${(props) => (props.secondary ? "rgba(108, 117, 125, 0.4)" : "rgba(102, 126, 234, 0.5)")};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled.div`
  font-size: 0.95rem;
  color: ${props => props.error ? '#dc3545' : '#28a745'};
  font-weight: 600;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  background: ${props => props.error ? '#f8d7da' : '#d4edda'};
  border: 1px solid ${props => props.error ? '#f5c6cb' : '#c3e6cb'};
`;

const RadioGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
  }
  
  input[type="radio"]:checked + & {
    background: #e7f0ff;
    border-color: #667eea;
  }
  
  input[type="radio"] {
    accent-color: #667eea;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e9ecef;
  }
  
  input[type="checkbox"]:checked + span {
    font-weight: 600;
  }
  
  input[type="checkbox"] {
    accent-color: #667eea;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

/* ---------- Modern Table Components ---------- */
const TableContainer = styled.div`
  overflow-x: auto;
  margin-top: 1.5rem;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1rem;
`;

const HeaderGroup = styled.div`
  text-align: center;
`;

const CategoryTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #007bff;
  margin: 0;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

const ModernTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
`;

const TableHead = styled.th`
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 12px 16px;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 600;
  color: #2c3e50;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #667eea;
  width: ${props => props.width || 'auto'};
`;

const TableRow = styled.tr`
  transition: all 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
    transform: scale(1.005);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  
  &:not(:last-child) td {
    border-bottom: 1px solid #e9ecef;
  }
`;

const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 0.9rem;
  color: #495057;
  vertical-align: middle;
`;

const TableInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: #f8f9fa;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    background: #ffffff;
  }
  
  &::placeholder {
    color: #adb5bd;
    font-style: italic;
  }
`;

const TableDivider = styled.td`
  width: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 2px;
    height: 60%;
    background: white;
    opacity: 0.5;
  }
`;

const TableSpacer = styled.div`
  height: 2rem;
`;

/* -------------------------- Component -------------------------- */
export default function HistoryRecordingSheet() {
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  const today = new Date().toISOString().split("T")[0];
  const location = useLocation();
  const passedData = location.state?.assessment || null;

  // Initial developmental history rows
  const initialGrossRows = [
    { skill: "Neck Holding", expected: "3 Months", achieved: "", impression: "" },
    { skill: "Stand Alone", expected: "9 Months", achieved: "", impression: "" },
    { skill: "Walks Alone", expected: "15 Months", achieved: "", impression: "" },
    { skill: "Runs / Walks up & down", expected: "2 Years", achieved: "", impression: "" },
    { skill: "Rides a Tricycle", expected: "3 Years", achieved: "", impression: "" },
    { skill: "Dresses with no supervision", expected: "5 Years", achieved: "", impression: "" },
  ];

  const initialFineMotorRows = [
    { skill: "Mature pincer Grasp", expected: "1 Year", achieved: "", impression: "" },
    { skill: "Scribbles / many intelligible words", expected: "1 ½ Years", achieved: "", impression: "" },
    { skill: "Point out objects in pictures", expected: "2 Years", achieved: "", impression: "" },
    { skill: "Copies a Circle", expected: "3 years", achieved: "", impression: "" },
    { skill: "Identifies body Parts", expected: "4 years", achieved: "", impression: "" },
    { skill: "Tells address/ knows rules of games", expected: "5 years", achieved: "", impression: "" },
  ];

  const initialLanguageRows = [
    { skill: "Babbling", expected: "6 Months", achieved: "", impression: "" },
    { skill: "Disyllables", expected: "9 Months", achieved: "", impression: "" },
    { skill: "2–3 Word Sentences", expected: "2 Years", achieved: "", impression: "" },
    { skill: "Knows full name & gender", expected: "3 Years", achieved: "", impression: "" },
    { skill: "Tells a Story / Poem", expected: "4 Years", achieved: "", impression: "" },
    { skill: "Simple answer to question", expected: "5 Years", achieved: "", impression: "" },
  ];

  const initialSocialRows = [
    { skill: "Social Smile", expected: "2 Months", achieved: "", impression: "" },
    { skill: "Recognizes Mother", expected: "3 Months", achieved: "", impression: "" },
    { skill: "Stranger Anxiety", expected: "6 Months", achieved: "", impression: "" },
    { skill: "Pretend / Parallel Play", expected: "2–2½ Years", achieved: "", impression: "" },
    { skill: "Associative / Cooperative Play", expected: "3–4 Years", achieved: "", impression: "" },
    { skill: "Goes about neighborhood", expected: "5 Years", achieved: "", impression: "" },
  ];

  const [form, setForm] = useState({
  identification: {
    name: passedData?.name_of_child || "",
    dateOfAssessment: today,
    dob: passedData?.dob || today,
    regNo: passedData?.registration_number || "",
    ageSex: passedData ? `${passedData.age?.year}y ${passedData.age?.months}m` : "",
    informantA: "",
    informantB: "",
    informationReliability: "Reliable",
    adequacy: "Adequate",
  },
  demographic: {
    father: passedData?.father_name || "",
    fatherOccupation: "",
    mother: passedData?.mother_name || "",
    motherOccupation: "",
    fatherAge: "",
    motherAge: "",
    addressCity: passedData?.address || "",
    mobileNumber: passedData?.mother_phone_number || "",
    religionLanguage: "",
  },
    presentingComplaints: "",
    historyOfPresentIllness: {
      modeOfOnset: [],
      courseOfIllness: [],
      progress: [],
    },
    familyHistory: {
      typeOfFamily: [],
      consanguinity: "",
      familyGenogram: "",
      mentalMedicalHistory: "No",
      mentalMedicalHistoryDetails: "",
    },
    personalHistory: {
      prenatal: {
        conceptualAge: "",
        reactionToPregnancy: "",
        abortionAttempt: "",
        abortionAttemptDetails: "",
        motherHealthOptions: [],
        motherHealthYesNo: "No",
        motherHealthDetails: "",
        medicationsUsed: "",
        otherComplaints: "",
      },
      natal: {
        term: "",
        deliveryPlace: "",
        deliveryType: "",
        caesareanReason: "",
        birthWeight: "",
        birthCry: "",
      },
      postnatal: {
        conditionsChecked: [],
        otherDetails: "",
      },
    },
    developmentalHistory: {
      grossMotor: initialGrossRows,
      fineMotor: initialFineMotorRows,
      language: initialLanguageRows,
      social: initialSocialRows,
    },
    scholasticHistory: {
      typeOfSchool: "",
      ageOfEntry: "",
      presentClass: "",
      medium: [],
      performance: "",
      disciplinaryProblems: "",
      disciplinaryProblemsDetails: "",
      regularity: "",
      regularityDetails: "",
      peerAdjustment: "",
      relationAuthorities: "",
      otherInfo: "",
    },
    playHistory: {
      playBehaviour: "",
      playPreferences: "",
      ruleKnowledge: "",
      groupBehaviour: "",
      leisureTime: "",
      likesDislikes: "",
      medicalHistory: "",
      sleepHistory: "",
      allergyHistory: "",
      screenTime: "",
    },
    treatmentHistory: "",
    generalHistory: {
      general: "",
      dysmorphicFeatures: "",
      cnsExamination: "",
      higherFunctions: "",
      cranialNerve: "",
      tone: "",
      power: "",
      reflexes: "",
      neonatalReflex: "",
      neurocutaneousMarkers: "",
    },
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const update = (path, value) => {
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let ref = copy;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
      ref[path[path.length - 1]] = value;
      return copy;
    });
  };

  const updateArrayCheckbox = (path, item, checked) => {
    setForm((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let arr = copy;
      for (let i = 0; i < path.length; i++) arr = arr[path[i]];
      const idx = arr.indexOf(item);
      if (checked && idx === -1) arr.push(item);
      if (!checked && idx !== -1) arr.splice(idx, 1);
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      identification_data: {
        name: form.identification.name,
        date_of_assessment: form.identification.dateOfAssessment,
        dob: form.identification.dob,
        reg_no: form.identification.regNo,
        age_sex: form.identification.ageSex,
        informant_a: form.identification.informantA,
        informant_b: form.identification.informantB,
        information_reliability: form.identification.informationReliability,
        adequacy: form.identification.adequacy,
      },
      demographic_data: {
        father: form.demographic.father,
        father_occupation: form.demographic.fatherOccupation,
        mother: form.demographic.mother,
        mother_occupation: form.demographic.motherOccupation,
        father_age: form.demographic.fatherAge,
        mother_age: form.demographic.motherAge,
        address_city: form.demographic.addressCity,
        mobile_number: form.demographic.mobileNumber,
        religion_language: form.demographic.religionLanguage,
      },
      presenting_complaints: form.presentingComplaints,
      history_of_present_illness: {
        mode_of_onset: form.historyOfPresentIllness.modeOfOnset,
        course_of_illness: form.historyOfPresentIllness.courseOfIllness,
        progress: form.historyOfPresentIllness.progress,
      },
      family_history: {
        type_of_family: form.familyHistory.typeOfFamily,
        consanguinity: form.familyHistory.consanguinity,
        family_genogram: form.familyHistory.familyGenogram,
        mental_medical_history: {
          selected: form.familyHistory.mentalMedicalHistory,
          details: form.familyHistory.mentalMedicalHistory === "Yes" 
            ? form.familyHistory.mentalMedicalHistoryDetails 
            : "",
        },
      },
      personal_history: {
        prenatal: {
          conceptual_age_of_mother: form.personalHistory.prenatal.conceptualAge,
          reaction_towards_pregnancy: form.personalHistory.prenatal.reactionToPregnancy,
          abortion_attempt: {
            selected: form.personalHistory.prenatal.abortionAttempt,
            details: form.personalHistory.prenatal.abortionAttempt === "Yes"
              ? form.personalHistory.prenatal.abortionAttemptDetails
              : "",
          },
          mother_health_during_pregnancy: {
            selected_options: form.personalHistory.prenatal.motherHealthOptions,
            is_any_issue: form.personalHistory.prenatal.motherHealthYesNo,
            details: form.personalHistory.prenatal.motherHealthYesNo === "Yes"
              ? form.personalHistory.prenatal.motherHealthDetails
              : "",
          },
          medications_used_during_pregnancy: form.personalHistory.prenatal.medicationsUsed,
          other_complaints: form.personalHistory.prenatal.otherComplaints,
        },
      },
      natalandneanatal_history: {
        term: form.personalHistory.natal.term,
        delivery_place: form.personalHistory.natal.deliveryPlace,
        type_of_delivery: form.personalHistory.natal.deliveryType,
        caesarean_reason: form.personalHistory.natal.deliveryType === "Caesarean"
          ? form.personalHistory.natal.caesareanReason
          : "",
        birth_weight: form.personalHistory.natal.birthWeight,
        birth_cry: form.personalHistory.natal.birthCry,
      },
      postnatal_history: {
        selected_conditions: form.personalHistory.postnatal.conditionsChecked,
        other_details: form.personalHistory.postnatal.otherDetails,
      },
      developmental_history: {
        gross_motor: form.developmentalHistory.grossMotor.map(row => ({
          skill: row.skill,
          expected: row.expected,
          achieved: row.achieved,
          impression: row.impression,
        })),
        fine_motor: form.developmentalHistory.fineMotor.map(row => ({
          skill: row.skill,
          expected: row.expected,
          achieved: row.achieved,
          impression: row.impression,
        })),
        language: form.developmentalHistory.language.map(row => ({
          skill: row.skill,
          expected: row.expected,
          achieved: row.achieved,
          impression: row.impression,
        })),
        social: form.developmentalHistory.social.map(row => ({
          skill: row.skill,
          expected: row.expected,
          achieved: row.achieved,
          impression: row.impression,
        })),
      },
      scholastic_history: {
        type_of_school: form.scholasticHistory.typeOfSchool,
        age_of_entry: form.scholasticHistory.ageOfEntry,
        present_class: form.scholasticHistory.presentClass,
        medium_of_instruction: form.scholasticHistory.medium,
        scholastic_performance: form.scholasticHistory.performance,
        disciplinary_problems: {
          selected: form.scholasticHistory.disciplinaryProblems,
          details: form.scholasticHistory.disciplinaryProblems === "Yes"
            ? form.scholasticHistory.disciplinaryProblemsDetails
            : "",
        },
        regularity: {
          selected: form.scholasticHistory.regularity,
          details: form.scholasticHistory.regularity === "Discontinued"
            ? form.scholasticHistory.regularityDetails
            : "",
        },
        peer_group_adjustment: form.scholasticHistory.peerAdjustment,
        relation_with_authorities: form.scholasticHistory.relationAuthorities,
        other_info: form.scholasticHistory.otherInfo,
      },
      play_history: {
        play_behaviour: form.playHistory.playBehaviour,
        play_preferences: form.playHistory.playPreferences,
        rule_knowledge: form.playHistory.ruleKnowledge,
        group_behaviour: form.playHistory.groupBehaviour,
        leisure_time: form.playHistory.leisureTime,
        likes_dislikes: form.playHistory.likesDislikes,
        medical_history: form.playHistory.medicalHistory,
        sleep_history: form.playHistory.sleepHistory,
        allergy_history: form.playHistory.allergyHistory,
        screen_time: form.playHistory.screenTime,
      },
      treatment_history: form.treatmentHistory,
      general_history: {
        general: form.generalHistory.general,
        dysmorphic_features: form.generalHistory.dysmorphicFeatures,
        cns_examination: form.generalHistory.cnsExamination,
        higher_functions: form.generalHistory.higherFunctions,
        cranial_nerve: form.generalHistory.cranialNerve,
        tone: form.generalHistory.tone,
        power: form.generalHistory.power,
        reflexes: form.generalHistory.reflexes,
        neonatal_reflex: form.generalHistory.neonatalReflex,
        neurocutaneous_markers: form.generalHistory.neurocutaneousMarkers,
      },
    };

    console.log("FINAL PAYLOAD -> ", JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post(
        `${Milestonebaseurl}HistoryRecordingSheet/`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Saved:", response.data);
      setMessage("✓ Data saved successfully!");
      setSaving(false);
    } catch (err) {
      console.error("Error:", err);
      setMessage(`✗ Error: ${err.response?.data?.message || err.message}`);
      setSaving(false);
    }
  };

  const motherHealthList = [
    "Significant illness",
    "Rubella",
    "Any viral infections",
    "Injuries",
    "Hypertension/Hypotension",
  ];

  const postnatalConditions = [
    "Hypoxia",
    "Seizure",
    "Neonatal jaundice",
    "Infection",
    "Feeding problem",
    "Any long-term NICU stay",
  ];

  const mediumOptions = ["Metric", "CBSE", "ICSE", "Tamil", "English"];

  return (
    <Container>
      <InnerContainer>
        <Title>History Recording Sheet</Title>
        <form onSubmit={handleSubmit}>
          {/* Identification Data */}
          <Section>
            <SectionTitle>Identification Data</SectionTitle>
            <Grid>
              <Label>
                Name
                <Input
                  value={form.identification.name}
                  onChange={(e) => update(["identification", "name"], e.target.value)}
                  placeholder="Enter patient name"
                />
              </Label>
              <Label>
                D.O. Assessment
                <Input
                  type="date"
                  value={form.identification.dateOfAssessment}
                  onChange={(e) => update(["identification", "dateOfAssessment"], e.target.value)}
                />
              </Label>
              <Label>
                D.O.B
                <Input
                  type="date"
                  value={form.identification.dob}
                  onChange={(e) => update(["identification", "dob"], e.target.value)}
                />
              </Label>
              <Label>
                Reg. No
                <Input value={form.identification.regNo} onChange={(e) => update(["identification", "regNo"], e.target.value)} placeholder="Registration number" />
              </Label>
              <Label>
                Age/Sex
                <Input value={form.identification.ageSex} onChange={(e) => update(["identification", "ageSex"], e.target.value)} placeholder="e.g., 5 years / Male" />
              </Label>
              <Label>
                Informant A
                <Input value={form.identification.informantA} onChange={(e) => update(["identification", "informantA"], e.target.value)} placeholder="Primary informant" />
              </Label>
              <Label>
                Informant B
                <Input value={form.identification.informantB} onChange={(e) => update(["identification", "informantB"], e.target.value)} placeholder="Secondary informant" />
              </Label>
            </Grid>
            <Label style={{ marginTop: '1rem' }}>
              Information Reliability
              <RadioGroup>
                {["Reliable", "Partially Reliable", "Unreliable"].map((item) => (
                  <RadioLabel key={item}>
                    <input
                      type="radio"
                      name="infoReliability"
                      checked={form.identification.informationReliability === item}
                      onChange={() => update(["identification", "informationReliability"], item)}
                    />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Adequacy
              <RadioGroup>
                {["Adequate", "Inadequate"].map((item) => (
                  <RadioLabel key={item}>
                    <input
                      type="radio"
                      name="adequacy"
                      checked={form.identification.adequacy === item}
                      onChange={() => update(["identification", "adequacy"], item)}
                    />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
          </Section>

          {/* Demographic Data */}
          <Section>
            <SectionTitle>Demographic Data</SectionTitle>
            <Grid>
              <Label>
                Father
                <Input value={form.demographic.father} onChange={(e) => update(["demographic", "father"], e.target.value)} placeholder="Father's name" />
              </Label>
              <Label>
                Father Occupation
                <Input value={form.demographic.fatherOccupation} onChange={(e) => update(["demographic", "fatherOccupation"], e.target.value)} placeholder="Occupation" />
              </Label>
              <Label>
                Mother
                <Input value={form.demographic.mother} onChange={(e) => update(["demographic", "mother"], e.target.value)} placeholder="Mother's name" />
              </Label>
              <Label>
                Mother Occupation
                <Input value={form.demographic.motherOccupation} onChange={(e) => update(["demographic", "motherOccupation"], e.target.value)} placeholder="Occupation" />
              </Label>
              <Label>
                Age of Father
                <Input value={form.demographic.fatherAge} onChange={(e) => update(["demographic", "fatherAge"], e.target.value)} placeholder="Age" />
              </Label>
              <Label>
                Age of Mother
                <Input value={form.demographic.motherAge} onChange={(e) => update(["demographic", "motherAge"], e.target.value)} placeholder="Age" />
              </Label>
              <Label>
                Address / City
                <Input value={form.demographic.addressCity} onChange={(e) => update(["demographic", "addressCity"], e.target.value)} placeholder="Full address" />
              </Label>
              <Label>
                Mobile Number
                <Input value={form.demographic.mobileNumber} onChange={(e) => update(["demographic", "mobileNumber"], e.target.value)} placeholder="Contact number" />
              </Label>
              <Label>
                Religion / Language
                <Input value={form.demographic.religionLanguage} onChange={(e) => update(["demographic", "religionLanguage"], e.target.value)} placeholder="Religion & Language" />
              </Label>
            </Grid>
          </Section>

          {/* Presenting Complaints */}
          <Section>
            <SectionTitle>Presenting Complaints</SectionTitle>
            <TextArea value={form.presentingComplaints} onChange={(e) => update(["presentingComplaints"], e.target.value)} placeholder="Describe the chief complaints..." />
          </Section>

          {/* History of Present Illness */}
          <Section>
            <SectionTitle>History of Present Illness</SectionTitle>
            <Label>
              Mode of Onset
              <CheckboxGroup>
                {["Abrupt", "Acute", "Insidious"].map((item) => (
                  <CheckboxLabel key={item}>
                    <input
                      type="checkbox"
                      checked={form.historyOfPresentIllness.modeOfOnset.includes(item)}
                      onChange={(e) => updateArrayCheckbox(["historyOfPresentIllness", "modeOfOnset"], item, e.target.checked)}
                    />
                    <span>{item}</span>
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Course of Illness
              <CheckboxGroup>
                {["Continuous", "Episodic", "Fluctuating", "Other"].map((item) => (
                  <CheckboxLabel key={item}>
                    <input
                      type="checkbox"
                      checked={form.historyOfPresentIllness.courseOfIllness.includes(item)}
                      onChange={(e) => updateArrayCheckbox(["historyOfPresentIllness", "courseOfIllness"], item, e.target.checked)}
                    />
                    <span>{item}</span>
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Progress
              <CheckboxGroup>
                {["Improving", "Deteriorating", "Static"].map((item) => (
                  <CheckboxLabel key={item}>
                    <input
                      type="checkbox"
                      checked={form.historyOfPresentIllness.progress.includes(item)}
                      onChange={(e) => updateArrayCheckbox(["historyOfPresentIllness", "progress"], item, e.target.checked)}
                    />
                    <span>{item}</span>
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
            </Label>
          </Section>

          {/* Family History */}
          <Section>
            <SectionTitle>Family History</SectionTitle>
            <Label>
              Type of Family
              <CheckboxGroup>
                {["Nuclear", "Joint", "Other"].map((item) => (
                  <CheckboxLabel key={item}>
                    <input
                      type="checkbox"
                      checked={form.familyHistory.typeOfFamily.includes(item)}
                      onChange={(e) => updateArrayCheckbox(["familyHistory", "typeOfFamily"], item, e.target.checked)}
                    />
                    <span>{item}</span>
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Consanguinity
              <Input
                value={form.familyHistory.consanguinity}
                onChange={(e) => update(["familyHistory", "consanguinity"], e.target.value)}
                placeholder="Describe consanguinity if any"
              />
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Family Genogram
              <TextArea
                value={form.familyHistory.familyGenogram}
                onChange={(e) => update(["familyHistory", "familyGenogram"], e.target.value)}
                placeholder="Describe family genogram..."
              />
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Family History of any Mental & Medical Illness
              <RadioGroup>
                {["Yes", "No"].map((item) => (
                  <RadioLabel key={item}>
                    <input
                      type="radio"
                      name="familyMentalMedical"
                      checked={form.familyHistory.mentalMedicalHistory === item}
                      onChange={() => update(["familyHistory", "mentalMedicalHistory"], item)}
                    />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            {form.familyHistory.mentalMedicalHistory === "Yes" && (
              <Label style={{ marginTop: '1rem' }}>
                If yes, specify details
                <TextArea
                  value={form.familyHistory.mentalMedicalHistoryDetails || ""}
                  onChange={(e) => update(["familyHistory", "mentalMedicalHistoryDetails"], e.target.value)}
                  placeholder="Provide details..."
                />
              </Label>
            )}
          </Section>

          {/* Personal History - Prenatal */}
            <Section>
              <SectionTitle>Personal History - Prenatal</SectionTitle>

              <Label>
                Prenatal History (at the time of pregnancy)
                <Input
                  value={form.personalHistory.prenatal.prenatalHistory || ""}
                  onChange={(e) =>
                    update(["personalHistory", "prenatal", "prenatalHistory"], e.target.value)
                  }
                  placeholder="Enter prenatal history details"
                />
              </Label>

              <Grid style={{ marginTop: "1rem" }}>
                <Label>
                  Conceptual Age of Mother
                  <Input
                    value={form.personalHistory.prenatal.conceptualAge}
                    onChange={(e) =>
                      update(["personalHistory", "prenatal", "conceptualAge"], e.target.value)
                    }
                    placeholder="Age at conception"
                  />
                </Label>
              </Grid>

  

            <Label style={{ marginTop: '1rem' }}>
              Reaction Towards Pregnancy
              <RadioGroup>
                {["Planned", "Unplanned", "Normal", "Conceiving (IVF/IUI)"].map((item) => (
                  <RadioLabel key={item}>
                    <input
                      type="radio"
                      name="reactionPregnancy"
                      checked={form.personalHistory.prenatal.reactionToPregnancy === item}
                      onChange={() => update(["personalHistory", "prenatal", "reactionToPregnancy"], item)}
                    />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Any Attempt for Abortion
              <RadioGroup>
                {["Yes", "No"].map((item) => (
                  <RadioLabel key={item}>
                    <input
                      type="radio"
                      name="abortionAttempt"
                      checked={form.personalHistory.prenatal.abortionAttempt === item}
                      onChange={() => update(["personalHistory", "prenatal", "abortionAttempt"], item)}
                    />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            {form.personalHistory.prenatal.abortionAttempt === "Yes" && (
              <Label style={{ marginTop: '1rem' }}>
                If yes, explain
                <TextArea
                  value={form.personalHistory.prenatal.abortionAttemptDetails}
                  onChange={(e) => update(["personalHistory", "prenatal", "abortionAttemptDetails"], e.target.value)}
                  placeholder="Provide details..."
                />
              </Label>
            )}
            <Label style={{ marginTop: '1rem' }}>
              Mother's Health During Pregnancy
              <CheckboxGroup>
                {motherHealthList.map((m) => (
                  <CheckboxLabel key={m}>
                    <input
                      type="checkbox"
                      checked={form.personalHistory.prenatal.motherHealthOptions.includes(m)}
                      onChange={(e) => updateArrayCheckbox(["personalHistory", "prenatal", "motherHealthOptions"], m, e.target.checked)}
                    />
                    <span>{m}</span>
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Mother's health details required?
              <RadioGroup>
                {["Yes", "No"].map((item) => (
                  <RadioLabel key={item}>
                    <input
                      type="radio"
                      name="motherHealthDetailsRequired"
                      checked={form.personalHistory.prenatal.motherHealthYesNo === item}
                      onChange={() => update(["personalHistory", "prenatal", "motherHealthYesNo"], item)}
                    />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            {form.personalHistory.prenatal.motherHealthYesNo === "Yes" && (
              <Label style={{ marginTop: '1rem' }}>
                Explain Mother's Health Condition
                <TextArea
                  value={form.personalHistory.prenatal.motherHealthDetails}
                  onChange={(e) => update(["personalHistory", "prenatal", "motherHealthDetails"], e.target.value)}
                  placeholder="Provide detailed health information..."
                />
              </Label>
            )}
            <Label style={{ marginTop: '1rem' }}>
              Medications Used During Pregnancy
              <TextArea value={form.personalHistory.prenatal.medicationsUsed} onChange={(e) => update(["personalHistory", "prenatal", "medicationsUsed"], e.target.value)} placeholder="List medications..." />
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Other Complaints
              <TextArea value={form.personalHistory.prenatal.otherComplaints} onChange={(e) => update(["personalHistory", "prenatal", "otherComplaints"], e.target.value)} placeholder="Any other complaints..." />
            </Label>
          </Section>

          {/* Personal History - Natal */}
          <Section>
            <SectionTitle>Personal History - Natal and Neonatal</SectionTitle>
            <Label>
              Term
              <RadioGroup>
                {["Full", "Pre-term", "Post-term", "Not Known"].map((item) => (
                  <RadioLabel key={item}>
                    <input type="radio" name="term" checked={form.personalHistory.natal.term === item} onChange={() => update(["personalHistory", "natal", "term"], item)} />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Delivery Place
              <RadioGroup>
                {["Home", "Hospital", "Other"].map((item) => (
                  <RadioLabel key={item}>
                    <input type="radio" name="deliveryPlace" checked={form.personalHistory.natal.deliveryPlace === item} onChange={() => update(["personalHistory", "natal", "deliveryPlace"], item)} />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Type of Delivery
              <RadioGroup>
                {["Normal", "Caesarean", "Instrumental"].map((item) => (
                  <RadioLabel key={item}>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={form.personalHistory.natal.deliveryType === item}
                      onChange={() => update(["personalHistory", "natal", "deliveryType"], item)}
                    />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            {form.personalHistory.natal.deliveryType === "Caesarean" && (
              <Label style={{ marginTop: '1rem' }}>
                Reason for Caesarean
                <TextArea value={form.personalHistory.natal.caesareanReason} onChange={(e) => update(["personalHistory", "natal", "caesareanReason"], e.target.value)} placeholder="Reason..." />
              </Label>
            )}
            <Grid style={{ marginTop: '1rem' }}>
              <Label>
                Birth Weight (Normal = 2.5 Kg)
                <Input value={form.personalHistory.natal.birthWeight} onChange={(e) => update(["personalHistory", "natal", "birthWeight"], e.target.value)} placeholder="e.g., 2.5 Kg" />
              </Label>
            </Grid>
            <Label style={{ marginTop: '1rem' }}>
              Birth Cry
              <RadioGroup>
                {["Immediate", "Delayed", "Absent", "Not Known"].map((item) => (
                  <RadioLabel key={item}>
                    <input type="radio" name="birthCry" checked={form.personalHistory.natal.birthCry === item} onChange={() => update(["personalHistory", "natal", "birthCry"], item)} />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
          </Section>

          {/* Personal History - Postnatal */}
          <Section>
            <SectionTitle>Personal History - Postnatal</SectionTitle>
            <Label>
              History of any medical conditions
              <CheckboxGroup>
                {postnatalConditions.map((cond) => (
                  <CheckboxLabel key={cond}>
                    <input
                      type="checkbox"
                      checked={form.personalHistory.postnatal.conditionsChecked.includes(cond)}
                      onChange={(e) => updateArrayCheckbox(["personalHistory", "postnatal", "conditionsChecked"], cond, e.target.checked)}
                    />
                    <span>{cond}</span>
                  </CheckboxLabel>
                ))}
              </CheckboxGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Other postnatal details
              <TextArea value={form.personalHistory.postnatal.otherDetails} onChange={(e) => update(["personalHistory", "postnatal", "otherDetails"], e.target.value)} placeholder="Additional details..." />
            </Label>
          </Section>

          {/* Developmental History with Modern Tables */}
         {/* Developmental History with Modern Tables */}
          <Section>
            <SectionTitle>Developmental History (1–5 Years)</SectionTitle>
            
            {/* First Table: Gross Motor and Fine Motor/Cognitive side by side */}
            <TableContainer>
              <ModernTable>
                <thead>
                  <tr>
                    <TableHead width="20%">Gross Motor</TableHead>
                    <TableHead width="10%">Expected</TableHead>
                    <TableHead width="10%">Achieved Months</TableHead>
                    <TableHead width="10%">Impression</TableHead>
                    <TableHead width="20%">Fine motor/ Cognitive</TableHead>
                    <TableHead width="10%">Expected</TableHead>
                    <TableHead width="10%">Achieved Months</TableHead>
                    <TableHead width="10%">Impression</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {form.developmentalHistory.grossMotor.map((grossRow, index) => {
                    const fineRow = form.developmentalHistory.fineMotor[index] || { skill: "", expected: "", achieved: "", impression: "" };
                    return (
                      <TableRow key={index}>
                        <TableCell>{grossRow.skill}</TableCell>
                        <TableCell>{grossRow.expected}</TableCell>
                        <TableCell>
                          <TableInput
                            type="text"
                            value={grossRow.achieved}
                            placeholder="Age"
                            onChange={(e) => {
                              const copy = [...form.developmentalHistory.grossMotor];
                              copy[index].achieved = e.target.value;
                              update(["developmentalHistory", "grossMotor"], copy);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TableInput
                            type="text"
                            value={grossRow.impression}
                            placeholder="Impression"
                            onChange={(e) => {
                              const copy = [...form.developmentalHistory.grossMotor];
                              copy[index].impression = e.target.value;
                              update(["developmentalHistory", "grossMotor"], copy);
                            }}
                          />
                        </TableCell>
                        <TableCell>{fineRow.skill}</TableCell>
                        <TableCell>{fineRow.expected}</TableCell>
                        <TableCell>
                          <TableInput
                            type="text"
                            value={fineRow.achieved}
                            placeholder="Months"
                            onChange={(e) => {
                              const copy = [...form.developmentalHistory.fineMotor];
                              copy[index].achieved = e.target.value;
                              update(["developmentalHistory", "fineMotor"], copy);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TableInput
                            type="text"
                            value={fineRow.impression}
                            placeholder="Impression"
                            onChange={(e) => {
                              const copy = [...form.developmentalHistory.fineMotor];
                              copy[index].impression = e.target.value;
                              update(["developmentalHistory", "fineMotor"], copy);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </tbody>
              </ModernTable>
            </TableContainer>

            {/* Second Table: Language and Social side by side */}
            <TableContainer style={{ marginTop: '2rem' }}>
              <ModernTable>
                <thead>
                  <tr>
                    <TableHead width="20%">Language</TableHead>
                    <TableHead width="10%">Expected</TableHead>
                    <TableHead width="10%">Achieved Months</TableHead>
                    <TableHead width="10%">Impression</TableHead>
                    <TableHead width="20%">Social</TableHead>
                    <TableHead width="10%">Expected</TableHead>
                    <TableHead width="10%">Achieved Months</TableHead>
                    <TableHead width="10%">Impression</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {form.developmentalHistory.language.map((langRow, index) => {
                    const socialRow = form.developmentalHistory.social[index] || { skill: "", expected: "", achieved: "", impression: "" };
                    return (
                      <TableRow key={index}>
                        <TableCell>{langRow.skill}</TableCell>
                        <TableCell>{langRow.expected}</TableCell>
                        <TableCell>
                          <TableInput
                            type="text"
                            value={langRow.achieved}
                            placeholder="Months"
                            onChange={(e) => {
                              const copy = [...form.developmentalHistory.language];
                              copy[index].achieved = e.target.value;
                              update(["developmentalHistory", "language"], copy);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TableInput
                            type="text"
                            value={langRow.impression}
                            placeholder="Impression"
                            onChange={(e) => {
                              const copy = [...form.developmentalHistory.language];
                              copy[index].impression = e.target.value;
                              update(["developmentalHistory", "language"], copy);
                            }}
                          />
                        </TableCell>
                        <TableCell>{socialRow.skill}</TableCell>
                        <TableCell>{socialRow.expected}</TableCell>
                        <TableCell>
                          <TableInput
                            type="text"
                            value={socialRow.achieved}
                            placeholder="Age"
                            onChange={(e) => {
                              const copy = [...form.developmentalHistory.social];
                              copy[index].achieved = e.target.value;
                              update(["developmentalHistory", "social"], copy);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TableInput
                            type="text"
                            value={socialRow.impression}
                            placeholder="Impression"
                            onChange={(e) => {
                              const copy = [...form.developmentalHistory.social];
                              copy[index].impression = e.target.value;
                              update(["developmentalHistory", "social"], copy);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </tbody>
              </ModernTable>
            </TableContainer>
          </Section>

          {/* Scholastic History */}
          <Section>
            <SectionTitle>Scholastic History</SectionTitle>
            <Label>
              Type of School
              <RadioGroup>
                {["Normal School", "Special School", "Inclusive School"].map((item) => (
                  <RadioLabel key={item}>
                    <input type="radio" name="typeOfSchool" checked={form.scholasticHistory.typeOfSchool === item} onChange={() => update(["scholasticHistory", "typeOfSchool"], item)} />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            <Grid style={{ marginTop: '1rem' }}>
              <Label>
                Age of Entry
                <Input type="text" value={form.scholasticHistory.ageOfEntry || ""} onChange={(e) => update(["scholasticHistory", "ageOfEntry"], e.target.value)} placeholder="Age" />
              </Label>
              <Label>
                Present Class
                <Input type="text" value={form.scholasticHistory.presentClass || ""} onChange={(e) => update(["scholasticHistory", "presentClass"], e.target.value)} placeholder="Current class" />
              </Label>
            </Grid>
            <Label style={{ marginTop: "1rem" }}>
  Medium of Instruction & Syllabus
  <CheckboxGroup>
    {mediumOptions.map((m) => (
      <CheckboxLabel key={m}>
        <input
          type="checkbox"
          checked={form.scholasticHistory.medium.includes(m)}
          onChange={(e) =>
            updateArrayCheckbox(
              ["scholasticHistory", "medium"],
              m,
              e.target.checked
            )
          }
        />
        <span>{m}</span>
      </CheckboxLabel>
    ))}
  </CheckboxGroup>
</Label>

            <Label style={{ marginTop: '1rem' }}>
              Scholastic Performance
              <RadioGroup>
                {["Good", "Average", "Poor"].map((item) => (
                  <RadioLabel key={item}>
                    <input type="radio" name="scholasticPerformance" checked={form.scholasticHistory.performance === item} onChange={() => update(["scholasticHistory", "performance"], item)} />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Any Disciplinary Problems?
              <RadioGroup>
                {["Yes", "No"].map((opt) => (
                  <RadioLabel key={opt}>
                    <input type="radio" name="disciplinaryProblems" checked={form.scholasticHistory.disciplinaryProblems === opt} onChange={() => update(["scholasticHistory", "disciplinaryProblems"], opt)} />
                    <span>{opt}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            {form.scholasticHistory.disciplinaryProblems === "Yes" && (
              <Label style={{ marginTop: '1rem' }}>
                If yes, give details
                <TextArea value={form.scholasticHistory.disciplinaryProblemsDetails} onChange={(e) => update(["scholasticHistory", "disciplinaryProblemsDetails"], e.target.value)} placeholder="Details..." />
              </Label>
            )}
            <Label style={{ marginTop: '1rem' }}>
              Regularity
              <RadioGroup>
                {["Regular", "Irregular", "Discontinued"].map((item) => (
                  <RadioLabel key={item}>
                    <input type="radio" name="regularity" checked={form.scholasticHistory.regularity === item} onChange={() => update(["scholasticHistory", "regularity"], item)} />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            {form.scholasticHistory.regularity === "Discontinued" && (
              <Label style={{ marginTop: '1rem' }}>
                If discontinued, reason
                <TextArea value={form.scholasticHistory.regularityDetails} onChange={(e) => update(["scholasticHistory", "regularityDetails"], e.target.value)} placeholder="Reason..." />
              </Label>
            )}
            <Label style={{ marginTop: '1rem' }}>
              Peer Group Adjustment
              <RadioGroup>
                {["Good", "InAdequate", "Poor"].map((item) => (
                  <RadioLabel key={item}>
                    <input type="radio" name="peerAdjustment" checked={form.scholasticHistory.peerAdjustment === item} onChange={() => update(["scholasticHistory", "peerAdjustment"], item)} />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Relation with Authorities
              <RadioGroup>
                {["Good", "InAdequate", "Poor"].map((item) => (
                  <RadioLabel key={item}>
                    <input
                      type="radio"
                      name="relationAuthorities"
                      checked={form.scholasticHistory.relationAuthorities === item}
                      onChange={() => update(["scholasticHistory", "relationAuthorities"], item)}
                    />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Any Other Information
              <Input type="text" value={form.scholasticHistory.otherInfo || ""} onChange={(e) => update(["scholasticHistory", "otherInfo"], e.target.value)} placeholder="Additional information" />
            </Label>
          </Section>

          {/* Play History */}
          <Section>
            <SectionTitle>Play History</SectionTitle>
            <Label>
              Play Behaviour
              <RadioGroup>
                {["Enjoys play", "Not interested in Play", "Observes others while playing", "Other"].map((item) => (
                  <RadioLabel key={item}>
                    <input type="radio" name="playBehaviour" checked={form.playHistory.playBehaviour === item} onChange={() => update(["playHistory", "playBehaviour"], item)} />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Play Preferences
              <RadioGroup>
                {["Plays alone", "With older", "With younger", "Peer group", "Animals", "No preferences"].map((item) => (
                  <RadioLabel key={item}>
                    <input type="radio" name="playPreferences" checked={form.playHistory.playPreferences === item} onChange={() => update(["playHistory", "playPreferences"], item)} />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            <Label style={{ marginTop: '1rem' }}>
              Knowledge of games governed by rules
              <RadioGroup>
                {["Yes", "No", "Not known"].map((item) => (
                  <RadioLabel key={item}>
                    <input type="radio" name="ruleKnowledge" checked={form.playHistory.ruleKnowledge === item} onChange={() => update(["playHistory", "ruleKnowledge"], item)} />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
            <Grid style={{ marginTop: '1rem' }}>
              <Label>
                Behaviour while playing in group
                <Input value={form.playHistory.groupBehaviour || ""} onChange={(e) => update(["playHistory", "groupBehaviour"], e.target.value)} placeholder="Describe behaviour" />
              </Label>
              <Label>
                Leisure time activities
                <Input value={form.playHistory.leisureTime || ""} onChange={(e) => update(["playHistory", "leisureTime"], e.target.value)} placeholder="Activities" />
              </Label>
              <Label>
                Special likes & dislikes
                <Input value={form.playHistory.likesDislikes || ""} onChange={(e) => update(["playHistory", "likesDislikes"], e.target.value)} placeholder="Likes/Dislikes" />
              </Label>
              <Label>
                Medical History
                <Input value={form.playHistory.medicalHistory || ""} onChange={(e) => update(["playHistory", "medicalHistory"], e.target.value)} placeholder="Medical history" />
              </Label>
              <Label>
                Allergy History
                <Input value={form.playHistory.allergyHistory || ""} onChange={(e) => update(["playHistory", "allergyHistory"], e.target.value)} placeholder="Allergies" />
              </Label>
              <Label>
                Screen Time
                <Input value={form.playHistory.screenTime || ""} onChange={(e) => update(["playHistory", "screenTime"], e.target.value)} placeholder="Daily screen time" />
              </Label>
            </Grid>
            <Label style={{ marginTop: '1rem' }}>
              Sleep History
              <RadioGroup>
                {["Onset", "Maintenance"].map((item) => (
                  <RadioLabel key={item}>
                    <input type="radio" name="sleepHistory" checked={form.playHistory.sleepHistory === item} onChange={() => update(["playHistory", "sleepHistory"], item)} />
                    <span>{item}</span>
                  </RadioLabel>
                ))}
              </RadioGroup>
            </Label>
          </Section>

          {/* Treatment History */}
          <Section>
            <SectionTitle>Treatment History</SectionTitle>
            <Label>
              Treatment History
              <Input value={form.treatmentHistory || ""} onChange={(e) => update(["treatmentHistory"], e.target.value)} placeholder="Previous treatments, therapies, interventions..." />
            </Label>
          </Section>

          {/* General History */}
          <Section>
            <SectionTitle>General History & Examination</SectionTitle>
            <Grid>
              <Label>
                Dysmorphic Features
                <Input value={form.generalHistory.dysmorphicFeatures || ""} onChange={(e) => update(["generalHistory", "dysmorphicFeatures"], e.target.value)} placeholder="Any dysmorphic features" />
              </Label>
              <Label>
                CNS Examination
                <Input value={form.generalHistory.cnsExamination || ""} onChange={(e) => update(["generalHistory", "cnsExamination"], e.target.value)} placeholder="CNS examination findings" />
              </Label>
              <Label>
                Higher Functions
                <Input value={form.generalHistory.higherFunctions || ""} onChange={(e) => update(["generalHistory", "higherFunctions"], e.target.value)} placeholder="Higher mental functions" />
              </Label>
              <Label>
                Cranial Nerve E/o
                <Input value={form.generalHistory.cranialNerve || ""} onChange={(e) => update(["generalHistory", "cranialNerve"], e.target.value)} placeholder="Cranial nerve examination" />
              </Label>
              <Label>
                Tone
                <Input value={form.generalHistory.tone || ""} onChange={(e) => update(["generalHistory", "tone"], e.target.value)} placeholder="Muscle tone" />
              </Label>
              <Label>
                Power
                <Input value={form.generalHistory.power || ""} onChange={(e) => update(["generalHistory", "power"], e.target.value)} placeholder="Muscle power" />
              </Label>
              <Label>
                Reflexes
                <Input value={form.generalHistory.reflexes || ""} onChange={(e) => update(["generalHistory", "reflexes"], e.target.value)} placeholder="Reflex examination" />
              </Label>
              <Label>
                Neonatal Reflex
                <Input value={form.generalHistory.neonatalReflex || ""} onChange={(e) => update(["generalHistory", "neonatalReflex"], e.target.value)} placeholder="Neonatal reflexes" />
              </Label>
              <Label>
                Neurocutaneous Markers
                <Input value={form.generalHistory.neurocutaneousMarkers || ""} onChange={(e) => update(["generalHistory", "neurocutaneousMarkers"], e.target.value)} placeholder="Any neurocutaneous markers" />
              </Label>
            </Grid>
          </Section>

          {/* Submit Buttons */}
          <ButtonRow>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "💾 Save Record"}
            </Button>
            <Button type="button" secondary onClick={() => window.location.reload()}>
              🔄 Reset Form
            </Button>
            {message && <Message error={message.includes("Error")}>{message}</Message>}
          </ButtonRow>
        </form>
      </InnerContainer>
    </Container>
  );
}