import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';

// Styled components for responsive design
const Container = styled.div`
    padding: 20px;
    font-family: Arial, sans-serif;
`;

const Title = styled.h1`
    text-align: center;
    font-size: 2rem;
    margin-bottom: 20px;
`;

const TotalValue = styled.h2`
    text-align: center;
    font-size: 1.5rem;
    margin-bottom: 20px;
`;

const DQValue = styled.h2`
    text-align: center;
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #d9534f; /* Optional: Style the DQ value differently */
`;
const DQClass = styled.h2`
    text-align: center;
    font-size: 1.5rem;
    margin-bottom: 20px;
    color:rgb(57, 167, 57); /* Optional: Style the DQ value differently */
`;

const AgeGroupContainer = styled.div`
    margin-bottom: 20px;
`;

const AgeTitle = styled.h2`
    font-size: 1.5rem;
    margin-bottom: 10px;
    text-align: left;
`;


const TaskTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin: 0 auto;

    th, td {
        padding: 10px;
        text-align: left;
        border: 1px solid #ddd;
    }

    th {
        background-color: #f4f4f4;
    }

    td {
        font-size: 1rem;
    }
`;

const Button = styled.button`
    background-color: #406147;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
        background-color: #45a049;
    }

    &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
    }
`;

const LoadingText = styled.p`
    text-align: center;
    font-size: 1.2rem;
`;

const AgeTotalValue = styled.h3`
    text-align: center;
    font-size: 1.2rem;
    margin-top: 10px;
`;

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

const ResponsiveContainer = styled.div`
    @media (max-width: 768px) {
        padding: 10px;

        ${Title} {
            font-size: 1.5rem;
        }

        ${TotalValue} {
            font-size: 1.2rem;
        }

        ${AgeTitle} {
            font-size: 1.2rem;
        }

        ${TaskTable} {
            font-size: 0.9rem;
        }

        ${Button} {
            padding: 8px 12px;
            font-size: 0.9rem;
        }
    }

    @media (max-width: 480px) {
        padding: 5px;

        ${Title} {
            font-size: 1.2rem;
        }

        ${TotalValue} {
            font-size: 1rem;
        }

        ${AgeTitle} {
            font-size: 1rem;
        }

        ${TaskTable} {
            font-size: 0.8rem;
        }

        ${Button} {
            padding: 5px 10px;
            font-size: 0.8rem;
        }
    }
