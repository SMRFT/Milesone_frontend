import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import './CBCLforGirls6-18y.css';
import apiRequest from "./apiRequest";

const CBCLforGirls6To18y = () => {
    const [formData, setFormData] = useState({
        childName: '',
        age: '',
        gender: '',
        dateOfAssessment: '',
        table1: {
            timeRating1: '',
            skillRating1: '',
            timeRating2: '',
            skillRating2: '',
            A: '',
            B: '',
        },
        table2: {
            timeRating1: '',
            skillRating1: '',
            timeRating2: '',
            skillRating2: '',
            A: '',
            B: '',
        },
        table3: {
            timeRating1: '',
            skillRating1: '',
            timeRating2: '',
            skillRating2: '',
            A: '',
            B: '',
        },
        table4: {
            timeRating1: '',
            skillRating1: '',
            timeRating2: '',
            skillRating2: '',
            A: '',
            B: '',
        },
        table5: {
            firstQuestion: '',
            secondQuestion: '',
            A: '',
            B: '',
        },
        table6: {
            timeRating1: '',
            skillRating1: '',
            timeRating2: '',
            skillRating2: '',
            A: '',
            B: '',
        },
        table7: {
            reason:'',
            maxPerformance: '',
            specialClass: '',
            repeatedGrade: '',
            schoolProblems: '',       // Initial value for schoolProblems
            startDate: '',             // New field for "When did these problems start?"
            endDate: '',               // New field for "Have these problems ended?"
            illnessOrDisability: '',   // New field for illness or disability description
            concerns: '',              // New field for concerns
            bestThings: '',            // New field for best things about the child
        }
    });

    const location = useLocation();
    const { patient } = location.state || {};
    const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
    useEffect(() => {
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
    }, [patient]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        const [table, field] = name.split("."); // Assuming format like table5.firstQuestion


        // Update formData state
        setFormData((prevData) => {
            let updatedData = {
                ...prevData,
                [table]: {
                    ...prevData[table],
                    [field]: value,
                },
            };

            // Logic for updating A and B values based on the selections
            if (table === "table5") {
                if (field === "firstQuestion") {
                    updatedData.A = value === "None" ? 0 : 1; // If 'None', A = 0, else A = 1
                }

                if (field === "secondQuestion") {
                    updatedData.B = value === "LessThan1" ? 0 : 1; // If 'LessThan1', B = 0, else B = 1
                }
            }

            return updatedData;
        });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert age safely to a valid JSON object
        let parsedAge = { years: 0, months: 0, days: 0 };
        if (typeof formData.age === "string" && formData.age) {
            const ageParts = formData.age.match(/(\d+)\s*years?,\s*(\d+)\s*months?,\s*(\d+)\s*days?/i);
            if (ageParts) {
                parsedAge = {
                    years: parseInt(ageParts[1], 10),
                    months: parseInt(ageParts[2], 10),
                    days: parseInt(ageParts[3], 10),
                };
            }
        } else if (typeof formData.age === "object" && formData.age !== null) {
            parsedAge = {
                years: formData.age.years ?? formData.age.year ?? 0,
                months: formData.age.months ?? 0,
                days: formData.age.days ?? 0,
            };
        }

        // Create submission payload with updated age and table totals
        const submissionData = {
            ...formData,
            age: parsedAge,
        };

        // Ensure A and B values are added for all tables
        const tables = ["table1", "table2", "table3", "table4", "table5", "table6", "table7"];
        tables.forEach((table) => {
            submissionData[table] = {
                ...formData[table],
                A: calculateA(table),
                B: calculateB(table),
            };
        });

        console.log('Updated Form Data:', submissionData);

        try {
            const response = await apiRequest(`${Milestonebaseurl}CBCLgirlsassessment/`, "POST", submissionData);
            if (response && response.success) {
                alert('Form submitted successfully!');
                console.log('Form Submitted:', response.data);
            } else {
                alert(`Error submitting form: ${response?.error || "Submission failed"}`);
                console.error('Submission failed:', response?.error);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('An unexpected error occurred during submission.');
        }
    };
    



    // Calculate 'A' (timeRating) for a specific table
    const calculateA = (table) => {
        const timeRatings = [formData[table]?.timeRating1, formData[table]?.timeRating2, formData[table]?.timeRating3, formData[table]?.timeRating4]; // Ensure fields exist
        return timeRatings.reduce((total, rating) => total + (parseInt(rating) || 0), 0);
    };

    // Calculate 'B' (skillRating) for a specific table
    const calculateB = (table) => {
        const skillRatings = [formData[table]?.skillRating1, formData[table]?.skillRating2, formData[table]?.skillRating3, formData[table]?.skillRating4]; // Ensure fields exist
        return skillRatings.reduce((total, rating) => total + (parseInt(rating) || 0), 0);
    };

    // Calculate 'A' (first question logic) for table5
    // Calculate 'A' (first question logic) for table5
    const calculateTable5A = () => {
        const firstQuestion = formData.table5.firstQuestion;
        if (firstQuestion === "") return 0; // Default value is 0 if no selection
        return firstQuestion === "None" ? 0 : 1; // Set A to 0 if 'None', otherwise 1
    };

    // Calculate 'B' (second question logic) for table5
    const calculateTable5B = () => {
        const secondQuestion = formData.table5.secondQuestion;
        if (secondQuestion === "") return 0; // Default value is 0 if no selection
        return secondQuestion === "LessThan1" ? 0 : 1; // Set B to 0 if 'LessThan1', otherwise 1
    };

    // Example usage to calculate and log values for table1
    console.log("A for table1:", calculateA('table1'));  // Calculation for timeRating
    console.log("B for table1:", calculateB('table1'));  // Calculation for skillRating

    // Example usage to calculate and log values for table5
    console.log("A for table5:", calculateTable5A());  // Calculation for first question in table5
    console.log("B for table5:", calculateTable5B());  // Calculation for second question in table5

    // Calculate the maximum selected value
    const performanceValues = Object.values(formData.table7 || {}).map(value => Number(value) || 0);
    const maxPerformance = performanceValues.length ? Math.max(...performanceValues) : 0;


    return (
        <div className="StyledContainer">
            <h2>CHILD BEHAVIOR CHECKLIST FOR AGES 6-18 <br></br><br /> PART-A</h2>
            <form onSubmit={handleSubmit}>
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
                                value={formData.childName}
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
                                value={formData.age}
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
                                value={formData.gender}
                                onChange={handleChange}
                                className="Input"
                            />
                        </div>
                    </div>
                </fieldset>

                {/* Table Section */}
                <fieldset class="Fieldset">
                    <legend>
                        I. Please list the sports your child most likes to take part in. For example: swimming, baseball, skating, skateboarding, bike riding, fishing, etc.
                    </legend>
                    <table class="ChecklistTable">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Behavior Description</th>
                                <th className="columnHeader">
                                    A. Compared to others of the same age,<br /> about how much time does he/she spend in each?
                                </th>
                                <th className="columnHeader">
                                    B. Compared to others of the same age,<br /> how well does he/she do each one?
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="text" name="item1" class="Input" placeholder="a." value="a." readonly /></td>
                                <td><input type="text" name="description1" class="Input" placeholder="Enter behavior description" /></td>
                                <td>
                                    <select name="table1.timeRating1" className="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Less Than Average)</option>
                                        <option value="1">1 (Average)</option>
                                        <option value="2">2 (More Than Average)</option>
                                        <option value="0">0 (Don't Know)</option>
                                    </select>
                                </td>
                                <td>
                                    <select name="table1.skillRating1" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Less Than Average)</option>
                                        <option value="1">1 (Average)</option>
                                        <option value="2">2 (More Than Average)</option>
                                        <option value="0">0 (Don't Know)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td><input type="text" name="item2" class="Input" placeholder="b." value="b." readonly /></td>
                                <td><input type="text" name="description2" class="Input" placeholder="Enter behavior description" /></td>
                                <td>
                                    <select name="table1.timeRating2" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Less Than Average)</option>
                                        <option value="1">1 (Average)</option>
                                        <option value="2">2 (More Than Average)</option>
                                        <option value="0">0 (Don't Know)</option>
                                    </select>
                                </td>
                                <td>
                                    <select name="table1.skillRating2" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Less Than Average)</option>
                                        <option value="1">1 (Average)</option>
                                        <option value="2">2 (More Than Average)</option>
                                        <option value="0">0 (Don't Know)</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="TotalValue">
                        A = {calculateA("table1")} &nbsp; | &nbsp; B = {calculateB("table1")}
                    </div>
                </fieldset>
                {/* Table Section */}
                <fieldset class="Fieldset">
                    <legend>
                        II. Please list your child's favourite hobbies, activities and games, other than sports. For example: video games, dolls, reading, piano, crafts, cars, computers, singing, etc. (Do not include listening to radio, TV or other media.)
                    </legend>
                    <table class="ChecklistTable">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Behavior Description</th>
                                <th className="columnHeader">
                                    A. Compared to others of the same age,<br /> about how much time does he/she spend in each?
                                </th>
                                <th className="columnHeader">
                                    B. Compared to others of the same age,<br /> how well does he/she do each one?
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="text" name="item1" class="Input" placeholder="a." value="a." readonly /></td>
                                <td><input type="text" name="description1" class="Input" placeholder="Enter behavior description" /></td>
                                <td>
                                    <select name="table2.timeRating1" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Less Than Average)</option>
                                        <option value="1">1 (Average)</option>
                                        <option value="2">2 (More Than Average)</option>
                                        <option value="0">0 (Don't Know)</option>
                                    </select>
                                </td>
                                <td>
                                    <select name="table2.skillRating1" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Less Than Average)</option>
                                        <option value="1">1 (Average)</option>
                                        <option value="2">2 (More Than Average)</option>
                                        <option value="0">0 (Don't Know)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td><input type="text" name="item2" class="Input" placeholder="b." value="b." readonly /></td>
                                <td><input type="text" name="description2" class="Input" placeholder="Enter behavior description" /></td>
                                <td>
                                    <select name="table2.timeRating2" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Less Than Average)</option>
                                        <option value="1">1 (Average)</option>
                                        <option value="2">2 (More Than Average)</option>
                                        <option value="0">0 (Don't Know)</option>
                                    </select>
                                </td>
                                <td>
                                    <select name="table2.skillRating2" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Less Than Average)</option>
                                        <option value="1">1 (Average)</option>
                                        <option value="2">2 (More Than Average)</option>
                                        <option value="0">0 (Don't Know)</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="TotalValue">
                        A = {calculateA("table2")} &nbsp; | &nbsp; B = {calculateB("table2")}
                    </div>
                </fieldset>
                {/* Table Section */}
                <fieldset class="Fieldset">
                    <legend>
                        III. Please list any organizations, clubs, teams, or groups your child belongs to.
                    </legend>
                    <table class="ChecklistTable">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Behavior Description</th>
                                <th className="columnHeader">
                                    A. Compared to others of the same age,<br /> about how active is he/she  in each?
                                </th>
                                <th className="columnHeader">
                                    B. Mean of participation in organizations
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="text" name="item1" class="Input" placeholder="a." value="a." readonly /></td>
                                <td><input type="text" name="description1" class="Input" placeholder="Enter behavior description" /></td>
                                <td>
                                    <select name="table3.timeRating1" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Less Active)</option>
                                        <option value="1">1 (Average)</option>
                                    </select>
                                </td>
                                <td>
                                    <select name="table3.skillRating1" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="2">2 (More Active)</option>
                                        <option value="0">0 (Don't Know)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td><input type="text" name="item2" class="Input" placeholder="b." value="b." readonly /></td>
                                <td><input type="text" name="description2" class="Input" placeholder="Enter behavior description" /></td>
                                <td>
                                    <select name="table3.timeRating2" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Less Active)</option>
                                        <option value="1">1 (Average)</option>
                                    </select>
                                </td>
                                <td>
                                    <select name="table3.skillRating2" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="2">2 (More Active)</option>
                                        <option value="0">0 (Don't Know)</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="TotalValue">
                        A = {calculateA("table3")} &nbsp; | &nbsp; B = {calculateB("table3")}
                    </div>
                </fieldset>
                {/* Table Section */}
                <fieldset class="Fieldset">
                    <legend>
                        IV. Please list any jobs or chores your child has. For example: doing dishes, babysitting, making bed, working in store, etc.(Include both paid and unpaid jobs and chores.)
                    </legend>
                    <table class="ChecklistTable">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Behavior Description</th>
                                <th className="columnHeader">
                                    A. Compared to others of the same age,<br /> how well does he/she  carry them out?
                                </th>
                                <th className="columnHeader">
                                    B. Mean of job quality
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="text" name="item1" class="Input" placeholder="a." value="a." readonly /></td>
                                <td><input type="text" name="description1" class="Input" placeholder="Enter behavior description" /></td>
                                <td>
                                    <select name="table4.timeRating1" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Less Active)</option>
                                        <option value="1">1 (Average)</option>
                                    </select>
                                </td>
                                <td>
                                    <select name="table4.skillRating1" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="2">2 (More Active)</option>
                                        <option value="0">0 (Don't Know)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td><input type="text" name="item2" class="Input" placeholder="b." value="b." readonly /></td>
                                <td><input type="text" name="description2" class="Input" placeholder="Enter behavior description" /></td>
                                <td>
                                    <select name="table4.timeRating2" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Less Active)</option>
                                        <option value="1">1 (Average)</option>
                                    </select>
                                </td>
                                <td>
                                    <select name="table4.skillRating2" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="2">2 (More Active)</option>
                                        <option value="0">0 (Don't Know)</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="TotalValue">
                        A = {calculateA("table4")} &nbsp; | &nbsp; B = {calculateB("table4")}
                    </div>
                </fieldset>
                <fieldset className="Fieldset">
                    <legend>
                        V. 1. About how many close friends does your child have? (Do not include brothers & sisters)
                    </legend>
                    <div className="Row">
                        <div className="LabelInputContainer">
                            <label htmlFor="closeFriends" className="Label">Close Friends:</label>
                            <select
                                name="table5.firstQuestion"
                                className="Input"
                                onChange={handleChange}
                                value={formData.table5.firstQuestion}  // Control the input value
                            >
                                <option value="">Select...</option>
                                <option value="None">None</option>
                                <option value="1">1 or 2</option>
                                <option value="2">3 or 4</option>
                                <option value="3">4 or more</option>
                            </select>
                        </div>
                    </div>

                    <legend>
                        2. About how many times a week does your child do things with any friends outside of regular school hours? (Do not include brothers & sisters)
                    </legend>
                    <div className="Row">
                        <div className="LabelInputContainer">
                            <label htmlFor="activityWithFriends" className="Label">Activity with Friends:</label>
                            <select
                                name="table5.secondQuestion"
                                className="Input"
                                onChange={handleChange}
                                value={formData.table5.secondQuestion}  // Control the input value
                            >
                                <option value="">Select...</option>
                                <option value="LessThan1">Less than 1</option>
                                <option value="1or2">1 or 2</option>
                                <option value="3orMore">3 or more</option>
                            </select>
                        </div>
                    </div>

                    <div className="TotalValue">
                        A = {calculateTable5A()} &nbsp; | &nbsp; B = {calculateTable5B()}
                    </div>
                </fieldset>
                <fieldset class="Fieldset">
                    <legend>
                        VI. Compared to others of his/her age, how well does your child:
                    </legend>
                    <table class="ChecklistTable">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Behavior Description</th>
                                <th className="columnHeader">
                                    A. Behavior with others
                                </th>
                                <th className="columnHeader">
                                    B. Behavior alone
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><input type="text" name="item1" class="Input" placeholder="a." value="a." readonly /></td>
                                <td><input type="text" name="description1" class="Input" value="Get along with his/her brothers & sisters?" readonly /></td>
                                <td>
                                    <select name="table6.timeRating1" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Worse)</option>
                                        <option value="1">1 (Average)</option>
                                        <option value="1">1 (Better)</option>
                                        <option value="0">0 (Has no brothers or sisters)</option>
                                    </select>
                                </td>

                            </tr>
                            <tr>
                                <td><input type="text" name="item2" class="Input" placeholder="b." value="b." readonly /></td>
                                <td><input type="text" name="description2" class="Input" value="Get along with other kids?" readonly /></td>
                                <td>
                                    <select name="table6.timeRating2" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Worse)</option>
                                        <option value="1">1 (Average)</option>
                                        <option value="1">1 (Better)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td><input type="text" name="item2" class="Input" placeholder="c." value="c." readonly /></td>
                                <td><input type="text" name="description3" class="Input" value="Behave with his/her parents?" readonly /></td>
                                <td>
                                    <select name="table6.timeRating3" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Worse)</option>
                                        <option value="1">1 (Average)</option>
                                        <option value="1">1 (Better)</option>
                                    </select>
                                </td>
                            </tr>
                            <tr>
                                <td><input type="text" name="item2" class="Input" placeholder="d." value="d." readonly /></td>
                                <td><input type="text" name="description4" class="Input" value="Play and work alone?" readonly /></td>
                                <td></td>
                                <td>
                                    <select name="table6.skillRating4" class="Input" onChange={handleChange}>
                                        <option value="">Select...</option>
                                        <option value="0">0 (Worse)</option>
                                        <option value="1">1 (Average)</option>
                                        <option value="1">1 (Better)</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="TotalValue">
                        A = {calculateA("table6")} &nbsp; | &nbsp; B = {calculateB("table6")}
                    </div>
                </fieldset>

                <fieldset className="Fieldset">
                    <legend>
                        VII. 1. Performance in academic subjects. Other academic subjects—for example: computer courses, foreign language, business. Do not include gym, shop, driver's ed., or other nonacademic subjects.
                    </legend>
                    <br></br>
                    <br></br>

                    <div className="Row">
                        <label>Does not attend school because</label>
                        <textarea
                            name="table7.reason"
                            className="Input"
                            onChange={handleChange}
                            value={formData.table7.reason || ""}
                        />
                    </div>
                    <table className="ChecklistTable">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Behavior Description</th>
                                <th className="columnHeader">1. Mean performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Static subjects */}
                            {[
                                { item: "a.", description: "Reading, English, or Language Arts", name: "performance1" },
                                { item: "b.", description: "History or Social Studies", name: "performance2" },
                                { item: "c.", description: "Arithmetic or Math", name: "performance3" },
                                { item: "d.", description: "Science", name: "performance4" },
                            ].map((row, index) => (
                                <tr key={index}>
                                    <td><input type="text" className="Input" value={row.item} readOnly /></td>
                                    <td><input type="text" className="Input" value={row.description} readOnly /></td>
                                    <td>
                                        <select
                                            name={`table7.${row.name}`}
                                            className="Input"
                                            onChange={handleChange}
                                            value={formData.table7?.[row.name] || ""}
                                        >
                                            <option value="">Select...</option>
                                            <option value="0">0 (Failing)</option>
                                            <option value="1">1 (Below Average)</option>
                                            <option value="2">2 (Average)</option>
                                            <option value="2">2 (Above Average)</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}

                            {/* Editable subjects */}
                            {["e.", "f.", "g."].map((item, index) => (
                                <tr key={index + 4}>
                                    <td><input type="text" className="Input" value={item} readOnly /></td>
                                    <td>
                                        <input
                                            type="text"
                                            name={`table7.description${index + 5}`}
                                            className="Input"
                                            placeholder="Enter Subject Name"
                                            value={formData.table7?.[`description${index + 5}`] || ""}
                                            onChange={handleChange}
                                        />
                                    </td>
                                    <td>
                                        <select
                                            name={`table7.performance${index + 5}`}
                                            className="Input"
                                            onChange={handleChange}
                                            value={formData.table7?.[`performance${index + 5}`] || ""}
                                        >
                                            <option value="">Select...</option>
                                            <option value="0">0 (Failing)</option>
                                            <option value="1">1 (Below Average)</option>
                                            <option value="2">2 (Average)</option>
                                            <option value="3">3 (Above Average)</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="TotalValue">
                        <strong>Mean Performance = {maxPerformance}</strong>
                    </div>
                    <br></br>
                    <legend>
                        2. Does your child receive special education or remedial services or attend a special class or special school?
                    </legend>
                    <div className="Row">
                        <select
                            name="table7.specialClass"
                            className="Input"
                            onChange={handleChange}
                            value={formData.table7.specialClass}  // Controlled input with default empty string
                        >
                            <option value="">Select...</option> {/* Default placeholder */}
                            <option value="1">1 (No)</option>
                            <option value="0">0 (Yes)</option>
                        </select>
                    </div>
                    <div className="TotalValue">
                        <strong>Special Class = {formData.table7.specialClass || "0"}</strong>
                    </div>
                    <br></br>
                    <legend>
                        3. Has your child repeated any grades?
                    </legend>
                    <div className="Row">
                        <select
                            name="table7.repeatedGrade"
                            className="Input"
                            onChange={handleChange}
                            value={formData.table7.repeatedGrade}  // Controlled input with default empty string
                        >
                            <option value="">Select...</option> {/* Default placeholder */}
                            <option value="1">1 (No)</option>
                            <option value="0">0 (Yes)</option>
                        </select>
                    </div>
                    <div className="TotalValue">
                        <strong>Repeated Grade = {formData.table7.repeatedGrade || "0"}</strong>
                    </div>
                    <br></br>
                    <legend>
                        4. Has your child had any academic or other problems in school?
                    </legend>
                    <div className="Row">
                        <select
                            name="table7.schoolProblems"
                            className="Input"
                            onChange={handleChange}
                            value={formData.table7.schoolProblems}  // Controlled input with default empty string
                        >
                            <option value="">Select...</option> {/* Default placeholder */}
                            <option value="1">1 (No)</option>
                            <option value="0">0 (Yes)</option>
                        </select>
                    </div>
                    <div className="TotalValue">
                        <strong>School Problems = {formData.table7.schoolProblems || "0"}</strong>
                    </div>

                    {/* Conditionally render follow-up questions if "Yes" is selected */}
                    {formData.table7.schoolProblems === "0" && (
                        <div>
                            <div className="Row">
                                <label>When did these problems start?</label>
                                <textarea
                                    name="table7.startDate"
                                    className="Input"
                                    onChange={handleChange}
                                    value={formData.table7.startDate || ""}
                                />
                            </div>

                            <div className="Row">
                                <label>Have these problems ended? If Yes, when?</label>
                                <textarea
                                    name="table7.endDate"
                                    className="Input"
                                    onChange={handleChange}
                                    value={formData.table7.endDate || ""}
                                />
                            </div>

                            <div className="Row">
                                <label>Does your child have any illness or disability (either physical or mental)? If Yes, please describe.</label>
                                <textarea
                                    name="table7.illnessOrDisability"
                                    className="Input"
                                    onChange={handleChange}
                                    value={formData.table7.illnessOrDisability || ""}
                                />
                            </div>

                            <div className="Row">
                                <label>What concerns you most about your child?</label>
                                <textarea
                                    name="table7.concerns"
                                    className="Input"
                                    onChange={handleChange}
                                    value={formData.table7.concerns || ""}
                                />
                            </div>

                            <div className="Row">
                                <label>Please describe the best things about your child.</label>
                                <textarea
                                    name="table7.bestThings"
                                    className="Input"
                                    onChange={handleChange}
                                    value={formData.table7.bestThings || ""}
                                />
                            </div>
                        </div>
                    )}
                </fieldset>



                <button type="submit" className="SubmitButton">Submit</button>
            </form>
        </div>
    );
};

export default CBCLforGirls6To18y;
