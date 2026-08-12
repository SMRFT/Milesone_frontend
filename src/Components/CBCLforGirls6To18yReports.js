import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import apiRequest from "./apiRequest";

const CBCLforGirls6To18yReports = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const childName = location.state?.childName || queryParams.get("childName");
    const Milestonebaseurl = process.env.REACT_APP_BACKEND_MILESTONE_BASE_URL;
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!childName) {
            setError("Child name is missing.");
            setLoading(false);
            return;
        }

        const fetchReport = async () => {
            try {
                const response = await apiRequest(`${Milestonebaseurl}get-cbcl/${encodeURIComponent(childName)}/`, "GET");
                if (response && response.success) {
                    if (!response.data || response.data.length === 0) {
                        setError("No data found for this child.");
                    } else {
                        setReportData(response.data[0]); // Extract first object from array
                    }
                } else {
                    setError(response?.error || "Error fetching report");
                }
                setLoading(false);
            } catch (err) {
                setError("Error fetching report");
                setLoading(false);
            }
        };

        fetchReport();
    }, [childName, Milestonebaseurl]);

    if (loading) return <p>Loading report...</p>;
    if (error) return <p>{error}</p>;

    // Function to format age from JSON format
    const formatAge = (age) => {
        if (!age) return "Age not available";
        return `${age.years ?? 0} Years, ${age.months ?? 0} Months, ${age.days ?? 0} Days`;
    };

    // Function to render the A and B values for each table
    const renderTableData = (table, romanNumeral) => {
        if (!table) return null; // Skip if no data available

        return (
            <React.Fragment>
                <tr>
                    <td>{romanNumeral}</td>
                    <td>A. {table.A}</td>
                    <td>{table.A}</td>
                </tr>
                <tr>
                    <td></td>
                    <td>B. {table.B}</td>
                    <td>{table.B}</td>
                </tr>
            </React.Fragment>
        );
    };

    // Function to convert table number to Roman numeral
    const getRomanNumeral = (number) => {
        const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
        return romanNumerals[number - 1] || 'N/A';
    };

    // Function to calculate the total score for relevant tables (I, II, IV)
    const calculateTotal = () => {
        let total = 0;
        
        // Only calculate for relevant tables (Table I, II, IV)
        const relevantTables = ["table1", "table2", "table4"];

        relevantTables.forEach((tableName) => {
            const table = reportData[tableName];
            if (table) {
                total += parseFloat(table.A || 0) + parseFloat(table.B || 0);
            }
        });
        
        return total;
    };

    // Function to calculate total score for the "Social" table (III, V, VI)
    const calculateSocialTotal = () => {
        let total = 0;
        
        // Only calculate for relevant tables (Table III, V, VI)
        const socialTables = ["table3", "table5", "table6"];

        socialTables.forEach((tableName) => {
            const table = reportData[tableName];
            if (table) {
                total += parseFloat(table.A || 0) + parseFloat(table.B || 0);
            }
        });
        
        return total;
    };

    // Function to calculate the total score for the new Social Table VII
    const calculateSocialVII = () => {
        let total = 0;

        // Add the values for VII.1, VII.2, VII.3, VII.4
        total += parseFloat(reportData?.maxPerformance || 0);
        total += parseFloat(reportData?.specialClass || 0);
        total += parseFloat(reportData?.repeatedGrade || 0);
        total += parseFloat(reportData?.schoolProblems || 0);

        return total;
    };


    return (
        <div>
            <h2>CBCL Report for {reportData?.childName || "Unknown"}</h2>
            <p><strong>Age:</strong> {reportData?.age ? formatAge(reportData.age) : "Age not available"}</p>
            <p><strong>Gender:</strong> {reportData?.gender || "Not provided"}</p>

            <h3>Scores:</h3>
            <table border="1">
                <thead>
                    <tr>
                        <th>Section</th>
                        <th>Description</th>
                        <th>Scores</th>
                    </tr>
                </thead>
                <tbody>
                    {/* First Table (I, II, IV) */}
                    {["table1", "table2", "table3", "table4", "table5", "table6", "table7"].map((tableName, index) => {
                        const table = reportData[tableName];
                        if (!table) return null; // Skip if no data for this table

                        const romanNumeral = getRomanNumeral(index + 1);

                        switch (index) {
                            case 0: // Table I (Sports)
                                return (
                                    <React.Fragment key={tableName}>
                                        <tr>
                                            <td rowSpan={2}>{romanNumeral}</td>
                                            <td>A. # of sports</td>
                                            <td>{table.A}</td>
                                        </tr>
                                        <tr>
                                            <td>B. Mean of participation and skill in sports</td>
                                            <td>{table.B}</td>
                                        </tr>
                                    </React.Fragment>
                                );
                            case 1: // Table II (Other Activities)
                                return (
                                    <React.Fragment key={tableName}>
                                        <tr>
                                            <td rowSpan={2}>{romanNumeral}</td>
                                            <td>A. # of other activities</td>
                                            <td>{table.A}</td>
                                        </tr>
                                        <tr>
                                            <td>B. Mean of participation and skill in activities</td>
                                            <td>{table.B}</td>
                                        </tr>
                                    </React.Fragment>
                                );
                            case 3: // Table IV (Jobs)
                                return (
                                    <React.Fragment key={tableName}>
                                        <tr>
                                            <td rowSpan={2}>{romanNumeral}</td>
                                            <td>A. # of jobs</td>
                                            <td>{table.A}</td>
                                        </tr>
                                        <tr>
                                            <td>B. Mean job quality</td>
                                            <td>{table.B}</td>
                                        </tr>
                                    </React.Fragment>
                                );
                            default:
                                return null; // Skip other tables for now
                        }
                    })}
                    {/* Add Total Score row */}
                    <tr>
                        <td colSpan="2"><strong>Total Score:</strong></td>
                        <td>{calculateTotal()}</td>
                    </tr>
                </tbody>
            </table>

            <h3>Social:</h3>
            <table border="1">
                <thead>
                    <tr>
                        <th>Section</th>
                        <th>Description</th>
                        <th>Scores</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Table III (Organizations) */}
                    <tr>
                        <td rowSpan={2}>III</td>
                        <td>A. # of organizations</td>
                        <td>{reportData?.table3?.A}</td>
                    </tr>
                    <tr>
                        <td>B. Mean of participation in organizations</td>
                        <td>{reportData?.table3?.B}</td>
                    </tr>
                    {/* Table V (Friends) */}
                    <tr>
                        <td rowSpan={2}>V</td>
                        <td>A. # of friends</td>
                        <td>{reportData?.table5?.A}</td>
                    </tr>
                    <tr>
                        <td>B. Frequency of contacts with friends</td>
                        <td>{reportData?.table5?.B}</td>
                    </tr>
                    {/* Table VI (Behavior) */}
                    <tr>
                        <td rowSpan={2}>VI</td>
                        <td>A. Behavior with others</td>
                        <td>{reportData?.table6?.A}</td>
                    </tr>
                    <tr>
                        <td>B. Behavior alone</td>
                        <td>{reportData?.table6?.B}</td>
                    </tr>
                    {/* Add Total Score row for Social */}
                    <tr>
                        <td colSpan="2"><strong>Total Score:</strong></td>
                        <td>{calculateSocialTotal()}</td>
                    </tr>
                </tbody>
            </table>
            <h3>School:</h3>
            <table border="1">
                <thead>
                    <tr>
                        <th>Section</th>
                        <th>Description</th>
                        <th>Scores</th>
                    </tr>
                </thead>
                <tbody>
                    {/* VII.1 Mean performance */}
                    <tr>
                        <td>VII.1</td>
                        <td>Mean performance</td>
                        <td>{reportData?.table7?.maxPerformance}</td>
                    </tr>
                    {/* VII.2 Special class */}
                    <tr>
                        <td>VII.2</td>
                        <td>Special class</td>
                        <td>{reportData?.table7?.specialClass}</td>
                    </tr>
                    {/* VII.3 Repeated grade */}
                    <tr>
                        <td>VII.3</td>
                        <td>Repeated grade</td>
                        <td>{reportData?.table7?.repeatedGrade}</td>
                    </tr>
                    {/* VII.4 School problems */}
                    <tr>
                        <td>VII.4</td>
                        <td>School problems</td>
                        <td>{reportData?.table7?.schoolProblems}</td>
                    </tr>
                    {/* Add Total Score row for Social VII */}
                    <tr>
                        <td colSpan="2"><strong>Total Score:</strong></td>
                        <td>{calculateSocialVII()}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default CBCLforGirls6To18yReports;