`;


const AGE_ORDER = [
    "3M",
    "6M",
    "9M",
    "1Y",
    "1 1/2Y",
    "2Y",
    "3Y",
    "4Y",
    "5Y",
    "6Y",
    "7Y",
    "8Y",
    "9Y",
    "10Y",
    "11Y",
    "12Y",
    "13Y",
    "15Y",
];

const DevelopmentalTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [sortedTasks, setSortedTasks] = useState([]);
    const [totalValue, setTotalValue] = useState(0); // Initialize totalValue state
    const [yesClicked, setYesClicked] = useState({}); // Stores whether Yes was clicked for each task
    const [noClicked, setNoClicked] = useState({});
    const [buttonColors, setButtonColors] = useState({});
    const [disabledButtons, setDisabledButtons] = useState({});
    const [isEditing, setIsEditing] = useState(false); // Track if editing is enabled
    const location = useLocation(); // Get the state from the previous page
    const { patient } = location.state || {}; // Destructure patient data from state
    const [taskActions, setTaskActions] = useState({});
    const [noClickCount, setNoClickCount] = useState({});
    const [ageGroupNoClickCount, setAgeGroupNoClickCount] = useState({});

    const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;




    // Calculate DQ (DA/CA * 100)
    const calculateDQ = (DA, CA) => {
        if (CA === 0) return 0; // Avoid division by zero
        return ((DA / CA) * 100).toFixed(2); // Return DQ with two decimal points
    };

    // Function to classify DQ based on Wechsler's classification
    const classifyDQ = (dq) => {
        if (dq <= 19.99) return "Profound Developemental Delay";
        if (dq >= 20 && dq <= 34.99) return "Severe Developemental Delay";
        if (dq >= 35 && dq <= 49.99) return "Moderate Developemental Delay";
        if (dq >= 50 && dq <= 70.99) return "Mild Developemental Delay";
        if (dq >= 71 && dq <= 79.99) return "Borderline Developmental Function";
        if (dq >= 80 && dq <= 89.99) return "Dull Average Developmental Function";
        if (dq >= 90 && dq <= 109.99) return "Average Developmental Function";
        if (dq >= 110 && dq <= 119.99) return "Bright Average Developmental Function";
        if (dq >= 120 && dq <= 129.99) return "Superior Developmental Function";
        if (dq >= 130 && dq <= 139.99) return "Very Superior Developmental Function";
        if (dq >= 140) return "Gifted Child";
        return "Unknown"; // Fallback for unexpected values
    };

    const CA = patient?.age
        ? (patient.age.year || 0) * 12 +
        (patient.age.months || 0) +
        Math.floor((patient.age.days || 0) / 30)
        : 0;



    const getAgeGroup = () => {

        if (CA < 9) return ["3M", "6M", "9M"];
        if (CA < 12) return ["3M", "6M", "9M", "1Y", "1 1/2Y"];
        if (CA < 18) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y"];
        if (CA < 30) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y"];
        if (CA < 42) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y", "4Y"];
        if (CA < 54) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y", "4Y", "5Y"];
        if (CA < 66) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y", "4Y", "5Y", "6Y"];
        if (CA < 78) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y"];
        if (CA < 90) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y"];
        if (CA < 102) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y"];
        if (CA < 114) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y"];
        if (CA < 126) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y", "11Y"];
        if (CA < 138) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y", "11Y", "12Y"];
        if (CA < 150) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y", "11Y", "12Y", "13Y"];
        if (CA < 162) return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y", "11Y", "12Y", "13Y", "15Y"];
        return ["3M", "6M", "9M", "1Y", "1 1/2Y", "2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y", "11Y", "12Y", "13Y", "15Y"];
    };


    // Fetch tasks and initialize button states
    useEffect(() => {
        axios
            .get(`${Milestonebaseurl}developmental-tasks/`)
            .then((response) => {
                const data = response.data;

                // Get the relevant age groups based on patient's age
                const relevantAgeGroups = getAgeGroup(patient?.CA || 0);

                // Filter tasks for the relevant age groups
                const filteredTasks = data.filter((group) =>
                    relevantAgeGroups.includes(group.age)
                );

                // Sort tasks based on AGE_ORDER
                const sortedTasks = filteredTasks.sort(
                    (a, b) => AGE_ORDER.indexOf(a.age) - AGE_ORDER.indexOf(b.age)
                );

                setSortedTasks(sortedTasks);

                // Initialize disabledButtons for each task
                const initialDisabledState = {};
                sortedTasks.forEach((taskGroup, ageGroupIndex) => {
                    taskGroup.tasks.forEach((task, taskIndex) => {
                        const buttonKey = `${ageGroupIndex}-${taskIndex}`;
                        initialDisabledState[buttonKey] = { yes: false, no: false, edit: true }; // Edit is disabled initially
                    });
                });
                setDisabledButtons(initialDisabledState);
            })
            .catch((error) => console.error("Error fetching data:", error));
    }, [patient]);

    const convertToYearsMonthsDays = (days) => {
        const years = Math.floor(days / 365);
        const remainingDaysAfterYears = days % 365;
        const months = Math.floor(remainingDaysAfterYears / 30);
        const remainingDays = remainingDaysAfterYears % 30;
        return { years, months, remainingDays };
    };



    // State to track "Yes" clicks for each age group separately
    const [ageGroupClicks, setAgeGroupClicks] = useState({
        0: 0, // For ageGroup 0 (e.g., 3M)
        1: 0, // For ageGroup 1 (e.g., 6M)
        2: 0, // For ageGroup 2 (e.g., 9M)
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        12: 0,
        13: 0,
        14: 0,
        15: 0,
        16: 0,
        17: 0,


        // Add more age groups as needed
    });

    const [displayedTaskValues, setDisplayedTaskValues] = useState({
        0: null, // For 3M
        1: null, // For 6M
        2: null, // For 9M
        3: null,
        4: null,
        5: null,
        6: null,
        7: null,
        8: null,
        9: null,
        10: null,
        11: null,
        12: null,
        13: null,
        14: null,
        15: null,
        16: null,
        17: null,
    });
    // Function to find and set task value based on totalYesClicks for each age group
    const findTaskValue = (ageGroupIndex, totalClicks) => {
        // Dynamically compute the taskIndex for the given age group
        const taskIndex = totalClicks - 1; // Adjust index to be 0-based

        // Safely access the task value from the sortedTasks structure
        const taskValue = sortedTasks[ageGroupIndex]?.tasks?.[taskIndex]?.value || null;

        // Update the displayedTaskValues state for the specific age group
        setDisplayedTaskValues((prevValues) => ({
            ...prevValues,
            [ageGroupIndex]: taskValue, // Set task value for the specific age group
        }));
    };



    // Function to handle "No" button click for each age group and task
const handleNoClick = (ageGroupIndex, taskIndex, taskValue) => {
    const buttonKey = `${ageGroupIndex}-${taskIndex}`;

    // Track the number of "No" clicks for each age group
    setAgeGroupNoClickCount((prevNoClickCount) => {
        const newCount = (prevNoClickCount[ageGroupIndex] || 0) + 1;

        // If the "No" button has been clicked 4 times in any task of the age group,
        // disable all buttons for the entire age group
        if (newCount >= 4) {
            // Disable all buttons for the age group
            setDisabledButtons((prevState) => {
                const updatedDisabledButtons = { ...prevState };
        
                // Disable buttons for tasks within the same age group
                Object.keys(updatedDisabledButtons).forEach((key) => {
                    if (key.startsWith(`${ageGroupIndex}-`)) {
                        updatedDisabledButtons[key] = { yes: true, no: true }; // Disable buttons for this task
                    }
                });
        
                // Return the updated state
                return updatedDisabledButtons;
            });
        }
        

        return { ...prevNoClickCount, [ageGroupIndex]: newCount }; // Update the "No" click count for the age group
    });



    // Only decrement the "Yes" click count if "Yes" was clicked previously
    if (yesClicked[`${ageGroupIndex}-${taskIndex}`]) {
        setAgeGroupClicks((prevClicks) => {
            const newTotalClicks = prevClicks[ageGroupIndex] - 1;
            const updatedClicks = { ...prevClicks, [ageGroupIndex]: newTotalClicks };

            findTaskValue(ageGroupIndex, newTotalClicks);
            return updatedClicks;
        });
        

        setYesClicked((prevYesClicked) => {
            const updatedYesClicked = { ...prevYesClicked };
            delete updatedYesClicked[`${ageGroupIndex}-${taskIndex}`];
            return updatedYesClicked;
        });
    }

    // Update `taskActions` state
    setTaskActions((prevActions) => ({
        ...prevActions,
        [buttonKey]: "No", // Set action to "No"
    }));

    // Mark the task as having "No" clicked
    setNoClicked((prevNoClicked) => ({
        ...prevNoClicked,
        [`${ageGroupIndex}-${taskIndex}`]: true, // Track the "No" click for this task
    }));

    // Disable the "Yes" button and enable the "Edit" button for the current task
    setDisabledButtons((prevState) => ({
        ...prevState,
        [buttonKey]: { yes: true, no: true, edit: false }, // Disable "Yes", "No" and Enable "Edit"
    }));

    console.log(`No clicked for ${taskValue}`);
};

// Function to handle "Yes" button click for each age group and task
const handleYesClick = (ageGroupIndex, taskIndex) => {
    const buttonKey = `${ageGroupIndex}-${taskIndex}`;

    setAgeGroupClicks((prevClicks) => {
        const newTotalClicks = prevClicks[ageGroupIndex] + 1;
        const updatedClicks = { ...prevClicks, [ageGroupIndex]: newTotalClicks };

        findTaskValue(ageGroupIndex, newTotalClicks);
        return updatedClicks;
    });

    setNoClicked((prevNoClicked) => {
        const updatedNoClicked = { ...prevNoClicked };
        delete updatedNoClicked[`${ageGroupIndex}-${taskIndex}`];
        return updatedNoClicked;
    });

    setYesClicked((prevYesClicked) => ({
        ...prevYesClicked,
        [`${ageGroupIndex}-${taskIndex}`]: true, // Track the "Yes" click for this task
    }));

    

    // Update `taskActions` state
    setTaskActions((prevActions) => ({
        ...prevActions,
        [buttonKey]: "Yes", // Set action to "Yes"
    }));

    setDisabledButtons((prevState) => ({
        ...prevState,
        [buttonKey]: { yes: true, no: true, edit: false },
    }));

    console.log(`Yes clicked for task ${taskIndex} in age group ${ageGroupIndex}`);
};
    

    // Function to handle "Edit" button click
    const handleEditClick = (ageGroupIndex, taskIndex) => {
        const buttonKey = `${ageGroupIndex}-${taskIndex}`;

        // Reset both "Yes" and "No" button colors by updating the button state
        setButtonColors((prevColors) => ({
            ...prevColors,
            [`${ageGroupIndex}-${taskIndex}`]: {
                yes: 'defaultColor',  // Reset "Yes" button color
                no: 'defaultColor',   // Reset "No" button color
            },
        }));

        setIsEditing(true); // Enable editing
        setDisabledButtons((prevState) => ({
            ...prevState,
            [buttonKey]: { yes: false, no: false, edit: true },
        }));

        console.log(`Edit clicked for task ${taskIndex} in age group ${ageGroupIndex}`);
    };





    const calculateTotalValue = () => {
        // Sum all the task values in displayedTaskValues
        return Object.values(displayedTaskValues).reduce((total, taskValue) => {
            return total + (taskValue || 0); // Add value if it's a valid number, otherwise add 0
        }, 0);
    };

    // Convert total days to months for DA calculation
    const convertDaysToMonths = (days) => Math.floor(days / 30);

    // Get the total value in days and convert to months
    const totalDays = calculateTotalValue();
    const DA = convertDaysToMonths(totalDays); // DA is the total value in months

    const dqValue = calculateDQ(DA, CA);
    const dqClassification = classifyDQ(dqValue);


    // Function to save the data
    const saveData = (formData) => {
        axios
            .post(`${Milestonebaseurl}developmental-screening-tasks/`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                console.log('Data saved successfully:', response.data);
            })
            .catch((error) => {
                console.error('Error saving data:', error);
            });
    };


    const handleSubmit = () => {
        // Collect grouped tasks
        const tasksByAgeGroup = sortedTasks.reduce((acc, ageGroup, ageGroupIndex) => {
            const ageGroupName = ageGroup.age || "Unknown";

            if (!acc[ageGroupName]) {
                acc[ageGroupName] = [];
            }

            ageGroup.tasks.forEach((task, taskIndex) => {
                const buttonKey = `${ageGroupIndex}-${taskIndex}`;
                acc[ageGroupName].push({
                    task: task.task || "Unknown Task",
                    action: taskActions[buttonKey] || "No", // Use action from state
                });
            });

            return acc;
        }, {});

        // Prepare form data
        const formData = {
            date:patient.date,
            patient_name: patient?.patient_name || "",
            age: patient?.age || "N/A",
            gender: patient?.sex || "N/A",
            tasks: tasksByAgeGroup,
            CA: `${CA || 0} months`,
            DA: `${DA || 0} months`,
            dq_value: dqValue || "0.00",
            dq_classify: dqClassification || "Nil",
        };

        console.log("Form Data:", formData);
        saveData(formData);
    };
 const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MM/dd/yyyy'); // Customize this format as needed
  };




    return (
        <ResponsiveContainer>
            <h2>Developmental Screening Tasks</h2>

            <PatientDetailsContainer>
                {patient ? (
                    <>
                        <p>
                            <strong>Date:</strong> {formatDate(patient.date)}
                        </p>
                        <p>
                            <strong>Name:</strong> {patient.patient_name}
                        </p>
                        <p>
                            <strong>Age:</strong> {patient.age
                                ? `${patient.age.year} years, ${patient.age.months} months, ${patient.age.days} days`
                                : 'N/A'}
                        </p>
                        <p>
                            <strong>Gender:</strong> {patient.sex}
                        </p>
                        <p>
                            <strong>CA:</strong> {CA} months
                        </p>
                    </>
                ) : (
                    <p>No patient details provided.</p>
                )}
            </PatientDetailsContainer>

            <Container>

                {sortedTasks.length > 0 ? (
                    <div>
                        {sortedTasks.map((ageGroup, ageGroupIndex) => (
                            <AgeGroupContainer key={ageGroupIndex}>
                                <AgeTitle>Age: {ageGroup.age}</AgeTitle>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Task Name</th>
                                            <th>Years</th>
                                            <th>Months</th>
                                            <th>Days</th>
                                            <th>Value (Days)</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ageGroup.tasks.map((task, taskIndex) => {
                                            const { years, months, remainingDays } =
                                                convertToYearsMonthsDays(task.value);
                                            const buttonKey = `${ageGroupIndex}-${taskIndex}`;
                                            return (
                                                <tr key={taskIndex}>
                                                    <td>{task.task}</td>

                                                    <td>{years} years</td>
                                                    <td>{months} months</td>
                                                    <td>{remainingDays} days</td>
                                                    <td>{task.value} days</td>
                                                    <td>
                                                        <Button
                                                            className="me-2"
                                                            onClick={() => handleYesClick(ageGroupIndex, taskIndex, 1)}
                                                            disabled={disabledButtons[buttonKey]?.yes}
                                                            style={{
                                                                backgroundColor: yesClicked[`${ageGroupIndex}-${taskIndex}`] ? 'orange' : '', // Change color to orange
                                                                cursor: yesClicked[`${ageGroupIndex}-${taskIndex}`] ? 'not-allowed' : 'pointer', // Make it non-clickable
                                                            }}
                                                        >
                                                            Yes
                                                        </Button>
                                                        <Button
                                                            className="me-2"
                                                            onClick={() => handleNoClick(ageGroupIndex, taskIndex, task.value)}
                                                            disabled={disabledButtons[buttonKey]?.no}
                                                            style={{
                                                                backgroundColor: noClicked[`${ageGroupIndex}-${taskIndex}`] ? 'orange' : '', // Change to orange
                                                                cursor: noClicked[`${ageGroupIndex}-${taskIndex}`] ? 'not-allowed' : 'pointer', // Change cursor
                                                            }}
                                                        >
                                                            No
                                                        </Button>

                                                        <Button className="me-2"
                                                            onClick={() => handleEditClick(ageGroupIndex, taskIndex)}
                                                            disabled={disabledButtons[buttonKey]?.edit}
                                                        >
                                                            Edit
                                                        </Button>
                                                    </td>

                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <AgeTotalValue>
                                    <p>{`Total for this Age Group (in Days): ${displayedTaskValues[ageGroupIndex] || 0}`}</p>
                                </AgeTotalValue>

                            </AgeGroupContainer>
                        ))}
                    </div>
                ) : (
                    <LoadingText>Loading tasks...</LoadingText>
                )}
            </Container>
            <TotalValue> {`DA (in Days): ${calculateTotalValue()}`} Days</TotalValue>
            <TotalValue>DA (in Months): {DA} Months</TotalValue>
            <DQValue>Developmental Quotient (DQ): {dqValue}</DQValue>
            <DQClass>Classification of DQ: {dqClassification}
            </DQClass>
            <button
                onClick={handleSubmit}
                style={{ display: 'block', margin: '0 auto' }}
            >
                Submit
            </button>
        </ResponsiveContainer>

    );
};

export default DevelopmentalTasks;
