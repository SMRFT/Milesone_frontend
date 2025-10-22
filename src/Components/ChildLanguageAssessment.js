import { useState, useEffect } from "react";
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import './ChildLanguageAssessment.css'; // Import the CSS file for styling


const PatientDetailsContainer = styled.div`
  background-color: #f0f8ff;
  padding: 10px 20px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  p {
    font-size: 1rem;
    margin: 0 10px;
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
    text-align: center;

    p {
      margin: 5px 0;
    }
  }
`;
const ChildLanguageAssessment = () => {
  const [formData, setFormData] = useState({
    childName: '',
    age: '',
    gender: '',
    dateOfAssessment: '',
    complaint: '',
    onsetproblem: '',
    natureproblem: '',
    medicalhistory: '',
    natalhistory: {
      prenatalhistory: {
        maternalInfections: '',
        medicationsDuringPregnancy: '',
        otherIllness: '',
        physicalAgents: '',
      },
      perinatalhistory: {
        delivery: '',
        termofdelivery: '',
        birthcry: '',
        birthweight: '',
        birthcolour: '',
        neonataljaundice: '',
        apggarscore: '',
        hypoxiaischemia: '',
        congenitalanomalies: '',
        trauma: '',
      },
      postnatalhistory: {
        seizures: '',
        craniofacial: '',
        syndromes: '',
        infections: '',
        visualProblems: '',
        neurologicalImpairments: '',
        headInjury: '',
        metabolicDisorder: '',
        surgicalTreatment: '',
        ototoxicDrugs: '',
      },

    },
    familyhistory: '',
    developmentalhistory: {
      motorDevelopment: {
        headControlText: '',
        turningOverText: '',
        sittingText: '',
        crawlingText: '',
        standingWithSupportText: '',
        standingWithoutSupportText: '',
        walkingWithSupportText: '',
        walkingWithoutSupportText: '',
        bowelAndBladderControlText: '',
      },
      speechAndLanguageDevelopment: {
        cryingVocalizationText: '',
        cooingText: '',
        babblingText: '',
        jargonSpeechText: '',
        firstWordText: '',
        twoWordUtteranceText: '',
        phrasesSentenceText: '',
      },
    },
    socialemotionalbehavior: {
      recognizesParents: '', // Yes/No
      refusesStrangers: '', // Yes/No
      makesEyeContact: '', // Yes/No
      prefersPlayAlone: '', // Yes/No
      withdrawn: '', // Yes/No
      bizarreActivities: '', // Yes/No
      socializeWell: '', // Yes/No
      attentionSeeking: '', // Yes/No
      temperTantrum: '', // Yes/No
      shiftsFrequently: '', // Yes/No
      aggressive: '', // Yes/No
      restless: '', // Yes/No
      stereotypicBehaviours: '', // Yes/No
      inappropriateEmotion: '', // Yes/No
      selfStimulatoryBehaviour: '', // Yes/No
      typeOfPlay: '', // Text
      educationHistory: '', // Text
      others: '', // Text
    },
    prerequisitesforspeech: {
      eyeContact: '',
      jointAttention: '',
      compliance: '',
      turnTakingSkill: '',
      imitation: '',
      meansToEndRelation: '',
    },
    oralperipheralmechanism: {
      lipsAppearance: 'Normal',
      lipsFunction: 'Pursing',
      teethAppearance: 'Normal',
      teethFunction: 'Biting',
      alveolusAppearance: 'Normal',
      tongueAppearance: 'Normal',
      tongueFunction: 'Protrusion',
      hardPalateAppearance: 'Normal',
      softPalateAppearance: 'Normal',
      softPalateFunction: 'Adequate',
      uvulaAppearance: 'Normal',
      jawAppearance: 'Normal',
      jawFunction: 'Adequate',
      oralperipheralcomments: '',
    },
    vegetativeskills: {
      sucking: "Adequate",
      swallowing: "Adequate",
      chewing: "Adequate",
      biting: "Adequate",
      blowing: "Adequate",
      drooling: "Present",
    },
    communicationprofile: {
      modeOfCommunication: "Verbal", // default value
      languageUsed: "",
      receptiveSkill: "",
      expressiveSkill: "",
    },
    testadministered: '',
    provisionaldiagnosis: '',
    recommendation: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const location = useLocation(); // Get the state from the previous page
  const { patient } = location.state || {}; // Destructure patient data from state
  const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
  useEffect(() => {
    // Set current date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    setFormData((prevData) => ({
      ...prevData,
      dateOfAssessment: today,
      childName: patient?.patient_name || "",
      age: patient?.age  
      ? `${patient.age.year} years, ${patient.age.months} months, ${patient.age.days} days` 
      : '',
      gender: patient?.sex || "",
    }));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    console.log(`Updating field: ${name}, Value: ${value}`);
  
    setFormData((prevData) => {
      // For date input, ensure the format is valid
      if (name === 'dateOfAssessment') {
        const formattedValue = new Date(value).toISOString().split('T')[0];
        return {
          ...prevData,
          [name]: formattedValue,
        };
      }
  
      // Handle top-level fields like childName, age, and gender
    if (['childName', 'age', 'gender'].includes(name)) {
      console.log(`Updating ${name} to ${value}`); // Debugging log
      return {
        ...prevData,
        [name]: value,
      };
    }
  
      // Define the sections for more nested logic
      const sections = [
        'natalhistory',
        'developmentalhistory',
        'socialemotionalbehavior',
        'prerequisitesforspeech',
        'oralperipheralmechanism',
        'vegetativeskills',
        'communicationprofile',
      ];
  
      // Loop through each section for updating nested data
      for (const section of sections) {
        if (name in (prevData[section]?.prenatalhistory || {})) {
          return {
            ...prevData,
            [section]: {
              ...prevData[section],
              prenatalhistory: {
                ...prevData[section].prenatalhistory,
                [name]: value,
              },
            },
          };
        } else if (name in (prevData[section]?.perinatalhistory || {})) {
          return {
            ...prevData,
            [section]: {
              ...prevData[section],
              perinatalhistory: {
                ...prevData[section].perinatalhistory,
                [name]: value,
              },
            },
          };
        } else if (name in (prevData[section]?.postnatalhistory || {})) {
          return {
            ...prevData,
            [section]: {
              ...prevData[section],
              postnatalhistory: {
                ...prevData[section].postnatalhistory,
                [name]: value,
              },
            },
          };
        } else if (name in (prevData[section]?.motorDevelopment || {})) {
          return {
            ...prevData,
            [section]: {
              ...prevData[section],
              motorDevelopment: {
                ...prevData[section].motorDevelopment,
                [name]: value,
              },
            },
          };
        } else if (name in (prevData[section]?.speechAndLanguageDevelopment || {})) {
          return {
            ...prevData,
            [section]: {
              ...prevData[section],
              speechAndLanguageDevelopment: {
                ...prevData[section].speechAndLanguageDevelopment,
                [name]: value,
              },
            },
          };
        } else if (name in (prevData[section] || {})) {
          return {
            ...prevData,
            [section]: {
              ...prevData[section],
              [name]: value,
            },
          };
        }
      }
  
      // Default fallback for fields not in specific sections
      return {
        ...prevData,
        [name]: value,
      };
    });
  };
  
  


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    // Send the form data directly to the backend
    try {
      const response = await fetch(`${Milestonebaseurl}childspeechassessment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), // Send the formData as is
      });
      const result = await response.json();
      console.log('Form Submitted:', result);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };
  
  const nextPage = () => {
    if (currentPage < 15) setCurrentPage(currentPage + 1);
  };
  
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

 

  return (
    <div className="StyledContainer">
      <h2>Child Speech and Language Assessment</h2>
      <form onSubmit={handleSubmit}>
        {currentPage === 1 && (
          <fieldset className="Fieldset">
            <div className="Row">
            <div className="LabelInputContainer">
                <label htmlFor="dateOfAssessment" className="Label">Date of Assessment:</label>
                <input
                  type="date"
                  id="dateOfAssessment"
                  name="dateOfAssessment"
                  value={formData.dateOfAssessment}
                  onChange={handleChange}
                  className="Input"
                />
              </div>
              <div className="LabelInputContainer">
                <label htmlFor="childName" className="Label">Child Name:</label>
                <input
                  type="text"
                  id="childName"
                  name="childName"
                  value={formData.childName|| (patient && patient.patient_name) || ''}
                  onChange={handleChange}
                  className="Input"
                />
              </div>

              <div className="LabelInputContainer">
                <label htmlFor="age" className="Label">Age:</label>
                <input
                  type="text"
                  id="age"
                  name="age"
                  value={formData.age || 
                    (patient && patient.age 
                      ? `${patient.age.year} years, ${patient.age.months} months, ${patient.age.days} days` 
                      : ''
                    )}
                  onChange={handleChange}
                  className="Input"
                />
              </div>
              <div className="LabelInputContainer">
                <label htmlFor="gender" className="Label">Gender:</label>
                <input
                  type="text"
                  id="gender"
                  name="gender"
                  value={formData.gender || (patient && patient.sex) || ''}
                  onChange={handleChange}
                  className="Input"
                />
              </div>
            </div>
          </fieldset>
        )}
        

        {currentPage === 2 && (
          <>
            <fieldset className="Fieldset">
              <div className="LabelInputContainer">
                <label htmlFor="complaint" className="Label">I. Complaints</label>
                <textarea
                  id="complaint"
                  name="complaint"
                  value={formData.complaint}
                  onChange={handleChange}
                  className="Textarea"
                />
              </div>
            </fieldset>

            <fieldset className="Fieldset">
              <div className="LabelInputContainer">
                <label htmlFor="onsetproblem" className="Label">II. Onset of the Problem</label>
                <textarea
                  id="onsetproblem"
                  name="onsetproblem"
                  value={formData.onsetproblem}
                  onChange={handleChange}
                  className="Textarea"
                />
              </div>
            </fieldset>
          </>
        )}

        {currentPage === 3 && (
          <>
            <fieldset className="Fieldset">
              <div className="LabelInputContainer">
                <label htmlFor="natureproblem" className="Label">III. Nature of the Problem</label>
                <textarea
                  id="natureproblem"
                  name="natureproblem"
                  value={formData.natureproblem}
                  onChange={handleChange}
                  className="Textarea"
                />
              </div>
            </fieldset>

            <fieldset className="Fieldset">
              <div className="LabelInputContainer">
                <label htmlFor="medicalhistory" className="Label">IV. Medical history</label>
                <textarea
                  id="medicalhistory"
                  name="medicalhistory"
                  value={formData.medicalhistory}
                  onChange={handleChange}
                  className="Textarea"
                />
              </div>
            </fieldset>

          </>
        )}

        {currentPage === 4 && (
          <div>
            <fieldset className="Fieldset">
              <div>
                <p><strong>V. Natal History:</strong></p>
                <p className="Subheading">a. Pre-Natal History:</p>
                <div className="TextInputContainer">
                  <div className="TextInputItem">
                    <label htmlFor="maternalInfections" className="Label">1. Maternal infections: TORCH Complex/other infections</label>
                    <input
                      type="text"
                      id="maternalInfections"
                      name="maternalInfections"
                      value={formData.natalhistory.prenatalhistory.maternalInfections || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>

                  <div className="TextInputItem">
                    <label htmlFor="medicationsDuringPregnancy" className="Label">2. Medications during Pregnancy:</label>
                    <input
                      type="text"
                      id="medicationsDuringPregnancy"
                      name="medicationsDuringPregnancy"
                      value={formData.natalhistory.prenatalhistory.medicationsDuringPregnancy || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>

                  <div className="TextInputItem">
                    <label htmlFor="otherIllness" className="Label">3. Other Illness: Toxemia / Diabetes / Nutritional Deficiencies / High Blood Pressure / RH incompatibility</label>
                    <input
                      type="text"
                      id="otherIllness"
                      name="otherIllness"
                      value={formData.natalhistory.prenatalhistory.otherIllness || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>

                  <div className="TextInputItem">
                    <label htmlFor="physicalAgents" className="Label">4. Physical Agents: Exposure to Heat, radiation, chemicals</label>
                    <input
                      type="text"
                      id="physicalAgents"
                      name="physicalAgents"
                      value={formData.natalhistory.prenatalhistory.physicalAgents || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        )}

        {currentPage === 5 && (
          <div>
            <fieldset className="Fieldset">
              <div>
                <p><strong>V. Natal History:</strong></p>
                <p className="Subheading">b. Peri-Natal History:</p>
                <div className="TextInputContainer">
                  <div className="TextInputItem">
                    <label htmlFor="delivery" className="Label">1. Delivery</label>
                    <input
                      type="text"
                      id="delivery"
                      name="delivery"
                      value={formData.natalhistory.perinatalhistory.delivery || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>

                  <div className="TextInputItem">
                    <label htmlFor="termofdelivery" className="Label">2. Term of Delivery:</label>
                    <input
                      type="text"
                      id="termofdelivery"
                      name="termofdelivery"
                      value={formData.natalhistory.perinatalhistory.termofdelivery || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>

                  <div className="TextInputItem">
                    <label htmlFor="birthcry" className="Label">3. Birth cry:</label>
                    <input
                      type="text"
                      id="birthcry"
                      name="birthcry"
                      value={formData.natalhistory.perinatalhistory.birthcry || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>

                  <div className="TextInputItem">
                    <label htmlFor="birthweight" className="Label">4. Birth Weight</label>
                    <input
                      type="text"
                      id="birthweight"
                      name="birthweight"
                      value={formData.natalhistory.perinatalhistory.birthweight || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                  <div className="TextInputItem">
                    <label htmlFor="birthcolour" className="Label">5. Birth Colour</label>
                    <input
                      type="text"
                      id="birthcolour"
                      name="birthcolour"
                      value={formData.natalhistory.perinatalhistory.birthcolour || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                  <div className="TextInputItem">
                    <label htmlFor="neonataljaundice" className="Label">6. Neonatal Jaundice:</label>
                    <input
                      type="text"
                      id="neonataljaundice"
                      name="neonataljaundice"
                      value={formData.natalhistory.perinatalhistory.neonataljaundice || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                  <div className="TextInputItem">
                    <label htmlFor="apggarscore" className="Label">7. APGAR Score</label>
                    <input
                      type="text"
                      id="apggarscore"
                      name="apggarscore"
                      value={formData.natalhistory.perinatalhistory.apggarscore || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                  <div className="TextInputItem">
                    <label htmlFor="congenitalanomalies" className="Label">8. Congenital Anomalies</label>
                    <input
                      type="text"
                      id="congenitalanomalies"
                      name="congenitalanomalies"
                      value={formData.natalhistory.perinatalhistory.congenitalanomalies || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                  <div className="TextInputItem">
                    <label htmlFor="hypoxiaischemia" className="Label">9. Specify if Hypoxia, Ischemia, Asphyxia present:</label>
                    <input
                      type="text"
                      id="hypoxiaischemia"
                      name="hypoxiaischemia"
                      value={formData.natalhistory.perinatalhistory.hypoxiaischemia || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                  <div className="TextInputItem">
                    <label htmlFor="trauma" className="Label">10. Trauma - During Labour / Delivery:</label>
                    <input
                      type="text"
                      id="trauma"
                      name="trauma"
                      value={formData.natalhistory.perinatalhistory.trauma || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>

                </div>
              </div>
            </fieldset>
          </div>
        )}
        {currentPage === 6 && (
          <div>
            <fieldset className="Fieldset">
              <div>
                <p><strong>V. Natal History:</strong></p>
                <p className="Subheading">b. Post-Natal History:</p>
                <div className="TextInputContainer">
                  <div className="TextInputItem">
                    <label htmlFor="seizures" className="Label">1. Seizures : Present / Absent (if present specify no of Episodes)</label>
                    <input
                      type="text"
                      id="seizures"
                      name="seizures"
                      value={formData.natalhistory.postnatalhistory.seizures || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>

                  <div className="TextInputItem">
                    <label htmlFor="craniofacial" className="Label">2. Craniofacial Malformation : Present / Absent</label>
                    <input
                      type="text"
                      id="craniofacial"
                      name="craniofacial"
                      value={formData.natalhistory.postnatalhistory.craniofacial || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>

                  <div className="TextInputItem">
                    <label htmlFor="syndromes" className="Label">3. Syndromes (CHARGE / Congenital malformation of Cochlea)</label>
                    <input
                      type="text"
                      id="syndromes"
                      name="syndromes"
                      value={formData.natalhistory.postnatalhistory.syndromes || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>

                  <div className="TextInputItem">
                    <label htmlFor="infections" className="Label">4. Infections: Herpes zoster/Syphilis/Measles Chicken pox/Mumps/Influenza/Neningitis/Others</label>
                    <input
                      type="text"
                      id="infections"
                      name="infections"
                      value={formData.natalhistory.postnatalhistory.infections || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                  <div className="TextInputItem">
                    <label htmlFor="visualProblems" className="Label">5. Visual Problems:</label>
                    <input
                      type="text"
                      id="visualProblems"
                      name="visualProblems"
                      value={formData.natalhistory.postnatalhistory.visualProblems || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                  <div className="TextInputItem">
                    <label htmlFor="neurologicalImpairments" className="Label">6. Neurological Impairments:</label>
                    <input
                      type="text"
                      id="neurologicalImpairments"
                      name="neurologicalImpairments"
                      value={formData.natalhistory.postnatalhistory.neurologicalImpairments || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                  <div className="TextInputItem">
                    <label htmlFor="headInjury" className="Label">7. Head Injury</label>
                    <input
                      type="text"
                      id="headInjury"
                      name="headInjury"
                      value={formData.natalhistory.postnatalhistory.headInjury || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                  <div className="TextInputItem">
                    <label htmlFor="metabolicDisorder" className="Label">8. Metabolic and Endocrinal Disorder</label>
                    <input
                      type="text"
                      id="metabolicDisorder"
                      name="metabolicDisorder"
                      value={formData.natalhistory.postnatalhistory.metabolicDisorder || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                  <div className="TextInputItem">
                    <label htmlFor="surgicalTreatment" className="Label">9. Surgical Treatment:</label>
                    <input
                      type="text"
                      id="surgicalTreatment"
                      name="surgicalTreatment"
                      value={formData.natalhistory.postnatalhistory.surgicalTreatment || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                  <div className="TextInputItem">
                    <label htmlFor="ototoxicDrugs" className="Label">10. Ototoxic Drugs:</label>
                    <input
                      type="text"
                      id="ototoxicDrugs"
                      name="ototoxicDrugs"
                      value={formData.natalhistory.postnatalhistory.ototoxicDrugs || ''}
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>

                </div>
              </div>
            </fieldset>
          </div>
        )}
        {currentPage === 7 && (

          <fieldset className="Fieldset">
            <div className="LabelInputContainer">
              <label>VI. Family History</label>
              <label htmlFor="familyhistory" className="Label">Consanguinity:</label>
              <textarea
                id="familyhistory"
                name="familyhistory"
                value={formData.familyhistory}
                onChange={handleChange}
                className="Textarea"
              />
            </div>
          </fieldset>
        )}

        {currentPage === 8 && (
          <fieldset className="Fieldset">
            <div>
              <p><strong>VII. Developmental History</strong></p>
              <p className="Subheading">a. Motor Development</p>
              <div className="TextInputContainer">
                <div className="TextInputItem">
                  <label htmlFor="headControlText" className="Label">1. Head Control:</label>
                  <input
                    type="text"
                    id="headControlText"
                    name="headControlText"
                    value={formData.developmentalhistory.motorDevelopment.headControlText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="turningOverText" className="Label">2. Turning Over:</label>
                  <input
                    type="text"
                    id="turningOverText"
                    name="turningOverText"
                    value={formData.developmentalhistory.motorDevelopment.turningOverText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="sittingText" className="Label">3. Sitting:</label>
                  <input
                    type="text"
                    id="sittingText"
                    name="sittingText"
                    value={formData.developmentalhistory.motorDevelopment.sittingText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="crawlingText" className="Label">4. Crawling:</label>
                  <input
                    type="text"
                    id="crawlingText"
                    name="crawlingText"
                    value={formData.developmentalhistory.motorDevelopment.crawlingText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="standingWithSupportText" className="Label">5. Standing with support:</label>
                  <input
                    type="text"
                    id="standingWithSupportText"
                    name="standingWithSupportText"
                    value={formData.developmentalhistory.motorDevelopment.standingWithSupportText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="standingWithoutSupportText" className="Label">6. Standing without support:</label>
                  <input
                    type="text"
                    id="standingWithoutSupportText"
                    name="standingWithoutSupportText"
                    value={formData.developmentalhistory.motorDevelopment.standingWithoutSupportText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="walkingWithSupportText" className="Label">7. Walking with support:</label>
                  <input
                    type="text"
                    id="walkingWithSupportText"
                    name="walkingWithSupportText"
                    value={formData.developmentalhistory.motorDevelopment.walkingWithSupportText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="walkingWithoutSupportText" className="Label">8. Walking without support:</label>
                  <input
                    type="text"
                    id="walkingWithoutSupportText"
                    name="walkingWithoutSupportText"
                    value={formData.developmentalhistory.motorDevelopment.walkingWithoutSupportText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="bowelAndBladderControlText" className="Label">9. Bowel and Bladder control:</label>
                  <input
                    type="text"
                    id="bowelAndBladderControlText"
                    name="bowelAndBladderControlText"
                    value={formData.developmentalhistory.motorDevelopment.bowelAndBladderControlText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>
              </div>
            </div>
          </fieldset>
        )}
        {currentPage === 9 && (
          <fieldset className="Fieldset">
            <div>
              <p><strong>VIII. Developmental History</strong></p>
              <p className="Subheading">b. Speech and Language Development</p>
              <div className="TextInputContainer">

                <div className="TextInputItem">
                  <label htmlFor="cryingVocalizationText" className="Label">1. Crying/vocalization:</label>
                  <input
                    type="text"
                    id="cryingVocalizationText"
                    name="cryingVocalizationText"
                    value={formData.developmentalhistory.speechAndLanguageDevelopment.cryingVocalizationText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="cooingText" className="Label">2. Cooing:</label>
                  <input
                    type="text"
                    id="cooingText"
                    name="cooingText"
                    value={formData.developmentalhistory.speechAndLanguageDevelopment.cooingText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="babblingText" className="Label">3. Babbling:</label>
                  <input
                    type="text"
                    id="babblingText"
                    name="babblingText"
                    value={formData.developmentalhistory.speechAndLanguageDevelopment.babblingText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="jargonSpeechText" className="Label">4. Jargon speech:</label>
                  <input
                    type="text"
                    id="jargonSpeechText"
                    name="jargonSpeechText"
                    value={formData.developmentalhistory.speechAndLanguageDevelopment.jargonSpeechText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="firstWordText" className="Label">5. First word:</label>
                  <input
                    type="text"
                    id="firstWordText"
                    name="firstWordText"
                    value={formData.developmentalhistory.speechAndLanguageDevelopment.firstWordText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="twoWordUtteranceText" className="Label">6. Two word utterance:</label>
                  <input
                    type="text"
                    id="twoWordUtteranceText"
                    name="twoWordUtteranceText"
                    value={formData.developmentalhistory.speechAndLanguageDevelopment.twoWordUtteranceText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="phrasesSentenceText" className="Label">7. Phrases and Sentence:</label>
                  <input
                    type="text"
                    id="phrasesSentenceText"
                    name="phrasesSentenceText"
                    value={formData.developmentalhistory.speechAndLanguageDevelopment.phrasesSentenceText || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

              </div>
            </div>
          </fieldset>
        )}

        {currentPage === 10 && (
          <fieldset className="Fieldset">
            <div>
              <p><strong> VIII. Social, Emotional & BehavioralHistory</strong> </p>
              <div className="TextInputContainer">

                {/* Yes/No Dropdown fields */}
                {[
                  { id: "recognizesParents", label: "1. Recognizes Parents" },
                  { id: "refusesStrangers", label: "2. Refuses to go to strangers" },
                  { id: "makesEyeContact", label: "3. Makes Eye Contact" },
                  { id: "prefersPlayAlone", label: "4. Prefers to play by himself" },
                  { id: "withdrawn", label: "5. Withdrawn" },
                  { id: "bizarreActivities", label: "6. Indulges in Bizarre activities" },
                  { id: "socializeWell", label: "7. Socialize well" },
                  { id: "attentionSeeking", label: "8. Attention seeking Behaviours" },
                  { id: "temperTantrum", label: "9. Exhibits temper tantrum" },
                  { id: "shiftsFrequently", label: "10. Shifts frequently" },
                  { id: "aggressive", label: "11. Aggressive" },
                  { id: "restless", label: "12. Restless" },
                  { id: "stereotypicBehaviours", label: "13. Stereotypic Behaviours" },
                  { id: "inappropriateEmotion", label: "14. Inappropriate emotion" },
                  { id: "selfStimulatoryBehaviour", label: "15. Self Stimulatory Behaviour" },
                ].map((field) => (
                  <div key={field.id} className="TextInputItem">
                    <label htmlFor={field.id} className="Label">{field.label}:</label>
                    <select
                      id={field.id}
                      name={field.id}
                      value={formData.socialemotionalbehavior?.[field.id] || ''} // Access the nested value
                      onChange={handleChange}
                      className="Dropdown"
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                ))}

                {/* Additional Text Input fields */}
                {[
                  { id: "typeOfPlay", label: "16. Type of Play" },
                  { id: "educationHistory", label: "17. Education History" },
                  { id: "others", label: "18. Others" },
                ].map((field) => (
                  <div key={field.id} className="TextInputItem">
                    <label htmlFor={field.id} className="Label">{field.label}:</label>
                    <input
                      type="text"
                      id={field.id}
                      name={field.id}
                      value={formData.socialemotionalbehavior?.[field.id] || ''} // Access the nested value
                      onChange={handleChange}
                      className="TextInput"
                    />
                  </div>
                ))}
              </div>
            </div>
          </fieldset>
        )}

        {currentPage === 11 && (
          <fieldset className="Fieldset">
            <div>
              <p><strong>IX. Prerequisites for Speech & Language Development</strong></p>
              <div className="TextInputContainer">
                <div className="TextInputItem">
                  <label htmlFor="eyeContact" className="Label">a. Eye Contact:</label>
                  <input
                    type="text"
                    id="eyeContact"
                    name="eyeContact"
                    value={formData.prerequisitesforspeech.eyeContact || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="jointAttention" className="Label">b. Joint Attention & Concentration:</label>
                  <input
                    type="text"
                    id="jointAttention"
                    name="jointAttention"
                    value={formData.prerequisitesforspeech.jointAttention || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="compliance" className="Label">c. Compliance:</label>
                  <input
                    type="text"
                    id="compliance"
                    name="compliance"
                    value={formData.prerequisitesforspeech.compliance || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="turnTakingSkill" className="Label">d. Turn-Taking Skill:</label>
                  <input
                    type="text"
                    id="turnTakingSkill"
                    name="turnTakingSkill"
                    value={formData.prerequisitesforspeech.turnTakingSkill || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="imitation" className="Label">e. Imitation:</label>
                  <input
                    type="text"
                    id="imitation"
                    name="imitation"
                    value={formData.prerequisitesforspeech.imitation || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>

                <div className="TextInputItem">
                  <label htmlFor="meansToEndRelation" className="Label">f. Means to End Relation:</label>
                  <input
                    type="text"
                    id="meansToEndRelation"
                    name="meansToEndRelation"
                    value={formData.prerequisitesforspeech.meansToEndRelation || ''}
                    onChange={handleChange}
                    className="TextInput"
                  />
                </div>
              </div>
            </div>
          </fieldset>
        )}


        {currentPage === 12 && (
          <fieldset className="Fieldset">
            <div>
              <p className="SectionHeading">X. Oral Peripheral Mechanism Examination</p>
              <table className="Table">
                <thead>
                  <tr>
                    <th>Structure</th>
                    <th>Appearance</th>
                    <th>Function</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Lips</td>
                    <td>
                      <select name="lipsAppearance" value={formData.oralperipheralmechanism.lipsAppearance} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Asymmetrical">Asymmetrical</option>
                        <option value="Repaired">Repaired</option>
                      </select>
                    </td>
                    <td>
                      <select name="lipsFunction" value={formData.oralperipheralmechanism.lipsFunction} onChange={handleChange}>
                        <option value="Pursing">Pursing</option>
                        <option value="Puckering">Puckering</option>
                        <option value="Rounding">Rounding</option>
                        <option value="Spreading">Spreading</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>Teeth</td>
                    <td>
                      <select name="teethAppearance" value={formData.oralperipheralmechanism.teethAppearance} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Missing">Missing</option>
                        <option value="Malaligned">Malaligned</option>
                      </select>
                    </td>
                    <td>
                      <select name="teethFunction" value={formData.oralperipheralmechanism.teethFunction} onChange={handleChange}>
                        <option value="Biting">Biting</option>
                        <option value="Chewing">Chewing</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>Alveolus</td>
                    <td>
                      <select name="alveolusAppearance" value={formData.oralperipheralmechanism.alveolusAppearance} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Cleft">Cleft</option>
                        <option value="Repaired">Repaired</option>
                        <option value="Fistula">Fistula</option>
                      </select>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>Tongue</td>
                    <td>
                      <select name="tongueAppearance" value={formData.oralperipheralmechanism.tongueAppearance} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Asymmetrical">Asymmetrical</option>
                        <option value="Microglossia">Microglossia</option>
                        <option value="Macroglossia">Macroglossia</option>
                        <option value="Ankyloglossia">Ankyloglossia</option>
                      </select>
                    </td>
                    <td>
                      <select name="tongueFunction" value={formData.oralperipheralmechanism.tongueFunction} onChange={handleChange}>
                        <option value="Protrusion">Protrusion</option>
                        <option value="Retraction">Retraction</option>
                        <option value="Lateralization">Lateralization</option>
                        <option value="Elevation">Elevation</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>Hard Palate</td>
                    <td>
                      <select name="hardPalateAppearance" value={formData.oralperipheralmechanism.hardPalateAppearance} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Cleft">Cleft</option>
                        <option value="Repaired">Repaired</option>
                        <option value="Fistula">Fistula</option>
                        <option value="Submucous Cleft">Submucous Cleft</option>
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td>Soft Palate</td>
                    <td>
                      <select name="softPalateAppearance" value={formData.oralperipheralmechanism.softPalateAppearance} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Cleft">Cleft</option>
                        <option value="Repaired">Repaired</option>
                        <option value="Fistula">Fistula</option>
                      </select>
                    </td>
                    <td>
                      <select name="softPalateFunction" value={formData.oralperipheralmechanism.softPalateFunction} onChange={handleChange}>
                        <option value="Adequate">Adequate</option>
                        <option value="Inadequate">Inadequate</option>
                      </select>
                    </td>
                  </tr>

                  <tr>
                    <td>Uvula</td>
                    <td>
                      <select name="uvulaAppearance" value={formData.oralperipheralmechanism.uvulaAppearance} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Asymmetrical">Asymmetrical</option>
                        <option value="Bifid">Bifid</option>
                        <option value="Short">Short</option>
                      </select>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>Jaw</td>
                    <td>
                      <select name="jawAppearance" value={formData.oralperipheralmechanism.jawAppearance} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Asymmetrical">Asymmetrical</option>
                      </select>
                    </td>
                    <td>
                      <select name="jawFunction" value={formData.oralperipheralmechanism.jawFunction} onChange={handleChange}>
                        <option value="Adequate">Adequate</option>
                        <option value="Inadequate">Inadequate</option>
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="CommentsContainer">
                <label htmlFor="oralperipheralcomments" className="Label">Comments:</label>
                <textarea
                  id="oralperipheralcomments"
                  name="oralperipheralcomments"
                  value={formData.oralperipheralmechanism.oralperipheralcomments}
                  onChange={handleChange}
                  className="TextArea"
                ></textarea>
              </div>
            </div>
          </fieldset>
        )}

        {currentPage === 13 && (
          <fieldset className="Fieldset">
            <div>
              <p className="SectionHeading">XI. Vegetative Skills</p>
              <div className="SkillContainer">
                <label className="Label" htmlFor="sucking">Sucking:</label>
                <select id="sucking" name="sucking" value={formData.vegetativeskills.sucking} onChange={handleChange} className="Dropdown">
                  <option value="Adequate">Adequate</option>
                  <option value="Inadequate">Inadequate</option>
                  <option value="Not Trained">Not Trained</option>
                </select>
              </div>

              <div className="SkillContainer">
                <label className="Label" htmlFor="swallowing">Swallowing:</label>
                <select id="swallowing" name="swallowing" value={formData.vegetativeskills.swallowing} onChange={handleChange} className="Dropdown">
                  <option value="Adequate">Adequate</option>
                  <option value="Inadequate">Inadequate</option>
                  <option value="Not Trained">Not Trained</option>
                </select>
              </div>

              <div className="SkillContainer">
                <label className="Label" htmlFor="chewing">Chewing:</label>
                <select id="chewing" name="chewing" value={formData.vegetativeskills.chewing} onChange={handleChange} className="Dropdown">
                  <option value="Adequate">Adequate</option>
                  <option value="Inadequate">Inadequate</option>
                  <option value="Not Trained">Not Trained</option>
                </select>
              </div>

              <div className="SkillContainer">
                <label className="Label" htmlFor="biting">Biting:</label>
                <select id="biting" name="biting" value={formData.vegetativeskills.biting} onChange={handleChange} className="Dropdown">
                  <option value="Adequate">Adequate</option>
                  <option value="Inadequate">Inadequate</option>
                  <option value="Not Trained">Not Trained</option>
                </select>
              </div>

              <div className="SkillContainer">
                <label className="Label" htmlFor="blowing">Blowing:</label>
                <select id="blowing" name="blowing" value={formData.vegetativeskills.blowing} onChange={handleChange} className="Dropdown">
                  <option value="Adequate">Adequate</option>
                  <option value="Inadequate">Inadequate</option>
                  <option value="Not Trained">Not Trained</option>
                </select>
              </div>

              <div className="SkillContainer">
                <label className="Label" htmlFor="drooling">Drooling:</label>
                <select id="drooling" name="drooling" value={formData.vegetativeskills.drooling} onChange={handleChange} className="Dropdown">
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>
          </fieldset>
        )}

        {currentPage === 14 && (
          <fieldset className="Fieldset">
            <div>
              <p className="SectionHeading">XII. Communication Profile</p>

              <div className="FieldContainer">
                <label className="Label" htmlFor="modeOfCommunication">a. Mode of Communication:</label>
                <select
                  id="modeOfCommunication"
                  name="modeOfCommunication"
                  value={formData.communicationprofile.modeOfCommunication}
                  onChange={handleChange}
                  className="Dropdown"
                >
                  <option value="Verbal">Verbal</option>
                  <option value="Gestural">Gestural</option>
                  <option value="Combined">Combined</option>
                </select>
              </div>

              <div className="FieldContainer">
                <label className="Label" htmlFor="languageUsed">b. Language used at home / Mother Tongue:</label>
                <input
                  type="text"
                  id="languageUsed"
                  name="languageUsed"
                  value={formData.communicationprofile.languageUsed}
                  onChange={handleChange}
                  className="TextInput"
                />
              </div>

              <div className="FieldContainer">
                <label className="Label" htmlFor="receptiveSkill">c. Receptive Skill:</label>
                <textarea
                  id="receptiveSkill"
                  name="receptiveSkill"
                  value={formData.communicationprofile.receptiveSkill}
                  onChange={handleChange}
                  className="Textarea"
                  rows="4"
                ></textarea>
              </div>

              <div className="FieldContainer">
                <label className="Label" htmlFor="expressiveSkill">d. Expressive Skill:</label>
                <textarea
                  id="expressiveSkill"
                  name="expressiveSkill"
                  value={formData.communicationprofile.expressiveSkill}
                  onChange={handleChange}
                  className="Textarea"
                  rows="4"
                ></textarea>
              </div>
            </div>
          </fieldset>
        )}

        {currentPage === 15 && (
          <fieldset className="Fieldset">
            <div>
              <p className="SectionHeading">XIII. Test Administered</p>
              <textarea
                id="testadministered"
                name="testadministered"
                value={formData.testadministered}
                onChange={handleChange}
                className="Textarea"
                rows="4"
              ></textarea>

              <p className="SectionHeading">XIV. Provisional Diagnosis</p>
              <textarea
                id="provisionaldiagnosis"
                name="provisionaldiagnosis"
                value={formData.provisionaldiagnosis}
                onChange={handleChange}
                className="Textarea"
                rows="4"
              ></textarea>

              <p className="SectionHeading">XV. Recommendation</p>
              <textarea
                id="recommendation"
                name="recommendation"
                value={formData.recommendation}
                onChange={handleChange}
                className="Textarea"
                rows="4"
              ></textarea>
            </div>
          </fieldset>
        )}


        {/* Add other pages similarly */}

        <div className="ButtonContainer">
          <button type="button" onClick={prevPage} disabled={currentPage === 1}>
            Previous
          </button>
          {currentPage === 15 ? (
            <button type="button" onClick={handleSubmit}>
              Submit
            </button>
          ) : (
            <button type="button" onClick={nextPage} disabled={currentPage === 15}>
              Next
            </button>
          )}
        </div>

      </form>
    </div>
  );
};

export default ChildLanguageAssessment;