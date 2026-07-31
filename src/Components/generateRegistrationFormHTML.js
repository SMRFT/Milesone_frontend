import mdcLogo from "./Images/mdcLogo.png";

/**
 * Normalizes patient registration data and returns an HTML string formatted 
 * to match the physical "REGISTRATION FORM" paper printout.
 *
 * @param {Object} data - Patient registration data object
 * @param {string} employeeName - Name of employee taking action (optional)
 * @returns {string} HTML document string ready for printWindow.document.write()
 */
export const generateRegistrationFormHTML = (data = {}, employeeName = "") => {
  // Child Full Name (salutation + name)
  const salutationStr = data.salutation ? data.salutation.trim() : "";
  const childNameStr = data.name_of_child ? data.name_of_child.trim() : "";
  const childFullName = [salutationStr, childNameStr].filter(Boolean).join(" ");

  // Normalize age
  let formattedAge = "";
  if (data.age) {
    let ageObj = data.age;
    if (typeof ageObj === "string") {
      try {
        ageObj = JSON.parse(ageObj);
      } catch (e) {
        ageObj = null;
      }
    }
    if (ageObj && typeof ageObj === "object") {
      const parts = [];
      if (ageObj.year || ageObj.years) parts.push(`${ageObj.year || ageObj.years}Y`);
      if (ageObj.months || ageObj.month) parts.push(`${ageObj.months || ageObj.month}M`);
      if (ageObj.days || ageObj.day) parts.push(`${ageObj.days || ageObj.day}D`);
      formattedAge = parts.join(" ");
    } else if (typeof data.age === "string") {
      formattedAge = data.age;
    }
  }

  // Normalize date
  let regDate = "";
  if (data.date) {
    try {
      regDate = new Date(data.date).toLocaleDateString();
    } catch (e) {
      regDate = data.date;
    }
  } else {
    regDate = new Date().toLocaleDateString();
  }

  // Normalize DOB
  let dobStr = "";
  if (data.dob) {
    try {
      dobStr = new Date(data.dob).toLocaleDateString();
    } catch (e) {
      dobStr = data.dob;
    }
  }

  // Father / Mother name format
  const fatherName = data.father_name ? data.father_name.trim() : "";
  const motherName = data.mother_name ? data.mother_name.trim() : "";
  let parentsCombined = "";
  if (fatherName && motherName) {
    parentsCombined = fatherName === motherName ? fatherName : `${fatherName} / ${motherName}`;
  } else {
    parentsCombined = fatherName || motherName || "";
  }

  // Phone numbers (de-duplicate identical numbers)
  const motherPhone = data.mother_phone_number ? data.mother_phone_number.trim() : "";
  const fatherPhone = data.father_phone_number ? data.father_phone_number.trim() : "";
  let phoneCombined = "";
  if (motherPhone && fatherPhone) {
    phoneCombined = motherPhone === fatherPhone ? motherPhone : `${motherPhone}, ${fatherPhone}`;
  } else {
    phoneCombined = motherPhone || fatherPhone || "";
  }

  // Normalize Reason for visit
  let reasonsChecked = {
    languageDelay: false,
    developmentDelay: false,
    learningDisability: false,
    geneticDisorder: false,
    inattention: false,
    screeningDevelopment: false,
    anyOtherIssues: false,
    otherText: "",
  };

  const rawReason = data.reason_for_visit;
  let reasonsList = [];

  if (Array.isArray(rawReason)) {
    reasonsList = rawReason;
  } else if (typeof rawReason === "object" && rawReason !== null) {
    reasonsList = Object.keys(rawReason).filter((k) => rawReason[k]);
  } else if (typeof rawReason === "string") {
    try {
      const parsed = JSON.parse(rawReason);
      if (Array.isArray(parsed)) reasonsList = parsed;
      else if (typeof parsed === "object" && parsed !== null) {
        reasonsList = Object.keys(parsed).filter((k) => parsed[k]);
      } else {
        reasonsList = [rawReason];
      }
    } catch (e) {
      reasonsList = [rawReason];
    }
  }

  reasonsList.forEach((reason) => {
    if (typeof reason !== "string") return;
    const rLower = reason.toLowerCase();
    if (rLower.includes("language")) reasonsChecked.languageDelay = true;
    if (rLower.includes("development delay") && !rLower.includes("genetic")) {
      reasonsChecked.developmentDelay = true;
    }
    if (rLower.includes("learning")) reasonsChecked.learningDisability = true;
    if (rLower.includes("genetic")) reasonsChecked.geneticDisorder = true;
    if (rLower.includes("inattention")) reasonsChecked.inattention = true;
    if (rLower.includes("screening")) reasonsChecked.screeningDevelopment = true;

    const othersMatch = reason.match(/^Others\((.*)\)$/);
    if (othersMatch) {
      reasonsChecked.anyOtherIssues = true;
      reasonsChecked.otherText = othersMatch[1];
    } else if (rLower.includes("other") || rLower.includes("any other")) {
      reasonsChecked.anyOtherIssues = true;
      if (data.other_reason_text) {
        reasonsChecked.otherText = data.other_reason_text;
      }
    }
  });

  if (data.other_reason_text && !reasonsChecked.otherText) {
    reasonsChecked.anyOtherIssues = true;
    reasonsChecked.otherText = data.other_reason_text;
  }

  // Normalize Source of Referral
  let doctorName = "";
  let isMediaAdd = false;
  let isFriendsNeighbours = false;
  let otherReferral = "";

  let referralObj = data.source_of_referral;
  if (typeof referralObj === "string") {
    try {
      referralObj = JSON.parse(referralObj);
    } catch (e) {
      referralObj = {};
    }
  }

  if (referralObj && typeof referralObj === "object") {
    doctorName = referralObj.ThroughDoctorwithName || "";
    isMediaAdd = Boolean(referralObj.ThroughMediaAdd);
    isFriendsNeighbours = Boolean(referralObj.ThroughFriendsNeighbours);
    otherReferral = referralObj.Others || "";
  }

  const renderBox = (isChecked) => {
    return `<span class="checkbox-box">${isChecked ? "&#10003;" : "&nbsp;"}</span>`;
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Registration Form - Milestone Developmental Center</title>
        <style>
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 15px;
            color: #000;
            background-color: #fff;
          }
          .page-border {
            border: 2px solid #333;
            padding: 20px 25px;
            min-height: 96vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .header-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .logo-section {
            width: 180px;
            display: flex;
            align-items: center;
          }
          .logo-img {
            height: 55px;
            width: auto;
          }
          .form-title-box {
            border: 2px solid #222;
            padding: 8px 30px;
            font-size: 18px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
            text-align: center;
            border-radius: 4px;
          }
          
          /* Fields Info Section Styling */
          .info-section {
            margin-bottom: 25px;
          }
          .field-row {
            display: flex;
            align-items: flex-end;
            margin-bottom: 14px;
            font-size: 14px;
            line-height: 1.4;
            width: 100%;
          }
          .field-group {
            display: flex;
            align-items: flex-end;
            white-space: nowrap;
            flex-shrink: 0;
          }
          .field-group.flex-fill {
            flex: 1;
            flex-shrink: 1;
            min-width: 0;
          }
          .field-label {
            font-weight: 700;
            white-space: nowrap;
            margin-right: 4px;
          }
          .field-value {
            border-bottom: 1.5px solid #333;
            padding-left: 6px;
            padding-right: 6px;
            font-weight: 600;
            white-space: nowrap;
            text-align: left;
            min-height: 20px;
          }

          /* Section Headings */
          .section-heading {
            font-weight: 800;
            font-size: 16px;
            margin-top: 18px;
            margin-bottom: 12px;
            text-decoration: underline;
            color: #111;
          }

          /* Checkbox Styling */
          .checkbox-box {
            display: inline-block;
            width: 18px;
            height: 18px;
            border: 1.5px solid #222;
            text-align: center;
            line-height: 16px;
            font-weight: bold;
            font-size: 14px;
            margin-left: 8px;
            vertical-align: middle;
            background-color: #fff;
          }

          /* Reason for Visit Grid */
          .reasons-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 12px 15px;
            font-size: 13.5px;
            font-weight: 600;
            margin-bottom: 15px;
          }
          .reason-item {
            display: flex;
            align-items: center;
          }

          /* Lines for symptoms & treatment */
          .line-input-area {
            border-bottom: 1.5px solid #333;
            min-height: 28px;
            margin-bottom: 15px;
            font-size: 14px;
            font-weight: 600;
            padding-left: 5px;
          }

          /* Source of referral list */
          .referral-list {
            font-size: 14px;
            font-weight: 600;
            line-height: 1.8;
          }
          .referral-item {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
          }

          /* Footer Styling */
          .footer-container {
            margin-top: 30px;
            border-top: 1px solid #444;
            padding-top: 10px;
            font-size: 12px;
            color: #222;
          }
          .footer-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
            font-weight: 600;
          }
          .footer-bar {
            height: 12px;
            background-color: #333;
            width: 100%;
            margin-top: 6px;
          }

          @media print {
            body { padding: 0; }
            .page-border { border: 2px solid #000; min-height: 98vh; }
          }
        </style>
      </head>
      <body>
        <div class="page-border">
          <div>
            <!-- Header section -->
            <div class="header-row">
              <div class="logo-section">
                <img src="${mdcLogo}" alt="Logo" class="logo-img" />
              </div>
              <div class="form-title-box">
                REGISTRATION FORM
              </div>
              <div style="width: 180px;"></div>
            </div>

            <!-- Fields info section -->
            <div class="info-section">
              <!-- Row 1: Name, Sex, D.O.B -->
              <div class="field-row">
                <div class="field-group flex-fill">
                  <span class="field-label">Name of the child :</span>
                  <span class="field-value" style="flex: 1;">${childFullName}</span>
                </div>
                <div class="field-group" style="margin-left: 15px;">
                  <span class="field-label">Sex :</span>
                  <span class="field-value" style="min-width: 70px;">${data.sex || ''}</span>
                </div>
                <div class="field-group" style="margin-left: 15px;">
                  <span class="field-label">D.O.B :</span>
                  <span class="field-value" style="min-width: 100px;">${dobStr}</span>
                </div>
              </div>

              <!-- Row 2: Age, Date, Registration Number -->
              <div class="field-row">
                <div class="field-group">
                  <span class="field-label">Age :</span>
                  <span class="field-value" style="min-width: 120px;">${formattedAge}</span>
                </div>
                <div class="field-group" style="margin-left: 20px;">
                  <span class="field-label">Date :</span>
                  <span class="field-value" style="min-width: 100px;">${regDate}</span>
                </div>
                <div class="field-group flex-fill" style="margin-left: 20px;">
                  <span class="field-label">Registration Number :</span>
                  <span class="field-value" style="flex: 1; min-width: 140px;">${data.registration_number || data.registrationNumber || ''}</span>
                </div>
              </div>

              <!-- Row 3: Name of father/mother -->
              <div class="field-row">
                <div class="field-group flex-fill">
                  <span class="field-label">Name of father/mother :</span>
                  <span class="field-value" style="flex: 1;">${parentsCombined}</span>
                </div>
              </div>

              <!-- Row 4: Address, Phone Number -->
              <div class="field-row">
                <div class="field-group flex-fill">
                  <span class="field-label">Address :</span>
                  <span class="field-value" style="flex: 1;">${data.address || ''}</span>
                </div>
                <div class="field-group" style="margin-left: 20px;">
                  <span class="field-label">Phone Number :</span>
                  <span class="field-value" style="min-width: 180px;">${phoneCombined}</span>
                </div>
              </div>

              <!-- Row 5: Mail ID -->
              <div class="field-row">
                <div class="field-group flex-fill">
                  <span class="field-label">Mail ID :</span>
                  <span class="field-value" style="flex: 1; max-width: 450px;">${data.mail_id || ''}</span>
                </div>
              </div>
            </div>

            <!-- Reason for visit -->
            <div class="section-heading">Reason for visit</div>
            <div class="reasons-grid">
              <div class="reason-item">
                1. Language delay ${renderBox(reasonsChecked.languageDelay)}
              </div>
              <div class="reason-item">
                2. Development Delay ${renderBox(reasonsChecked.developmentDelay)}
              </div>
              <div class="reason-item">
                3. Learning Disability ${renderBox(reasonsChecked.learningDisability)}
              </div>
              <div class="reason-item" style="grid-column: span 1;">
                4. Genetic Disorder with development Delay ${renderBox(reasonsChecked.geneticDisorder)}
              </div>
              <div class="reason-item">
                5. Inattention ${renderBox(reasonsChecked.inattention)}
              </div>
              <div class="reason-item">
                6. Screening Of Development ${renderBox(reasonsChecked.screeningDevelopment)}
              </div>
              <div class="reason-item" style="grid-column: span 3;">
                7. Any other Issues ${renderBox(reasonsChecked.anyOtherIssues)}
                ${reasonsChecked.otherText ? `<span style="margin-left: 10px; font-weight: bold; border-bottom: 1px solid #333; padding: 0 8px;">${reasonsChecked.otherText}</span>` : ''}
              </div>
            </div>

            <!-- Duration Of Symptoms -->
            <div class="section-heading">Duration Of Symptoms</div>
            <div class="line-input-area">${data.duration_of_symptoms || ''}</div>

            <!-- Previous Treatment Done -->
            <div class="section-heading">Previous Treatment Done</div>
            <div class="line-input-area">${data.previous_treatment_done || ''}</div>

            <!-- Source Of Referral -->
            <div class="section-heading">Source Of Referral</div>
            <div class="referral-list">
              <div class="referral-item">
                1. Through Doctor With Name :
                <span style="border-bottom: 1.5px solid #333; padding-left: 8px; flex-grow: 1; margin-left: 6px;">
                  ${doctorName}
                </span>
              </div>
              <div class="referral-item">
                2. Through Media / Ads ${renderBox(isMediaAdd)}
              </div>
              <div class="referral-item">
                3. Through Friends / Neighbours ${renderBox(isFriendsNeighbours)}
              </div>
              <div class="referral-item">
                4. Others :
                <span style="border-bottom: 1.5px solid #333; padding-left: 8px; flex-grow: 1; margin-left: 6px;">
                  ${otherReferral}
                </span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer-container">
            <div class="footer-info-row">
              <div>📍 59/37 ,Saradha College Road ,Salem</div>
              <div>📞 +91-9047033633</div>
            </div>
            <div class="footer-info-row">
              <div>✉️ info@milestonescenter.in</div>
              <div>visit us at: www.milestonescenter.in</div>
            </div>
            <div class="footer-bar"></div>
          </div>
        </div>
      </body>
    </html>
  `;
};
